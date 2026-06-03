import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useCallback } from "react";
import { api, API_ENABLED } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import {
  useStatusOptions,
  refreshStatusOptions,
  type StatusEntity,
  type StatusOption,
} from "@/lib/useStatusOptions";

export const Route = createFileRoute("/stages")({
  head: () => ({
    meta: [
      { title: "Étapes du pipeline — Protection ERP" },
      { name: "description", content: "Configurez les étapes du pipeline commercial." },
    ],
  }),
  component: StagesPage,
});

type Stage = { id: string; name: string; color: string; position: number };
const COLORS = ["info", "primary", "success", "warning", "destructive", "muted"];

function StagesPage() {
  const { user } = useAuth();
  const confirmDialog = useConfirm();
  const canEdit = user?.role === "Administrateur" || user?.role === "Manager";
  const canDelete = user?.role === "Administrateur";
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("info");

  const load = useCallback(async () => {
    if (!API_ENABLED) return;
    setLoading(true);
    try {
      const r = await api<{ stages: Stage[] }>("/stages.php");
      setStages((r.stages ?? []).slice().sort((a, b) => a.position - b.position));
    } catch (e: any) { toast.error("Erreur", { description: e?.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!name.trim()) { toast.error("Nom requis"); return; }
    try {
      await api("/stages.php", { method: "POST", body: { name: name.trim(), color, position: stages.length + 1 } });
      setName(""); toast.success("Étape créée"); await load();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
  };
  const remove = async (id: string) => {
    const ok = await confirmDialog({ title: "Supprimer l'étape", description: "Voulez-vous supprimer cette étape ?", destructive: true });
    if (!ok) return;
    try { await api(`/stages.php?id=${encodeURIComponent(id)}`, { method: "DELETE" }); await load(); }
    catch (e: any) { toast.error(e?.message ?? "Erreur"); }
  };
  const move = async (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= stages.length) return;
    const arr = stages.slice();
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    const reindexed = arr.map((s, i) => ({ ...s, position: i + 1 }));
    setStages(reindexed);
    try {
      await Promise.all([
        api("/stages.php", { method: "PATCH", body: { id: reindexed[idx].id, position: reindexed[idx].position } }),
        api("/stages.php", { method: "PATCH", body: { id: reindexed[swap].id, position: reindexed[swap].position } }),
      ]);
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); load(); }
  };
  const recolor = async (id: string, c: string) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, color: c } : s)));
    try { await api("/stages.php", { method: "PATCH", body: { id, color: c } }); }
    catch (e: any) { toast.error(e?.message ?? "Erreur"); load(); }
  };

  return (
    <AppLayout>
      <PageHeader
        icon={<Layers className="h-5 w-5" />}
        title="Étapes du pipeline"
        description="Configurez les étapes par lesquelles vos prospects progressent."
        actions={
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        }
      />
      {canEdit && (
        <Card className="mb-4">
          <CardContent className="py-4 grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Nom de l'étape</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Qualification" />
            </div>
            <div className="space-y-1.5">
              <Label>Couleur</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={create}><Plus className="h-4 w-4 mr-1.5" /> Ajouter</Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {stages.length === 0 && !loading ? (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Aucune étape</CardContent></Card>
        ) : stages.map((s, i) => (
          <Card key={s.id}>
            <CardContent className="py-3 flex items-center gap-3">
              <Badge variant="outline" className="w-7 justify-center">{s.position}</Badge>
              <div className="font-medium flex-1 min-w-0 truncate">{s.name}</div>
              {canEdit ? (
                <Select value={s.color} onValueChange={(c) => recolor(s.id, c)}>
                  <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              ) : <Badge variant="secondary">{s.color}</Badge>}
              {canEdit && (
                <div className="flex gap-0.5">
                  <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === stages.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                </div>
              )}
              {canDelete && (
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <StatusManager entity="prospect" title="Statuts Prospects" />
        <StatusManager entity="contract" title="Statuts Contrats (facturation)" />
      </div>
    </AppLayout>
  );
}

// ---------------------------------------------------------------------------
// Dynamic status manager — add / rename / recolor / delete statuses for
// prospects or contracts. Same UI for both, scoped by `entity`.
// ---------------------------------------------------------------------------
function StatusManager({ entity, title }: { entity: StatusEntity; title: string }) {
  const { user } = useAuth();
  const confirmDialog = useConfirm();
  const canEdit = user?.role === "Administrateur" || user?.role === "Manager";
  const canDelete = user?.role === "Administrateur";
  const { options, refresh } = useStatusOptions(entity);
  const [newValue, setNewValue] = useState("");
  const [newColor, setNewColor] = useState("info");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const v = newValue.trim();
    if (!v) { toast.error("Nom requis"); return; }
    setBusy(true);
    try {
      await api("/status_options.php", {
        method: "POST",
        body: { entity, value: v, color: newColor, position: options.length + 1 },
      });
      setNewValue("");
      await refresh();
      toast.success("Statut ajouté");
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
    finally { setBusy(false); }
  };

  const rename = async (opt: StatusOption, value: string) => {
    if (value === opt.value) return;
    try {
      await api("/status_options.php", { method: "PATCH", body: { id: opt.id, value } });
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); refresh(); }
  };
  const recolor = async (opt: StatusOption, c: string) => {
    try {
      await api("/status_options.php", { method: "PATCH", body: { id: opt.id, color: c } });
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
  };
  const remove = async (opt: StatusOption) => {
    const ok = await confirmDialog({
      title: `Supprimer "${opt.value}" ?`,
      description: "Si ce statut est utilisé, la suppression sera bloquée. Renommez d'abord les enregistrements concernés.",
      destructive: true,
    });
    if (!ok) return;
    try {
      await api(`/status_options.php?id=${encodeURIComponent(opt.id)}`, { method: "DELETE" });
      await refresh();
      await refreshStatusOptions();
      toast.success("Statut supprimé");
    } catch (e: any) {
      toast.error(e?.message ?? "Suppression impossible");
    }
  };
  const move = async (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= options.length) return;
    const arr = options.slice();
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    try {
      await Promise.all(arr.map((o, i) =>
        api("/status_options.php", { method: "PATCH", body: { id: o.id, position: i + 1 } }),
      ));
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); refresh(); }
  };

  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <Badge variant="secondary">{options.length}</Badge>
        </div>
        {canEdit && (
          <div className="grid grid-cols-[1fr_120px_auto] gap-2 items-end pb-2 border-b">
            <div className="space-y-1">
              <Label className="text-xs">Nouveau statut</Label>
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="ex: En négociation"
                onKeyDown={(e) => { if (e.key === "Enter") create(); }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Couleur</Label>
              <Select value={newColor} onValueChange={setNewColor}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={create} disabled={busy}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </div>
        )}
        <div className="space-y-1.5">
          {options.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">Aucun statut configuré</div>
          )}
          {options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2 py-1">
              <Badge variant="outline" className="w-7 justify-center text-xs">{i + 1}</Badge>
              {canEdit ? (
                <Input
                  defaultValue={o.value}
                  className="h-8 flex-1"
                  onBlur={(e) => rename(o, e.target.value.trim())}
                />
              ) : <div className="flex-1 text-sm">{o.value}</div>}
              {canEdit ? (
                <Select value={o.color} onValueChange={(c) => recolor(o, c)}>
                  <SelectTrigger className="w-[110px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{COLORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              ) : <Badge variant="secondary">{o.color}</Badge>}
              {canEdit && (
                <div className="flex gap-0.5">
                  <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === options.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                </div>
              )}
              {canDelete && (
                <Button size="sm" variant="ghost" onClick={() => remove(o)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}