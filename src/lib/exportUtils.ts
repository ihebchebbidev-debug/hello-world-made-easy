// Lightweight client-side exporters (no extra deps)
export function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV<T extends Record<string, unknown>>(rows: T[], columns?: (keyof T)[]): string {
  if (rows.length === 0) return "";
  const cols = (columns ?? (Object.keys(rows[0]) as (keyof T)[])) as string[];
  const head = cols.map(escapeCsv).join(",");
  const body = rows.map((r) => cols.map((c) => escapeCsv((r as Record<string, unknown>)[c])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export function exportCSV<T extends Record<string, unknown>>(filename: string, rows: T[], columns?: (keyof T)[]) {
  downloadBlob(filename, toCSV(rows, columns), "text/csv;charset=utf-8");
}

export function exportJSON(filename: string, data: unknown) {
  downloadBlob(filename, JSON.stringify(data, null, 2), "application/json");
}

export function printPage() {
  if (typeof window !== "undefined") window.print();
}

// Excel (XLSX) export — dynamic import keeps initial bundle small.
export async function exportXLSX<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  sheetName = "Données",
) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename);
}

// Enrich rows with custom-field columns using human-readable labels.
// Falls back to `cf_<key>` if the label collides with an existing column.
export function withCustomFields<T extends Record<string, unknown>>(
  rows: T[],
  defs: { key: string; label: string }[],
  valuesById: Record<string, Record<string, string>>,
  idField: keyof T = "id" as keyof T,
): Record<string, unknown>[] {
  if (defs.length === 0) return rows.map((r) => ({ ...r }));
  const baseKeys = new Set(rows[0] ? Object.keys(rows[0]) : []);
  const colName = new Map<string, string>();
  for (const d of defs) {
    const safe = baseKeys.has(d.label) || [...colName.values()].includes(d.label)
      ? `cf_${d.key}` : d.label;
    colName.set(d.key, safe);
  }
  return rows.map((r) => {
    const id = String(r[idField] ?? "");
    const vals = valuesById[id] ?? {};
    const out: Record<string, unknown> = { ...r };
    for (const d of defs) out[colName.get(d.key)!] = vals[d.key] ?? "";
    return out;
  });
}

/* ---------------------------------------------------------------------------
 * Human-friendly export mappers (French labels, no internal IDs).
 * Use these before calling exportCSV / exportXLSX / exportJSON for
 * Prospects and Contracts so users see business labels — never dev field
 * names like `assignedTo`, `billingStatus`, `customValues`, raw row IDs,
 * or unrelated relationship IDs.
 * -------------------------------------------------------------------------*/

import { formatDate } from "@/lib/utils";

const outcomeFr: Record<string, string> = { won: "Gagné", lost: "Perdu", pending: "En cours" };
const checkFr: Record<string, string> = { valid: "Validé", invalid: "Invalide", pending: "En attente" };

// Fields we never want in user-facing exports (internal IDs, FK refs, raw blobs).
const HIDDEN_KEYS = new Set([
  "id", "prospectId", "contractId", "userId", "user_id",
  "createdById", "updatedById", "agentId", "ownerId",
  "customValues", "extra", "raw", "_raw",
]);

type Mapping = Array<[string, string, ((v: unknown, row: any) => unknown)?]>;

const PROSPECT_MAP: Mapping = [
  ["civility", "Civilité"],
  ["lastName", "Nom"],
  ["firstName", "Prénom"],
  ["age", "Âge"],
  ["birthDate", "Date de naissance", (v) => formatDate(v as any) ?? ""],
  ["spouseAge", "Âge conjoint"],
  ["spouseBirthDate", "Date de naissance conjoint", (v) => formatDate(v as any) ?? ""],
  ["regime", "Régime"],
  ["childrenCount", "Nombre d'enfants"],
  ["childrenAges", "Âges des enfants"],
  ["phone", "Téléphone fixe"],
  ["mobile", "Mobile"],
  ["email", "Email"],
  ["postalCode", "Code postal"],
  ["city", "Ville"],
  ["source", "Source"],
  ["status", "Statut"],
  ["outcome", "Résultat", (v) => outcomeFr[String(v)] ?? v ?? ""],
  ["lostReason", "Motif de perte"],
  ["checkValeur", "Check valeur", (v) => checkFr[String(v)] ?? v ?? ""],
  ["currentMutuelle", "Mutuelle actuelle"],
  ["cotisation", "Cotisation actuelle"],
  ["demande", "Demande"],
  ["assignedTo", "Assigné à"],
  ["createdAt", "Date d'ajout", (v) => formatDate(v as any) ?? ""],
  ["comment", "Commentaire"],
];

