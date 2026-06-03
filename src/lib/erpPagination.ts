// Server-side pagination helpers for prospects & contracts.
// Use these on list pages instead of pulling the full table into memory.
// Backed by `?count=1`, `?page=N&pageSize=...`, `?ids=1` modes added to
// /prospects.php and /contracts.php (backwards compatible).

import { api } from "./api";
import type { Prospect, Contract } from "./types";

export type SortDir = "asc" | "desc";

// ---------- Prospects ----------

export type ProspectFilters = {
  q?: string;
  status?: string;
  outcome?: string;
  source?: string;
  assignedTo?: string; // pass "__none__" for "unassigned"
  checkValeur?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};
export type ProspectSortField =
  | "createdAt" | "lastName" | "firstName" | "status" | "source" | "assignedTo" | "outcome";

function prospectQuery(f: ProspectFilters): Record<string, string> {
  const q: Record<string, string> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v !== undefined && v !== null && v !== "") q[k] = String(v);
  }
  return q;
}

export async function fetchProspectsCount(filters: ProspectFilters = {}): Promise<number> {
  const r = await api<{ total: number }>("/prospects.php", { query: { count: "1", ...prospectQuery(filters) } });
  return r.total ?? 0;
}

export type ProspectsPage = { rows: Prospect[]; total: number; page: number; pageSize: number };

export async function fetchProspectsPage(opts: {
  page?: number;
  pageSize?: number;
  filters?: ProspectFilters;
  sort?: ProspectSortField;
  dir?: SortDir;
}): Promise<ProspectsPage> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 2000;
  const r = await api<{ prospects: Prospect[]; total: number; page: number; pageSize: number }>(
    "/prospects.php",
    {
      query: {
        page: String(page),
        pageSize: String(pageSize),
        sort: opts.sort ?? "createdAt",
        dir: opts.dir ?? "desc",
        ...prospectQuery(opts.filters ?? {}),
      },
    },
  );
  return { rows: r.prospects ?? [], total: r.total ?? 0, page: r.page ?? page, pageSize: r.pageSize ?? pageSize };
}

export async function fetchProspectIdsForFilter(filters: ProspectFilters = {}): Promise<string[]> {
  const r = await api<{ ids: string[] }>("/prospects.php", { query: { ids: "1", ...prospectQuery(filters) } });
  return r.ids ?? [];
}

// Stream every page (used by exports). Yields rows in page batches.
export async function* iterateAllProspects(
  filters: ProspectFilters = {},
  pageSize = 2000,
  sort: ProspectSortField = "createdAt",
  dir: SortDir = "desc",
): AsyncGenerator<Prospect[], void, unknown> {
  let page = 1;
  while (true) {
    const r = await fetchProspectsPage({ page, pageSize, filters, sort, dir });
    if (!r.rows.length) return;
    yield r.rows;
    if (page * r.pageSize >= r.total) return;
    page++;
  }
}

// ---------- Contracts ----------

export type ContractFilters = {
  q?: string;
  billingStatus?: string;
  partner?: string;
  cabinet?: string;
  source?: string;
  assignedTo?: string;
  sigFrom?: string; sigTo?: string;
  effFrom?: string; effTo?: string;
  valFrom?: string; valTo?: string;
};
export type ContractSortField =
  | "signatureDate" | "effectiveDate" | "validationDate" | "premium" | "lastName" | "id";

function contractQuery(f: ContractFilters): Record<string, string> {
  const q: Record<string, string> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v !== undefined && v !== null && v !== "") q[k] = String(v);
  }
  return q;
}

export async function fetchContractsCount(filters: ContractFilters = {}): Promise<number> {
  const r = await api<{ total: number }>("/contracts.php", { query: { count: "1", ...contractQuery(filters) } });
  return r.total ?? 0;
}

export type ContractsPage = { rows: Contract[]; total: number; page: number; pageSize: number };

export async function fetchContractsPage(opts: {
  page?: number;
  pageSize?: number;
  filters?: ContractFilters;
  sort?: ContractSortField;
  dir?: SortDir;
}): Promise<ContractsPage> {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 2000;
  const r = await api<{ contracts: Contract[]; total: number; page: number; pageSize: number }>(
    "/contracts.php",
    {
      query: {
        page: String(page),
        pageSize: String(pageSize),
        sort: opts.sort ?? "signatureDate",
        dir: opts.dir ?? "desc",
        ...contractQuery(opts.filters ?? {}),
      },
    },
  );
  return { rows: r.contracts ?? [], total: r.total ?? 0, page: r.page ?? page, pageSize: r.pageSize ?? pageSize };
}

export async function fetchContractIdsForFilter(filters: ContractFilters = {}): Promise<string[]> {
  const r = await api<{ ids: string[] }>("/contracts.php", { query: { ids: "1", ...contractQuery(filters) } });
  return r.ids ?? [];
}

export async function* iterateAllContracts(
  filters: ContractFilters = {},
  pageSize = 2000,
  sort: ContractSortField = "signatureDate",
  dir: SortDir = "desc",
): AsyncGenerator<Contract[], void, unknown> {
  let page = 1;
  while (true) {
    const r = await fetchContractsPage({ page, pageSize, filters, sort, dir });
    if (!r.rows.length) return;
    yield r.rows;
    if (page * r.pageSize >= r.total) return;
    page++;
  }
}
