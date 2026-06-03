import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Download,
  ArrowLeft, ArrowRight, Plus, RefreshCw, FileX2, Copy, UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { parseSpreadsheet, exportCSV } from "@/lib/exportUtils";
import { toast } from "sonner";
import { recordImportRun, type ImportEntity } from "@/lib/importHistory";
import { useAuth } from "@/lib/auth";

const SKIP = "__skip__";

export function normalizePhone(v: unknown): string {
  if (v == null) return "";
  let s = String(v).replace(/\D+/g, "");
  if (!s) return "";
  if (s.startsWith("0033")) s = s.slice(4);
  else if (s.startsWith("33") && s.length === 11) s = s.slice(2);
  else if (s.startsWith("0")) s = s.slice(1);
  return s;
}
export function normalizeEmail(v: unknown): string {
  if (v == null) return "";
  return String(v).trim().toLowerCase();
}

export type DuplicateRecord = {
  id: string;
  label: string;
  phone?: string;
  mobile?: string;
  email?: string;
  values?: Record<string, unknown>;
};


export type ImportField = {
  key: string;
  label: string;
  required?: boolean;
  sample?: string;
  validate?: (value: unknown) => string | null;
  aliases?: string[];
  transform?: (value: unknown) => unknown;
};

export type CustomImportField = {
  key: string;
  label: string;
  type?: string;
  aliases?: string[];
};

export type ImportResult = { added: number; updated: number; skipped: number };

export type KnownUser = { username: string; fullName?: string | null };

export type ImportFlowProps = {
  title: string;
  description: string;
  fields: ImportField[];
  customFields?: CustomImportField[];
  onImport: (rows: Record<string, unknown>[]) => ImportResult | Promise<ImportResult>;
  existingIds?: string[];
  idField?: string;
  existingRecords?: DuplicateRecord[];
  templateFileName?: string;
  entity?: ImportEntity;
  batchSize?: number;
  /** Known app users for fuzzy matching of the `assignedTo` column. */
  knownUsers?: KnownUser[];
  /** Which fields to use for duplicate detection. Default: ["phone", "email"]. "phone" also covers `mobile`. */
  dedupeOn?: ("phone" | "email")[];
  /** Called once the user confirms the import (success). Use to navigate back. */
  onDone?: () => void;
  /** Called when user clicks Cancel on the upload step. */
  onCancel?: () => void;
};


type Step = "upload" | "map" | "review";
type DupResolution = "merge" | "add" | "skip";

const UNASSIGNED = "__unassigned__";
const normName = (s: unknown) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

type ValidatedRow = {
  index: number;
  values: Record<string, unknown>;
  errors: { field: string; message: string }[];
  matchKey: string | null;
  isUpdate: boolean;
  duplicate: DuplicateRecord | null;
  duplicateReason: "phone" | "email" | null;
  /** Original assignedTo value as read from the file (trimmed). */
  assigneeRaw: string | null;
  /** Username matched automatically, or null if unresolved. */
  assigneeMatched: string | null;
};

