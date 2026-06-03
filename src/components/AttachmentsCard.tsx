import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Upload, Download, Trash2, FileText, Image as ImageIcon, FileArchive, File as FileIcon, Loader2, Search, X } from "lucide-react";
import { api, apiUpload, apiUrl, API_ENABLED } from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TypeFilter = "all" | "image" | "pdf" | "doc" | "sheet" | "archive" | "other";
type SizeFilter = "all" | "small" | "medium" | "large";

function categoryOf(mime: string): TypeFilter {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m === "application/pdf") return "pdf";
  if (m.includes("word") || m.includes("msword") || m.includes("officedocument.wordprocessing") || m === "text/plain") return "doc";
  if (m.includes("sheet") || m.includes("excel") || m === "text/csv") return "sheet";
  if (m.includes("zip") || m.includes("compressed") || m.includes("rar") || m.includes("tar")) return "archive";
  return "other";
}

export type Attachment = {
  id: string;
  entity: "prospect" | "contract";
  entityId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  uploadedBy: string;
  createdAt: string;
};

function fmtSize(b: number) {
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} Ko`;
  return `${(b / 1024 / 1024).toFixed(2)} Mo`;
}

function FileTypeIcon({ mime }: { mime: string }) {
  if (mime?.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
  if (mime === "application/pdf") return <FileText className="h-4 w-4" />;
  if (mime?.includes("zip") || mime?.includes("compressed")) return <FileArchive className="h-4 w-4" />;
  return <FileIcon className="h-4 w-4" />;
}

export function AttachmentsCard({
  entity,
  entityId,
  onAdded,
  onRemoved,
}: {
  entity: "prospect" | "contract";
  entityId: string;
  onAdded?: (a: { filename: string; sizeBytes: number }) => void;
  onRemoved?: (a: { filename: string; sizeBytes: number }) => void;
}) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<Attachment | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    if (!API_ENABLED) return;
    setLoading(true);
    try {
      const r = await api<{ attachments: Attachment[] }>("/attachments.php", {
        query: { entity, entity_id: entityId },
      });
      setItems(r.attachments ?? []);
    } catch (e: any) {
      toast.error("Chargement des pièces jointes impossible", { description: e?.message });
    } finally {
      setLoading(false);
    }
  }, [entity, entityId]);

  useEffect(() => { void load(); }, [load]);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || !API_ENABLED) return;
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(true);
    try {
      for (const f of list) {
        if (f.size > 20 * 1024 * 1024) {
          toast.error(`${f.name}: fichier trop volumineux (>20 Mo)`);
          continue;
        }
        await apiUpload("/attachments.php", {
          entity,
          entity_id: entityId,
          file: f,
        });
        onAdded?.({ filename: f.name, sizeBytes: f.size });
      }
      toast.success(`${list.length} fichier(s) téléversé(s)`);
      await load();
    } catch (e: any) {
      toast.error("Échec de l'envoi", { description: e?.message });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (a: Attachment) => {
    setDeletingId(a.id);
    try {
      await api(`/attachments.php?id=${encodeURIComponent(a.id)}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== a.id));
      onRemoved?.({ filename: a.filename, sizeBytes: a.sizeBytes });
      toast.success("Pièce jointe supprimée", { description: a.filename });
    } catch (e: any) {
      toast.error("Suppression impossible", { description: e?.message });
    } finally {
      setDeletingId(null);
      setConfirmDel(null);
    }
  };

  // Apply filters
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : null;
    const toTs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;
    return items.filter((a) => {
      if (q && !a.filename.toLowerCase().includes(q) && !a.uploadedBy?.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && categoryOf(a.mimeType) !== typeFilter) return false;
      if (sizeFilter !== "all") {
        const mb = a.sizeBytes / (1024 * 1024);
        if (sizeFilter === "small" && mb >= 1) return false;
        if (sizeFilter === "medium" && (mb < 1 || mb > 5)) return false;
        if (sizeFilter === "large" && mb <= 5) return false;
      }
      const ts = new Date(a.createdAt).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      return true;
    });
  }, [items, search, typeFilter, sizeFilter, dateFrom, dateTo]);

  const hasActiveFilter =
    search !== "" || typeFilter !== "all" || sizeFilter !== "all" || dateFrom !== "" || dateTo !== "";

  const resetFilters = () => {
    setSearch(""); setTypeFilter("all"); setSizeFilter("all"); setDateFrom(""); setDateTo("");
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Pièces jointes
            </CardTitle>
            <CardDescription>Documents liés à cette fiche (max 20 Mo / fichier)</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5">
            {hasActiveFilter ? `${filtered.length}/${items.length}` : items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dropzone / picker */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-lg border-2 border-dashed p-4 text-center transition-base cursor-pointer ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
            disabled={!API_ENABLED || uploading}
          />
          <div className="flex flex-col items-center gap-1.5 text-sm">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="font-medium">
              {uploading ? "Envoi en cours…" : "Glissez vos fichiers ici ou cliquez"}
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, images, documents — jusqu'à 20 Mo
            </span>
          </div>
        </div>

        {!API_ENABLED && (
          <div className="text-xs text-muted-foreground italic text-center">
            API non configurée — les pièces jointes nécessitent le backend.
          </div>
        )}

        {/* Filters */}
        {items.length > 0 && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou auteur…"
                className="pl-8 h-9"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Documents</SelectItem>
                  <SelectItem value="sheet">Tableurs</SelectItem>
                  <SelectItem value="archive">Archives</SelectItem>
                  <SelectItem value="other">Autres</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sizeFilter} onValueChange={(v) => setSizeFilter(v as SizeFilter)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Taille" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes tailles</SelectItem>
                  <SelectItem value="small">&lt; 1 Mo</SelectItem>
                  <SelectItem value="medium">1 – 5 Mo</SelectItem>
                  <SelectItem value="large">&gt; 5 Mo</SelectItem>
                </SelectContent>
              </Select>
              <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Date début" />
              <DatePicker value={dateTo} onChange={setDateTo} placeholder="Date fin" />
            </div>
            {hasActiveFilter && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                  <X className="h-3 w-3 mr-1" /> Réinitialiser
                </Button>
              </div>
            )}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-6 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />Chargement…
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Aucun document pour le moment.
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Aucun document ne correspond aux filtres.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30">
                <div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center shrink-0">
                  <FileTypeIcon mime={a.mimeType} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.filename}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {fmtSize(a.sizeBytes)} · @{a.uploadedBy} · {new Date(a.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
                <a
                  href={apiUrl(a.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  aria-label={`Télécharger ${a.filename}`}
                >
                  <Download className="h-4 w-4" />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDel(a)}
                  disabled={deletingId === a.id}
                  aria-label={`Supprimer ${a.filename}`}
                >
                  {deletingId === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => { if (!o) setConfirmDel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette pièce jointe ?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDel ? (
                <>Le fichier <span className="font-medium text-foreground">{confirmDel.filename}</span> ({fmtSize(confirmDel.sizeBytes)}) sera définitivement supprimé. Cette action est irréversible.</>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingId}
              onClick={(e) => { e.preventDefault(); if (confirmDel) void remove(confirmDel); }}
            >
              {deletingId ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Suppression…</> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
