// Per (entity, field) edit-permission map for dynamic option lists.
// Loaded once from /option_lists.php?action=perms and cached at module level.
// Administrateur is always allowed implicitly.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";

export type EditableRole =
  | "Manager"
  | "Superviseur"
  | "Agent"
  | "Vendeur"
  | "Qualificateur"
  | "Backoffice";
export const EDITABLE_ROLES: EditableRole[] = [
  "Manager",
  "Superviseur",
  "Agent",
  "Vendeur",
  "Qualificateur",
  "Backoffice",
];

type PermsMap = Record<string, EditableRole[]>; // "entity:field" -> roles

let state: { perms: PermsMap; loaded: boolean } = { perms: {}, loaded: false };
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };
let inflight: Promise<void> | null = null;

async function load(force = false): Promise<void> {
  if (!force && state.loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const r = await api<{ perms: PermsMap }>("/option_lists.php?action=perms");
      state = { perms: r.perms ?? {}, loaded: true };
    } catch {
      state = { perms: state.perms, loaded: true };
    } finally {
      inflight = null;
      emit();
    }
  })();
  return inflight;
}

export async function setFieldPerms(entity: string, field: string, roles: EditableRole[]) {
  await api("/option_lists.php", {
    method: "POST",
    body: { action: "set_perms", entity, field, roles },
  });
  state = { perms: { ...state.perms, [`${entity}:${field}`]: roles }, loaded: true };
  emit();
}

function subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }
const getSnapshot = () => state;

export function useOptionPerms() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => { void load(); }, []);
  const rolesFor = useCallback(
    (entity: string, field: string): EditableRole[] => snap.perms[`${entity}:${field}`] ?? [],
    [snap],
  );
  const canEdit = useCallback(
    (role: string | undefined, entity: string, field: string): boolean => {
      if (!role) return false;
      if (role === "Administrateur") return true;
      return rolesFor(entity, field).includes(role as EditableRole);
    },
    [rolesFor],
  );
  return { loaded: snap.loaded, rolesFor, canEdit, refresh: () => load(true) };
}
