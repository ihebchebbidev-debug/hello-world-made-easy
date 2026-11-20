import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { n as Button } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { d as DropdownMenuItem, l as DropdownMenu, m as DropdownMenuTrigger, u as DropdownMenuContent, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { t as DatePicker } from "./date-picker-BVRMSMeD.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DpaEa0I_.mjs";
import { r as api, s as getToken, t as API_BASE } from "./api-2UuWgcOn.mjs";
import { c as withCustomFields, r as exportXLSX, t as exportCSV } from "./exportUtils-D82gKDXZ.mjs";
import { n as useCustomFieldsTable } from "./useCustomFields-B3TFFvN5.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bn as ArrowUp, En as ChartColumn, Gn as ArrowDown, Gt as FileSpreadsheet, Wt as FileText, in as Download, it as Minus, q as RefreshCw } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/reports-CfZBxeX9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fmtDate = (d) => d.toISOString().slice(0, 10);
var today = () => fmtDate(/* @__PURE__ */ new Date());
var monthStart = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 8) + "01";
var addDays = (d, n) => {
	const x = new Date(d);
	x.setDate(x.getDate() + n);
	return x;
};
var daysBetween = (a, b) => Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 864e5) + 1);
var PRESETS = [
	{
		key: "today",
		label: "Aujourd'hui",
		compute: () => ({
			from: today(),
			to: today()
		})
	},
	{
		key: "7d",
		label: "7 derniers jours",
		compute: () => ({
			from: fmtDate(addDays(/* @__PURE__ */ new Date(), -6)),
			to: today()
		})
	},
	{
		key: "30d",
		label: "30 derniers jours",
		compute: () => ({
			from: fmtDate(addDays(/* @__PURE__ */ new Date(), -29)),
			to: today()
		})
	},
	{
		key: "mtd",
		label: "Mois en cours",
		compute: () => ({
			from: monthStart(),
			to: today()
		})
	},
	{
		key: "ytd",
		label: "Année en cours",
		compute: () => ({
			from: (/* @__PURE__ */ new Date()).getFullYear() + "-01-01",
			to: today()
		})
	},
	{
		key: "lastMonth",
		label: "Mois précédent",
		compute: () => {
			const d = /* @__PURE__ */ new Date();
			const first = new Date(d.getFullYear(), d.getMonth() - 1, 1);
			const last = new Date(d.getFullYear(), d.getMonth(), 0);
			return {
				from: fmtDate(first),
				to: fmtDate(last)
			};
		}
	}
];
function previousPeriod(from, to) {
	const days = daysBetween(from, to);
	const prevTo = fmtDate(addDays(new Date(from), -1));
	return {
		from: fmtDate(addDays(new Date(prevTo), -(days - 1))),
		to: prevTo
	};
}
function ReportsPage() {
	const { prospects, contracts } = useErp();
	const pCustom = useCustomFieldsTable("prospect");
	const cCustom = useCustomFieldsTable("contract");
	const [from, setFrom] = (0, import_react.useState)(monthStart());
	const [to, setTo] = (0, import_react.useState)(today());
	const [data, setData] = (0, import_react.useState)(null);
	const [prev, setPrev] = (0, import_react.useState)(null);
	const [compare, setCompare] = (0, import_react.useState)(true);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const load = async (range) => {
		const f = range?.from ?? from;
		const t = range?.to ?? to;
		setLoading(true);
		try {
			const r = await api("/reports.php", { query: {
				from: f,
				to: t
			} });
			setData(r);
			if (compare) {
				const pp = previousPeriod(f, t);
				try {
					const r2 = await api("/reports.php", { query: {
						from: pp.from,
						to: pp.to
					} });
					setPrev(r2);
				} catch {
					setPrev(null);
				}
			} else setPrev(null);
		} catch (e) {
			toast.error("Erreur chargement", { description: e?.message });
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const applyPreset = (p) => {
		const r = p.compute();
		setFrom(r.from);
		setTo(r.to);
		load(r);
	};
	const exportCsv = async () => {
		try {
			const token = getToken();
			const url = `${API_BASE}/reports.php?format=csv&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
			const res = await fetch(url, { headers: token ? {
				Authorization: `Bearer ${token}`,
				"X-Auth-Token": token
			} : {} });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const blob = await res.blob();
			const href = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = href;
			a.download = `rapport-agents_${from}_${to}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(href);
		} catch (e) {
			toast.error("Échec de l'export CSV", { description: e?.message });
		}
	};
	const exportXlsx = async () => {
		if (!data) {
			toast.error("Aucune donnée");
			return;
		}
		try {
			const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.agents), "Agents");
			XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.monthly), "Mensuel");
			XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.sources), "Sources");
			XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
				...data.funnel,
				from,
				to
			}]), "Entonnoir");
			if (prev) {
				XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prev.agents), "Agents (préc.)");
				XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
					...prev.funnel,
					from: prev.period.from,
					to: prev.period.to
				}]), "Entonnoir (préc.)");
			}
			XLSX.writeFile(wb, `rapport_${from}_${to}.xlsx`);
			toast.success("Export Excel généré");
		} catch (e) {
			toast.error("Échec Excel", { description: e?.message });
		}
	};
	const exportAgentsXlsx = () => {
		if (!data) return;
		exportXLSX(`agents_${from}_${to}.xlsx`, data.agents, "Agents");
	};
	const inRange = (iso) => !!iso && iso >= from && iso <= to;
	const exportProspectsCsv = () => {
		const rows = prospects.filter((p) => inRange(p.createdAt?.slice(0, 10)));
		if (rows.length === 0) {
			toast.error("Aucun prospect sur la période");
			return;
		}
		const enriched = withCustomFields(rows, pCustom.defs, pCustom.valuesById);
		exportCSV(`prospects_${from}_${to}.csv`, enriched);
		toast.success(`${rows.length} prospect(s) exporté(s)`);
	};
	const exportProspectsXlsx = async () => {
		const rows = prospects.filter((p) => inRange(p.createdAt?.slice(0, 10)));
		if (rows.length === 0) {
			toast.error("Aucun prospect sur la période");
			return;
		}
		const enriched = withCustomFields(rows, pCustom.defs, pCustom.valuesById);
		try {
			await exportXLSX(`prospects_${from}_${to}.xlsx`, enriched, "Prospects");
			toast.success(`${rows.length} prospect(s) exporté(s)`);
		} catch (e) {
			toast.error("Échec Excel", { description: e?.message });
		}
	};
	const exportContractsCsv = () => {
		const rows = contracts.filter((c) => inRange(c.signatureDate?.slice(0, 10)));
		if (rows.length === 0) {
			toast.error("Aucun contrat sur la période");
			return;
		}
		const enriched = withCustomFields(rows, cCustom.defs, cCustom.valuesById);
		exportCSV(`contrats_${from}_${to}.csv`, enriched);
		toast.success(`${rows.length} contrat(s) exporté(s)`);
	};
	const exportContractsXlsx = async () => {
		const rows = contracts.filter((c) => inRange(c.signatureDate?.slice(0, 10)));
		if (rows.length === 0) {
			toast.error("Aucun contrat sur la période");
			return;
		}
		const enriched = withCustomFields(rows, cCustom.defs, cCustom.valuesById);
		try {
			await exportXLSX(`contrats_${from}_${to}.xlsx`, enriched, "Contrats");
			toast.success(`${rows.length} contrat(s) exporté(s)`);
		} catch (e) {
			toast.error("Échec Excel", { description: e?.message });
		}
	};
	const prevByUser = (0, import_react.useMemo)(() => {
		if (!prev) return /* @__PURE__ */ new Map();
		return new Map(prev.agents.map((a) => [a.username, a]));
	}, [prev]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Rapports & analytique",
				description: "Performance par agent, entonnoir, revenus mensuels, comparaison de période et exports.",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4 mt-6 shadow-elegant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-[11px] uppercase tracking-wider text-muted-foreground",
								children: "Du"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
								value: from,
								onChange: setFrom,
								placeholder: "Du"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-[11px] uppercase tracking-wider text-muted-foreground",
								children: "Au"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
								value: to,
								onChange: setTo,
								placeholder: "Au"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5 ml-2",
							children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => applyPreset(p),
								children: p.label
							}, p.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-xs text-muted-foreground ml-2 select-none cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: compare,
								onChange: (e) => setCompare(e.target.checked),
								className: "h-3.5 w-3.5"
							}), "Comparer à la période précédente"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => load(),
								disabled: loading,
								className: "bg-primary text-primary-foreground hover:bg-primary/90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}` }), "Actualiser"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), "Exporter"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: exportCsv,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), "CSV agents"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: exportAgentsXlsx,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Excel agents"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: exportXlsx,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Excel complet (multi-onglets)"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: exportProspectsCsv,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), "CSV prospects (avec champs personnalisés)"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: exportProspectsXlsx,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Excel prospects (avec champs personnalisés)"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: exportContractsCsv,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), "CSV contrats (avec champs personnalisés)"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: exportContractsXlsx,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Excel contrats (avec champs personnalisés)"]
									})
								]
							})] })]
						})
					]
				}), prev && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 text-xs text-muted-foreground",
					children: ["Comparé à ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium text-foreground",
						children: [
							prev.period.from,
							" → ",
							prev.period.to
						]
					})]
				})]
			}),
			data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-3 mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Leads",
							value: data.funnel.total,
							prevValue: prev?.funnel.total
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Gagnés",
							value: data.funnel.won,
							prevValue: prev?.funnel.won,
							tone: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Perdus",
							value: data.funnel.lost,
							prevValue: prev?.funnel.lost,
							tone: "destructive",
							higherIsBetter: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "En attente",
							value: data.funnel.pending,
							prevValue: prev?.funnel.pending
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "mt-6 shadow-elegant",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 py-3 border-b font-semibold text-sm",
						children: "Performance par agent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Agent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Leads"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Gagnés"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Perdus"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Contrats"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Revenue"
						}),
						prev && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Δ Revenue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Conv. %"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [data.agents.map((a) => {
						const p = prevByUser.get(a.username);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: a.fullName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: a.username
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: a.handled
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right text-success",
								children: a.won
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right text-destructive",
								children: a.lost
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: a.contracts
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-medium",
								children: formatAmount(a.revenue)
							}),
							prev && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeltaInline, {
									current: a.revenue,
									previous: p?.revenue ?? 0,
									format: (n) => formatAmount(n)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right",
								children: [a.conversion, "%"]
							})
						] }, a.username);
					}), data.agents.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: prev ? 8 : 7,
						className: "text-center text-muted-foreground py-8",
						children: "Aucune donnée"
					}) })] })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "shadow-elegant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 py-3 border-b font-semibold text-sm",
							children: "Revenus mensuels (12 mois)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Mois" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Contrats"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Revenue"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.monthly.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.month }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: m.contracts
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right font-medium",
								children: formatAmount(m.revenue)
							})
						] }, m.month)) })] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "shadow-elegant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 py-3 border-b font-semibold text-sm",
							children: "Performance par source"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Source" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Total"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Gagnés"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Conv. %"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: data.sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: s.source }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: s.total
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right text-success",
								children: s.won
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right",
								children: [s.conversion, "%"]
							})
						] }, s.source)) })] })]
					})]
				})
			] })
		]
	});
}
function KpiCard({ label, value, prevValue, tone, higherIsBetter = true }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `text-2xl font-semibold ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""}`,
				children: value
			}),
			prevValue !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeltaInline, {
					current: value,
					previous: prevValue,
					higherIsBetter
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground ml-1",
					children: "vs préc."
				})]
			})
		]
	});
}
function DeltaInline({ current, previous, format, higherIsBetter = true }) {
	if (previous === 0 && current === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "text-muted-foreground inline-flex items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3 mr-0.5" }), "0"]
	});
	const diff = current - previous;
	const pct = previous === 0 ? null : Math.round(diff / Math.abs(previous) * 100);
	const positive = diff > 0;
	const cls = diff === 0 ? "text-muted-foreground" : positive === higherIsBetter ? "text-success" : "text-destructive";
	const Icon = diff === 0 ? Minus : positive ? ArrowUp : ArrowDown;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center font-medium ${cls}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3 w-3 mr-0.5" }),
			format ? format(Math.abs(diff)) : Math.abs(diff),
			pct !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "ml-1 opacity-80",
				children: [
					"(",
					pct > 0 ? "+" : "",
					pct,
					"%)"
				]
			})
		]
	});
}
export { ReportsPage as component };
