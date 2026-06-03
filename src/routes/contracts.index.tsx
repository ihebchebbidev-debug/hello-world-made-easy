import { isAssignableRole, isFieldRole} from "@/lib/permissions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { FileText, Download, ChevronRight, Pencil, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { api, API_ENABLED } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { formatAmount, formatCompact, useCurrency } from "@/lib/currency";
import { exportCSV, withCustomFields, toContractExportRows } from "@/lib/exportUtils";
import {
  fetchContractsPage,
  fetchContractIdsForFilter,
  iterateAllContracts,
  type ContractFilters,
} from "@/lib/erpPagination";


import { FilterBar, type FilterChip } from "@/components/FilterBar";
import { SavedViews } from "@/components/SavedViews";
import { CustomColumnsPicker } from "@/components/CustomColumnsPicker";
import { useCustomFieldsTable, formatCustomValue } from "@/lib/useCustomFields";
import type { Contract } from "@/lib/types";
import { useStatusOptions } from "@/lib/useStatusOptions";
import { useOptionList } from "@/lib/useOptionList";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contracts/")({
  head: () => ({
    meta: [
      { title: "Contrats — Protection ERP" },
      { name: "description", content: "Suivi des contrats signés, en attente de validation et facturation." },
    ],
  }),
  component: ContractsPage,
});

const billingColor: Record<string, string> = {
  "Validé Confirmation": "bg-success/15 text-success border-success/20",
  "En attente de validation": "bg-warning/15 text-warning-foreground border-warning/20",
  "Annuler la confirmation": "bg-destructive/15 text-destructive border-destructive/20",
  "Pré-validé": "bg-info/15 text-info border-info/20",
};

const ALL = "__all__";
const PAGE_SIZE_OPTIONS = [50, 100, 500, 2000];
// BILLING / PARTNERS / SOURCES / CABINETS come from option_lists.php
// (admin-editable via /options and /statuses/contracts).

