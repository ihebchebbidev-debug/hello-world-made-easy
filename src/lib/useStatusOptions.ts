// Dynamic prospect/contract status options, fetched from status_options.php
// and cached at module level so every consumer (filters, edit dropdowns,
// admin UI) stays in sync without re-hitting the API.
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";

export type StatusEntity = "prospect" | "contract";
export type StatusOption = {
  id: string;
  entity: StatusEntity;
  value: string;
  color: string;     // semantic token name: info/primary/success/warning/destructive/muted/accent
  position: number;
};

// ----- hardcoded fallback so the UI never shows an empty dropdown ---------
const FALLBACK: Record<StatusEntity, StatusOption[]> = {
  prospect: [
    "A recontacter (Voir Commentaire)","RDV","Vente","Devis",
    "Sans réponse","Refus","HC âge","HC Cotisation","HC tutelle",
  ].map((v, i) => ({ id: `_fb_p_${i}`, entity: "prospect", value: v, color: "muted", position: i + 1 })),
  contract: [
    "Pré-validé","En attente de validation","Validé Confirmation","Annuler la confirmation",
  ].map((v, i) => ({ id: `_fb_c_${i}`, entity: "contract", value: v, color: "muted", position: i + 1 })),
};

// ----- module store -------------------------------------------------------
type State = { prospect: StatusOption[]; contract: StatusOption[]; loaded: boolean };
let state: State = { ...FALLBACK, loaded: false };
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };
const setState = (next: Partial<State>) => { state = { ...state, ...next }; emit(); };

let inflight: Promise<void> | null = null;
async function fetchAll(force = false): Promise<void> {
  if (!force && state.loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const r = await api<{ prospect: StatusOption[]; contract: StatusOption[] }>(
        "/status_options.php",
      );
      setState({
        prospect: r.prospect?.length ? r.prospect : FALLBACK.prospect,
        contract: r.contract?.length ? r.contract : FALLBACK.contract,
        loaded: true,
      });
    } catch {
      // keep fallback, mark as loaded so we don't spin forever
      setState({ loaded: true });
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
const getSnapshot = () => state;

// ----- public hook --------------------------------------------------------
export function useStatusOptions(entity: StatusEntity) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => { void fetchAll(); }, []);
  const refresh = useCallback(() => fetchAll(true), []);
  return { options: snap[entity], values: snap[entity].map((o) => o.value), loaded: snap.loaded, refresh };
}

// Imperative refresh for the admin page after CRUD operations.
export function refreshStatusOptions() { return fetchAll(true); }
