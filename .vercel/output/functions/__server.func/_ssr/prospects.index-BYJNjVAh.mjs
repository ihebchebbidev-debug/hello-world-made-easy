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
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-DR1z1nDt.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DpaEa0I_.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { l as loadPersistentState, n as FilterBar, o as fetchProspectIdsForFilter, r as SavedViews, s as fetchProspectsPage, t as CustomColumnsPicker, u as savePersistentState } from "./CustomColumnsPicker-NiDe8uKb.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { n as useCustomFieldsTable, t as formatCustomValue } from "./useCustomFields-B3TFFvN5.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Hn as ArrowUpDown, On as CalendarPlus, Q as Plus, et as Pencil, in as Download, ot as MessageSquare, q as RefreshCw, un as ClipboardList, vt as LoaderCircle } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/prospects.index-BYJNjVAh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var statusColor = {
	"Vente": "bg-success/15 text-success border-success/20",
	"RDV": "bg-info/15 text-info border-info/20",
	"Devis": "bg-primary/10 text-primary border-primary/20",
	"A recontacter (Voir Commentaire)": "bg-warning/15 text-warning-foreground border-warning/20",
	"Sans réponse": "bg-muted text-muted-foreground border-border",
	"Refus": "bg-destructive/10 text-destructive border-destructive/20"
};
var ALL = "__all__";
var PAGE_SIZE_OPTIONS = [
	50,
	100,
	500,
	2e3
];
var PROSPECTS_STORAGE_KEY = "erp.prospects.lastView";
var CHECK_OPTIONS = [
	{
		v: ALL,
		label: "All"
	},
	{
		v: "valid",
		label: "Valide"
	},
	{
		v: "invalid",
		label: "Invalide"
	},
	{
		v: "pending",
		label: "En attente"
	}
];
function ProspectsPage() {
	const { users } = useErp();
	const { values: STATUS_OPTIONS } = useStatusOptions("prospect");
	const { values: SOURCE_OPTIONS } = useOptionList("prospect", "source");
	const { user } = useAuth();
	const navigate = useNavigate();
	const isAgent = isFieldRole(user?.role);
	const confirmDialog = useConfirm();
	const agentOptions = (0, import_react.useMemo)(() => users.filter((u) => isAssignableRole(u.role)).map((u) => u.username), [users]);
	const savedProspectView = loadPersistentState(PROSPECTS_STORAGE_KEY, {
		searchInput: "",
		search: "",
		statut: ALL,
		assigne: ALL,
		source: ALL,
		dateFrom: "",
		dateTo: "",
		check: ALL,
		sortBy: "createdAt",
		sortDir: "desc",
		pageSize: 100,
		customFilters: {}
	});
	const [searchInput, setSearchInput] = (0, import_react.useState)(savedProspectView.searchInput);
	const [search, setSearch] = (0, import_react.useState)(savedProspectView.search);
	const [statut, setStatut] = (0, import_react.useState)(savedProspectView.statut);
	const [assigne, setAssigne] = (0, import_react.useState)(savedProspectView.assigne);
	const [source, setSource] = (0, import_react.useState)(savedProspectView.source);
	const [dateFrom, setDateFrom] = (0, import_react.useState)(savedProspectView.dateFrom);
	const [dateTo, setDateTo] = (0, import_react.useState)(savedProspectView.dateTo);
	const [check, setCheck] = (0, import_react.useState)(savedProspectView.check);
	const [sortBy, setSortBy] = (0, import_react.useState)(savedProspectView.sortBy);
	const [sortDir, setSortDir] = (0, import_react.useState)(savedProspectView.sortDir);
	const [page, setPage] = (0, import_react.useState)(1);
	const [pageSize, setPageSize] = (0, import_react.useState)(savedProspectView.pageSize);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const { defs: customDefs, valuesById: customValuesById } = useCustomFieldsTable("prospect");
	const [visibleCols, setVisibleCols] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [customFilters, setCustomFilters] = (0, import_react.useState)(savedProspectView.customFilters);
	const setCustomFilter = (k, v) => setCustomFilters((prev) => {
		const next = { ...prev };
		if (!v) delete next[k];
		else next[k] = v;
		return next;
	});
	const [rows, setRows] = (0, import_react.useState)([]);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const reqIdRef = (0, import_react.useRef)(0);
	const filters = (0, import_react.useMemo)(() => ({
		q: search.trim() || void 0,
		status: statut !== ALL ? statut : void 0,
		source: source !== ALL ? source : void 0,
		assignedTo: assigne !== ALL ? assigne : void 0,
		checkValeur: check !== ALL ? check : void 0,
		from: dateFrom || void 0,
		to: dateTo || void 0
	}), [
		search,
		statut,
		source,
		assigne,
		check,
		dateFrom,
		dateTo
	]);
	(0, import_react.useEffect)(() => {
		setPage(1);
		setSelected(/* @__PURE__ */ new Set());
	}, [
		search,
		statut,
		source,
		assigne,
		check,
		dateFrom,
		dateTo,
		sortBy,
		sortDir,
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
			const r = await fetchProspectsPage({
				page,
				pageSize,
				filters,
				sort: sortBy,
				dir: sortDir
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
		filters,
		sortBy,
		sortDir
	]);
	(0, import_react.useEffect)(() => {
		loadPage();
	}, [loadPage]);
	const visibleRows = (0, import_react.useMemo)(() => {
		const cfEntries = Object.entries(customFilters);
		if (!cfEntries.length) return rows;
		return rows.filter((p) => {
			const vals = customValuesById[p.id] ?? {};
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
	const reset = () => {
		setSearchInput("");
		setSearch("");
		setStatut(ALL);
		setAssigne(ALL);
		setSource(ALL);
		setDateFrom("");
		setDateTo("");
		setCheck(ALL);
		setCustomFilters({});
		toast.success("Filtres réinitialisés");
	};
	const toggleSort = (f) => {
		if (sortBy === f) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(f);
			setSortDir("asc");
		}
	};
	const toggleAll = (v) => setSelected(v ? new Set(visibleRows.map((p) => p.id)) : /* @__PURE__ */ new Set());
	const toggleOne = (id, v) => setSelected((prev) => {
		const next = new Set(prev);
		if (v) next.add(id);
		else next.delete(id);
		return next;
	});
	const selectAllMatching = (0, import_react.useCallback)(async () => {
		try {
			const ids = await fetchProspectIdsForFilter(filters);
			setSelected(new Set(ids));
			toast.success(`${ids.length.toLocaleString("fr-FR")} prospect(s) sélectionné(s)`);
		} catch (e) {
			toast.error(e?.message ?? "Échec de la sélection globale");
		}
	}, [filters]);
	const currentView = {
		search,
		statut,
		assigne,
		source,
		dateFrom,
		dateTo,
		check,
		sortBy,
		sortDir
	};
	(0, import_react.useEffect)(() => {
		savePersistentState(PROSPECTS_STORAGE_KEY, {
			searchInput,
			search,
			statut,
			assigne,
			source,
			dateFrom,
			dateTo,
			check,
			sortBy,
			sortDir,
			pageSize,
			customFilters
		});
	}, [
		searchInput,
		search,
		statut,
		assigne,
		source,
		dateFrom,
		dateTo,
		check,
		sortBy,
		sortDir,
		pageSize,
		customFilters
	]);
	const applyView = (v) => {
		setSearchInput(v.search ?? "");
		setSearch(v.search ?? "");
		setStatut(v.statut ?? ALL);
		setAssigne(v.assigne ?? ALL);
		setSource(v.source ?? ALL);
		setDateFrom(v.dateFrom ?? "");
		setDateTo(v.dateTo ?? "");
		setCheck(v.check ?? ALL);
		setSortBy(v.sortBy ?? "createdAt");
		setSortDir(v.sortDir ?? "desc");
	};
	const eqView = (a, b) => a.search === b.search && a.statut === b.statut && a.assigne === b.assigne && a.source === b.source && a.dateFrom === b.dateFrom && a.dateTo === b.dateTo && a.check === b.check && a.sortBy === b.sortBy && a.sortDir === b.sortDir;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "table",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Prospects",
			description: `${total.toLocaleString("fr-FR")} leads dans la base — gérez vos prospects et leur statut`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavedViews, {
					scope: "prospects",
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
						to: "/prospects/export",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), "Exporter"]
					})
				}),
				!isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/prospects/import",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5 rotate-180" }), "Importer"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => navigate({ to: "/prospects/new" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), " Nouveau prospect"]
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
					if (assigne !== ALL) chips.push({
						key: "assigne",
						label: `Assigné: ${assigne}`,
						onClear: () => setAssigne(ALL)
					});
					if (source !== ALL) chips.push({
						key: "source",
						label: `Source: ${source}`,
						onClear: () => setSource(ALL)
					});
					if (check !== ALL) chips.push({
						key: "check",
						label: `Check: ${check}`,
						onClear: () => setCheck(ALL)
					});
					if (dateFrom) chips.push({
						key: "df",
						label: `Du ${dateFrom}`,
						onClear: () => setDateFrom("")
					});
					if (dateTo) chips.push({
						key: "dt",
						label: `Au ${dateTo}`,
						onClear: () => setDateTo("")
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
						searchPlaceholder: "Rechercher par nom, prénom, téléphone, ville…",
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
									label: "Statut Appel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: statut,
										onChange: setStatut,
										placeholder: "Statut Appel",
										options: STATUS_OPTIONS
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Assigné à",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: assigne,
										onChange: setAssigne,
										placeholder: "Assigné à",
										options: agentOptions
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Source Prospect",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterSelect, {
										value: source,
										onChange: setSource,
										placeholder: "Source Prospect",
										options: SOURCE_OPTIONS
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Date Ajout (du)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
										value: dateFrom,
										onChange: setDateFrom
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Date Ajout (au)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
										value: dateTo,
										onChange: setDateTo
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Check Valeur",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: check,
										onValueChange: setCheck,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CHECK_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: o.v,
											children: o.label
										}, o.v)) })]
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
				selected.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-3 shadow-elegant bg-primary/5 border-primary/20 flex items-center justify-between gap-2 flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm font-medium",
						children: [selected.size.toLocaleString("fr-FR"), " prospect(s) sélectionné(s)"]
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
							!isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								onValueChange: async (val) => {
									const ids = Array.from(selected);
									try {
										const r = await api("/prospects.php?action=bulk", {
											method: "POST",
											body: {
												action: "bulk",
												op: "assign",
												ids,
												assignedTo: val
											}
										});
										toast.success(`${r.updated} prospect(s) réassigné(s) à ${val}`);
										setSelected(/* @__PURE__ */ new Set());
										await loadPage();
									} catch (e) {
										toast.error(e?.message ?? "Échec de la réassignation");
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									className: "h-9 w-[200px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Réassigner à…" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: agentOptions.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: u,
									children: u
								}, u)) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: async () => {
									const ids = Array.from(selected);
									if (!await confirmDialog({
										title: "Archiver les prospects",
										description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											"Archiver ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: ids.length }),
											" prospect(s) (statut ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "\"Sans réponse\"" }),
											") ?"
										] }),
										confirmLabel: "Archiver"
									})) return;
									try {
										const r = await api("/prospects.php?action=bulk", {
											method: "POST",
											body: {
												action: "bulk",
												op: "status",
												ids,
												status: "Sans réponse"
											}
										});
										toast.success(`${r.updated} prospect(s) archivé(s)`);
										setSelected(/* @__PURE__ */ new Set());
										await loadPage();
									} catch (e) {
										toast.error(e?.message ?? "Échec de l'archivage");
									}
								},
								children: "Archiver"
							}),
							user?.role === "Administrateur" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "destructive",
								size: "sm",
								onClick: async () => {
									const ids = Array.from(selected);
									if (!await confirmDialog({
										title: "Supprimer les prospects",
										description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											"Voulez-vous supprimer définitivement ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: ids.length }),
											" prospect(s) ?"
										] }),
										destructive: true
									})) return;
									try {
										const CHUNK = 500;
										let deleted = 0;
										const errors = [];
										for (let i = 0; i < ids.length; i += CHUNK) {
											const slice = ids.slice(i, i + CHUNK);
											try {
												const r = await api("/prospects.php?action=bulk", {
													method: "POST",
													body: {
														action: "bulk",
														op: "delete",
														ids: slice
													}
												});
												deleted += Number(r.deleted ?? 0);
											} catch (err) {
												errors.push(err?.message ?? "Erreur inconnue");
											}
										}
										if (errors.length) toast.error(`${deleted}/${ids.length} supprimé(s) — ${errors.length} lot(s) en échec`, { description: errors[0] });
										else toast.success(`${deleted} prospect(s) supprimé(s)`);
										setSelected(/* @__PURE__ */ new Set());
										await loadPage();
									} catch (e) {
										toast.error(e?.message ?? "Échec de la suppression");
									}
								},
								children: "Supprimer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
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
											checked: visibleRows.length > 0 && visibleRows.every((p) => selected.has(p.id)),
											onCheckedChange: (v) => toggleAll(!!v),
											"aria-label": "Tout sélectionner"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableHead, {
										label: "Nom",
										field: "lastName",
										sortBy,
										sortDir,
										onSort: toggleSort
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "hidden md:table-cell",
										children: "Téléphone"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableHead, {
										label: "Date Ajout",
										field: "createdAt",
										sortBy,
										sortDir,
										onSort: toggleSort,
										className: "hidden lg:table-cell"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableHead, {
										label: "Source Prospect",
										field: "source",
										sortBy,
										sortDir,
										onSort: toggleSort,
										className: "hidden lg:table-cell"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableHead, {
										label: "Statut",
										field: "status",
										sortBy,
										sortDir,
										onSort: toggleSort
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableHead, {
										label: "Assigné À",
										field: "assignedTo",
										sortBy,
										sortDir,
										onSort: toggleSort,
										className: "hidden md:table-cell"
									}),
									customDefs.filter((d) => visibleCols.has(d.key)).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-xs",
										children: d.label
									}, d.id)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-10" })
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [visibleRows.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "hover:bg-muted/30 transition-base cursor-pointer",
								onClick: (e) => {
									if (e.target.closest("a,button,input,label,[data-no-row-click]")) return;
									navigate({
										to: "/prospects/$prospectId",
										params: { prospectId: p.id }
									});
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										"data-no-row-click": true,
										onClick: (e) => e.stopPropagation(),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											checked: selected.has(p.id),
											onCheckedChange: (v) => toggleOne(p.id, !!v),
											"aria-label": `Sélectionner ${p.lastName}`
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/prospects/$prospectId",
										params: { prospectId: p.id },
										className: "flex items-center gap-3 hover:text-primary transition-base",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold",
											children: [p.firstName?.[0] ?? "?", p.lastName?.[0] ?? "?"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "font-medium text-sm",
											children: [
												p.civility,
												" ",
												p.lastName
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [
												p.firstName,
												" • ",
												p.postalCode ?? p.city
											]
										})] })]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "hidden md:table-cell text-sm",
										children: p.phone
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "hidden lg:table-cell text-sm text-muted-foreground",
										children: formatDate(p.createdAt) ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "hidden lg:table-cell text-sm",
										children: p.source
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: statusColor[p.status] ?? "",
											children: p.status
										}), p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
											className: "max-w-xs",
											children: p.comment
										})] }) })]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "hidden md:table-cell text-sm text-muted-foreground",
										children: p.assignedTo ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "italic",
											children: "Non attribué"
										})
									}),
									customDefs.filter((d) => visibleCols.has(d.key)).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-sm text-muted-foreground",
										children: formatCustomValue(d, customValuesById[p.id]?.[d.key])
									}, d.id)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-end gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "h-8 w-8",
												title: "Planifier un RDV",
												onClick: (e) => {
													e.stopPropagation();
													navigate({
														to: "/calendar",
														search: {
															prospectId: p.id,
															newEvent: "1"
														}
													});
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "h-3.5 w-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												asChild: true,
												variant: "ghost",
												size: "icon",
												className: "h-8 w-8",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/prospects/$prospectId/edit",
													params: { prospectId: p.id },
													"aria-label": "Modifier",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												className: "h-8 w-8",
												onClick: () => loadPage(),
												title: "Recharger",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" })
											})
										]
									}) })
								]
							}, p.id)), !loading && visibleRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
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
function SortableHead({ label, field, sortBy, sortDir, onSort, className }) {
	const active = sortBy === field;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => onSort(field),
			className: "inline-flex items-center gap-1 font-medium hover:text-foreground transition-base",
			children: [
				label,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: `h-3 w-3 ${active ? "text-foreground" : "text-muted-foreground/50"}` }),
				active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px]",
					children: sortDir === "asc" ? "↑" : "↓"
				})
			]
		})
	});
}
export { ProspectsPage as component };
