import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout, u as isFieldRole } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, o as formatDate, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { D as Checkbox, M as useConfirm } from "./router-BUkYRVTH.mjs";
import { t as DatePicker } from "./date-picker-BVRMSMeD.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DpaEa0I_.mjs";
import { S as useCurrency, b as formatCompact, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { c as withCustomFields, o as toContractExportRows, t as exportCSV } from "./exportUtils-D82gKDXZ.mjs";
import { a as fetchContractsPage, c as iterateAllContracts, i as fetchContractIdsForFilter, l as loadPersistentState, n as FilterBar, r as SavedViews, t as CustomColumnsPicker, u as savePersistentState } from "./CustomColumnsPicker-NiDe8uKb.mjs";
import { n as useCustomFieldsTable, t as formatCustomValue } from "./useCustomFields-B3TFFvN5.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Wt as FileText, et as Pencil, in as Download, vt as LoaderCircle, xn as ChevronRight } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contracts.index-5v2HpP8Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var billingColor = {
	"Validé Confirmation": "bg-success/15 text-success border-success/20",
	"En attente de validation": "bg-warning/15 text-warning-foreground border-warning/20",
	"Annuler la confirmation": "bg-destructive/15 text-destructive border-destructive/20",
	"Pré-validé": "bg-info/15 text-info border-info/20"
};
var billingTokenColor = {
	success: "bg-success/15 text-success border-success/20",
	warning: "bg-warning/15 text-warning-foreground border-warning/20",
	destructive: "bg-destructive/15 text-destructive border-destructive/20",
	info: "bg-info/15 text-info border-info/20",
	primary: "bg-primary/15 text-primary border-primary/20",
	accent: "bg-accent/15 text-accent-foreground border-accent/20",
	muted: "bg-muted/10 text-muted-foreground border-border"
};
function getBillingBadgeClass(status, options) {
	const option = options.find((o) => o.value === status);
	if (option) return billingTokenColor[option.color] ?? billingColor[status] ?? "bg-muted/10 text-muted-foreground border-border";
	return billingColor[status] ?? "bg-muted/10 text-muted-foreground border-border";
}
var ALL = "__all__";
var PAGE_SIZE_OPTIONS = [
	50,
	100,
	500,
	2e3
];
var CONTRACTS_STORAGE_KEY = "erp.contracts.lastView";
function ContractsPage() {
	const { users, updateContractBilling } = useErp();
	const { options: BILLING_OPTIONS, values: BILLING } = useStatusOptions("contract");
	const PARTNERS = useOptionList("contract", "partner").values;
	const CABINETS = useOptionList("contract", "cabinet").values;
	const SOURCES = useOptionList("contract", "source").values;
	const { user } = useAuth();
	const isAgent = isFieldRole(user?.role);
	const currency = useCurrency();
	const confirmDialog = useConfirm();
	const agentOptions = (0, import_react.useMemo)(() => users.filter((u) => isAssignableRole(u.role)).map((u) => u.username), [users]);
	const savedContractView = loadPersistentState(CONTRACTS_STORAGE_KEY, {
		searchInput: "",
		search: "",
		dateSig: "",
		dateEffet: "",
		dateVal: "",
		assigne: ALL,
		source: ALL,
		statut: ALL,
		partenaire: ALL,
		cabinet: ALL,
		pageSize: 100,
		customFilters: {}
	});
	const [searchInput, setSearchInput] = (0, import_react.useState)(savedContractView.searchInput);
	const [search, setSearch] = (0, import_react.useState)(savedContractView.search);
	const [dateSig, setDateSig] = (0, import_react.useState)(savedContractView.dateSig);
	const [dateEffet, setDateEffet] = (0, import_react.useState)(savedContractView.dateEffet);
	const [dateVal, setDateVal] = (0, import_react.useState)(savedContractView.dateVal);
	const [assigne, setAssigne] = (0, import_react.useState)(savedContractView.assigne);
	const [source, setSource] = (0, import_react.useState)(savedContractView.source);
	const [statut, setStatut] = (0, import_react.useState)(savedContractView.statut);
	const [partenaire, setPartenaire] = (0, import_react.useState)(savedContractView.partenaire);
	const [cabinet, setCabinet] = (0, import_react.useState)(savedContractView.cabinet);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(savedContractView.pageSize);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [bulkBusy, setBulkBusy] = (0, import_react.useState)(false);
	const { defs: customDefs, valuesById: customValuesById } = useCustomFieldsTable("contract");
	const [visibleCols, setVisibleCols] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [customFilters, setCustomFilters] = (0, import_react.useState)(savedContractView.customFilters);
	const setCustomFilter = (k, v) => setCustomFilters((prev) => {
		const next = { ...prev };
		if (!v) delete next[k];
		else next[k] = v;
		return next;
	});
	const reset = () => {
		setSearchInput("");
		setSearch("");
		setDateSig("");
		setDateEffet("");
		setDateVal("");
		setAssigne(ALL);
		setSource(ALL);
		setStatut(ALL);
		setPartenaire(ALL);
		setCabinet(ALL);
		setCustomFilters({});
		toast.success("Filtres réinitialisés");
	};
	const filters = (0, import_react.useMemo)(() => ({
		q: search.trim() || void 0,
		billingStatus: statut !== ALL ? statut : void 0,
		partner: partenaire !== ALL ? partenaire : void 0,
		cabinet: cabinet !== ALL ? cabinet : void 0,
		source: source !== ALL ? source : void 0,
		assignedTo: isAgent ? user?.username || "__none__" : assigne !== ALL ? assigne : void 0,
		sigFrom: dateSig || void 0,
		sigTo: dateSig || void 0,
		effFrom: dateEffet || void 0,
		effTo: dateEffet || void 0,
		valFrom: dateVal || void 0,
		valTo: dateVal || void 0
	}), [
		search,
		statut,
		partenaire,
		cabinet,
		source,
		assigne,
		dateSig,
		dateEffet,
		dateVal,
		isAgent,
		user?.username
	]);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const reqIdRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		setPage(1);
		setSelected(/* @__PURE__ */ new Set());
	}, [
		search,
		statut,
		partenaire,
		cabinet,
		source,
		assigne,
		dateSig,
		dateEffet,
		dateVal,
		pageSize
	]);
	(0, import_react.useEffect)(() => {
		const v = searchInput.trim();
		const wait = v.length === 0 ? 0 : v.length < 3 ? 600 : 350;
		const t = setTimeout(() => setSearch(searchInput), wait);
		return () => clearTimeout(t);
	}, [searchInput]);
	const loadPage = (0, import_react.useCallback)(async () => {
		const myReq = ++reqIdRef.current;
		setLoading(true);
		setError(null);
		try {
			const r = await fetchContractsPage({
				page,
				pageSize,
				filters
			});
			if (myReq !== reqIdRef.current) return;
			setRows(r.rows);
			setTotal(r.total);
		} catch (e) {
			if (myReq !== reqIdRef.current) return;
			setError(e?.message ?? "Erreur de chargement");
		} finally {
			if (myReq === reqIdRef.current) setLoading(false);
		}
	}, [
		page,
		pageSize,
		filters
	]);
	(0, import_react.useEffect)(() => {
		loadPage();
	}, [loadPage]);
	const visibleRows = (0, import_react.useMemo)(() => {
		const cfEntries = Object.entries(customFilters);
		if (!cfEntries.length) return rows;
		return rows.filter((c) => {
			const vals = customValuesById[c.id] ?? {};
			for (const [k, want] of cfEntries) if (!String(vals[k] ?? "").toLowerCase().includes(want.toLowerCase())) return false;
			return true;
		});
	}, [
		rows,
		customFilters,
		customValuesById
	]);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const fromIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const toIdx = Math.min(page * pageSize, total);
	const totalCAPage = visibleRows.reduce((s, c) => s + c.premium, 0);
	const selectAllMatching = (0, import_react.useCallback)(async () => {
		try {
			const ids = await fetchContractIdsForFilter(filters);
			setSelected(new Set(ids));
			toast.success(`${ids.length.toLocaleString("fr-FR")} contrat(s) sélectionné(s)`);
		} catch (e) {
			toast.error(e?.message ?? "Échec de la sélection globale");
		}
	}, [filters]);
	const exportSelection = (0, import_react.useCallback)(async () => {
		setBulkBusy(true);
		try {
			const wantedIds = new Set(selected);
			const collected = [];
			for await (const batch of iterateAllContracts(filters)) {
				for (const r of batch) if (wantedIds.has(r.id)) collected.push(r);
				if (collected.length >= wantedIds.size) break;
			}
			const enriched = withCustomFields(collected, customDefs, customValuesById);
			const out = toContractExportRows(enriched);
			exportCSV("contrats-selection.csv", out);
			toast.success(`${out.length.toLocaleString("fr-FR")} contrat(s) exporté(s)`);
		} catch (e) {
			toast.error(e?.message ?? "Échec de l'export");
		} finally {
			setBulkBusy(false);
		}
	}, [
		selected,
		filters,
		customDefs,
		customValuesById
	]);
	const currentView = {
		search,
		dateSig,
		dateEffet,
		dateVal,
		assigne,
		source,
		statut,
		partenaire,
		cabinet
	};
	(0, import_react.useEffect)(() => {
		savePersistentState(CONTRACTS_STORAGE_KEY, {
			searchInput,
			search,
			dateSig,
			dateEffet,
			dateVal,
			assigne,
			source,
			statut,
			partenaire,
			cabinet,
			pageSize,
			customFilters
		});
	}, [
		searchInput,
		search,
		dateSig,
		dateEffet,
		dateVal,
		assigne,
		source,
		statut,
		partenaire,
		cabinet,
		pageSize,
		customFilters
	]);
	const applyView = (v) => {
		setSearchInput(v.search ?? "");
		setSearch(v.search ?? "");
		setDateSig(v.dateSig ?? "");
		setDateEffet(v.dateEffet ?? "");
		setDateVal(v.dateVal ?? "");
		setAssigne(v.assigne ?? ALL);
		setSource(v.source ?? ALL);
		setStatut(v.statut ?? ALL);
		setPartenaire(v.partenaire ?? ALL);
		setCabinet(v.cabinet ?? ALL);
	};
	const eqView = (a, b) => a.search === b.search && a.dateSig === b.dateSig && a.dateEffet === b.dateEffet && a.dateVal === b.dateVal && a.assigne === b.assigne && a.source === b.source && a.statut === b.statut && a.partenaire === b.partenaire && a.cabinet === b.cabinet;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "table",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Contrats",
			description: `${total.toLocaleString("fr-FR")} contrats — ${formatCompact(totalCAPage, currency)} sur la page courante`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedViews, {
					scope: "contracts",
					current: currentView,
					onApply: applyView,
					isEqual: eqView
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomColumnsPicker, {
					defs: customDefs,
					visible: visibleCols,
					onToggle: (k, v) => setVisibleCols((prev) => {
						const n = new Set(prev);
						if (v) n.add(k);
						else n.delete(k);
						return n;
					})
				}),
				!isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/contracts/export",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), "Exporter"]
					})
				}),
				user?.role === "Administrateur" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/contracts/import",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), "Importer"]
					})
				})
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4",
			children: [
				(() => {
					const chips = [];
					if (statut !== ALL) chips.push({
						key: "statut",
						label: `Statut: ${statut}`,
						onClear: () => setStatut(ALL)
					});
					if (partenaire !== ALL) chips.push({
						key: "p",
						label: `Partenaire: ${partenaire}`,
						onClear: () => setPartenaire(ALL)
					});
					if (cabinet !== ALL) chips.push({
						key: "c",
						label: `Cabinet: ${cabinet}`,
						onClear: () => setCabinet(ALL)
					});
					if (assigne !== ALL) chips.push({
						key: "a",
						label: `Assigné: ${assigne}`,
						onClear: () => setAssigne(ALL)
					});
					if (source !== ALL) chips.push({
						key: "s",
						label: `Source: ${source}`,
						onClear: () => setSource(ALL)
					});
					if (dateSig) chips.push({
						key: "ds",
						label: `Signé ${dateSig}`,
						onClear: () => setDateSig("")
					});
					if (dateEffet) chips.push({
						key: "de",
						label: `Effet ${dateEffet}`,
						onClear: () => setDateEffet("")
					});
					if (dateVal) chips.push({
						key: "dv",
						label: `Validé ${dateVal}`,
						onClear: () => setDateVal("")
					});
					for (const [k, val] of Object.entries(customFilters)) {
						const def = customDefs.find((d) => d.key === k);
						if (def) chips.push({
							key: `cf-${k}`,
							label: `${def.label}: ${val}`,
							onClear: () => setCustomFilter(k, "")
						});
					}
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
						searchValue: searchInput,
						onSearchChange: setSearchInput,
						searchPlaceholder: "Rechercher par nom, prénom, ville…",
						onSearch: () => {
							setSearch(searchInput);
						},
						onReset: reset,
						activeChips: chips,
						resultsCount: total,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Statut Facturation",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: statut,
										onChange: setStatut,
										options: BILLING,
										placeholder: "Choisir"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Partenaire Santé",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: partenaire,
										onChange: setPartenaire,
										options: PARTNERS,
										placeholder: "Choisir"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Cabinet",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: cabinet,
										onChange: setCabinet,
										options: CABINETS,
										placeholder: "Choisir"
									})
								}),
								!isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Assigné à",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: assigne,
										onChange: setAssigne,
										options: agentOptions,
										placeholder: "Choisir"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Source Prospect",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: source,
										onChange: setSource,
										options: SOURCES,
										placeholder: "Choisir"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Date Signature",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
										value: dateSig,
										onChange: setDateSig
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Date Effet",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
										value: dateEffet,
										onChange: setDateEffet
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Date Validation",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
										value: dateVal,
										onChange: setDateVal
									})
								}),
								customDefs.map((def) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: `${def.label} (page courante)`,
									children: def.type === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: customFilters[def.key] ?? ALL,
										onValueChange: (v) => setCustomFilter(def.key, v === ALL ? "" : v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Tous" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: ALL,
											children: "Tous"
										}), (def.options ?? []).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: o,
											children: o
										}, o))] })]
									}) : def.type === "boolean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: customFilters[def.key] ?? ALL,
										onValueChange: (v) => setCustomFilter(def.key, v === ALL ? "" : v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Tous" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: ALL,
												children: "Tous"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "1",
												children: "Oui"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "0",
												children: "Non"
											})
										] })]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: def.type === "number" ? "number" : def.type === "date" ? "date" : "text",
										value: customFilters[def.key] ?? "",
										onChange: (e) => setCustomFilter(def.key, e.target.value),
										placeholder: "Contient…"
									})
								}, def.id))
							]
						})
					});
				})(),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-3",
					children: [
						{
							label: "Total contrats",
							value: total.toLocaleString("fr-FR")
						},
						{
							label: "Page courante",
							value: visibleRows.length
						},
						{
							label: "CA page",
							value: formatCompact(totalCAPage, currency)
						},
						{
							label: "Sélectionnés",
							value: selected.size
						}
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 shadow-elegant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: s.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-2xl font-semibold",
							children: s.value
						})]
					}, s.label))
				}),
				selected.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3 shadow-elegant bg-primary/5 border-primary/20 flex items-center justify-between gap-2 flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm font-medium",
						children: [selected.size.toLocaleString("fr-FR"), " contrat(s) sélectionné(s)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 items-center flex-wrap",
						children: [
							selected.size < total && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: selectAllMatching,
								children: [
									"Tout sélectionner (",
									total.toLocaleString("fr-FR"),
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								onValueChange: async (val) => {
									const ids = Array.from(selected);
									setBulkBusy(true);
									try {
										let ok = 0;
										for (const id of ids) try {
											await updateContractBilling(id, val);
											ok++;
										} catch {}
										toast.success(`${ok}/${ids.length} contrat(s) mis à jour`);
										setSelected(/* @__PURE__ */ new Set());
										await loadPage();
									} finally {
										setBulkBusy(false);
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 w-[230px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Changer le statut…" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: BILLING.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s,
									children: s
								}, s)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								disabled: bulkBusy,
								onClick: exportSelection,
								children: "Exporter sélection"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								disabled: bulkBusy || false,
								onClick: async () => {
									const ids = Array.from(selected);
									if (!await confirmDialog({
										title: "Supprimer les contrats",
										description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											"Voulez-vous supprimer définitivement ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: ids.length }),
											" contrat(s) ?"
										] }),
										destructive: true
									})) return;
									setBulkBusy(true);
									try {
										let ok = 0;
										for (const id of ids) try {
											await api(`/contracts.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
											ok++;
										} catch {}
										toast.success(`${ok}/${ids.length} contrat(s) supprimé(s)`);
										setSelected(/* @__PURE__ */ new Set());
										await loadPage();
									} finally {
										setBulkBusy(false);
									}
								},
								children: "Supprimer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setSelected(/* @__PURE__ */ new Set()),
								children: "Désélectionner"
							})
						]
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-3 border-destructive/30 bg-destructive/5 text-sm text-destructive",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-elegant overflow-hidden relative",
					children: [
						loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute top-2 right-3 z-10 flex items-center gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), " Chargement…"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "w-10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: visibleRows.length > 0 && visibleRows.every((c) => selected.has(c.id)),
											onCheckedChange: (v) => setSelected(v ? new Set(visibleRows.map((c) => c.id)) : /* @__PURE__ */ new Set()),
											"aria-label": "Tout sélectionner"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Nom" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "hidden md:table-cell",
										children: "Partenaire"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "hidden lg:table-cell",
										children: "Date SI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "hidden lg:table-cell",
										children: "Date VA"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "CA" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut Facturation" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "hidden lg:table-cell",
										children: "Source"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "hidden md:table-cell",
										children: "Assigné À"
									}),
									customDefs.filter((d) => visibleCols.has(d.key)).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-xs",
										children: d.label
									}, d.id)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [visibleRows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContractRow, {
								c,
								billingOptions: BILLING_OPTIONS,
								canEdit: !isAgent,
								checked: selected.has(c.id),
								onToggle: (v) => setSelected((prev) => {
									const n = new Set(prev);
									if (v) n.add(c.id);
									else n.delete(c.id);
									return n;
								}),
								extraCells: customDefs.filter((d) => visibleCols.has(d.key)).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-sm text-muted-foreground",
									children: formatCustomValue(d, customValuesById[c.id]?.[d.key])
								}, d.id))
							}, c.id)), !loading && visibleRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								colSpan: 20,
								className: "text-center text-sm text-muted-foreground py-8",
								children: "Aucun résultat"
							}) })] })] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: total === 0 ? "Aucun résultat" : `${fromIdx.toLocaleString("fr-FR")}–${toIdx.toLocaleString("fr-FR")} sur ${total.toLocaleString("fr-FR")}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: String(pageSize),
									onValueChange: (v) => setPageSize(Number(v)),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-7 w-[110px] text-xs",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PAGE_SIZE_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: String(s),
										children: [s, " / page"]
									}, s)) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1 items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										disabled: page <= 1 || loading,
										onClick: () => setPage((p) => Math.max(1, p - 1)),
										children: "Précédent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs px-2",
										children: [
											"Page ",
											page,
											" / ",
											totalPages
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										disabled: page >= totalPages || loading,
										onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
										children: "Suivant"
									})
								]
							})]
						})
					]
				})
			]
		})]
	});
}
function FilterField({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-[11px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), children]
	});
}
function FilterSelect({ value, onChange, placeholder, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: ALL,
			children: "Tous"
		}), options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
			value: o,
			children: o
		}, o))] })]
	});
}
function ContractRow({ c, checked, onToggle, extraCells, canEdit = true, billingOptions }) {
	const navigate = useNavigate();
	const currency = useCurrency();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
		onClick: (e) => {
			if (e.target.closest("[data-bulk-checkbox]")) return;
			navigate({
				to: "/contracts/$contractId",
				params: { contractId: c.id }
			});
		},
		className: "hover:bg-muted/30 transition-base cursor-pointer group",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				"data-bulk-checkbox": true,
				onClick: (e) => e.stopPropagation(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					checked,
					onCheckedChange: (v) => onToggle(!!v),
					"aria-label": `Sélectionner ${c.lastName}`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/contracts/$contractId",
				params: { contractId: c.id },
				className: "font-medium text-sm hover:text-primary transition-base",
				children: c.lastName
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground",
				children: [
					c.firstName,
					" • ",
					c.city
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "hidden md:table-cell text-sm",
				children: c.partner
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "hidden lg:table-cell text-sm text-muted-foreground",
				children: formatDate(c.signatureDate) ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "hidden lg:table-cell text-sm text-muted-foreground",
				children: formatDate(c.validationDate) ?? "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "font-semibold text-sm",
				children: formatAmount(c.premium, currency)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				className: getBillingBadgeClass(c.billingStatus, billingOptions),
				children: c.billingStatus
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "hidden lg:table-cell text-sm text-muted-foreground",
				children: c.source
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "hidden md:table-cell text-sm text-muted-foreground",
				children: c.assignedTo
			}),
			extraCells,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				className: "w-20",
				"data-bulk-checkbox": true,
				onClick: (e) => e.stopPropagation(),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-1",
					children: [canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contracts/$contractId/edit",
							params: { contractId: c.id },
							"aria-label": "Modifier",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-muted-foreground group-hover:text-foreground transition-base" })]
				})
			})
		]
	});
}
export { ContractsPage as component };