function ContractsPage() {
  const { users, updateContractBilling } = useErp();
  const { values: BILLING } = useStatusOptions("contract");
  const PARTNERS = useOptionList("contract", "partner").values;
  const CABINETS = useOptionList("contract", "cabinet").values;
  const SOURCES = useOptionList("contract", "source").values;
  const { user } = useAuth();
  const isAgent = isFieldRole(user?.role);
  const currency = useCurrency();
  const confirmDialog = useConfirm();
  const agentOptions = useMemo(
    () => users.filter((u) => isAssignableRole(u.role)).map((u) => u.username),
    [users],
  );

  // Search input (debounced)
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Filters
  const [dateSig, setDateSig] = useState("");
  const [dateEffet, setDateEffet] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [assigne, setAssigne] = useState(ALL);
  const [source, setSource] = useState(ALL);
  const [statut, setStatut] = useState(ALL);
  const [partenaire, setPartenaire] = useState(ALL);
  const [cabinet, setCabinet] = useState(ALL);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const { defs: customDefs, valuesById: customValuesById } = useCustomFieldsTable("contract");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set());
  const [customFilters, setCustomFilters] = useState<Record<string, string>>({});
  const setCustomFilter = (k: string, v: string) =>
    setCustomFilters((prev) => {
      const next = { ...prev };
      if (!v) delete next[k]; else next[k] = v;
      return next;
    });

  const reset = () => {
    setSearchInput(""); setSearch(""); setDateSig(""); setDateEffet(""); setDateVal("");
    setAssigne(ALL); setSource(ALL); setStatut(ALL); setPartenaire(ALL); setCabinet(ALL);
    setCustomFilters({});
    toast.success("Filtres réinitialisés");
  };

  const filters: ContractFilters = useMemo(() => ({
    q: search.trim() || undefined,
    billingStatus: statut !== ALL ? statut : undefined,
    partner: partenaire !== ALL ? partenaire : undefined,
    cabinet: cabinet !== ALL ? cabinet : undefined,
    source: source !== ALL ? source : undefined,
    assignedTo: isAgent
      ? (user?.username || "__none__")
      : (assigne !== ALL ? assigne : undefined),
    sigFrom: dateSig || undefined, sigTo: dateSig || undefined,
    effFrom: dateEffet || undefined, effTo: dateEffet || undefined,
    valFrom: dateVal || undefined, valTo: dateVal || undefined,
  }), [search, statut, partenaire, cabinet, source, assigne, dateSig, dateEffet, dateVal, isAgent, user?.username]);

  const [rows, setRows] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => { setPage(1); setSelected(new Set()); }, [search, statut, partenaire, cabinet, source, assigne, dateSig, dateEffet, dateVal, pageSize]);

  useEffect(() => {
    const v = searchInput.trim();
    const wait = v.length === 0 ? 0 : v.length < 3 ? 600 : 350;
    const t = setTimeout(() => setSearch(searchInput), wait);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadPage = useCallback(async () => {
    if (!API_ENABLED) return;
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const r = await fetchContractsPage({ page, pageSize, filters });
      if (myReq !== reqIdRef.current) return;
      setRows(r.rows);
      setTotal(r.total);
    } catch (e: any) {
      if (myReq !== reqIdRef.current) return;
      setError(e?.message ?? "Erreur de chargement");
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => { void loadPage(); }, [loadPage]);

  const visibleRows = useMemo(() => {
    const cfEntries = Object.entries(customFilters);
    if (!cfEntries.length) return rows;
    return rows.filter((c) => {
      const vals = customValuesById[c.id] ?? {};
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
  const totalCAPage = visibleRows.reduce((s, c) => s + c.premium, 0);

  const selectAllMatching = useCallback(async () => {
    try {
      const ids = await fetchContractIdsForFilter(filters);
      setSelected(new Set(ids));
      toast.success(`${ids.length.toLocaleString("fr-FR")} contrat(s) sélectionné(s)`);
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de la sélection globale");
    }
  }, [filters]);

  const exportSelection = useCallback(async () => {
    setBulkBusy(true);
    try {
      // Fetch the selected rows page-by-page (handles huge selections)
      const wantedIds = new Set(selected);
      const collected: Contract[] = [];
      for await (const batch of iterateAllContracts(filters)) {
        for (const r of batch) if (wantedIds.has(r.id)) collected.push(r);
        if (collected.length >= wantedIds.size) break;
      }
      const enriched = withCustomFields(collected, customDefs, customValuesById);
      const out = toContractExportRows(enriched as Record<string, unknown>[]);
      exportCSV("contrats-selection.csv", out);
      toast.success(`${out.length.toLocaleString("fr-FR")} contrat(s) exporté(s)`);
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de l'export");
    } finally {
      setBulkBusy(false);
    }
  }, [selected, filters, customDefs, customValuesById]);

  type ViewState = {
    search: string; dateSig: string; dateEffet: string; dateVal: string;
    assigne: string; source: string; statut: string; partenaire: string; cabinet: string;
  };
  const currentView: ViewState = { search, dateSig, dateEffet, dateVal, assigne, source, statut, partenaire, cabinet };
  const applyView = (v: ViewState) => {
    setSearchInput(v.search ?? ""); setSearch(v.search ?? "");
    setDateSig(v.dateSig ?? ""); setDateEffet(v.dateEffet ?? "");
    setDateVal(v.dateVal ?? ""); setAssigne(v.assigne ?? ALL); setSource(v.source ?? ALL);
    setStatut(v.statut ?? ALL); setPartenaire(v.partenaire ?? ALL); setCabinet(v.cabinet ?? ALL);
  };
  const eqView = (a: ViewState, b: ViewState) =>
    a.search === b.search && a.dateSig === b.dateSig && a.dateEffet === b.dateEffet &&
    a.dateVal === b.dateVal && a.assigne === b.assigne && a.source === b.source &&
    a.statut === b.statut && a.partenaire === b.partenaire && a.cabinet === b.cabinet;

  return (
    <AppLayout skeleton="table">
      <PageHeader
        title="Contrats"
        description={`${total.toLocaleString("fr-FR")} contrats — ${formatCompact(totalCAPage, currency)} sur la page courante`}
        icon={<FileText className="h-5 w-5" />}
        actions={
          <>
            <SavedViews scope="contracts" current={currentView} onApply={applyView} isEqual={eqView} />
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
                <Link to="/contracts/export"><Download className="h-4 w-4 mr-1.5" />Exporter</Link>
              </Button>
            )}
            {user?.role === "Administrateur" && (
              <Button asChild variant="outline" size="sm">
                <Link to="/contracts/import"><Download className="h-4 w-4 mr-1.5" />Importer</Link>
              </Button>
            )}
          </>
        }
      />

      <div className="mt-6 space-y-4">
          {(() => {
            const chips: FilterChip[] = [];
            if (statut !== ALL) chips.push({ key: "statut", label: `Statut: ${statut}`, onClear: () => setStatut(ALL) });
            if (partenaire !== ALL) chips.push({ key: "p", label: `Partenaire: ${partenaire}`, onClear: () => setPartenaire(ALL) });
            if (cabinet !== ALL) chips.push({ key: "c", label: `Cabinet: ${cabinet}`, onClear: () => setCabinet(ALL) });
            if (assigne !== ALL) chips.push({ key: "a", label: `Assigné: ${assigne}`, onClear: () => setAssigne(ALL) });
            if (source !== ALL) chips.push({ key: "s", label: `Source: ${source}`, onClear: () => setSource(ALL) });
            if (dateSig) chips.push({ key: "ds", label: `Signé ${dateSig}`, onClear: () => setDateSig("") });
            if (dateEffet) chips.push({ key: "de", label: `Effet ${dateEffet}`, onClear: () => setDateEffet("") });
            if (dateVal) chips.push({ key: "dv", label: `Validé ${dateVal}`, onClear: () => setDateVal("") });
            for (const [k, val] of Object.entries(customFilters)) {
              const def = customDefs.find((d) => d.key === k);
              if (def) chips.push({ key: `cf-${k}`, label: `${def.label}: ${val}`, onClear: () => setCustomFilter(k, "") });
            }
            return (
              <FilterBar
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Rechercher par nom, prénom, ville…"
                onSearch={() => { setSearch(searchInput); }}
                onReset={reset}
                activeChips={chips}
                resultsCount={total}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <FilterField label="Statut Facturation">
                    <FilterSelect value={statut} onChange={setStatut} options={BILLING} placeholder="Choisir" />
                  </FilterField>
                  <FilterField label="Partenaire Santé">
                    <FilterSelect value={partenaire} onChange={setPartenaire} options={PARTNERS} placeholder="Choisir" />
                  </FilterField>
                  <FilterField label="Cabinet">
                    <FilterSelect value={cabinet} onChange={setCabinet} options={CABINETS} placeholder="Choisir" />
                  </FilterField>
                  {!isAgent && (
                    <FilterField label="Assigné à">
                      <FilterSelect value={assigne} onChange={setAssigne} options={agentOptions} placeholder="Choisir" />
                    </FilterField>
                  )}
                  <FilterField label="Source Prospect">
                    <FilterSelect value={source} onChange={setSource} options={SOURCES} placeholder="Choisir" />
                  </FilterField>
                  <FilterField label="Date Signature"><DatePicker value={dateSig} onChange={setDateSig} /></FilterField>
                  <FilterField label="Date Effet"><DatePicker value={dateEffet} onChange={setDateEffet} /></FilterField>
                  <FilterField label="Date Validation"><DatePicker value={dateVal} onChange={setDateVal} /></FilterField>
                  {customDefs.map((def) => (
                    <FilterField key={def.id} label={`${def.label} (page courante)`}>
                      {def.type === "select" ? (
                        <Select value={customFilters[def.key] ?? ALL} onValueChange={(v) => setCustomFilter(def.key, v === ALL ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="Tous" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ALL}>Tous</SelectItem>
                            {(def.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : def.type === "boolean" ? (
                        <Select value={customFilters[def.key] ?? ALL} onValueChange={(v) => setCustomFilter(def.key, v === ALL ? "" : v)}>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total contrats", value: total.toLocaleString("fr-FR") },
              { label: "Page courante", value: visibleRows.length },
              { label: "CA page", value: formatCompact(totalCAPage, currency) },
              { label: "Sélectionnés", value: selected.size },
            ].map((s) => (
              <Card key={s.label} className="p-4 shadow-elegant">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
                <div className="mt-1 text-2xl font-semibold">{s.value}</div>
              </Card>
            ))}
          </div>

          {selected.size > 0 && (
            <Card className="p-3 shadow-elegant bg-primary/5 border-primary/20 flex items-center justify-between gap-2 flex-wrap">
              <div className="text-sm font-medium">{selected.size.toLocaleString("fr-FR")} contrat(s) sélectionné(s)</div>
              <div className="flex gap-2 items-center flex-wrap">
                {selected.size < total && (
                  <Button variant="outline" size="sm" onClick={selectAllMatching}>
                    Tout sélectionner ({total.toLocaleString("fr-FR")})
                  </Button>
                )}
                <Select
                  onValueChange={async (val) => {
                    const ids = Array.from(selected);
                    setBulkBusy(true);
                    try {
                      let ok = 0;
                      for (const id of ids) {
                        try { await updateContractBilling(id, val as Contract["billingStatus"]); ok++; } catch { /* ignore per-row */ }
                      }
                      toast.success(`${ok}/${ids.length} contrat(s) mis à jour`);
                      setSelected(new Set());
                      await loadPage();
                    } finally { setBulkBusy(false); }
                  }}
                >
                  <SelectTrigger className="h-9 w-[230px]"><SelectValue placeholder="Changer le statut…" /></SelectTrigger>
                  <SelectContent>
                    {BILLING.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" disabled={bulkBusy} onClick={exportSelection}>
                  Exporter sélection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bulkBusy || !API_ENABLED}
                  onClick={async () => {
                    const ids = Array.from(selected);
                    const ok = await confirmDialog({
                      title: "Supprimer les contrats",
                      description: <>Voulez-vous supprimer définitivement <b>{ids.length}</b> contrat(s) ?</>,
                      destructive: true,
                    });
                    if (!ok) return;
                    setBulkBusy(true);
                    try {
                      let ok = 0;
                      for (const id of ids) {
                        try { await api(`/contracts.php?id=${encodeURIComponent(id)}`, { method: "DELETE" }); ok++; } catch { /* ignore */ }
                      }
                      toast.success(`${ok}/${ids.length} contrat(s) supprimé(s)`);
                      setSelected(new Set());
                      await loadPage();
                    } finally { setBulkBusy(false); }
                  }}
                >Supprimer</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Désélectionner</Button>
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
                        checked={visibleRows.length > 0 && visibleRows.every((c) => selected.has(c.id))}
                        onCheckedChange={(v) => setSelected(v ? new Set(visibleRows.map((c) => c.id)) : new Set())}
                        aria-label="Tout sélectionner"
                      />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden md:table-cell">Partenaire</TableHead>
                    <TableHead className="hidden lg:table-cell">Date SI</TableHead>
                    <TableHead className="hidden lg:table-cell">Date VA</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>Statut Facturation</TableHead>
                    <TableHead className="hidden lg:table-cell">Source</TableHead>
                    <TableHead className="hidden md:table-cell">Assigné À</TableHead>
                    {customDefs.filter((d) => visibleCols.has(d.key)).map((d) => (
                      <TableHead key={d.id} className="text-xs">{d.label}</TableHead>
                    ))}
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((c) => (
                    <ContractRow
                      key={c.id}
                      c={c}
                      canEdit={!isAgent}
                      checked={selected.has(c.id)}
                      onToggle={(v) => setSelected((prev) => {
                        const n = new Set(prev);
                        if (v) n.add(c.id); else n.delete(c.id);
                        return n;
                      })}
                      extraCells={customDefs.filter((d) => visibleCols.has(d.key)).map((d) => (
                        <TableCell key={d.id} className="text-sm text-muted-foreground">
                          {formatCustomValue(d, customValuesById[c.id]?.[d.key])}
                        </TableCell>
                      ))}
                    />
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

function ContractRow({ c, checked, onToggle, extraCells, canEdit = true }: { c: Contract; checked: boolean; onToggle: (v: boolean) => void; extraCells?: React.ReactNode; canEdit?: boolean }) {
  const navigate = useNavigate();
  const currency = useCurrency();
  return (
    <TableRow
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest('[data-bulk-checkbox]')) return;
        navigate({ to: "/contracts/$contractId", params: { contractId: c.id } });
      }}
      className="hover:bg-muted/30 transition-base cursor-pointer group"
    >
      <TableCell data-bulk-checkbox onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={checked} onCheckedChange={(v) => onToggle(!!v)} aria-label={`Sélectionner ${c.lastName}`} />
      </TableCell>
      <TableCell>
        <Link to="/contracts/$contractId" params={{ contractId: c.id }} className="font-medium text-sm hover:text-primary transition-base">
          {c.lastName}
        </Link>
        <div className="text-xs text-muted-foreground">{c.firstName} • {c.city}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm">{c.partner}</TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(c.signatureDate) ?? "—"}</TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(c.validationDate) ?? "—"}</TableCell>
      <TableCell className="font-semibold text-sm">{formatAmount(c.premium, currency)}</TableCell>
      <TableCell><Badge variant="outline" className={billingColor[c.billingStatus]}>{c.billingStatus}</Badge></TableCell>
      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{c.source}</TableCell>
      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.assignedTo}</TableCell>
      {extraCells}
      <TableCell className="w-20" data-bulk-checkbox onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          {canEdit && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link to="/contracts/$contractId/edit" params={{ contractId: c.id }} aria-label="Modifier">
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-base" />
        </div>
      </TableCell>
    </TableRow>
  );
}
