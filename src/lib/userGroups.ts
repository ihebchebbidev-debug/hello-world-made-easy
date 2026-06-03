// Many-to-many membership store for user ↔ groups.
// Source of truth: /user_groups.php (MySQL extraneterp_user_groups).
// Falls back to single-team `users.team` when API is disabled.
import { useEffect, useSyncExternalStore } from "react";
import { api, API_ENABLED } from "@/lib/api";

type AllMap = Record<string, string[]>; // user_id -> groups

let cache: AllMap = {};
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };

export async function refreshUserGroups(): Promise<void> {
  if (!API_ENABLED) return;
  if (loading) return loading;
  loading = (async () => {
    try {
      const r = await api<{ memberships: AllMap }>("/user_groups.php");
      cache = r.memberships ?? {};
      loaded = true;
      emit();
    } catch {
      /* keep cache */
    } finally {
      loading = null;
    }
  })();
  return loading;
}

export function getGroupsForUser(userId: string, fallbackTeam?: string): string[] {
  const g = cache[userId];
  if (g && g.length) return g;
  return fallbackTeam ? [fallbackTeam] : [];
}

export async function saveUserGroups(userId: string, groups: string[]): Promise<string[]> {
  if (!API_ENABLED) {
    cache[userId] = [...groups];
    emit();
    return groups;
  }
  const r = await api<{ user_id: string; groups: string[] }>("/user_groups.php", {
    method: "PUT",
    body: { user_id: userId, groups },
  });
  cache[userId] = r.groups ?? [];
  emit();
  return cache[userId];
}

export async function fetchUserGroups(userId: string): Promise<string[]> {
  if (!API_ENABLED) return cache[userId] ?? [];
  try {
    const r = await api<{ user_id: string; groups: string[] }>(
      `/user_groups.php?user_id=${encodeURIComponent(userId)}`,
    );
    cache[userId] = r.groups ?? [];
    emit();
    return cache[userId];
  } catch {
    return cache[userId] ?? [];
  }
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  if (!loaded) void refreshUserGroups();
  return () => { listeners.delete(cb); };
};
const getSnapshot = () => cache;

export function useAllUserGroups(): AllMap {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useUserGroups(userId: string | undefined, fallbackTeam?: string): string[] {
  const all = useAllUserGroups();
  useEffect(() => { if (userId && !all[userId]) void fetchUserGroups(userId); }, [userId, all]);
  if (!userId) return [];
  const g = all[userId];
  if (g && g.length) return g;
  return fallbackTeam ? [fallbackTeam] : [];
}

// Initial kickoff
void refreshUserGroups();
