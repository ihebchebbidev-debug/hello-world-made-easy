// Lightweight typed REST client for the PHP backend.
// API base URL is hardcoded to the production PHP backend.
const BASE = "https://luccibyey.com.tn/intranetprotec";
export const API_ENABLED = true;
export const API_BASE = BASE;

/** Build absolute URL to any backend file path (e.g. attachments.php?download=...) */
export function apiUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return BASE + (path.startsWith("/") ? path : `/${path}`);
}

/** Upload one file via multipart/form-data. Used by attachments.php. */
export async function apiUpload<T = any>(
  path: string,
  fields: Record<string, string | Blob>,
): Promise<T> {
  if (!API_ENABLED) throw new ApiError("API base URL not configured", 0);
  const url = BASE + (path.startsWith("/") ? path : `/${path}`);
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v as any);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = token;
  }
  const res = await fetch(url, { method: "POST", headers, body: fd });
  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok || (data && data.success === false)) {
    const msg = data?.message ?? `HTTP ${res.status}`;
    const code = data?.code as string | undefined;
    if (res.status === 401) setToken(null);
    if (code === "IP_NOT_ALLOWED" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("erp:ip-blocked", { detail: { message: msg, ip: data?.ip } }));
    }
    throw new ApiError(msg, res.status, code);
  }
  return data as T;
}

const TOKEN_KEY = "protection_erp_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Broadcast an IP-blocked event so the UI can show a full-screen banner. */
function notifyIpBlocked(message: string, ip?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("erp:ip-blocked", { detail: { message, ip } }));
}

export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  if (!API_ENABLED) throw new ApiError("API base URL not configured", 0);

  const url = new URL(BASE + (path.startsWith("/") ? path : `/${path}`));
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["X-Auth-Token"] = token;
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok || (data && data.success === false)) {
    const msg = data?.message ?? `HTTP ${res.status}`;
    const code = data?.code as string | undefined;
    if (res.status === 401) setToken(null);
    if (code === "IP_NOT_ALLOWED") notifyIpBlocked(msg, data?.ip);
    throw new ApiError(msg, res.status, code);
  }
  return data as T;
}
