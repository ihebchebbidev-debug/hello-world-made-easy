import { i as __toESM } from "../_runtime.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { _ as PopoverContent, g as Popover, v as PopoverTrigger } from "./popover-ePQ9XJ_z.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { D as Checkbox, M as useConfirm } from "./router-BUkYRVTH.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Cn as ChevronDown, Pn as Bookmark, Q as Plus, U as RotateCcw, V as Search, b as Trash2, j as SlidersHorizontal, n as X, wn as Check, z as Settings2 } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/CustomColumnsPicker-NiDe8uKb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function prospectQuery(f) {
	const q = {};
	for (const [k, v] of Object.entries(f)) if (v !== void 0 && v !== null && v !== "") q[k] = String(v);
	return q;
}
async function fetchProspectsPage(opts) {
	const page = opts.page ?? 1;
	const pageSize = opts.pageSize ?? 2e3;
	const r = await api("/prospects.php", { query: {
		page: String(page),
		pageSize: String(pageSize),
		sort: opts.sort ?? "createdAt",
		dir: opts.dir ?? "desc",
		...prospectQuery(opts.filters ?? {})
	} });
	return {
		rows: r.prospects ?? [],
		total: r.total ?? 0,
		page: r.page ?? page,
		pageSize: r.pageSize ?? pageSize
	};
}
async function fetchProspectIdsForFilter(filters = {}) {
	return (await api("/prospects.php", { query: {
		ids: "1",
		...prospectQuery(filters)
	} })).ids ?? [];
}
function contractQuery(f) {
	const q = {};
	for (const [k, v] of Object.entries(f)) if (v !== void 0 && v !== null && v !== "") q[k] = String(v);
	return q;
}
async function fetchContractsPage(opts) {
	const page = opts.page ?? 1;
	const pageSize = opts.pageSize ?? 2e3;
	const r = await api("/contracts.php", { query: {
		page: String(page),
		pageSize: String(pageSize),
		sort: opts.sort ?? "signatureDate",
		dir: opts.dir ?? "desc",
		...contractQuery(opts.filters ?? {})
	} });
	return {
		rows: r.contracts ?? [],
		total: r.total ?? 0,
		page: r.page ?? page,
		pageSize: r.pageSize ?? pageSize
	};
}
async function fetchContractIdsForFilter(filters = {}) {
	return (await api("/contracts.php", { query: {
		ids: "1",
		...contractQuery(filters)
	} })).ids ?? [];
}
async function* iterateAllContracts(filters = {}, pageSize = 2e3, sort = "signatureDate", dir = "desc") {
	let page = 1;
	while (true) {
		const r = await fetchContractsPage({
			page,
			pageSize,
			filters,
			sort,
			dir
		});
		if (!r.rows.length) return;
		yield r.rows;
		if (page * r.pageSize >= r.total) return;
		page++;
	}
}
function loadPersistentState(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function savePersistentState(key, value) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
/**
* Compact filter UX:
*  - Always-visible search bar + primary action
*  - "Filtres" toggle reveals the advanced grid
*  - Active filters shown as removable chips so users always understand what's applied
*/
function FilterBar({ searchValue, onSearchChange, searchPlaceholder = "Rechercher…", onSearch, onReset, activeChips, children, resultsCount }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const hasFilters = activeChips.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: searchValue,
						onChange: (e) => onSearchChange(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter") onSearch();
						},
						placeholder: searchPlaceholder,
						className: "pl-9 h-10"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: open ? "default" : "outline",
							size: "sm",
							onClick: () => setOpen((o) => !o),
							className: "h-10 relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "h-4 w-4 mr-1.5" }),
								"Filtres",
								hasFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5",
									children: activeChips.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 ml-1 transition-transform ${open ? "rotate-180" : ""}` })
							]
						}),
						hasFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: onReset,
							className: "h-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4 mr-1.5" }), "Effacer"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							onClick: onSearch,
							className: "h-10 bg-primary text-primary-foreground hover:bg-primary/90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 mr-1.5" }), "Rechercher"]
						})
					]
				})]
			}),
			hasFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-3 pb-3 flex items-center flex-wrap gap-1.5 border-t border-border pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] uppercase tracking-wider text-muted-foreground mr-1",
					children: ["Filtres actifs", typeof resultsCount === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 normal-case tracking-normal text-foreground/70",
						children: [
							"· ",
							resultsCount.toLocaleString("fr-FR"),
							" résultat",
							resultsCount > 1 ? "s" : ""
						]
					})]
				}), activeChips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "bg-primary/5 border-primary/20 text-foreground gap-1 pl-2 pr-1 py-0.5 cursor-pointer hover:bg-primary/10",
					onClick: c.onClear,
					children: [c.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 text-muted-foreground" })]
				}, c.key))]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-3 pt-3 border-t border-border bg-muted/20",
				children
			})
		]
	});
}
/** Persisted list of named filter snapshots, scoped per page (e.g. "prospects"). */
function useSavedViews(scope) {
	const key = `erp.savedViews.${scope}`;
	const [views, setViews] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(key);
			if (raw) setViews(JSON.parse(raw));
		} catch {}
	}, [key]);
	const persist = (next) => {
		setViews(next);
		try {
			localStorage.setItem(key, JSON.stringify(next));
		} catch {}
	};
	return {
		views,
		save: (name, state) => {
			const id = `v-${Date.now().toString(36)}`;
			persist([...views, {
				id,
				name,
				state
			}]);
		},
		remove: (id) => persist(views.filter((v) => v.id !== id)),
		rename: (id, name) => persist(views.map((v) => v.id === id ? {
			...v,
			name
		} : v))
	};
}
function SavedViews({ scope, current, onApply, isEqual }) {
	const { views, save, remove } = useSavedViews(scope);
	const [name, setName] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const confirmDialog = useConfirm();
	const handleSave = () => {
		const trimmed = name.trim();
		if (!trimmed) {
			toast.error("Donnez un nom à la vue");
			return;
		}
		save(trimmed, current);
		setName("");
		toast.success(`Vue "${trimmed}" enregistrée`);
	};
	const eq = (v) => isEqual ? isEqual(v, current) : false;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "h-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "h-4 w-4 mr-1.5" }),
					"Vues",
					views.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted text-foreground text-[10px] font-semibold px-1.5",
						children: views.length
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
			align: "end",
			className: "w-80 p-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 py-2 border-b border-border text-sm font-semibold",
					children: "Vues enregistrées"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-64 overflow-y-auto",
					children: views.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-3 py-4 text-xs text-muted-foreground text-center",
						children: "Aucune vue. Configurez vos filtres puis enregistrez-les ci-dessous."
					}) : views.map((v) => {
						const active = eq(v.state);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-3 py-2 hover:bg-muted/40 border-b border-border last:border-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									onApply(v.state);
									setOpen(false);
									toast.success(`Vue "${v.name}" appliquée`);
								},
								className: "flex-1 text-left text-sm flex items-center gap-2 min-w-0",
								children: [
									active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-success shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: v.name
									}),
									active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px] py-0 ml-auto",
										children: "active"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "h-7 w-7 text-muted-foreground hover:text-destructive",
								onClick: async () => {
									if (await confirmDialog({
										title: "Supprimer la vue",
										description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											"Voulez-vous supprimer la vue ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
												"\"",
												v.name,
												"\""
											] }),
											" ?"
										] }),
										destructive: true
									})) remove(v.id);
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						}, v.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 border-t border-border space-y-2 bg-muted/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground",
						children: "Enregistrer la vue actuelle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") handleSave();
							},
							placeholder: "Ex: Mes leads chauds",
							className: "h-9"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "h-9",
							onClick: handleSave,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5 mr-1" }), "Enregistrer"]
						})]
					})]
				})
			]
		})]
	});
}
function CustomColumnsPicker({ defs, visible, onToggle }) {
	if (defs.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4 mr-1.5" }),
				" Colonnes",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-1.5 text-[10px] text-muted-foreground",
					children: [
						"(",
						visible.size,
						"/",
						defs.length,
						")"
					]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		className: "w-64 p-3 space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
			children: "Champs personnalisés"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2 max-h-72 overflow-auto",
			children: defs.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor: `col-${f.id}`,
				className: "flex items-center gap-2 cursor-pointer text-sm font-normal",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					id: `col-${f.id}`,
					checked: visible.has(f.key),
					onCheckedChange: (c) => onToggle(f.key, !!c)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: f.label
				})]
			}, f.id))
		})]
	})] });
}
export { fetchContractsPage as a, iterateAllContracts as c, fetchContractIdsForFilter as i, loadPersistentState as l, FilterBar as n, fetchProspectIdsForFilter as o, SavedViews as r, fetchProspectsPage as s, CustomColumnsPicker as t, savePersistentState as u };
