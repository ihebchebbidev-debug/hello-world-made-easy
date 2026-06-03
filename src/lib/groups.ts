// Store for "Groupes" (équipes).
// - Source of truth: backend `/groups.php` (MySQL table `extraneterp_groups`).
// - localStorage acts as offline cache + fallback when API is disabled.
// - Exposes React subscription via useGroups() and an imperative groupsStore.
import { useSyncExternalStore } from "react";
import { api, API_ENABLED } from "@/lib/api";

const CACHE_KEY = "erp.groups.v1";
const DEFAULTS = ["Direction", "Lead-Actifs", "Lead-Premium", "Backoffice", "TV"];

function readCache(): string[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return DEFAULTS;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length ? arr.map(String) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

let cache: string[] = readCache();
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };

function writeCache(next: string[]) {
  cache = next;
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(next)); }
  catch { /* ignore quota */ }
  emit();
}

let loaded = false;
let loading: Promise<void> | null = null;

async function refresh(): Promise<void> {
  if (!API_ENABLED) return;
  if (loading) return loading;
  loading = (async () => {
    try {
      const r = await api<{ groups: string[] }>("/groups.php");
      if (Array.isArray(r.groups)) writeCache(r.groups);
      loaded = true;
    } catch {
      /* offline / endpoint missing — keep cache */
    } finally {
      loading = null;
    }
  })();
  return loading;
}

// Kick off initial load
void refresh();

export const groupsStore = {
  list: () => cache,
  refresh,
  async add(name: string) {
    const n = name.trim();
    if (!n || cache.includes(n)) return;
    // Optimistic
    writeCache([...cache, n]);
    if (!API_ENABLED) return;
    try {
      const r = await api<{ groups: string[] }>("/groups.php", {
        method: "POST",
        body: { name: n },
      });
      if (Array.isArray(r.groups)) writeCache(r.groups);
    } catch (e) {
      await refresh();
      throw e;
    }
  },
  async rename(oldName: string, newName: string) {
    const n = newName.trim();
    if (!n || n === oldName) return;
    writeCache(cache.map((g) => (g === oldName ? n : g)));
    if (!API_ENABLED) return;
    try {
      const r = await api<{ groups: string[] }>("/groups.php", {
        method: "PATCH",
        body: { old: oldName, new: n },
      });
      if (Array.isArray(r.groups)) writeCache(r.groups);
    } catch (e) {
      await refresh();
      throw e;
    }
  },
  async remove(name: string) {
    const prev = cache;
    writeCache(cache.filter((g) => g !== name));
    if (!API_ENABLED) return;
    try {
      const r = await api<{ groups: string[] }>(
        `/groups.php?name=${encodeURIComponent(name)}`,
        { method: "DELETE" },
      );
      if (Array.isArray(r.groups)) writeCache(r.groups);
    } catch (e) {
      writeCache(prev);
      throw e;
    }
  },
  reorder(next: string[]) {
    writeCache(next.filter((v, i, a) => a.indexOf(v) === i));
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Refresh from server when a new subscriber mounts (covers post-login).
  if (!loaded) void refresh();
  return () => { listeners.delete(cb); };
}
const getSnapshot = () => cache;

export function useGroups(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
