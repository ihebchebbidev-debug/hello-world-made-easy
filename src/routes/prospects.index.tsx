import { isAssignableRole, isFieldRole} from "@/lib/permissions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { ClipboardList, Plus, Download, MessageSquare, RefreshCw, ArrowUpDown, Pencil, Loader2, CalendarPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { api, API_ENABLED } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import {
  fetchProspectsPage,
  fetchProspectIdsForFilter,
  type ProspectFilters,
  type ProspectSortField,
  type SortDir,
} from "@/lib/erpPagination";
import type { Prospect } from "@/lib/types";
import { useStatusOptions } from "@/lib/useStatusOptions";
import { useOptionList } from "@/lib/useOptionList";


import { useNavigate } from "@tanstack/react-router";
import { FilterBar, type FilterChip } from "@/components/FilterBar";
import { SavedViews } from "@/components/SavedViews";
import { CustomColumnsPicker } from "@/components/CustomColumnsPicker";
import { useCustomFieldsTable, formatCustomValue } from "@/lib/useCustomFields";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/prospects/")({
  head: () => ({
    meta: [
      { title: "Prospects — Protection ERP" },
      { name: "description", content: "Gestion des leads: filtrage, statut d'appel, assignation et suivi." },
    ],
  }),
  component: ProspectsPage,
});

const statusColor: Record<string, string> = {
  "Vente": "bg-success/15 text-success border-success/20",
  "RDV": "bg-info/15 text-info border-info/20",
  "Devis": "bg-primary/10 text-primary border-primary/20",
  "A recontacter (Voir Commentaire)": "bg-warning/15 text-warning-foreground border-warning/20",
  "Sans réponse": "bg-muted text-muted-foreground border-border",
  "Refus": "bg-destructive/10 text-destructive border-destructive/20",
};

const ALL = "__all__";
const PAGE_SIZE_OPTIONS = [50, 100, 500, 2000];

// STATUS_OPTIONS and SOURCE_OPTIONS now come from dynamic hooks — see ProspectsPage.
const CHECK_OPTIONS = [
  { v: ALL, label: "All" },
  { v: "valid", label: "Valide" },
  { v: "invalid", label: "Invalide" },
  { v: "pending", label: "En attente" },
];