const CONTRACT_MAP: Mapping = [
  ["civility", "Civilité"],
  ["lastName", "Nom"],
  ["firstName", "Prénom"],
  ["birthDate", "Date de naissance", (v) => formatDate(v as any) ?? ""],
  ["phone", "Téléphone fixe"],
  ["mobile", "Mobile"],
  ["email", "Email"],
  ["address", "Adresse"],
  ["postalCode", "Code postal"],
  ["city", "Ville"],
  ["partner", "Partenaire"],
  ["cabinet", "Cabinet"],
  ["product", "Produit"],
  ["productOptions", "Options produit"],
  ["complementaryProduct", "Produit complémentaire"],
  ["complementaryPremium", "Cotisation complémentaire"],
  ["complementaryEffectiveDate", "Date d'effet complémentaire", (v) => formatDate(v as any) ?? ""],
  ["premium", "Cotisation annuelle"],
  ["previousPremium", "Cotisation précédente"],
  ["signatureDate", "Date de signature", (v) => formatDate(v as any) ?? ""],
  ["effectiveDate", "Date d'effet", (v) => formatDate(v as any) ?? ""],
  ["validationDate", "Date de validation", (v) => formatDate(v as any) ?? ""],
  ["currentExpiryDate", "Date d'échéance", (v) => formatDate(v as any) ?? ""],
  ["billingStatus", "Statut facturation"],
  ["currentMutuelle", "Mutuelle actuelle"],
  ["ssn", "N° Sécurité sociale"],
  ["adhesionNumber", "N° d'adhésion"],
  ["principalMember", "Adhérent principal"],
  ["spouseCivility", "Civilité conjoint"],
  ["spouseLastName", "Nom conjoint"],
  ["spouseFirstName", "Prénom conjoint"],
  ["spouseBirthDate", "Date de naissance conjoint", (v) => formatDate(v as any) ?? ""],
  ["bankHolderLastName", "Nom titulaire bancaire"],
  ["bankHolderFirstName", "Prénom titulaire bancaire"],
  ["iban", "IBAN"],
  ["bic", "BIC"],
  ["debitDate", "Date de prélèvement", (v) => formatDate(v as any) ?? ""],
  ["debitType", "Type de prélèvement"],
  ["terminationType", "Type de résiliation"],
  ["regime", "Régime"],
  ["childrenCount", "Nombre d'enfants"],
  ["childrenAges", "Âges des enfants"],
  ["source", "Source"],
  ["assignedTo", "Assigné à"],
  ["commercialComment", "Commentaire commercial"],
];

function applyMap(row: Record<string, unknown>, map: Mapping): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const seen = new Set<string>();
  for (const [key, label, fn] of map) {
    seen.add(key);
    const raw = row[key];
    const v = fn ? fn(raw, row) : raw;
    out[label] = v ?? "";
  }
  // Pass through extra columns (e.g. custom fields already given French labels
  // by withCustomFields), but skip internal/relationship keys.
  for (const k of Object.keys(row)) {
    if (seen.has(k) || HIDDEN_KEYS.has(k)) continue;
    out[k] = row[k];
  }
  return out;
}

export function toProspectExportRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => applyMap(r, PROSPECT_MAP));
}

export function toContractExportRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => applyMap(r, CONTRACT_MAP));
}


