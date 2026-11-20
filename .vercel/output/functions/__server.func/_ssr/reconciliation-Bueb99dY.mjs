import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { a as cn, n as Button } from "./input-IbC7Hkfd.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DpaEa0I_.mjs";
import { r as useImportRuns, t as clearImportRuns } from "./importHistory-DY8ex3tY.mjs";
import { t as exportCSV } from "./exportUtils-D82gKDXZ.mjs";
import { M as useConfirm } from "./router-BUkYRVTH.mjs";
import { _ as PopoverContent, g as Popover, v as PopoverTrigger } from "./popover-ePQ9XJ_z.mjs";
import { t as Calendar$1 } from "./calendar-maC5FJWT.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Dn as Calendar, Gt as FileSpreadsheet, Q as Plus, Ut as FileXCorner, _n as CircleCheck, b as Trash2, gn as CircleMinus, in as Download, q as RefreshCw } from "../_libs/lucide-react.mjs";
import { P as fr, u as format } from "../_libs/date-fns.mjs";
// node_modules/.nitro/vite/services/ssr/assets/reconciliation-Bueb99dY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ENTITY_LABELS = {
	prospect: "Prospects",
	contract: "Contrats",
	user: "Utilisateurs"
};
function fmtDate(iso) {
	try {
		return new Date(iso).toLocaleString("fr-FR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
	} catch {
		return iso;
	}
}
function ReconciliationPage() {
	const runs = useImportRuns();
	const confirmDialog = useConfirm();
	const [entity, setEntity] = (0, import_react.useState)("all");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [period, setPeriod] = (0, import_react.useState)("all");
	const [customFrom, setCustomFrom] = (0, import_react.useState)(void 0);
	const [customTo, setCustomTo] = (0, import_react.useState)(void 0);
	const { fromTs, toTs } = (0, import_react.useMemo)(() => {
		const now = Date.now();
		const day = 864e5;
		if (period === "7d") return {
			fromTs: now - 7 * day,
			toTs: now
		};
		if (period === "30d") return {
			fromTs: now - 30 * day,
			toTs: now
		};
		if (period === "90d") return {
			fromTs: now - 90 * day,
			toTs: now
		};
		if (period === "custom") return {
			fromTs: customFrom ? customFrom.setHours(0, 0, 0, 0) : -Infinity,
			toTs: customTo ? new Date(customTo).setHours(23, 59, 59, 999) : Infinity
		};
		return {
			fromTs: -Infinity,
			toTs: Infinity
		};
	}, [
		period,
		customFrom,
		customTo
	]);
	const filtered = (0, import_react.useMemo)(() => runs.filter((r) => {
		if (entity !== "all" && r.entity !== entity) return false;
		const t = new Date(r.ts).getTime();
		return t >= fromTs && t <= toTs;
	}), [
		runs,
		entity,
		fromTs,
		toTs
	]);
	const totals = (0, import_react.useMemo)(() => {
		const t = {
			added: 0,
			updated: 0,
			skipped: 0,
			runs: filtered.length
		};
		for (const r of filtered) {
			t.added += r.totals.added;
			t.updated += r.totals.updated;
			t.skipped += r.totals.skipped;
		}
		return t;
	}, [filtered]);
	const selected = (0, import_react.useMemo)(() => filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null, [filtered, selectedId]);
	const exportRunsCSV = () => {
		if (filtered.length === 0) return;
		exportCSV("reconciliation-imports.csv", filtered.map((r) => ({
			date: fmtDate(r.ts),
			entite: ENTITY_LABELS[r.entity],
			fichier: r.fileName ?? "",
			utilisateur: r.user ?? "",
			lignes_lues: r.rowsRead,
			ajoutes: r.totals.added,
			mis_a_jour: r.totals.updated,
			ignores: r.totals.skipped,
			invalides: r.rowsInvalid,
			doublons: r.duplicates
		})));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "table",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Réconciliation des imports",
				description: "Historique des imports CSV/Excel: ce qui a été ajouté, mis à jour ou ignoré, et le mappage des colonnes utilisé.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: period,
							onValueChange: (v) => setPeriod(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-[160px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Période" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "Toute la période"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "7d",
									children: "7 derniers jours"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "30d",
									children: "30 derniers jours"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "90d",
									children: "90 derniers jours"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "custom",
									children: "Personnalisé…"
								})
							] })]
						}),
						period === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: cn("h-9 justify-start text-left font-normal", !customFrom && "text-muted-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-1.5" }), customFrom ? format(customFrom, "dd MMM yyyy", { locale: fr }) : "Du"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
							className: "w-auto p-0",
							align: "start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
								mode: "single",
								selected: customFrom,
								onSelect: setCustomFrom,
								initialFocus: true,
								className: cn("p-3 pointer-events-auto")
							})
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: cn("h-9 justify-start text-left font-normal", !customTo && "text-muted-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-1.5" }), customTo ? format(customTo, "dd MMM yyyy", { locale: fr }) : "Au"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
							className: "w-auto p-0",
							align: "start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
								mode: "single",
								selected: customTo,
								onSelect: setCustomTo,
								initialFocus: true,
								className: cn("p-3 pointer-events-auto")
							})
						})] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: entity,
							onValueChange: (v) => setEntity(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-[180px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "Toutes les entités"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "prospect",
									children: "Prospects"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "contract",
									children: "Contrats"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "user",
									children: "Utilisateurs"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: exportRunsCSV,
							disabled: filtered.length === 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), " Exporter CSV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: async () => {
								if (await confirmDialog({
									title: "Vider l'historique",
									description: "Vider l'historique des imports ?",
									destructive: true,
									confirmLabel: "Vider"
								})) {
									clearImportRuns();
									setSelectedId(null);
								}
							},
							disabled: runs.length === 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1.5" }), " Vider"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Imports",
						value: totals.runs,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Ajoutés",
						value: totals.added,
						tone: "info",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Mis à jour",
						value: totals.updated,
						tone: "success",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Ignorés",
						value: totals.skipped,
						tone: totals.skipped > 0 ? "warning" : "muted",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-4 w-4" })
					})
				]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-16 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileXCorner, { className: "h-8 w-8 mx-auto mb-3 text-muted-foreground/60" }), "Aucun import enregistré pour le moment. Les imports CSV depuis Prospects, Contrats ou Utilisateurs apparaîtront ici."]
			}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-5 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base",
							children: [
								"Historique (",
								filtered.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Cliquez un import pour voir le détail du mappage." })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Entité" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Fichier" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Ajoutés"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "M.à.j."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Ignorés"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.map((r) => {
							const active = selected?.id === r.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								onClick: () => setSelectedId(r.id),
								className: `cursor-pointer ${active ? "bg-muted/60" : ""}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs whitespace-nowrap",
										children: fmtDate(r.ts)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[11px]",
										children: ENTITY_LABELS[r.entity]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-xs truncate max-w-[200px]",
										children: [r.fileName ?? "—", r.user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[10px] text-muted-foreground",
											children: ["par @", r.user]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right text-sm font-medium text-info",
										children: r.totals.added
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right text-sm font-medium text-success",
										children: r.totals.updated
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right text-sm font-medium text-muted-foreground",
										children: r.totals.skipped
									})
								]
							}, r.id);
						}) })] })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-2 space-y-4",
					children: selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Résultats"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
							ENTITY_LABELS[selected.entity],
							" • ",
							fmtDate(selected.ts)
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Fichier",
								v: selected.fileName ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Utilisateur",
								v: selected.user ? `@${selected.user}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2 pt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "Ajoutés",
										value: selected.totals.added,
										tone: "info"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "Mis à jour",
										value: selected.totals.updated,
										tone: "success"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "Ignorés",
										value: selected.totals.skipped,
										tone: "muted"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "Lues",
										value: selected.rowsRead
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "Invalides",
										value: selected.rowsInvalid,
										tone: selected.rowsInvalid > 0 ? "destructive" : "muted"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
										label: "Doublons",
										value: selected.duplicates,
										tone: selected.duplicates > 0 ? "warning" : "muted"
									})
								]
							})
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Mappage des champs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
							selected.mapping.filter((m) => m.sourceColumn).length,
							"/",
							selected.mapping.length,
							" mappé(s)"
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Champ ERP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Colonne CSV" })] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: selected.mapping.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: m.fieldLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] text-muted-foreground",
							children: [m.fieldKey, m.required && " · requis"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.sourceColumn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-xs bg-muted px-1.5 py-0.5 rounded",
								children: m.sourceColumn
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMinus, { className: "h-3.5 w-3.5" }), "Non mappé"]
						}) })] }, m.fieldKey)) })] })
					})] })] })
				})]
			})
		]
	});
}
function KpiCard({ label, value, icon, tone = "muted" }) {
	const toneCls = {
		info: "text-info",
		success: "text-success",
		warning: "text-warning-foreground",
		destructive: "text-destructive",
		muted: "text-foreground"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "py-4 px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: toneCls[tone],
				children: icon
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mt-1 text-2xl font-semibold ${toneCls[tone]}`,
			children: value
		})]
	}) });
}
function MiniStat({ label, value, tone = "muted" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-md border p-2 ${{
			info: "bg-info/10 text-info border-info/20",
			success: "bg-success/10 text-success border-success/20",
			warning: "bg-warning/10 text-warning-foreground border-warning/20",
			destructive: "bg-destructive/10 text-destructive border-destructive/20",
			muted: "bg-muted/50 text-foreground border-border"
		}[tone]}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider opacity-70",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-base font-semibold",
			children: value
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-medium truncate",
			children: v
		})]
	});
}
export { ReconciliationPage as component };
