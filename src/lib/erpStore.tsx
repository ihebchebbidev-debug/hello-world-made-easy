import { createContext, useContext, useMemo, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Prospect, AppUser, Contract, CalEvent } from "./types";

import { formatAmount } from "./currency";
import { api, API_ENABLED } from "./api";
import { useAuth } from "./auth";

export type ActivityField = "billingStatus" | "premium" | "attachment_added" | "attachment_removed";
export type ActivityEntry = {
  id: string;
  contractId: string;
  field: ActivityField;
  previousValue: string;
  newValue: string;
  user: string;
  timestamp: string; // ISO
};

export type ImportResult = { added: number; updated: number; skipped: number };

type ErpState = {
  prospects: Prospect[];
  users: AppUser[];
  contracts: Contract[];
  activity: ActivityEntry[];
  events: CalEvent[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  // actions
  claimLead: (prospectId: string, agentUsername: string) => Promise<void> | void;
  markWon: (prospectId: string, premium?: number, partner?: string) => Promise<void> | void;
  markLost: (prospectId: string, reason?: string) => Promise<void> | void;
  updateContractBilling: (contractId: string, billingStatus: Contract["billingStatus"]) => Promise<void> | void;
  updateContractPremium: (contractId: string, premium: number) => Promise<void> | void;
  // prospect updates
  updateProspect: (id: string, patch: Partial<Prospect>) => Promise<void> | void;
  deleteProspect: (id: string) => Promise<void> | void;
  // user CRUD
  saveUser: (u: Partial<AppUser> & { password?: string }) => Promise<void> | void;
  deleteUser: (id: string) => Promise<void> | void;
  // calendar CRUD
  saveEvent: (e: Partial<CalEvent>) => Promise<void> | void;
  deleteEvent: (id: string) => Promise<void> | void;
  // bulk imports — upsert by id, returns add/update counts
  importProspects: (rows: Partial<Prospect>[]) => Promise<ImportResult> | ImportResult;
  importContracts: (rows: Partial<Contract>[]) => Promise<ImportResult> | ImportResult;
  importUsers: (rows: Partial<AppUser>[]) => Promise<ImportResult> | ImportResult;
  // selectors
  getAgentStats: (username: string) => { handled: number; won: number; lost: number; pending: number; conversion: number };
  getContractActivity: (contractId: string) => ActivityEntry[];
  logActivity: (contractId: string, field: ActivityField, previousValue: string, newValue: string) => void;
  refresh: () => Promise<void>;
};

const ErpContext = createContext<ErpState | null>(null);

function recomputeUsers(users: AppUser[], prospects: Prospect[]): AppUser[] {
  return users.map((u) => {
    const mine = prospects.filter((p) => p.assignedTo === u.username);
    const won = mine.filter((p) => p.outcome === "won").length;
    const handled = mine.length;
    const conv = handled > 0 ? (won / handled) * 100 : 0;
    if (u.role !== "Agent" && u.role !== "Manager") return u;
    return { ...u, leadsHandled: handled, contractsWon: won, conversionRate: Number(conv.toFixed(1)) };
  });
}

export function ErpProvider({ children }: { children: ReactNode }) {
  const auth = (() => { try { return useAuth(); } catch { return null; } })();
  const isLogged = !!auth?.user;

  // API is the source of truth — start empty, refresh() populates from backend.
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [importedUsers, setImportedUsers] = useState<AppUser[]>([]);
  const [serverUsers, setServerUsers] = useState<AppUser[] | null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(API_ENABLED);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(!API_ENABLED);

  const liveUsers = serverUsers;
  const users = useMemo(
    () => recomputeUsers(liveUsers ?? importedUsers, prospects),
    [liveUsers, importedUsers, prospects],
  );

  const refresh = useCallback(async () => {
    if (!API_ENABLED || !isLogged) return;
    setLoading(true);
    setError(null);
    try {
      // Critical data — block hydration on these.
      // NOTE: prospects/contracts are capped at 2000 rows here on purpose so
      // very large tables never crash the app. Index pages now drive their own
      // server-paginated queries via /lib/erpPagination.
      const [p, c, u, ev] = await Promise.all([
        api<{ prospects: Prospect[] }>("/prospects.php", { query: { page: 1, pageSize: 2000 } }),
        api<{ contracts: Contract[] }>("/contracts.php", { query: { page: 1, pageSize: 2000 } }),
        api<{ users: AppUser[] }>("/users.php"),
        api<{ events: CalEvent[] }>("/calendar.php"),
      ]);
      setProspects(p.prospects ?? []);
      setContracts(c.contracts ?? []);
      setServerUsers(u.users ?? []);
      setEvents(ev.events ?? []);
      setHydrated(true);
      // Activity log can be large — load in background, never block UI.
      api<{ activity: ActivityEntry[] }>("/activity.php")
        .then((ac) => setActivity(ac.activity ?? []))
        .catch(() => { /* non-critical */ });
    } catch (e: any) {
      console.warn("ERP refresh failed", e);
      const msg = e?.status === 401
        ? "Votre session a expiré. Veuillez vous reconnecter."
        : e?.status === 0 || e?.message === "Failed to fetch"
        ? "Impossible de joindre le serveur. Vérifiez votre connexion."
        : e?.status >= 500
        ? "Le serveur est momentanément indisponible. Réessayez dans un instant."
        : (e?.message ?? "Une erreur est survenue lors du chargement des données.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isLogged]);

  useEffect(() => { void refresh(); }, [refresh]);

  // Targeted slice reloads — avoid pulling the whole dataset for one change.
  const reloadProspects = useCallback(async () => {
    if (!API_ENABLED || !isLogged) return;
    try {
      const r = await api<{ prospects: Prospect[] }>("/prospects.php", { query: { page: 1, pageSize: 2000 } });
      setProspects(r.prospects ?? []);
    } catch (e) { console.warn("reloadProspects failed", e); }
  }, [isLogged]);
  const reloadContracts = useCallback(async () => {
    if (!API_ENABLED || !isLogged) return;
    try {
      const r = await api<{ contracts: Contract[] }>("/contracts.php", { query: { page: 1, pageSize: 2000 } });
      setContracts(r.contracts ?? []);
    } catch (e) { console.warn("reloadContracts failed", e); }
  }, [isLogged]);
  const reloadEvents = useCallback(async () => {
    if (!API_ENABLED || !isLogged) return;
    try {
      const r = await api<{ events: CalEvent[] }>("/calendar.php");
      setEvents(r.events ?? []);
    } catch (e) { console.warn("reloadEvents failed", e); }
  }, [isLogged]);
  const reloadUsers = useCallback(async () => {
    if (!API_ENABLED || !isLogged) return;
    try {
      const r = await api<{ users: AppUser[] }>("/users.php");
      setServerUsers(r.users ?? []);
    } catch (e) { console.warn("reloadUsers failed", e); }
  }, [isLogged]);

  // ---------- Local fallback helpers ----------
  const logActivityLocal = useCallback(
    (contractId: string, field: ActivityField, previousValue: string, newValue: string) => {
      setActivity((prev) => [
        {
          id: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          contractId, field, previousValue, newValue,
          user: auth?.user?.username ?? "system",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [auth?.user?.username],
  );

  // ---------- Mutations ----------
  const claimLead = useCallback(async (prospectId: string, agentUsername: string) => {
    if (API_ENABLED) {
      await api("/prospects.php", { method: "POST", body: { action: "claim", id: prospectId } });
      // Optimistic local patch — no full reload needed.
      setProspects((prev) => prev.map((p) =>
        p.id === prospectId
          ? { ...p, assignedTo: agentUsername, status: "A recontacter (Voir Commentaire)" }
          : p,
      ));
      return;
    }
    setProspects((prev) =>
      prev.map((p) =>
        p.id === prospectId && p.assignedTo === null
          ? { ...p, assignedTo: agentUsername, status: "A recontacter (Voir Commentaire)" }
          : p,
      ),
    );
  }, []);

  const markWon = useCallback(async (prospectId: string, premium = 950, partner = "NEOLIANE") => {
    if (API_ENABLED) {
      await api("/prospects.php", { method: "POST", body: { action: "mark_won", id: prospectId, premium, partner } });
      // Patch prospect locally; refetch only contracts (server creates a new one).
      setProspects((prev) => prev.map((p) =>
        p.id === prospectId ? { ...p, outcome: "won", status: "Vente" } : p,
      ));
      void reloadContracts();
      return;
    }
    setProspects((prev) => prev.map((p) =>
      p.id === prospectId ? { ...p, outcome: "won", status: "Vente" } : p,
    ));
    setContracts((prev) => {
      const p = prospects.find((x) => x.id === prospectId);
      if (!p) return prev;
      const today = new Date().toISOString().slice(0, 10);
      const newContract: Contract = {
        id: `C-${6000 + prev.length}`,
        lastName: p.lastName, firstName: p.firstName, city: p.city,
        partner, cabinet: "Cabinet Paris 1",
        signatureDate: today, effectiveDate: today, validationDate: null,
        premium, billingStatus: "Pré-validé",
        source: p.source, assignedTo: p.assignedTo ?? "—",
      };
      return [newContract, ...prev];
    });
  }, [reloadContracts, prospects]);

  const markLost = useCallback(async (prospectId: string, reason = "Non précisé") => {
    if (API_ENABLED) {
      await api("/prospects.php", { method: "POST", body: { action: "mark_lost", id: prospectId, reason } });
      setProspects((prev) => prev.map((p) =>
        p.id === prospectId ? { ...p, outcome: "lost", status: "Sans réponse", lostReason: reason } : p,
      ));
      return;
    }
    setProspects((prev) => prev.map((p) =>
      p.id === prospectId ? { ...p, outcome: "lost", status: "Sans réponse", lostReason: reason } : p,
    ));
  }, []);

  const updateContractBilling = useCallback(async (contractId: string, billingStatus: Contract["billingStatus"]) => {
    if (API_ENABLED) {
      await api("/contracts.php", { method: "PATCH", body: { id: contractId, billingStatus } });
      setContracts((prev) => prev.map((c) =>
        c.id === contractId
          ? {
              ...c, billingStatus,
              validationDate: billingStatus === "Validé Confirmation"
                ? new Date().toISOString().slice(0, 10)
                : c.validationDate,
            }
          : c,
      ));
      return;
    }
    setContracts((prev) => prev.map((c) => {
      if (c.id !== contractId) return c;
      if (c.billingStatus !== billingStatus) {
        logActivityLocal(contractId, "billingStatus", c.billingStatus, billingStatus);
      }
      return {
        ...c, billingStatus,
        validationDate: billingStatus === "Validé Confirmation"
          ? new Date().toISOString().slice(0, 10)
          : c.validationDate,
      };
    }));
  }, [logActivityLocal]);

  const updateContractPremium = useCallback(async (contractId: string, premium: number) => {
    if (API_ENABLED) {
      await api("/contracts.php", { method: "PATCH", body: { id: contractId, premium } });
      setContracts((prev) => prev.map((c) =>
        c.id === contractId ? { ...c, premium } : c,
      ));
      return;
    }
    setContracts((prev) => prev.map((c) => {
      if (c.id !== contractId) return c;
      if (c.premium !== premium) {
        logActivityLocal(contractId, "premium", formatAmount(c.premium), formatAmount(premium));
      }
      return { ...c, premium };
    }));
  }, [logActivityLocal]);

  const updateProspect = useCallback(async (id: string, patch: Partial<Prospect>) => {
    if (API_ENABLED) {
      await api("/prospects.php", { method: "PATCH", body: { id, ...patch } });
      setProspects((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
      return;
    }
    setProspects((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const deleteProspect = useCallback(async (id: string) => {
    if (API_ENABLED) {
      await api(`/prospects.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setProspects((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    setProspects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const saveUser = useCallback(async (u: Partial<AppUser> & { password?: string }) => {
    if (API_ENABLED) {
      await api("/users.php", { method: "POST", body: u });
      await reloadUsers();
      return;
    }
    setImportedUsers((prev) => {
      const exists = prev.findIndex((x) => (u.id && x.id === u.id) || x.username === u.username);
      const next: AppUser = {
        id: u.id ?? `U-${Date.now()}`,
        username: u.username ?? "",
        fullName: u.fullName ?? "",
        email: u.email ?? "",
        role: (u.role ?? "Agent") as AppUser["role"],
        team: u.team ?? "Lead-Actifs",
        active: u.active ?? true,
        contractsWon: u.contractsWon ?? 0,
        leadsHandled: u.leadsHandled ?? 0,
        conversionRate: u.conversionRate ?? 0,
      };
      if (exists >= 0) { const c = [...prev]; c[exists] = next; return c; }
      return [...prev, next];
    });
  }, [reloadUsers]);

  const deleteUser = useCallback(async (id: string) => {
    if (API_ENABLED) {
      await api(`/users.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      await reloadUsers();
      return;
    }
    setImportedUsers((prev) => prev.filter((u) => u.id !== id));
  }, [reloadUsers]);

  const saveEvent = useCallback(async (e: Partial<CalEvent>) => {
    const currentUser = auth?.user?.username ?? "system";
    const payload: Partial<CalEvent> = { ...e, agent: e.agent ?? currentUser };
    if (API_ENABLED) {
      if (payload.id && events.some((x) => x.id === payload.id)) {
        await api("/calendar.php", { method: "PUT", body: payload });
      } else {
        await api("/calendar.php", { method: "POST", body: payload });
      }
      await reloadEvents();
      return;
    }
    setEvents((prev) => {
      if (payload.id && prev.some((x) => x.id === payload.id)) {
        return prev.map((x) => x.id === payload.id ? { ...x, ...payload } as CalEvent : x);
      }
      return [...prev, {
        id: payload.id ?? `E-${Date.now()}`,
        title: payload.title ?? "Sans titre",
        date: payload.date ?? new Date().toISOString().slice(0, 10),
        time: payload.time ?? "09:00",
        type: (payload.type ?? "rdv") as CalEvent["type"],
        agent: payload.agent ?? currentUser,
      }];
    });
  }, [reloadEvents, events, auth?.user?.username]);

  const deleteEvent = useCallback(async (id: string) => {
    if (API_ENABLED) {
      await api(`/calendar.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ---------- Selectors ----------
  const getContractActivity = useCallback(
    (contractId: string) => activity.filter((a) => a.contractId === contractId),
    [activity],
  );

  const getAgentStats = useCallback((username: string) => {
    const mine = prospects.filter((p) => p.assignedTo === username);
    const won = mine.filter((p) => p.outcome === "won").length;
    const lost = mine.filter((p) => p.outcome === "lost").length;
    const pending = mine.filter((p) => p.outcome === "pending").length;
    const handled = mine.length;
    const conversion = handled ? (won / handled) * 100 : 0;
    return { handled, won, lost, pending, conversion };
  }, [prospects]);

  // ---------- Bulk imports ----------
  const importProspects = useCallback(async (rows: Partial<Prospect>[]): Promise<ImportResult> => {
    if (API_ENABLED) {
      // ImportFlow already slices into batches before calling us, but the PHP
      // backend can occasionally drop a single bad row in a batch (encoding
      // issues, duplicate id race, etc). Re-chunking here and catching per
      // chunk guarantees a partial failure never wipes the whole import —
      // we just count what succeeded and surface the rest as "skipped".
      const CHUNK = 250;
      let added = 0, updated = 0, skipped = 0;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        try {
          const r = await api<ImportResult>("/prospects.php", { method: "POST", body: { rows: slice } });
          added += Number(r.added ?? 0);
          updated += Number(r.updated ?? 0);
          skipped += Number(r.skipped ?? 0);
        } catch (err) {
          console.error("[importProspects] batch failed", err);
          skipped += slice.length;
        }
      }
      await reloadProspects();
      return { added, updated, skipped };
    }
    const today = new Date().toISOString().slice(0, 10);
    let added = 0, updated = 0, skipped = 0;
    setProspects((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      for (const r of rows) {
        const lastName = String(r.lastName ?? "").trim();
        if (!lastName) { skipped++; continue; }
        const id = String(r.id ?? `P-IMP-${Date.now()}-${added + updated}`);
        const existing = byId.get(id);
        const next: Prospect = {
          id, civility: (r.civility === "Mme" ? "Mme" : "M"), lastName,
          firstName: String(r.firstName ?? existing?.firstName ?? "").trim(),
          phone: String(r.phone ?? existing?.phone ?? "").trim(),
          email: String(r.email ?? existing?.email ?? "").trim(),
          source: String(r.source ?? existing?.source ?? "Web"),
          status: String(r.status ?? existing?.status ?? "A recontacter (Voir Commentaire)"),
          assignedTo: r.assignedTo !== undefined ? (r.assignedTo ? String(r.assignedTo) : null) : (existing?.assignedTo ?? null),
          createdAt: String(r.createdAt ?? existing?.createdAt ?? today),
          city: String(r.city ?? existing?.city ?? "").toUpperCase(),
          outcome: (r.outcome ?? existing?.outcome ?? "pending") as Prospect["outcome"],
          checkValeur: (r.checkValeur ?? existing?.checkValeur ?? "pending") as Prospect["checkValeur"],
        };
        if (r.lostReason ?? existing?.lostReason) next.lostReason = String(r.lostReason ?? existing?.lostReason);
        if (r.comment ?? existing?.comment) next.comment = String(r.comment ?? existing?.comment);
        byId.set(id, next);
        if (existing) updated++; else added++;
      }
      return Array.from(byId.values());
    });
    return { added, updated, skipped };
  }, [reloadProspects]);

  const importContracts = useCallback(async (rows: Partial<Contract>[]): Promise<ImportResult> => {
    if (API_ENABLED) {
      const r = await api<ImportResult>("/contracts.php", { method: "POST", body: { rows } });
      await reloadContracts();
      return { added: r.added, updated: r.updated, skipped: r.skipped };
    }
    const today = new Date().toISOString().slice(0, 10);
    let added = 0, updated = 0, skipped = 0;
    setContracts((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));
      for (const r of rows) {
        const lastName = String(r.lastName ?? "").trim();
        if (!lastName) { skipped++; continue; }
        const id = String(r.id ?? `C-IMP-${Date.now()}-${added + updated}`);
        const existing = byId.get(id);
        const next: Contract = {
          id, lastName,
          firstName: String(r.firstName ?? existing?.firstName ?? "").trim(),
          city: String(r.city ?? existing?.city ?? "").toUpperCase(),
          partner: String(r.partner ?? existing?.partner ?? "NEOLIANE"),
          cabinet: String(r.cabinet ?? existing?.cabinet ?? "Cabinet Paris 1"),
          signatureDate: String(r.signatureDate ?? existing?.signatureDate ?? today),
          effectiveDate: String(r.effectiveDate ?? existing?.effectiveDate ?? today),
          validationDate: r.validationDate !== undefined ? (r.validationDate ? String(r.validationDate) : null) : (existing?.validationDate ?? null),
          premium: Number(r.premium ?? existing?.premium ?? 0) || 0,
          billingStatus: String(r.billingStatus ?? existing?.billingStatus ?? "Pré-validé"),
          source: String(r.source ?? existing?.source ?? "Web"),
          assignedTo: String(r.assignedTo ?? existing?.assignedTo ?? "—"),
        };
        byId.set(id, next);
        if (existing) updated++; else added++;
      }
      return Array.from(byId.values());
    });
    return { added, updated, skipped };
  }, [reloadContracts]);

  const importUsers = useCallback(async (rows: Partial<AppUser>[]): Promise<ImportResult> => {
    if (API_ENABLED) {
      const r = await api<ImportResult>("/users.php", { method: "POST", body: { rows } });
      await reloadUsers();
      return { added: r.added, updated: r.updated, skipped: r.skipped };
    }
    let added = 0, updated = 0, skipped = 0;
    const allCurrent = [...importedUsers];
    const byUsername = new Map(allCurrent.map((u) => [u.username, u]));
    const newOnes: AppUser[] = [];
    const patches = new Map<string, AppUser>();
    for (const r of rows) {
      const username = String(r.username ?? "").trim();
      const fullName = String(r.fullName ?? "").trim();
      if (!username || !fullName) { skipped++; continue; }
      const role = (["Administrateur", "Manager", "Agent", "Backoffice"].includes(String(r.role))
        ? r.role : "Agent") as AppUser["role"];
      const existing = byUsername.get(username);
      const next: AppUser = {
        id: String(r.id ?? existing?.id ?? `U-IMP-${Date.now()}-${added + updated}`),
        username, fullName,
        email: String(r.email ?? existing?.email ?? ""),
        role,
        team: String(r.team ?? existing?.team ?? "Lead-Actifs"),
        active: r.active === false ? false : (existing?.active ?? true),
        contractsWon: Number(r.contractsWon ?? existing?.contractsWon ?? 0) || 0,
        leadsHandled: Number(r.leadsHandled ?? existing?.leadsHandled ?? 0) || 0,
        conversionRate: Number(r.conversionRate ?? existing?.conversionRate ?? 0) || 0,
      };
      if (existing) { patches.set(username, next); updated++; }
      else { newOnes.push(next); added++; }
    }
    setImportedUsers((prev) => {
      const merged = [...prev];
      for (let i = 0; i < merged.length; i++) {
        const p = patches.get(merged[i].username);
        if (p) merged[i] = p;
      }
      return [...merged, ...newOnes];
    });
    return { added, updated, skipped };
  }, [reloadUsers, importedUsers]);

  const value: ErpState = {
    prospects, users, contracts, activity, events, loading, error, hydrated,
    claimLead, markWon, markLost,
    updateContractBilling, updateContractPremium,
    updateProspect, deleteProspect,
    saveUser, deleteUser,
    saveEvent, deleteEvent,
    importProspects, importContracts, importUsers,
    getAgentStats, getContractActivity, logActivity: logActivityLocal, refresh,
  };
  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

export function useErp() {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error("useErp must be used within ErpProvider");
  return ctx;
}

export function useDashboardStats() {
  const { prospects, contracts } = useErp();
  const [server, setServer] = useState<Partial<{
    totalLeads: number; newLeadsToday: number; contractsThisMonth: number;
    contractsToday: number; conversionRate: number; revenueThisMonth: number;
    wonLeads: number; lostLeads: number; pendingLeads: number;
  }> | null>(null);

  useEffect(() => {
    let cancel = false;
    if (!API_ENABLED) return;
    api<{ stats: typeof server }>("/dashboard.php")
      .then((r) => { if (!cancel && r?.stats) setServer(r.stats as any); })
      .catch(() => { /* fall back to client-computed */ });
    return () => { cancel = true; };
  }, [prospects.length, contracts.length]);

  return useMemo(() => {
    const total = prospects.length;
    const won = prospects.filter((p) => p.outcome === "won").length;
    const lost = prospects.filter((p) => p.outcome === "lost").length;
    const pending = prospects.filter((p) => p.outcome === "pending").length;
    const unclaimed = prospects.filter((p) => p.assignedTo === null).length;
    const conv = total ? (won / total) * 100 : 0;
    const today = new Date().toISOString().slice(0, 10);
    const contractsToday = contracts.filter((c) => c.signatureDate === today).length;
    const local = {
      totalLeads: total,
      newLeadsToday: unclaimed,
      contractsThisMonth: contracts.length,
      contractsToday,
      conversionRate: Number(conv.toFixed(1)),
      revenueThisMonth: contracts.reduce((s, c) => s + c.premium, 0),
      wonLeads: won,
      lostLeads: lost,
      pendingLeads: pending,
    };
    return { ...local, ...(server ?? {}) };
  }, [prospects, contracts, server]);
}