// Parse CSV / XLSX file → array of objects (header row required).
// Handles UTF-8 + latin1 (windows-1252) and auto-detects ; , or \t separators.
export async function parseSpreadsheet(file: File): Promise<Record<string, unknown>[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const XLSX = await import("xlsx");

  // For CSV/TSV: read as text with smart encoding detection so we handle
  // Windows-encoded exports (Excel FR) where accented chars become "�".
  if (ext === "csv" || ext === "tsv" || ext === "txt") {
    const buf = await file.arrayBuffer();
    let text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    // If we see the U+FFFD replacement char, fall back to latin1/windows-1252.
    if (text.includes("\uFFFD")) {
      try {
        text = new TextDecoder("windows-1252").decode(buf);
      } catch {
        text = new TextDecoder("iso-8859-1").decode(buf);
      }
    }
    // Strip BOM
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    // Detect separator from first non-empty line
    const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
    const counts = { ",": 0, ";": 0, "\t": 0, "|": 0 };
    let inQ = false;
    for (const ch of firstLine) {
      if (ch === '"') inQ = !inQ;
      else if (!inQ && ch in counts) (counts as any)[ch]++;
    }
    const sep = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) || ",";
    const wb = XLSX.read(text, { type: "string", raw: false, FS: sep });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return [];
    return unmergeSingleColumnSeparated(
      XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" }),
    );
  }

  // XLSX / XLS path
  const buf = await file.arrayBuffer();
  // Some exports save tab-separated text with an .xls extension. Detect by
  // checking the magic bytes: real XLS = D0 CF 11 E0 (OLE), real XLSX = 50 4B
  // (ZIP). Anything else: try to parse as text with smart separator detection.
  const head = new Uint8Array(buf.slice(0, 4));
  const isOle  = head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0;
  const isZip  = head[0] === 0x50 && head[1] === 0x4b;
  if (!isOle && !isZip) {
    let text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    if (text.includes("\uFFFD")) {
      try { text = new TextDecoder("windows-1252").decode(buf); }
      catch { text = new TextDecoder("iso-8859-1").decode(buf); }
    }
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
    const counts = { ",": 0, ";": 0, "\t": 0, "|": 0 };
    let inQ = false;
    for (const ch of firstLine) {
      if (ch === '"') inQ = !inQ;
      else if (!inQ && ch in counts) (counts as any)[ch]++;
    }
    const sep = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) || ",";
    const wb2 = XLSX.read(text, { type: "string", raw: false, FS: sep });
    const ws2 = wb2.Sheets[wb2.SheetNames[0]];
    if (!ws2) return [];
    return unmergeSingleColumnSeparated(
      XLSX.utils.sheet_to_json<Record<string, unknown>>(ws2, { defval: "" }),
    );
  }
  const wb = XLSX.read(buf, { type: "array", raw: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  return unmergeSingleColumnSeparated(
    XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" }),
  );
}

/**
 * Some Excel exports stuff a full ;-separated row into a single cell (often
 * happens when a CSV is "saved as .xlsx" without re-parsing the delimiter).
 * Detect that case and explode the single column back into proper columns.
 * Also stitches "continuation rows" (a wrapped long comment that produced an
 * extra cell-only row) back onto the last column of the previous record.
 */
function unmergeSingleColumnSeparated(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  if (rows.length === 0) return rows;
  // Look at the union of keys across the first few rows because SheetJS adds
  // synthetic "__EMPTY" filler columns only on rows that need them.
  const allKeys = new Set<string>();
  for (const r of rows.slice(0, 20)) for (const k of Object.keys(r)) allKeys.add(k);
  const cols = Array.from(allKeys);
  // The "packed" column is the one whose NAME contains a separator several
  // times — that means it's actually the full ;-joined header row.
  const candidate = cols.find((c) => /[;|\t]/.test(c) && c.split(/[;|\t]/).length >= 3);
  if (!candidate) return rows;
  const headerKey = candidate;
  // Other columns are either auto-generated SheetJS fillers (__EMPTY*) or
  // unrelated extra columns. We only treat __EMPTY* as continuation cells.
  const extraKeys = cols.filter((c) => c !== headerKey && /^__EMPTY/.test(c));
  // If there are non-__EMPTY extra columns, this isn't a packed file.
  const otherKeys = cols.filter((c) => c !== headerKey && !/^__EMPTY/.test(c));
  if (otherKeys.length > 0) return rows;
  // Pick the separator that produces the most fields in the header.
  const seps = [";", "\t", "|"] as const;
  let bestSep: string = ";";
  let bestCount = 0;
  for (const s of seps) {
    const n = headerKey.split(s).length;
    if (n > bestCount) { bestCount = n; bestSep = s; }
  }
  if (bestCount < 3) return rows; // not actually a packed row
  const headerParts = headerKey.split(bestSep).map((s) => s.trim());
  const expected = headerParts.length;
  const minFields = Math.max(3, Math.ceil(expected / 2));
  const out: Record<string, unknown>[] = [];
  for (const r of rows) {
    const raw = r[headerKey];
    const cell = raw == null ? "" : String(raw);
    // Capture continuation text from __EMPTY* filler columns in this same row.
    const continuations: string[] = [];
    for (const k of extraKeys) {
      const v = r[k];
      if (v == null) continue;
      const s = String(v).trim();
      if (s) continuations.push(s);
    }
    if (!cell.trim()) {
      // A row whose main cell is empty but with continuation text → append
      // it to the previous record's last column.
      if (continuations.length && out.length > 0) {
        const last = out[out.length - 1];
        const lastKey = headerParts[headerParts.length - 1];
        const prev = last[lastKey] == null ? "" : String(last[lastKey]);
        last[lastKey] = (prev ? prev + " " : "") + continuations.join(" ");
      }
      continue;
    }
    const parts = cell.split(bestSep);
    if (parts.length < minFields) {
      // Wrap-around continuation — append to the last record's last column.
      if (out.length > 0) {
        const last = out[out.length - 1];
        const lastKey = headerParts[headerParts.length - 1];
        const prev = last[lastKey] == null ? "" : String(last[lastKey]);
        last[lastKey] = (prev ? prev + " " : "") + [cell.trim(), ...continuations].join(" ");
      }
      continue;
    }
    const obj: Record<string, unknown> = {};
    for (let i = 0; i < expected; i++) {
      const key = headerParts[i] || `col_${i + 1}`;
      obj[key] = (parts[i] ?? "").trim();
    }
    // Merge any continuation fragments into the last logical column.
    if (continuations.length) {
      const lastKey = headerParts[headerParts.length - 1];
      const prev = obj[lastKey] == null ? "" : String(obj[lastKey]);
      obj[lastKey] = (prev ? prev + " " : "") + continuations.join(" ");
    }
    out.push(obj);
  }
  return out;
}

