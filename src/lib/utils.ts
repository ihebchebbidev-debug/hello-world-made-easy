import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date-ish value to "DD/MM/YYYY" (fr-FR).
 * Returns null for empty/invalid input — callers can render "—" themselves
 * or pass the result to <Row value={...}/> which already handles null.
 */
export function formatDate(
  value: string | number | Date | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s || ["null", "undefined", "invalid date", "nan", "—", "-"].includes(s.toLowerCase())) {
      return null;
    }
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Format a datetime-ish value to "DD/MM/YYYY HH:mm" (fr-FR). Returns null on invalid input.
 */
export function formatDateTime(
  value: string | number | Date | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s || ["null", "undefined", "invalid date", "nan"].includes(s.toLowerCase())) return null;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Parse a date-ish value to an epoch ms number, or NaN if empty/invalid.
 * Treats common sentinels ("", "null", "undefined", "invalid date", "—", "-") as missing.
 */
export function parseDateSafe(value: unknown): number {
  if (value === null || value === undefined) return NaN;
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? NaN : t;
  }
  if (typeof value !== "string") return NaN;
  const s = value.trim();
  if (!s || ["null", "undefined", "invalid date", "nan", "—", "-"].includes(s.toLowerCase())) return NaN;
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? NaN : t;
}

/**
 * Date comparator that always pushes invalid/missing dates to the end,
 * regardless of asc/desc direction. Returns -1/0/1.
 */
export function compareDates(a: unknown, b: unknown, dir: "asc" | "desc" = "asc"): number {
  const ta = parseDateSafe(a);
  const tb = parseDateSafe(b);
  const aMissing = Number.isNaN(ta);
  const bMissing = Number.isNaN(tb);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  const cmp = ta === tb ? 0 : ta < tb ? -1 : 1;
  return dir === "asc" ? cmp : -cmp;
}

/** Normalize any date-ish value to ISO YYYY-MM-DD, or null if invalid. Useful for filter equality. */
export function toIsoDate(value: unknown): string | null {
  const t = parseDateSafe(value);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