export function ImportFlow({
  title, description, fields, customFields = [], onImport, existingIds = [], idField = "id",
  existingRecords = [], templateFileName, entity, batchSize = 500, knownUsers = [],
  dedupeOn = ["phone", "email"], onDone, onCancel,
}: ImportFlowProps) {

  const auth = (() => { try { return useAuth(); } catch { return null; } })();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [customMapping, setCustomMapping] = useState<Record<string, string>>({});
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, batch: 0, batches: 0, added: 0, updated: 0, skipped: 0 });
  const [resolutions, setResolutions] = useState<Record<number, DupResolution>>({});
  /** Maps normalized unknown agent value -> override (UNASSIGNED or username). */
  const [assigneeOverrides, setAssigneeOverrides] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null); setRawRows([]); setHeaders([]); setMapping({}); setCustomMapping({});
    setStep("upload"); setResolutions({}); setAssigneeOverrides({});
    setProgress({ done: 0, total: 0, batch: 0, batches: 0, added: 0, updated: 0, skipped: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (f: File) => {
    setParsing(true);
    try {
      const rows = await parseSpreadsheet(f);
      if (rows.length === 0) { toast.error("Fichier vide ou illisible"); return; }
      const cols = Object.keys(rows[0]);
      setRawRows(rows);
      setHeaders(cols);
      const norm = (s: string) =>
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
         .replace(/[^a-z0-9]+/g, "").trim();
      const colNorm = cols.map((c) => ({ raw: c, n: norm(c) }));
      const findFor = (candidates: string[]): string | undefined => {
        const cands = candidates.map(norm).filter(Boolean);
        for (const c of cands) {
          const hit = colNorm.find((cn) => cn.n === c);
          if (hit) return hit.raw;
        }
        for (const c of cands) {
          const hit = colNorm.find((cn) => cn.n.includes(c) || c.includes(cn.n));
          if (hit) return hit.raw;
        }
        return undefined;
      };
      const used = new Set<string>();
      const auto: Record<string, string> = {};
      for (const fld of fields) {
        const found = findFor([fld.key, fld.label, ...(fld.aliases ?? [])]);
        if (found && !used.has(found)) { auto[fld.key] = found; used.add(found); }
        else auto[fld.key] = SKIP;
      }
      const autoCustom: Record<string, string> = {};
      for (const cf of customFields) {
        const found = findFor([cf.key, cf.label, ...(cf.aliases ?? [])]);
        if (found && !used.has(found)) { autoCustom[cf.key] = found; used.add(found); }
        else autoCustom[cf.key] = SKIP;
      }
      setMapping(auto);
      setCustomMapping(autoCustom);
      setFile(f);
      setStep("map");
      toast.success(`${rows.length} ligne(s) détectée(s)`);
    } catch (e) {
      console.error(e);
      toast.error("Impossible de lire le fichier");
    } finally {
      setParsing(false);
    }
  };

  const missingRequired = fields.filter((f) => f.required && (!mapping[f.key] || mapping[f.key] === SKIP));
  const mappedCount = fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).length
    + customFields.filter((f) => customMapping[f.key] && customMapping[f.key] !== SKIP).length;
  const totalFieldCount = fields.length + customFields.length;

  const dupPhoneEnabled = dedupeOn.includes("phone");
  const dupEmailEnabled = dedupeOn.includes("email");
  const dupIndex = useMemo(() => {
    const byPhone = new Map<string, DuplicateRecord>();
    const byEmail = new Map<string, DuplicateRecord>();
    for (const r of existingRecords) {
      if (dupPhoneEnabled) {
        const p = normalizePhone(r.phone);
        if (p && !byPhone.has(p)) byPhone.set(p, r);
        const m = normalizePhone(r.mobile);
        if (m && !byPhone.has(m)) byPhone.set(m, r);
      }
      if (dupEmailEnabled) {
        const e = normalizeEmail(r.email);
        if (e && !byEmail.has(e)) byEmail.set(e, r);
      }
    }
    return { byPhone, byEmail };
  }, [existingRecords, dupPhoneEnabled, dupEmailEnabled]);


  /** Fuzzy matcher: returns a known username or null. */
  const matchAssignee = useMemo(() => {
    const byKey = new Map<string, string>();
    const add = (key: string, username: string) => {
      if (!key) return;
      if (!byKey.has(key)) byKey.set(key, username);
    };
    for (const u of knownUsers) {
      const un = u.username;
      if (!un) continue;
      add(normName(un), un);
      // username prefix before first separator (e.g. "felix.pro" -> "felix")
      const head = String(un).split(/[.\s_@-]/)[0];
      if (head) add(normName(head), un);
      if (u.fullName) {
        const full = String(u.fullName);
        add(normName(full), un);
        // also reversed "Prenom Nom" -> "Nom Prenom"
        const parts = full.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          add(normName(parts.join("")), un);
          add(normName([...parts].reverse().join("")), un);
        }
      }
    }
    return (raw: string): string | null => {
      const n = normName(raw);
      if (!n) return null;
      if (byKey.has(n)) return byKey.get(n)!;
      // try head before separator on the imported value too (e.g. "felix.pro")
      const head = normName(String(raw).split(/[.\s_@-]/)[0]);
      if (head && byKey.has(head)) return byKey.get(head)!;
      // last resort: prefix containment against known keys
      for (const [k, v] of byKey) {
        if (k.length >= 3 && (n.startsWith(k) || k.startsWith(n))) return v;
      }
      return null;
    };
  }, [knownUsers]);

  const validated: ValidatedRow[] = useMemo(() => {
    if (step !== "review") return [];
    const existingSet = new Set(existingIds);
    return rawRows.map((r, i) => {
      const values: Record<string, unknown> = {};
      const errors: { field: string; message: string }[] = [];
      for (const fld of fields) {
        const src = mapping[fld.key];
        if (!src || src === SKIP) {
          if (fld.required) errors.push({ field: fld.label, message: "champ requis non mappé" });
          continue;
        }
        const raw = r[src];
        let v: unknown = typeof raw === "string" ? raw.trim() : raw;
        if (fld.transform) {
          try { v = fld.transform(v); } catch { /* keep original */ }
        }
        values[fld.key] = v;
        if (fld.required && (v === undefined || v === null || v === "")) {
          errors.push({ field: fld.label, message: "valeur vide" });
        }
        if (fld.validate) {
          const msg = fld.validate(v);
          if (msg) errors.push({ field: fld.label, message: msg });
        }
      }
      const cv: Record<string, string> = {};
      for (const cf of customFields) {
        const src = customMapping[cf.key];
        if (!src || src === SKIP) continue;
        const raw = r[src];
        if (raw === undefined || raw === null) continue;
        const s = typeof raw === "string" ? raw.trim() : String(raw);
        if (s === "") continue;
        cv[cf.key] = s;
      }
      if (Object.keys(cv).length) values.customValues = cv;
      const matchKey = values[idField] != null && String(values[idField]).trim() !== ""
        ? String(values[idField]).trim() : null;
      const isUpdate = matchKey ? existingSet.has(matchKey) : false;

      let duplicate: DuplicateRecord | null = null;
      let duplicateReason: "phone" | "email" | null = null;
      if (!isUpdate) {
        if (dupPhoneEnabled) {
          const np = normalizePhone(values["phone"]);
          const nm = normalizePhone(values["mobile"]);
          if (np && dupIndex.byPhone.has(np)) {
            duplicate = dupIndex.byPhone.get(np)!;
            duplicateReason = "phone";
          } else if (nm && dupIndex.byPhone.has(nm)) {
            duplicate = dupIndex.byPhone.get(nm)!;
            duplicateReason = "phone";
          }
        }
        if (!duplicate && dupEmailEnabled) {
          const ne = normalizeEmail(values["email"]);
          if (ne && dupIndex.byEmail.has(ne)) {
            duplicate = dupIndex.byEmail.get(ne)!;
            duplicateReason = "email";
          }
        }
      }


      const assigneeRawRaw = values["assignedTo"];
      const assigneeRaw = assigneeRawRaw != null && String(assigneeRawRaw).trim() !== ""
        ? String(assigneeRawRaw).trim() : null;
      const assigneeMatched = assigneeRaw && knownUsers.length > 0 ? matchAssignee(assigneeRaw) : null;
      return {
        index: i + 1, values, errors, matchKey, isUpdate, duplicate, duplicateReason,
        assigneeRaw, assigneeMatched,
      };
    });
  }, [step, rawRows, mapping, customMapping, fields, customFields, existingIds, idField, dupIndex, dupPhoneEnabled, dupEmailEnabled, knownUsers, matchAssignee]);

  /** Unique unresolved agents grouped by normalized key. */
  const unresolvedAgents = useMemo(() => {
    if (knownUsers.length === 0) return [] as { key: string; sample: string; count: number }[];
    const map = new Map<string, { key: string; sample: string; count: number }>();
    for (const v of validated) {
      if (!v.assigneeRaw || v.assigneeMatched) continue;
      const k = normName(v.assigneeRaw);
      if (!k) continue;
      const cur = map.get(k);
      if (cur) cur.count++;
      else map.set(k, { key: k, sample: v.assigneeRaw, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [validated, knownUsers]);

  const unresolvedCount = useMemo(
    () => validated.filter((v) => v.assigneeRaw && !v.assigneeMatched).length,
    [validated],
  );

  useEffect(() => {
    if (step !== "review") return;
    setResolutions((prev) => {
      const next = { ...prev };
      for (const v of validated) {
        if (v.duplicate && next[v.index] === undefined) next[v.index] = "merge";
      }
      return next;
    });
  }, [step, validated]);

  const summary = useMemo(() => {
    const valid = validated.filter((v) => v.errors.length === 0);
    const invalid = validated.length - valid.length;
    let willUpdate = 0, willAdd = 0, willSkip = 0, dupCount = 0;
    for (const v of valid) {
      if (v.duplicate) {
        dupCount++;
        const r = resolutions[v.index] ?? "merge";
        if (r === "merge") willUpdate++;
        else if (r === "add") willAdd++;
        else willSkip++;
      } else if (v.isUpdate) willUpdate++;
      else willAdd++;
    }
    return { total: validated.length, valid: valid.length, invalid, willAdd, willUpdate, willSkip, dupCount };
  }, [validated, resolutions]);

  const handleConfirm = async () => {
    const okRows: Record<string, unknown>[] = [];
    const resolveAssignee = (v: ValidatedRow): { changed: boolean; value: string | null } => {
      if (!v.assigneeRaw) return { changed: false, value: null };
      if (v.assigneeMatched) return { changed: v.assigneeMatched !== v.assigneeRaw, value: v.assigneeMatched };
      const ov = assigneeOverrides[normName(v.assigneeRaw)];
      if (ov === UNASSIGNED) return { changed: true, value: null };
      if (ov) return { changed: true, value: ov };
      return { changed: true, value: null }; // default unresolved -> unassigned
    };
    for (const v of validated) {
      if (v.errors.length > 0) continue;
      const a = resolveAssignee(v);
      const applyAssignee = (obj: Record<string, unknown>) => {
        if (!v.assigneeRaw) return obj;
        return { ...obj, assignedTo: a.value };
      };
      if (v.duplicate) {
        const r = resolutions[v.index] ?? "merge";
        if (r === "skip") continue;
        if (r === "merge") {
          okRows.push(applyAssignee({ ...v.values, [idField]: v.duplicate.id }));
        } else {
          const cloned = { ...v.values };
          if (String(cloned[idField] ?? "") === v.duplicate.id) delete cloned[idField];
          okRows.push(applyAssignee(cloned));
        }
      } else {
        okRows.push(applyAssignee({ ...v.values }));
      }
    }
    if (okRows.length === 0) { toast.error("Aucune ligne valide à importer"); return; }
    setImporting(true);
    const size = Math.max(50, batchSize);
    const batches = Math.ceil(okRows.length / size);
    setProgress({ done: 0, total: okRows.length, batch: 0, batches, added: 0, updated: 0, skipped: 0 });
    let added = 0, updated = 0, skipped = 0;
    try {
      for (let i = 0; i < okRows.length; i += size) {
        const slice = okRows.slice(i, i + size);
        const batchIdx = Math.floor(i / size) + 1;
        setProgress((p) => ({ ...p, batch: batchIdx }));
        const r = await onImport(slice);
        added += r.added; updated += r.updated; skipped += r.skipped;
        setProgress({ done: Math.min(i + size, okRows.length), total: okRows.length, batch: batchIdx, batches, added, updated, skipped });
      }
      const result: ImportResult = { added, updated, skipped };
      if (entity) {
        recordImportRun({
          entity,
          title,
          fileName: file?.name ?? null,
          user: auth?.user?.username ?? null,
          totals: { added: result.added, updated: result.updated, skipped: result.skipped },
          rowsRead: validated.length,
          rowsValid: summary.valid,
          rowsInvalid: summary.invalid,
          duplicates: summary.dupCount,
          mapping: [
            ...fields.map((f) => ({
              fieldKey: f.key,
              fieldLabel: f.label,
              sourceColumn: mapping[f.key] && mapping[f.key] !== SKIP ? mapping[f.key] : null,
              required: !!f.required,
            })),
            ...customFields.map((f) => ({
              fieldKey: `cf:${f.key}`,
              fieldLabel: f.label,
              sourceColumn: customMapping[f.key] && customMapping[f.key] !== SKIP ? customMapping[f.key] : null,
              required: false,
            })),
          ],
        });
      }
      toast.success(
        `${result.added} ajoutée(s) • ${result.updated} mise(s) à jour`,
        { description: result.skipped ? `${result.skipped} ignorée(s)` : file?.name },
      );
      reset();
      onDone?.();
    } catch (e) {
      toast.error("Échec de l'import", { description: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headerRow: Record<string, string> = {};
    for (const f of fields) headerRow[f.key] = f.sample ?? "";
    exportCSV(templateFileName ?? "modele-import.csv", [headerRow]);
    toast.success("Modèle CSV téléchargé");
  };

  const downloadInvalid = () => {
    const bad = validated.filter((v) => v.errors.length > 0);
    if (bad.length === 0) return;
    const out = bad.map((v) => ({
      ligne: v.index,
      erreurs: v.errors.map((e) => `${e.field}: ${e.message}`).join(" | "),
      ...v.values,
    }));
    exportCSV("lignes-invalides.csv", out);
    toast.success(`${bad.length} ligne(s) invalide(s) exportée(s)`);
  };

  const Steps = (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      {(["upload", "map", "review"] as const).map((s, i) => {
        const active = step === s;
        const done = (["upload", "map", "review"] as const).indexOf(step) > i;
        const labels = { upload: "1. Fichier", map: "2. Mappage", review: "3. Aperçu" } as const;
        return (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full border ${
              active ? "bg-primary text-primary-foreground border-primary"
                : done ? "bg-success/15 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"
            }`}>{labels[s]}</span>
            {i < 2 && <ArrowRight className="h-3 w-3" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-base font-semibold">{title}</div>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          {Steps}
        </div>
      </Card>

      {step === "upload" && (
        <div className="space-y-4">
          <Card
            className="border-dashed border-2 p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <div className="font-medium">Glissez un fichier ou cliquez pour parcourir</div>
            <div className="text-xs text-muted-foreground mt-1">Formats acceptés : .csv, .xlsx, .xls</div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </Card>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Besoin d'un modèle ?</span>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1.5" />Télécharger le modèle CSV
            </Button>
          </div>
          {parsing && <div className="text-xs text-muted-foreground">Lecture en cours…</div>}
          {onCancel && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={onCancel}>Annuler</Button>
            </div>
          )}
        </div>
      )}

      {step === "map" && file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30">
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {rawRows.length} ligne(s) • {headers.length} colonne(s) • {mappedCount}/{totalFieldCount} champ(s) mappé(s)
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={reset} aria-label="Retirer">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Mappage des colonnes
            </Label>
            <div className="mt-2 border border-border rounded-md divide-y divide-border max-h-[28rem] overflow-y-auto">
              {fields.map((f) => {
                const v = mapping[f.key] ?? SKIP;
                const isMapped = v !== SKIP;
                return (
                  <div key={f.key} className="grid grid-cols-2 gap-3 p-2.5 items-center">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <span className="font-medium truncate">{f.label}</span>
                      {f.required && <Badge variant="outline" className="text-[10px] py-0 bg-destructive/10 text-destructive border-destructive/20">requis</Badge>}
                      {isMapped && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                    </div>
                    <Select value={v} onValueChange={(nv) => setMapping((m) => ({ ...m, [f.key]: nv }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SKIP}>— Ignorer —</SelectItem>
                        {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
              {customFields.length > 0 && (
                <div className="px-2.5 py-1.5 bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Champs personnalisés
                </div>
              )}
              {customFields.map((f) => {
                const v = customMapping[f.key] ?? SKIP;
                const isMapped = v !== SKIP;
                return (
                  <div key={`cf-${f.key}`} className="grid grid-cols-2 gap-3 p-2.5 items-center">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <span className="font-medium truncate">{f.label}</span>
                      <Badge variant="outline" className="text-[10px] py-0">perso</Badge>
                      {isMapped && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                    </div>
                    <Select value={v} onValueChange={(nv) => setCustomMapping((m) => ({ ...m, [f.key]: nv }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SKIP}>— Ignorer —</SelectItem>
                        {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>

          {missingRequired.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Champs requis manquants</div>
                <div className="text-xs mt-0.5">{missingRequired.map((f) => f.label).join(", ")}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep("upload")}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Retour
            </Button>
            <Button disabled={missingRequired.length > 0} onClick={() => setStep("review")}>
              Aperçu<ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SummaryCard label="Lignes lues" value={summary.total} />
            <SummaryCard label="À ajouter" value={summary.willAdd} tone="info" icon={<Plus className="h-3.5 w-3.5" />} />
            <SummaryCard label="À mettre à jour" value={summary.willUpdate} tone="success" icon={<RefreshCw className="h-3.5 w-3.5" />} />
            <SummaryCard label="Doublons détectés" value={summary.dupCount} tone={summary.dupCount > 0 ? "warning" : "muted"} icon={<Copy className="h-3.5 w-3.5" />} />
            <SummaryCard label="Invalides" value={summary.invalid} tone={summary.invalid > 0 ? "destructive" : "muted"} icon={<FileX2 className="h-3.5 w-3.5" />} />
          </div>

          {summary.dupCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/20 text-sm">
              <Copy className="h-4 w-4 mt-0.5 shrink-0 text-warning-foreground" />
              <div className="flex-1">
                <div className="font-medium">Fusion assistée</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {summary.dupCount} ligne(s) correspondent à un enregistrement existant ({dedupeOn.includes("email") ? "téléphone, GSM ou email" : "téléphone ou GSM"} normalisé).
                  Choisissez l'action par ligne ci-dessous.
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" onClick={() => {
                  setResolutions((prev) => {
                    const n = { ...prev };
                    for (const v of validated) if (v.duplicate) n[v.index] = "merge";
                    return n;
                  });
                }}>Tout fusionner</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setResolutions((prev) => {
                    const n = { ...prev };
                    for (const v of validated) if (v.duplicate) n[v.index] = "skip";
                    return n;
                  });
                }}>Tout ignorer</Button>
              </div>
            </div>
          )}

          {unresolvedAgents.length > 0 && (
            <div className="rounded-md border border-warning/30 bg-warning/5 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <UserX className="h-4 w-4 mt-0.5 shrink-0 text-warning-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {unresolvedAgents.length} agent(s) non reconnu(s) — {unresolvedCount} ligne(s) concernée(s)
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Choisissez l'utilisateur correspondant, ou laissez « Non assigné ». Sans choix, ces lignes seront importées sans agent.
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => {
                    setAssigneeOverrides((prev) => {
                      const n = { ...prev };
                      for (const a of unresolvedAgents) n[a.key] = UNASSIGNED;
                      return n;
                    });
                  }}>Tout laisser non assigné</Button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {unresolvedAgents.map((a) => {
                  const cur = assigneeOverrides[a.key] ?? UNASSIGNED;
                  return (
                    <div key={a.key} className="flex items-center gap-2 rounded-md border border-border bg-background/60 p-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate" title={a.sample}>{a.sample}</div>
                        <div className="text-[11px] text-muted-foreground">{a.count} ligne(s)</div>
                      </div>
                      <Select
                        value={cur}
                        onValueChange={(nv) => setAssigneeOverrides((p) => ({ ...p, [a.key]: nv }))}
                      >
                        <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGNED}>— Non assigné —</SelectItem>
                          {knownUsers.map((u) => (
                            <SelectItem key={u.username} value={u.username}>
                              {u.fullName ? `${u.fullName} (${u.username})` : u.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border border-border rounded-md p-3 bg-muted/20">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Mappage appliqué</div>
            <div className="flex flex-wrap gap-1.5">
              {fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).map((f) => (
                <Badge key={f.key} variant="outline" className="font-normal">
                  <span className="text-muted-foreground">{mapping[f.key]}</span>
                  <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                  <span className="font-medium">{f.label}</span>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Aperçu détaillé ({Math.min(validated.length, 50)} sur {validated.length})
              </Label>
              {summary.invalid > 0 && (
                <Button variant="outline" size="sm" onClick={downloadInvalid}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />Télécharger les lignes invalides
                </Button>
              )}
            </div>
            <div className="border border-border rounded-md overflow-x-auto max-h-96">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium w-12">Ligne</th>
                    <th className="px-2 py-1.5 text-left font-medium w-24">Action</th>
                    {fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).map((f) => (
                      <th key={f.key} className="px-2 py-1.5 text-left font-medium">{f.label}</th>
                    ))}
                    <th className="px-2 py-1.5 text-left font-medium">Erreurs</th>
                  </tr>
                </thead>
                <tbody>
                  {validated.slice(0, 50).map((v) => {
                    const bad = v.errors.length > 0;
                    return (
                      <tr key={v.index} className={`border-t border-border ${bad ? "bg-destructive/5" : v.duplicate ? "bg-warning/5" : ""}`}>
                        <td className="px-2 py-1.5 text-muted-foreground align-top">{v.index}</td>
                        <td className="px-2 py-1.5 align-top">
                          {bad ? (
                            <Badge variant="outline" className="text-[10px] py-0 bg-destructive/10 text-destructive border-destructive/20">
                              Ignorée
                            </Badge>
                          ) : v.duplicate ? (
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-[10px] py-0 bg-warning/15 text-warning-foreground border-warning/30">
                                <Copy className="h-2.5 w-2.5 mr-1" />Doublon ({v.duplicateReason === "phone" ? "tél" : "email"})
                              </Badge>
                              <Select
                                value={resolutions[v.index] ?? "merge"}
                                onValueChange={(nv) => setResolutions((p) => ({ ...p, [v.index]: nv as DupResolution }))}
                              >
                                <SelectTrigger className="h-7 text-[11px] w-[120px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="merge">Fusionner</SelectItem>
                                  <SelectItem value="add">Ajouter quand même</SelectItem>
                                  <SelectItem value="skip">Ignorer</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={v.duplicate.label}>
                                ↳ {v.duplicate.label}
                              </div>
                            </div>
                          ) : v.isUpdate ? (
                            <Badge variant="outline" className="text-[10px] py-0 bg-success/10 text-success border-success/20">
                              <RefreshCw className="h-2.5 w-2.5 mr-1" />Maj
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] py-0 bg-info/10 text-info border-info/20">
                              <Plus className="h-2.5 w-2.5 mr-1" />Ajout
                            </Badge>
                          )}
                        </td>
                        {fields.filter((f) => mapping[f.key] && mapping[f.key] !== SKIP).map((f) => (
                          <td key={f.key} className="px-2 py-1.5 truncate max-w-[160px] align-top">
                            {String(v.values[f.key] ?? "")}
                          </td>
                        ))}
                        <td className="px-2 py-1.5 text-destructive align-top">
                          {v.errors.length > 0 ? (
                            <span title={v.errors.map((e) => `${e.field}: ${e.message}`).join("\n")}>
                              {v.errors.map((e) => e.field).join(", ")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {summary.valid === 0 ? (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Aucune ligne valide. Corrigez le fichier ou le mappage avant de poursuivre.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Prêt à importer : <strong>{summary.willAdd}</strong> ajout(s) et{" "}
                <strong>{summary.willUpdate}</strong> mise(s) à jour
                {summary.invalid > 0 && <> — {summary.invalid} ligne(s) seront ignorée(s)</>}
              </span>
            </div>
          )}

          {importing && (
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Import en cours — lot {progress.batch}/{progress.batches}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {progress.done.toLocaleString()} / {progress.total.toLocaleString()} lignes
                  {progress.total > 0 && <> · {Math.round((progress.done / progress.total) * 100)}%</>}
                </span>
              </div>
              <Progress value={progress.total > 0 ? (progress.done / progress.total) * 100 : 0} />
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 tabular-nums">
                  Ajoutées : <strong>{progress.added.toLocaleString()}</strong>
                </span>
                <span className="rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 tabular-nums">
                  Mises à jour : <strong>{progress.updated.toLocaleString()}</strong>
                </span>
                <span className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 tabular-nums">
                  Ignorées : <strong>{progress.skipped.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep("map")} disabled={importing}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Modifier le mappage
            </Button>
            <Button onClick={handleConfirm} disabled={summary.valid === 0 || importing}>
              <Upload className="h-4 w-4 mr-1.5" />
              {importing ? `Import… ${progress.done}/${progress.total}` : `Confirmer l'import (${summary.valid})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label, value, tone = "muted", icon,
}: {
  label: string; value: number;
  tone?: "muted" | "info" | "success" | "destructive" | "warning";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    muted: "border-border bg-muted/30 text-foreground",
    info: "border-info/20 bg-info/10 text-info",
    success: "border-success/20 bg-success/10 text-success",
    destructive: "border-destructive/20 bg-destructive/10 text-destructive",
    warning: "border-warning/20 bg-warning/10 text-warning-foreground",
  }[tone];
  return (
    <div className={`rounded-md border p-3 ${toneClass}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-80 flex items-center gap-1">
        {icon}{label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