function ProspectsPage() {
  const { users } = useErp();
  const { values: STATUS_OPTIONS } = useStatusOptions("prospect");
  const { values: SOURCE_OPTIONS } = useOptionList("prospect", "source");
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAgent = isFieldRole(user?.role);
  const confirmDialog = useConfirm();
  const agentOptions = useMemo(
    () => users.filter((u) => isAssignableRole(u.role)).map((u) => u.username),
    [users],
  );

  // Search input (debounced) + applied query
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Filters
  const [statut, setStatut] = useState(ALL);
  const [assigne, setAssigne] = useState(ALL);
  const [source, setSource] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [check, setCheck] = useState(ALL);

  // Sort + pagination
  const [sortBy, setSortBy] = useState<ProspectSortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Selection (per-page)
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Custom fields
  const { defs: customDefs, valuesById: customValuesById } = useCustomFieldsTable("prospect");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set());
  const [customFilters, setCustomFilters] = useState<Record<string, string>>({});
  const setCustomFilter = (k: string, v: string) =>
    setCustomFilters((prev) => {
      const next = { ...prev };
      if (!v) delete next[k]; else next[k] = v;
      return next;
    });

  // Server-paginated data
  const [rows, setRows] = useState<Prospect[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  // Build filters object for the API
  const filters: ProspectFilters = useMemo(() => ({
    q: search.trim() || undefined,
    status: statut !== ALL ? statut : undefined,
    source: source !== ALL ? source : undefined,
    assignedTo: assigne !== ALL ? assigne : undefined,
    checkValeur: check !== ALL ? check : undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
  }), [search, statut, source, assigne, check, dateFrom, dateTo]);

  // Reset page when filters/sort/pageSize change
  useEffect(() => { setPage(1); setSelected(new Set()); }, [search, statut, source, assigne, check, dateFrom, dateTo, sortBy, sortDir, pageSize]);

  // Debounce search input → search. Longer wait while typing mid-word so
  // we don't fire heavy queries on every keystroke at 100k+ rows.
  useEffect(() => {
    const v = searchInput.trim();
    const wait = v.length === 0 ? 0 : v.length < 3 ? 600 : 350;
    const t = setTimeout(() => setSearch(searchInput), wait);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch page from server when inputs change
  const loadPage = useCallback(async () => {
    if (!API_ENABLED) return;
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const r = await fetchProspectsPage({ page, pageSize, filters, sort: sortBy, dir: sortDir });
      if (myReq !== reqIdRef.current) return; // stale
      setRows(r.rows);
      setTotal(r.total);
    } catch (e: any) {
      if (myReq !== reqIdRef.current) return;
      setError(e?.message ?? "Erreur de chargement");
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, [page, pageSize, filters, sortBy, sortDir]);

  useEffect(() => { void loadPage(); }, [loadPage]);

  // Apply client-side custom field filters on top of the current page
  const visibleRows = useMemo(() => {
    const cfEntries = Object.entries(customFilters);
    if (!cfEntries.length) return rows;
    return rows.filter((p) => {
      const vals = customValuesById[p.id] ?? {};
      for (const [k, want] of cfEntries) {
        const v = String(vals[k] ?? "").toLowerCase();
        if (!v.includes(want.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, customFilters, customValuesById]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const fromIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIdx = Math.min(page * pageSize, total);

  const reset = () => {
    setSearchInput(""); setSearch("");
    setStatut(ALL); setAssigne(ALL); setSource(ALL);
    setDateFrom(""); setDateTo(""); setCheck(ALL);
    setCustomFilters({});
    toast.success("Filtres réinitialisés");
  };

  const toggleSort = (f: ProspectSortField) => {
    if (sortBy === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(f); setSortDir("asc"); }
  };

  const toggleAll = (v: boolean) => setSelected(v ? new Set(visibleRows.map((p) => p.id)) : new Set());
  const toggleOne = (id: string, v: boolean) => setSelected((prev) => {
    const next = new Set(prev);
    if (v) next.add(id); else next.delete(id);
    return next;
  });

  // Select all matching the current filter (server-side ids endpoint)
  const selectAllMatching = useCallback(async () => {
    try {
      const ids = await fetchProspectIdsForFilter(filters);
      setSelected(new Set(ids));
      toast.success(`${ids.length.toLocaleString("fr-FR")} prospect(s) sélectionné(s)`);
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de la sélection globale");
    }
  }, [filters]);

  type ViewState = {
    search: string; statut: string; assigne: string; source: string;
    dateFrom: string; dateTo: string; check: string;
    sortBy: ProspectSortField; sortDir: SortDir;
  };
  const currentView: ViewState = { search, statut, assigne, source, dateFrom, dateTo, check, sortBy, sortDir };
  const applyView = (v: ViewState) => {
    setSearchInput(v.search ?? ""); setSearch(v.search ?? "");
    setStatut(v.statut ?? ALL); setAssigne(v.assigne ?? ALL);
    setSource(v.source ?? ALL); setDateFrom(v.dateFrom ?? ""); setDateTo(v.dateTo ?? "");
    setCheck(v.check ?? ALL); setSortBy(v.sortBy ?? "createdAt"); setSortDir(v.sortDir ?? "desc");
  };
  const eqView = (a: ViewState, b: ViewState) =>
    a.search === b.search && a.statut === b.statut && a.assigne === b.assigne &&
    a.source === b.source && a.dateFrom === b.dateFrom && a.dateTo === b.dateTo &&
    a.check === b.check && a.sortBy === b.sortBy && a.sortDir === b.sortDir;

  return (
    <AppLayout skeleton="table">
      <PageHeader
        title="Prospects"
        description={`${total.toLocaleString("fr-FR")} leads dans la base — gérez vos prospects et leur statut`}
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <>
            <SavedViews scope="prospects" current={currentView} onApply={applyView} isEqual={eqView} />
            <CustomColumnsPicker
              defs={customDefs}
              visible={visibleCols}
              onToggle={(k, v) => setVisibleCols((prev) => {
                const n = new Set(prev);
                if (v) n.add(k); else n.delete(k);
                return n;
              })}
            />
            {!isAgent && (
              <Button asChild variant="outline" size="sm">
                <Link to="/prospects/export"><Download className="h-4 w-4 mr-1.5" />Exporter</Link>
              </Button>
            )}
            {!isAgent && (
              <Button asChild variant="outline" size="sm">
                <Link to="/prospects/import"><Download className="h-4 w-4 mr-1.5 rotate-180" />Importer</Link>
              </Button>
            )}
            <Button size="sm" onClick={() => navigate({ to: "/prospects/new" })}>
              <Plus className="h-4 w-4 mr-1.5" /> Nouveau prospect
            </Button>
          </>
        }
      />

      <div className="mt-6 space-y-4">
          {(() => {
            const chips: FilterChip[] = [];
            if (statut !== ALL) chips.push({ key: "statut", label: `Statut: ${statut}`, onClear: () => setStatut(ALL) });
            if (assigne !== ALL) chips.push({ key: "assigne", label: `Assigné: ${assigne}`, onClear: () => setAssigne(ALL) });
            if (source !== ALL) chips.push({ key: "source", label: `Source: ${source}`, onClear: () => setSource(ALL) });
            if (check !== ALL) chips.push({ key: "check", label: `Check: ${check}`, onClear: () => setCheck(ALL) });
            if (dateFrom) chips.push({ key: "df", label: `Du ${dateFrom}`, onClear: () => setDateFrom("") });
            if (dateTo) chips.push({ key: "dt", label: `Au ${dateTo}`, onClear: () => setDateTo("") });
            for (const [k, val] of Object.entries(customFilters)) {
              const def = customDefs.find((d) => d.key === k);
              if (def) chips.push({ key: `cf-${k}`, label: `${def.label}: ${val}`, onClear: () => setCustomFilter(k, "") });
            }
            return (
              <FilterBar
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Rechercher par nom, prénom, téléphone, ville…"
                onSearch={() => { setSearch(searchInput); }}
                onReset={reset}
                activeChips={chips}
                resultsCount={total}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <FilterField label="Statut Appel">
                    <FilterSelect value={statut} onChange={setStatut} placeholder="Statut Appel" options={STATUS_OPTIONS} />
                  </FilterField>
                  <FilterField label="Assigné à">
                    <FilterSelect value={assigne} onChange={setAssigne} placeholder="Assigné à" options={agentOptions} />
                  </FilterField>
                  <FilterField label="Source Prospect">
                    <FilterSelect value={source} onChange={setSource} placeholder="Source Prospect" options={SOURCE_OPTIONS} />
                  </FilterField>
                  <FilterField label="Date Ajout (du)"><DatePicker value={dateFrom} onChange={setDateFrom} /></FilterField>
                  <FilterField label="Date Ajout (au)"><DatePicker value={dateTo} onChange={setDateTo} /></FilterField>
                  <FilterField label="Check Valeur">
                    <Select value={check} onValueChange={setCheck}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CHECK_OPTIONS.map((o) => <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FilterField>
                  {customDefs.map((def) => (
                    <FilterField key={def.id} label={`${def.label} (page courante)`}>
                      {def.type === "select" ? (
                        <Select
                          value={customFilters[def.key] ?? ALL}
                          onValueChange={(v) => setCustomFilter(def.key, v === ALL ? "" : v)}
                        >
                          <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL}>Tous</SelectItem>
                            {(def.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : def.type === "boolean" ? (
                        <Select
                          value={customFilters[def.key] ?? ALL}
                          onValueChange={(v) => setCustomFilter(def.key, v === ALL ? "" : v)}
                        >
                          <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL}>Tous</SelectItem>
                            <SelectItem value="1">Oui</SelectItem>
                            <SelectItem value="0">Non</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={def.type === "number" ? "number" : def.type === "date" ? "date" : "text"}
                          value={customFilters[def.key] ?? ""}
                          onChange={(e) => setCustomFilter(def.key, e.target.value)}
                          placeholder="Contient…"
                        />
                      )}
                    </FilterField>
                  ))}
                </div>
              </FilterBar>
            );
          })()}

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <Card className="p-3 shadow-elegant bg-primary/5 border-primary/20 flex items-center justify-between gap-2 flex-wrap">
              <div className="text-sm font-medium">{selected.size.toLocaleString("fr-FR")} prospect(s) sélectionné(s)</div>
              <div className="flex gap-2 items-center flex-wrap">
                {selected.size < total && (
                  <Button variant="outline" size="sm" onClick={selectAllMatching}>
                    Tout sélectionner ({total.toLocaleString("fr-FR")})
                  </Button>
                )}
                {!isAgent && (
                <Select
                  onValueChange={async (val) => {
                    const ids = Array.from(selected);
                    if (!API_ENABLED) { toast.error("API non configurée"); return; }
                    try {
                      const r = await api<{ updated: number }>("/prospects.php?action=bulk", {
                        method: "POST",
                        body: { action: "bulk", op: "assign", ids, assignedTo: val },
                      });
                      toast.success(`${r.updated} prospect(s) réassigné(s) à ${val}`);
                      setSelected(new Set());
                      await loadPage();
                    } catch (e: any) {
                      toast.error(e?.message ?? "Échec de la réassignation");
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Réassigner à…" /></SelectTrigger>
                  <SelectContent>
                    {agentOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const ids = Array.from(selected);
                    if (!API_ENABLED) { toast.error("API non configurée"); return; }
                    const ok = await confirmDialog({
                      title: "Archiver les prospects",
                      description: <>Archiver <b>{ids.length}</b> prospect(s) (statut <i>"Sans réponse"</i>) ?</>,
                      confirmLabel: "Archiver",
                    });
                    if (!ok) return;
                    try {
                      const r = await api<{ updated: number }>("/prospects.php?action=bulk", {
                        method: "POST",
                        body: { action: "bulk", op: "status", ids, status: "Sans réponse" },
                      });
                      toast.success(`${r.updated} prospect(s) archivé(s)`);
                      setSelected(new Set());
                      await loadPage();
                    } catch (e: any) {
                      toast.error(e?.message ?? "Échec de l'archivage");
                    }
                  }}
                >Archiver</Button>
                {user?.role === "Administrateur" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const ids = Array.from(selected);
                      if (!API_ENABLED) { toast.error("API non configurée"); return; }
                      const ok = await confirmDialog({
                        title: "Supprimer les prospects",
                        description: <>Voulez-vous supprimer définitivement <b>{ids.length}</b> prospect(s) ?</>,
                        destructive: true,
                      });
                      if (!ok) return;
                      try {
                        // Chunk by 500 ids so very large selections don't hit
                        // PHP post_max_size / max_input_vars and so a single
                        // failing chunk doesn't wipe out the whole operation.
                        const CHUNK = 500;
                        let deleted = 0;
                        const errors: string[] = [];
                        for (let i = 0; i < ids.length; i += CHUNK) {
                          const slice = ids.slice(i, i + CHUNK);
                          try {
                            const r = await api<{ deleted: number }>("/prospects.php?action=bulk", {
                              method: "POST",
                              body: { action: "bulk", op: "delete", ids: slice },
                            });
                            deleted += Number(r.deleted ?? 0);
                          } catch (err: any) {
                            errors.push(err?.message ?? "Erreur inconnue");
                          }
                        }
                        if (errors.length) {
                          toast.error(`${deleted}/${ids.length} supprimé(s) — ${errors.length} lot(s) en échec`, {
                            description: errors[0],
                          });
                        } else {
                          toast.success(`${deleted} prospect(s) supprimé(s)`);
                        }
                        setSelected(new Set());
                        await loadPage();
                      } catch (e: any) {
                        toast.error(e?.message ?? "Échec de la suppression");
                      }
                    }}
                  >Supprimer</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Désélectionner</Button>
              </div>
            </Card>
          )}

          {error && (
            <Card className="p-3 border-destructive/30 bg-destructive/5 text-sm text-destructive">{error}</Card>
          )}

          <Card className="shadow-elegant overflow-hidden relative">
            {loading && (
              <div className="absolute top-2 right-3 z-10 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Chargement…
              </div>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={visibleRows.length > 0 && visibleRows.every((p) => selected.has(p.id))}
                        onCheckedChange={(v) => toggleAll(!!v)}
                        aria-label="Tout sélectionner"
                      />
                    </TableHead>
                    <SortableHead label="Nom" field="lastName" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                    <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                    <SortableHead label="Date Ajout" field="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} className="hidden lg:table-cell" />
                    <SortableHead label="Source Prospect" field="source" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} className="hidden lg:table-cell" />
                    <SortableHead label="Statut" field="status" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                    <SortableHead label="Assigné À" field="assignedTo" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} className="hidden md:table-cell" />
                    {customDefs.filter((d) => visibleCols.has(d.key)).map((d) => (
                      <TableHead key={d.id} className="text-xs">{d.label}</TableHead>
                    ))}
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-muted/30 transition-base cursor-pointer"
                      onClick={(e) => {
                        const t = e.target as HTMLElement;
                        if (t.closest("a,button,input,label,[data-no-row-click]")) return;
                        navigate({ to: "/prospects/$prospectId", params: { prospectId: p.id } });
                      }}
                    >
                      <TableCell data-no-row-click onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(p.id)}
                          onCheckedChange={(v) => toggleOne(p.id, !!v)}
                          aria-label={`Sélectionner ${p.lastName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/prospects/$prospectId"
                          params={{ prospectId: p.id }}
                          className="flex items-center gap-3 hover:text-primary transition-base"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                            {p.firstName?.[0] ?? "?"}{p.lastName?.[0] ?? "?"}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{p.civility} {p.lastName}</div>
                            <div className="text-xs text-muted-foreground">{p.firstName} • {p.city}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{p.phone}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(p.createdAt) ?? "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{p.source}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={statusColor[p.status] ?? ""}>{p.status}</Badge>
                          {p.comment && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">{p.comment}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {p.assignedTo ?? <span className="italic">Non attribué</span>}
                      </TableCell>
                      {customDefs.filter((d) => visibleCols.has(d.key)).map((d) => (
                        <TableCell key={d.id} className="text-sm text-muted-foreground">
                          {formatCustomValue(d, customValuesById[p.id]?.[d.key])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Planifier un RDV"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({ to: "/calendar", search: { prospectId: p.id, newEvent: "1" } });
                            }}
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link to="/prospects/$prospectId/edit" params={{ prospectId: p.id }} aria-label="Modifier">
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadPage()} title="Recharger">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && visibleRows.length === 0 && (
                    <TableRow><TableCell colSpan={20} className="text-center text-sm text-muted-foreground py-8">Aucun résultat</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span>
                  {total === 0 ? "Aucun résultat" : `${fromIdx.toLocaleString("fr-FR")}–${toIdx.toLocaleString("fr-FR")} sur ${total.toLocaleString("fr-FR")}`}
                </span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="h-7 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((s) => <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1 items-center">
                <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</Button>
                <span className="text-xs px-2">Page {page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Suivant</Button>
              </div>
            </div>
          </Card>
      </div>
    </AppLayout>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function FilterSelect({
  value, onChange, placeholder, options,
}: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Tous</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function SortableHead({
  label, field, sortBy, sortDir, onSort, className,
}: {
  label: string;
  field: ProspectSortField;
  sortBy: ProspectSortField;
  sortDir: SortDir;
  onSort: (f: ProspectSortField) => void;
  className?: string;
}) {
  const active = sortBy === field;
  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-base"
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "text-foreground" : "text-muted-foreground/50"}`} />
        {active && <span className="text-[10px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </TableHead>
  );
}
