// Dynamic option lists for editable select dropdowns (Source, Régime,
// Partenaire santé, Civilité, Produit, Cabinet, …). Backed by
// option_lists.php; cached at module level so every consumer stays in
// sync. Falls back to a hardcoded list when the backend is offline.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";

export type OptionEntity = "prospect" | "contract";
export type OptionItem = {
  id: string;
  entity: OptionEntity;
  field: string;
  value: string;
  position: number;
};

// ----- Hardcoded fallback (kept in sync with backend seeds) ---------------
const FALLBACK: Record<string, string[]> = {
  "prospect:source":            ["Web", "Client Existant", "RDV CHAUD", "Fiches Qualifie", "Recommandation"],
  "prospect:regime":            ["CPAM", "MSA", "RSI", "Alsace"],
  "prospect:civility":          ["M", "Mme"],
  "prospect:lost_reason":       ["Pas intéressé", "Trop cher", "Doublon", "Coordonnées invalides"],
  "contract:source":            ["Web", "Client Existant", "RDV CHAUD", "Fiches Qualifie", "Recommandation"],
  "contract:partner":           ["NEOLIANE", "SPVIE", "APRIL", "ALPTIS", "APIVIA", "MALAKOFF", "MIEL MUTUELLE", "TASSUR", "Autre"],
  "contract:product":           ["Santé", "Prévoyance", "Obsèques", "Emprunteur", "Autre"],
  "contract:cabinet":           ["Cabinet Paris 1", "Cabinet Lyon", "Cabinet Marseille"],
  "contract:debit_type":        ["Mensuel", "Trimestriel", "Semestriel", "Annuel"],
  "contract:termination_type":  ["RIA", "Échéance"],
  "contract:regime":            ["CPAM", "MSA", "RSI", "Alsace"],
  "contract:civility":          ["M", "Mme"],
  "contract:spouse_civility":   ["M", "Mme"],
};

const fallbackFor = (entity: OptionEntity, field: string): OptionItem[] => {
  const key = `${entity}:${field}`;
  return (FALLBACK[key] ?? []).map((v, i) => ({
    id: `_fb_${key}_${i}`, entity, field, value: v, position: i + 1,
  }));
};

// ----- Module store ------------------------------------------------------
type State = { items: Record<string, OptionItem[]>; loaded: Set<string> };
let state: State = { items: {}, loaded: new Set() };
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };
const setState = (next: Partial<State>) => { state = { ...state, ...next }; emit(); };

const inflight: Map<string, Promise<void>> = new Map();

async function fetchOne(entity: OptionEntity, field: string, force = false): Promise<void> {
  const key = `${entity}:${field}`;
  if (!force && state.loaded.has(key)) return;
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = (async () => {
    try {
      const r = await api<{ options: OptionItem[] }>(
        `/option_lists.php?entity=${entity}&field=${encodeURIComponent(field)}`,
      );
      const items = { ...state.items };
      items[key] = r.options?.length ? r.options : fallbackFor(entity, field);
      const loaded = new Set(state.loaded); loaded.add(key);
      setState({ items, loaded });
    } catch {
      const items = { ...state.items };
      if (!items[key]) items[key] = fallbackFor(entity, field);
      const loaded = new Set(state.loaded); loaded.add(key);
      setState({ items, loaded });
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

function subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }
const getSnapshot = () => state;

// ----- Public hook --------------------------------------------------------
export function useOptionList(entity: OptionEntity, field: string) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const key = `${entity}:${field}`;
  useEffect(() => { void fetchOne(entity, field); }, [entity, field]);
  const refresh = useCallback(() => fetchOne(entity, field, true), [entity, field]);
  const items = snap.items[key] ?? fallbackFor(entity, field);
  return {
    options: items,
    values: items.map((o) => o.value),
    loaded: snap.loaded.has(key),
    refresh,
  };
}

export function refreshOptionList(entity: OptionEntity, field: string) {
  return fetchOne(entity, field, true);
}
