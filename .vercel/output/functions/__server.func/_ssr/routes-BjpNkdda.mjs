import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { C as useDashboardStats, S as useCurrency, b as formatCompact, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { c as useAuth } from "./input-IbC7Hkfd.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { r as useAllUserGroups } from "./userGroups-Cq6gRBAA.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { An as CalendarCheck, C as Target, Ct as LayoutGrid, En as ChartColumn, Jn as Activity, Kn as ArrowDownRight, Vn as ArrowUpRight, Xt as FileCheck, _ as Trophy, _n as CircleCheck, a as Users, at as Minimize2, dn as ClipboardCheck, dt as Maximize2, k as Sparkles, kt as Inbox, ln as Clock, pn as CircleX, q as RefreshCw, vn as CircleAlert, y as TrendingUp, zn as Ban } from "../_libs/lucide-react.mjs";
import { a as LineChart, c as Area, d as Bar, f as Pie, g as Legend, h as Tooltip, i as BarChart, l as Line, m as ResponsiveContainer, n as AreaChart, o as YAxis, p as Cell, r as PieChart, s as XAxis, t as ComposedChart, u as CartesianGrid } from "../_libs/recharts+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/routes-BjpNkdda.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_DOT_COLOR = {
	success: "oklch(0.45 0.64 140)",
	warning: "oklch(0.85 0.6 80)",
	destructive: "oklch(0.65 0.75 25)",
	info: "oklch(0.62 0.65 260)",
	primary: "oklch(0.6 0.7 190)",
	accent: "oklch(0.72 0.62 320)",
	muted: "oklch(0.62 0.05 240)"
};
var colorFor = (status, options) => {
	const option = options.get(status);
	return option ? STATUS_DOT_COLOR[option.color] ?? STATUS_DOT_COLOR.muted : STATUS_DOT_COLOR.muted;
};
var EXCLUDED_BILLING_STATUSES = /* @__PURE__ */ new Set([
	"annuler la confirmation",
	"rétractation",
	"résiliation"
]);
var isExcludedBillingStatus = (status) => EXCLUDED_BILLING_STATUSES.has((status || "").trim().toLowerCase());
var MONTHS_FR$5 = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre"
];
var AgentSalesMatrix = (0, import_react.memo)(function AgentSalesMatrix({ roleFilter, groupFilter, title = "Ventes par agent & compagnie" } = {}) {
	const { contracts, users } = useErp();
	const { user } = useAuth();
	const currency = useCurrency();
	const { options: billingStatusOptions } = useStatusOptions("contract");
	const { values: PARTNERS } = useOptionList("contract", "partner");
	const allUserGroups = useAllUserGroups();
	const billingStatusByValue = (0, import_react.useMemo)(() => new Map(billingStatusOptions.map((o) => [o.value, o])), [billingStatusOptions]);
	const now = /* @__PURE__ */ new Date();
	const [ym, setYm] = (0, import_react.useState)(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
	const [year, monthIdx] = ym.split("-").map(Number);
	const monthLabel = `${MONTHS_FR$5[(monthIdx ?? 1) - 1]} ${year}`;
	const isPriv = user?.role === "Administrateur" || user?.role === "Manager" || user?.role === "Présentation";
	const { agentNames, resolveAgent } = (0, import_react.useMemo)(() => {
		const wantedGroups = groupFilter ? new Set((Array.isArray(groupFilter) ? groupFilter : [groupFilter]).map((g) => g.trim().toLowerCase())) : null;
		const staff = users.filter((u) => {
			if (!isAssignableRole(u.role)) return false;
			const roleOk = roleFilter ? roleFilter.has(u.role) : false;
			const groupOk = wantedGroups ? (allUserGroups[u.id] || []).some((g) => wantedGroups.has(g.toLowerCase())) : false;
			if (!roleFilter && !wantedGroups) return true;
			return roleOk || groupOk;
		});
		const displayOf = (u) => u.fullName?.trim() || u.username;
		const lookup = /* @__PURE__ */ new Map();
		staff.forEach((u) => {
			const display = displayOf(u);
			if (u.username) lookup.set(u.username.toLowerCase(), display);
			if (u.fullName) lookup.set(u.fullName.trim().toLowerCase(), display);
			lookup.set(display.toLowerCase(), display);
		});
		const allNames = staff.map(displayOf);
		const visible = isPriv ? allNames : (() => {
			const me = user?.fullName?.trim() || user?.username || "";
			return me ? [me] : [];
		})();
		const visibleSet = new Set(visible.map((n) => n.toLowerCase()));
		const resolve = (raw) => {
			const key = (raw || "").trim().toLowerCase();
			if (!key) return null;
			const display = lookup.get(key);
			if (!display) return null;
			return visibleSet.has(display.toLowerCase()) ? display : null;
		};
		return {
			agentNames: visible,
			resolveAgent: resolve
		};
	}, [
		users,
		isPriv,
		user,
		roleFilter,
		groupFilter,
		allUserGroups
	]);
	const monthContracts = (0, import_react.useMemo)(() => {
		return contracts.filter((c) => {
			return (c.signatureDate || "").startsWith(ym);
		});
	}, [contracts, ym]);
	const statusRows = (0, import_react.useMemo)(() => {
		const rows = billingStatusOptions.map((o) => o.value);
		const extraStatuses = Array.from(new Set(monthContracts.map((c) => (c.billingStatus ?? "").trim()).filter((status) => status && !billingStatusByValue.has(status))));
		return [...rows, ...extraStatuses];
	}, [
		billingStatusOptions,
		billingStatusByValue,
		monthContracts
	]);
	const partnerRows = (0, import_react.useMemo)(() => {
		const rows = PARTNERS.length ? PARTNERS : ["Autre"];
		const extraPartners = Array.from(new Set(monthContracts.map((c) => (c.partner ?? "").trim()).filter((partner) => partner && !rows.includes(partner))));
		return [...rows, ...extraPartners];
	}, [PARTNERS, monthContracts]);
	const matrix = (0, import_react.useMemo)(() => {
		const rows = statusRows.length ? statusRows : ["Autre"];
		const data = {};
		rows.forEach((r) => {
			data[r] = {};
			agentNames.forEach((a) => {
				data[r][a] = {
					revenue: 0,
					count: 0
				};
			});
		});
		monthContracts.forEach((c) => {
			const agent = resolveAgent(c.assignedTo);
			if (!agent) return;
			const status = (c.billingStatus ?? "").trim() || "Autre";
			const row = rows.includes(status) ? status : "Autre";
			if (!data[row]) return;
			const cell = data[row][agent];
			if (!cell) return;
			cell.revenue += Number(c.premium) || 0;
			cell.count += 1;
		});
		return {
			rows,
			data
		};
	}, [
		monthContracts,
		agentNames,
		resolveAgent,
		statusRows
	]);
	const partnerMatrix = (0, import_react.useMemo)(() => {
		const rows = partnerRows.length ? partnerRows : ["Autre"];
		const data = {};
		rows.forEach((r) => {
			data[r] = {};
			agentNames.forEach((a) => {
				data[r][a] = {
					revenue: 0,
					count: 0
				};
			});
		});
		monthContracts.forEach((c) => {
			if (isExcludedBillingStatus(c.billingStatus ?? "")) return;
			const agent = resolveAgent(c.assignedTo);
			if (!agent) return;
			const partner = (c.partner ?? "").trim() || "Autre";
			const row = rows.includes(partner) ? partner : "Autre";
			if (!data[row]) return;
			const cell = data[row][agent];
			if (!cell) return;
			cell.revenue += Number(c.premium) || 0;
			cell.count += 1;
		});
		return {
			rows,
			data
		};
	}, [
		monthContracts,
		agentNames,
		resolveAgent,
		partnerRows
	]);
	const activeColTotals = (0, import_react.useMemo)(() => {
		const out = {};
		agentNames.forEach((a) => {
			let revenue = 0, count = 0;
			matrix.rows.forEach((r) => {
				if (isExcludedBillingStatus(r)) return;
				revenue += matrix.data[r][a].revenue;
				count += matrix.data[r][a].count;
			});
			out[a] = {
				revenue,
				count
			};
		});
		return out;
	}, [matrix, agentNames]);
	const rowTotals = (0, import_react.useMemo)(() => {
		const out = {};
		matrix.rows.forEach((r) => {
			let revenue = 0, count = 0;
			agentNames.forEach((a) => {
				revenue += matrix.data[r][a].revenue;
				count += matrix.data[r][a].count;
			});
			out[r] = {
				revenue,
				count
			};
		});
		return out;
	}, [matrix, agentNames]);
	const partnerRowTotals = (0, import_react.useMemo)(() => {
		const out = {};
		partnerMatrix.rows.forEach((r) => {
			let revenue = 0, count = 0;
			agentNames.forEach((a) => {
				revenue += partnerMatrix.data[r][a].revenue;
				count += partnerMatrix.data[r][a].count;
			});
			out[r] = {
				revenue,
				count
			};
		});
		return out;
	}, [partnerMatrix, agentNames]);
	const partnerColTotals = (0, import_react.useMemo)(() => {
		const out = {};
		agentNames.forEach((a) => {
			let revenue = 0, count = 0;
			partnerMatrix.rows.forEach((r) => {
				revenue += partnerMatrix.data[r][a].revenue;
				count += partnerMatrix.data[r][a].count;
			});
			out[a] = {
				revenue,
				count
			};
		});
		return out;
	}, [partnerMatrix, agentNames]);
	const grandTotal = (0, import_react.useMemo)(() => {
		let revenue = 0, count = 0;
		agentNames.forEach((a) => {
			revenue += activeColTotals[a].revenue;
			count += activeColTotals[a].count;
		});
		return {
			revenue,
			count
		};
	}, [activeColTotals, agentNames]);
	const partnerGrandTotal = (0, import_react.useMemo)(() => {
		let revenue = 0, count = 0;
		agentNames.forEach((a) => {
			revenue += partnerColTotals[a].revenue;
			count += partnerColTotals[a].count;
		});
		return {
			revenue,
			count
		};
	}, [partnerColTotals, agentNames]);
	(0, import_react.useMemo)(() => {
		return agentNames.map((a) => {
			const row = { agent: a };
			matrix.rows.forEach((r) => {
				row[r] = matrix.data[r][a].count;
			});
			return row;
		});
	}, [matrix, agentNames]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const out = [];
		const d = /* @__PURE__ */ new Date();
		for (let i = 0; i < 12; i++) {
			const y = d.getFullYear(), m = d.getMonth();
			out.push({
				value: `${y}-${String(m + 1).padStart(2, "0")}`,
				label: `${MONTHS_FR$5[m]} ${y}`
			});
			d.setMonth(d.getMonth() - 1);
		}
		return out;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base xl:text-lg flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-4 w-4 xl:h-5 xl:w-5 text-primary" }), title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
				className: "xl:text-sm",
				children: [
					monthLabel,
					" · ",
					grandTotal.count,
					" ventes · ",
					formatAmount(grandTotal.revenue, currency)
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: ym,
				onChange: (e) => setYm(e.target.value),
				className: "text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5",
				children: monthOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: o.value,
					children: o.label
				}, o.value))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-xs xl:text-sm tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-muted/60 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60",
								children: "Statut facturation"
							}),
							agentNames.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-semibold px-3 py-2.5 whitespace-nowrap",
								children: a
							}, a)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground",
								children: "C.A"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground",
								children: "Nbr Ventes"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [matrix.rows.map((r) => {
						const dot = colorFor(r, billingStatusByValue);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/30 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "h-2.5 w-2.5 rounded-full",
											style: { background: dot }
										}), r]
									})
								}),
								agentNames.map((a) => {
									const cell = matrix.data[r][a];
									const empty = cell.revenue === 0 && cell.count === 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`,
										children: empty ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-end leading-tight",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: formatAmount(cell.revenue, currency)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] xl:text-[11px] text-muted-foreground",
												children: [
													cell.count,
													" vente",
													cell.count > 1 ? "s" : ""
												]
											})]
										})
									}, a);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right font-bold bg-primary/5",
									children: formatAmount(rowTotals[r].revenue, currency)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right font-bold bg-primary/5",
									children: rowTotals[r].count
								})
							]
						}, r);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-bold sticky left-0 bg-primary/10",
								children: "Total"
							}),
							agentNames.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-bold",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-end leading-tight",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatAmount(activeColTotals[a].revenue, currency) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] xl:text-[11px] font-medium text-muted-foreground",
										children: [
											activeColTotals[a].count,
											" vente",
											activeColTotals[a].count > 1 ? "s" : ""
										]
									})]
								})
							}, a)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-extrabold bg-primary/15",
								children: formatAmount(grandTotal.revenue, currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-extrabold bg-primary/15",
								children: grandTotal.count
							})
						]
					})] })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-x-auto rounded-xl border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-3 border-b border-border bg-muted/50 text-sm font-semibold",
					children: "Par défaut par compagnie"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-xs xl:text-sm tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-muted/60 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60",
								children: "Compagnie"
							}),
							agentNames.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-semibold px-3 py-2.5 whitespace-nowrap",
								children: a
							}, a)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground",
								children: "C.A"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground",
								children: "Nbr Ventes"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [partnerMatrix.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border hover:bg-accent/30 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
								children: r
							}),
							agentNames.map((a) => {
								const cell = partnerMatrix.data[r][a];
								const empty = cell.revenue === 0 && cell.count === 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: `px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`,
									children: empty ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-end leading-tight",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: formatAmount(cell.revenue, currency)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] xl:text-[11px] text-muted-foreground",
											children: [
												cell.count,
												" vente",
												cell.count > 1 ? "s" : ""
											]
										})]
									})
								}, a);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 text-right font-bold bg-primary/5",
								children: formatAmount(partnerRowTotals[r].revenue, currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2.5 text-right font-bold bg-primary/5",
								children: partnerRowTotals[r].count
							})
						]
					}, r)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-bold sticky left-0 bg-primary/10",
								children: "Total"
							}),
							agentNames.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-bold",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-end leading-tight",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatAmount(partnerColTotals[a].revenue, currency) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] xl:text-[11px] font-medium text-muted-foreground",
										children: [
											partnerColTotals[a].count,
											" vente",
											partnerColTotals[a].count > 1 ? "s" : ""
										]
									})]
								})
							}, a)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-extrabold bg-primary/15",
								children: formatAmount(partnerGrandTotal.revenue, currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-extrabold bg-primary/15",
								children: partnerGrandTotal.count
							})
						]
					})] })]
				})]
			})]
		})]
	});
});
function useRdvConversion(ym) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const fetchOnce = () => {
			setIsLoading(true);
			setError(null);
			return api(`/rdv_conversion.php`, { query: { ym } }).then((d) => {
				if (!cancelled) setData(d);
			}).catch((e) => {
				if (!cancelled) setError(e);
			}).finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		};
		fetchOnce();
		const id = window.setInterval(fetchOnce, 6e5);
		const onFocus = () => fetchOnce();
		const onVis = () => {
			if (document.visibilityState === "visible") fetchOnce();
		};
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVis);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [ym]);
	return {
		data,
		error,
		isLoading
	};
}
var MONTHS_FR$4 = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre"
];
var VendeurConversionMatrix = (0, import_react.memo)(function VendeurConversionMatrix({ title = "Conversion RDV → Vente par vendeur" } = {}) {
	const { users } = useErp();
	const currency = useCurrency();
	const now = /* @__PURE__ */ new Date();
	const [ym, setYm] = (0, import_react.useState)(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
	const [year, monthIdx] = ym.split("-").map(Number);
	const monthLabel = `${MONTHS_FR$4[(monthIdx ?? 1) - 1]} ${year}`;
	const { data, isLoading, error } = useRdvConversion(ym);
	const displayOf = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		users.forEach((u) => {
			m.set(u.username.toLowerCase(), u.fullName?.trim() || u.username);
		});
		return (vendor) => m.get(vendor.toLowerCase()) ?? vendor;
	}, [users]);
	const rows = data?.rows ?? [];
	const totals = data?.totals;
	const vendors = (0, import_react.useMemo)(() => [...rows].sort((a, b) => b.rdv_taken - a.rdv_taken || a.vendor.localeCompare(b.vendor)), [rows]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const out = [];
		const d = /* @__PURE__ */ new Date();
		for (let i = 0; i < 12; i++) {
			const y = d.getFullYear(), m = d.getMonth();
			out.push({
				value: `${y}-${String(m + 1).padStart(2, "0")}`,
				label: `${MONTHS_FR$4[m]} ${y}`
			});
			d.setMonth(d.getMonth() - 1);
		}
		return out;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base xl:text-lg flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-4 w-4 xl:h-5 xl:w-5 text-primary" }), title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
				className: "xl:text-sm",
				children: [monthLabel, totals && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					" · ",
					totals.rdv_taken,
					" RDV pris · ",
					totals.sales_from_rdv,
					" ventes",
					" ",
					"(",
					totals.conversion_rate,
					"%) · ",
					formatAmount(totals.revenue_from_rdv, currency)
				] })]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: ym,
				onChange: (e) => setYm(e.target.value),
				className: "text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5",
				children: monthOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: o.value,
					children: o.label
				}, o.value))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-6",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }),
						"Impossible de charger les données (",
						error.message,
						")."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-xs xl:text-sm tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-muted/60 text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60",
									children: "Indicateur"
								}),
								vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-semibold px-3 py-2.5 whitespace-nowrap",
									children: displayOf(v.vendor)
								}, v.vendor)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground",
									children: "Total"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
										children: "RDV pris"
									}),
									vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right",
										children: v.rdv_taken || "—"
									}, v.vendor)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-bold bg-primary/5",
										children: totals?.rdv_taken ?? 0
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border bg-accent/20",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
										children: "Ventes issues RDV"
									}),
									vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right",
										children: v.sales_from_rdv || "—"
									}, v.vendor)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-bold bg-primary/5",
										children: totals?.sales_from_rdv ?? 0
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
										children: "Taux conversion"
									}),
									vendors.map((v) => {
										const good = v.conversion_rate >= 50;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: `px-3 py-2.5 text-right font-medium ${good ? "text-emerald-600 dark:text-emerald-400" : ""}`,
											children: v.rdv_taken > 0 ? `${v.conversion_rate}%` : "—"
										}, v.vendor);
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-bold bg-primary/5",
										children: totals && totals.rdv_taken > 0 ? `${totals.conversion_rate}%` : "—"
									})
								]
							})
						] })]
					})
				}),
				isLoading && !data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: "Chargement…"
				})
			]
		})]
	});
});
function useRdvAgents(ym) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const fetchOnce = () => {
			setIsLoading(true);
			setError(null);
			return api(`/rdv_agents.php`, { query: { ym } }).then((d) => {
				if (!cancelled) setData(d);
			}).catch((e) => {
				if (!cancelled) setError(e);
			}).finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		};
		fetchOnce();
		const id = window.setInterval(fetchOnce, 6e5);
		const onFocus = () => fetchOnce();
		const onVis = () => {
			if (document.visibilityState === "visible") fetchOnce();
		};
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVis);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [ym]);
	return {
		data,
		error,
		isLoading
	};
}
var RDV_COLORS = {
	"RDV": "oklch(0.7 0.25 330)",
	"TRAITÉS": "oklch(0.55 0.22 265)",
	"GAGNÉS": "oklch(0.72 0.19 145)",
	"NRP": "oklch(0.82 0.16 95)",
	"REFUS": "oklch(0.62 0.22 25)",
	"EN ATTENTE": "oklch(0.65 0.04 250)"
};
var MONTHS_FR$3 = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre"
];
var RdvAgentsMatrix = (0, import_react.memo)(function RdvAgentsMatrix({ roleFilter: _roleFilter, title = "Performance des agents RDV" } = {}) {
	const now = /* @__PURE__ */ new Date();
	const [ym, setYm] = (0, import_react.useState)(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
	const [year, monthIdx] = ym.split("-").map(Number);
	const monthLabel = `${MONTHS_FR$3[(monthIdx ?? 1) - 1]} ${year}`;
	const { data, error, isLoading } = useRdvAgents(ym);
	const series = data?.series ?? [];
	const pct = (n, d) => d > 0 ? n / d * 100 : 0;
	const grand = (0, import_react.useMemo)(() => {
		let total = 0, unique = 0, won = 0, lost = 0, nrp = 0, pending = 0;
		series.forEach((s) => {
			total += s.total;
			unique += s.unique;
			won += s.won;
			lost += s.lost;
			nrp += s.nrp;
			pending += s.pending;
		});
		const treated = won + lost + nrp;
		return {
			total,
			unique,
			won,
			lost,
			nrp,
			pending,
			treated
		};
	}, [series]);
	const chartData = (0, import_react.useMemo)(() => series.map((s) => ({
		agent: s.name,
		RDV: s.total,
		"TRAITÉS": s.won + s.lost + s.nrp,
		"GAGNÉS": s.won,
		NRP: s.nrp,
		REFUS: s.lost,
		"EN ATTENTE": s.pending
	})), [series]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const out = [];
		const d = /* @__PURE__ */ new Date();
		for (let i = 0; i < 12; i++) {
			const y = d.getFullYear(), m = d.getMonth();
			out.push({
				value: `${y}-${String(m + 1).padStart(2, "0")}`,
				label: `${MONTHS_FR$3[m]} ${y}`
			});
			d.setMonth(d.getMonth() - 1);
		}
		return out;
	}, []);
	const rows = [
		{
			key: "RDV",
			type: "count",
			valueFor: (s) => s.total,
			countFor: (s) => s.total,
			total: grand.total,
			totalCount: grand.total
		},
		{
			key: "TRAITÉS",
			type: "percent",
			valueFor: (s) => pct(s.won + s.lost + s.nrp, s.unique),
			countFor: (s) => s.won + s.lost + s.nrp,
			total: pct(grand.treated, grand.unique),
			totalCount: grand.treated
		},
		{
			key: "GAGNÉS",
			type: "percent",
			valueFor: (s) => pct(s.won, s.unique),
			countFor: (s) => s.won,
			total: pct(grand.won, grand.unique),
			totalCount: grand.won
		},
		{
			key: "NRP",
			type: "percent",
			valueFor: (s) => pct(s.nrp, s.unique),
			countFor: (s) => s.nrp,
			total: pct(grand.nrp, grand.unique),
			totalCount: grand.nrp
		},
		{
			key: "REFUS",
			type: "percent",
			valueFor: (s) => pct(s.lost, s.unique),
			countFor: (s) => s.lost,
			total: pct(grand.lost, grand.unique),
			totalCount: grand.lost
		},
		{
			key: "EN ATTENTE",
			type: "percent",
			valueFor: (s) => pct(s.pending, s.unique),
			countFor: (s) => s.pending,
			total: pct(grand.pending, grand.unique),
			totalCount: grand.pending
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base xl:text-lg flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-4 w-4 xl:h-5 xl:w-5 text-primary" }), title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
				className: "xl:text-sm",
				children: [
					monthLabel,
					" · ",
					grand.total,
					" RDV pris · ",
					grand.unique,
					" prospects uniques · ",
					grand.won,
					" gagnés"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: ym,
				onChange: (e) => setYm(e.target.value),
				className: "text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5",
				children: monthOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: o.value,
					children: o.label
				}, o.value))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-6",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }),
						"Impossible de charger les données (",
						error.message,
						")."
					]
				}),
				isLoading && !data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: "Chargement…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-xs xl:text-sm tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "bg-muted/60 text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60",
									children: "Indicateur"
								}),
								series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-semibold px-3 py-2.5 whitespace-nowrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-end leading-tight",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.full_name || s.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] uppercase tracking-wide text-muted-foreground",
											children: ["@", s.username]
										})]
									})
								}, s.username)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground",
									children: "Total"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => {
							const dot = RDV_COLORS[row.key];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border hover:bg-accent/30 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "h-2.5 w-2.5 rounded-full",
												style: { background: dot }
											}), row.key]
										})
									}),
									series.map((s) => {
										const v = row.valueFor(s);
										const c = row.countFor(s);
										const empty = s.total === 0;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: `px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`,
											children: empty ? "—" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col items-end leading-tight",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium",
													children: row.type === "percent" ? `${v.toFixed(2)}%` : String(v)
												}), row.type === "percent" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] xl:text-[11px] text-muted-foreground",
													children: [
														c,
														" / ",
														s.unique
													]
												})]
											})
										}, s.username);
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-right font-bold bg-primary/5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-end leading-tight",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.type === "percent" ? `${row.total.toFixed(2)}%` : String(row.total) }), row.type === "percent" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] xl:text-[11px] font-medium text-muted-foreground",
												children: [
													row.totalCount,
													" / ",
													grand.unique
												]
											})]
										})
									})
								]
							}, row.key);
						}) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center gap-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" }), "Volumes par agent"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-72 xl:h-80 rounded-xl border border-border bg-gradient-to-br from-muted/40 to-background p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: chartData,
							barCategoryGap: 20,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "oklch(0.92 0.008 240)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "agent",
									stroke: "oklch(0.52 0.02 250)",
									fontSize: 12
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.52 0.02 250)",
									fontSize: 12,
									allowDecimals: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid oklch(0.92 0.008 240)",
										fontSize: 12
									},
									cursor: { fill: "oklch(0.95 0.01 240 / 0.5)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "RDV",
									fill: RDV_COLORS["RDV"],
									radius: [
										4,
										4,
										0,
										0
									],
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "TRAITÉS",
									fill: RDV_COLORS["TRAITÉS"],
									radius: [
										4,
										4,
										0,
										0
									],
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "GAGNÉS",
									fill: RDV_COLORS["GAGNÉS"],
									radius: [
										4,
										4,
										0,
										0
									],
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "NRP",
									fill: RDV_COLORS["NRP"],
									radius: [
										4,
										4,
										0,
										0
									],
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "REFUS",
									fill: RDV_COLORS["REFUS"],
									radius: [
										4,
										4,
										0,
										0
									],
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "EN ATTENTE",
									fill: RDV_COLORS["EN ATTENTE"],
									radius: [
										4,
										4,
										0,
										0
									],
									isAnimationActive: false
								})
							]
						})
					})
				})] })
			]
		})]
	});
});
var MONTHS_FR$2 = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre"
];
var COLORS$1 = {
	qualified: "oklch(0.7 0.2 165)",
	total: "oklch(0.55 0.22 265)"
};
var isQualified = (status) => {
	const s = (status || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
	return s === "qualifie" || s.startsWith("qualifie");
};
/**
* Matrix of qualified prospects per qualificateur per month.
* Scope: only users with the Qualificateur role appear as columns.
* Privileged users (Admin/Manager) see everyone; others see only themselves.
*/
var QualifierMatrix = (0, import_react.memo)(function QualifierMatrix({ roleFilter, title = "Fiches qualifiées par qualificateur" } = {}) {
	const { prospects, users } = useErp();
	const { user } = useAuth();
	const now = /* @__PURE__ */ new Date();
	const [ym, setYm] = (0, import_react.useState)(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
	const [year, monthIdx] = ym.split("-").map(Number);
	const monthLabel = `${MONTHS_FR$2[(monthIdx ?? 1) - 1]} ${year}`;
	const isPriv = user?.role === "Administrateur" || user?.role === "Manager" || user?.role === "Présentation";
	const { agentNames, resolveAgent } = (0, import_react.useMemo)(() => {
		const staff = users.filter((u) => isAssignableRole(u.role) && (!roleFilter || roleFilter.has(u.role)));
		const displayOf = (u) => u.fullName?.trim() || u.username;
		const lookup = /* @__PURE__ */ new Map();
		staff.forEach((u) => {
			const display = displayOf(u);
			if (u.username) lookup.set(u.username.toLowerCase(), display);
			if (u.fullName) lookup.set(u.fullName.trim().toLowerCase(), display);
			lookup.set(display.toLowerCase(), display);
		});
		const allNames = staff.map(displayOf);
		const visible = isPriv ? allNames : (() => {
			const me = user?.fullName?.trim() || user?.username || "";
			return me && staff.some((u) => displayOf(u).toLowerCase() === me.toLowerCase()) ? [me] : [];
		})();
		const visibleSet = new Set(visible.map((n) => n.toLowerCase()));
		const resolve = (raw) => {
			const key = (raw || "").trim().toLowerCase();
			if (!key) return null;
			const display = lookup.get(key);
			if (!display) return null;
			return visibleSet.has(display.toLowerCase()) ? display : null;
		};
		return {
			agentNames: visible,
			resolveAgent: resolve
		};
	}, [
		users,
		isPriv,
		user,
		roleFilter
	]);
	const monthProspects = (0, import_react.useMemo)(() => prospects.filter((p) => (p.createdAt || "").startsWith(ym)), [prospects, ym]);
	const counts = (0, import_react.useMemo)(() => {
		const out = {};
		agentNames.forEach((a) => {
			out[a] = {
				total: 0,
				qualified: 0
			};
		});
		monthProspects.forEach((p) => {
			const a = resolveAgent(p.assignedTo);
			if (!a) return;
			out[a].total += 1;
			if (isQualified(p.status)) out[a].qualified += 1;
		});
		return out;
	}, [
		monthProspects,
		agentNames,
		resolveAgent
	]);
	const grand = (0, import_react.useMemo)(() => {
		let total = 0, qualified = 0;
		agentNames.forEach((a) => {
			total += counts[a].total;
			qualified += counts[a].qualified;
		});
		return {
			total,
			qualified
		};
	}, [counts, agentNames]);
	const pct = (n, d) => d > 0 ? n / d * 100 : 0;
	const chartData = (0, import_react.useMemo)(() => agentNames.map((a) => ({
		agent: a,
		Qualifiées: counts[a].qualified,
		"Non qualifiées": Math.max(0, counts[a].total - counts[a].qualified)
	})), [counts, agentNames]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const out = [];
		const d = /* @__PURE__ */ new Date();
		for (let i = 0; i < 12; i++) {
			const y = d.getFullYear(), m = d.getMonth();
			out.push({
				value: `${y}-${String(m + 1).padStart(2, "0")}`,
				label: `${MONTHS_FR$2[m]} ${y}`
			});
			d.setMonth(d.getMonth() - 1);
		}
		return out;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base xl:text-lg flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-4 w-4 xl:h-5 xl:w-5 text-primary" }), title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
				className: "xl:text-sm",
				children: [
					monthLabel,
					" · ",
					grand.qualified,
					" fiches qualifiées · ",
					grand.total,
					" fiches reçues"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: ym,
				onChange: (e) => setYm(e.target.value),
				className: "text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5",
				children: monthOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: o.value,
					children: o.label
				}, o.value))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-xs xl:text-sm tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "bg-muted/60 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60",
								children: "Indicateur"
							}),
							agentNames.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-semibold px-3 py-2.5 whitespace-nowrap",
								children: a
							}, a)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground",
								children: "Total"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/30 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "h-2.5 w-2.5 rounded-full",
											style: { background: COLORS$1.total }
										}), "Fiches reçues"]
									})
								}),
								agentNames.map((a) => {
									const v = counts[a].total;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `px-3 py-2.5 text-right ${v === 0 ? "text-muted-foreground/50" : ""}`,
										children: v === 0 ? "—" : v
									}, a);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right font-bold bg-primary/5",
									children: grand.total
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/30 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "h-2.5 w-2.5 rounded-full",
											style: { background: COLORS$1.qualified }
										}), "Fiches qualifiées"]
									})
								}),
								agentNames.map((a) => {
									const v = counts[a].qualified;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `px-3 py-2.5 text-right ${v === 0 ? "text-muted-foreground/50" : ""}`,
										children: v === 0 ? "—" : v
									}, a);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right font-bold bg-primary/5",
									children: grand.qualified
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border hover:bg-accent/30 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 font-semibold sticky left-0 bg-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-full bg-primary/50" }), "Taux de qualification"]
									})
								}),
								agentNames.map((a) => {
									const c = counts[a];
									const empty = c.total === 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`,
										children: empty ? "—" : `${pct(c.qualified, c.total).toFixed(1)}%`
									}, a);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2.5 text-right font-bold bg-primary/5",
									children: grand.total > 0 ? `${pct(grand.qualified, grand.total).toFixed(1)}%` : "—"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-bold sticky left-0 bg-primary/10",
									children: "Total qualifiées"
								}),
								agentNames.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-right font-bold",
									children: counts[a].qualified
								}, a)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-right font-extrabold bg-primary/15",
									children: grand.qualified
								})
							]
						})
					] })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center gap-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5" }), "Volume par qualificateur"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-72 xl:h-80 rounded-xl border border-border bg-gradient-to-br from-muted/40 to-background p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: chartData,
						barCategoryGap: 20,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								stroke: "oklch(0.92 0.008 240)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "agent",
								stroke: "oklch(0.52 0.02 250)",
								fontSize: 12
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								stroke: "oklch(0.52 0.02 250)",
								fontSize: 12,
								allowDecimals: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									borderRadius: 12,
									border: "1px solid oklch(0.92 0.008 240)",
									fontSize: 12
								},
								cursor: { fill: "oklch(0.95 0.01 240 / 0.5)" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "Qualifiées",
								stackId: "s",
								fill: COLORS$1.qualified,
								radius: [
									0,
									0,
									0,
									0
								],
								isAnimationActive: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "Non qualifiées",
								stackId: "s",
								fill: "oklch(0.85 0.04 250)",
								radius: [
									6,
									6,
									0,
									0
								],
								isAnimationActive: false
							})
						]
					})
				})
			})] })]
		})]
	});
});
function useQualifierCreations(ym) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const fetchOnce = () => {
			setIsLoading(true);
			setError(null);
			return api(`/qualifier_creations.php`, { query: { ym } }).then((d) => {
				if (!cancelled) setData(d);
			}).catch((e) => {
				if (!cancelled) setError(e);
			}).finally(() => {
				if (!cancelled) setIsLoading(false);
			});
		};
		fetchOnce();
		const id = window.setInterval(fetchOnce, 6e5);
		const onFocus = () => fetchOnce();
		const onVis = () => {
			if (document.visibilityState === "visible") fetchOnce();
		};
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVis);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [ym]);
	return {
		data,
		error,
		isLoading
	};
}
var MONTHS_FR$1 = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre"
];
var PALETTE$1 = [
	"oklch(0.65 0.22 265)",
	"oklch(0.70 0.20 145)",
	"oklch(0.68 0.22 30)",
	"oklch(0.70 0.18 200)",
	"oklch(0.65 0.22 320)",
	"oklch(0.72 0.18 60)",
	"oklch(0.62 0.22 10)",
	"oklch(0.70 0.18 170)",
	"oklch(0.65 0.22 280)",
	"oklch(0.72 0.17 120)"
];
var QualifierCreationsChart = (0, import_react.memo)(function QualifierCreationsChart({ title = "Comportement de création — Qualificateurs" } = {}) {
	const now = /* @__PURE__ */ new Date();
	const [ym, setYm] = (0, import_react.useState)(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
	const [hidden, setHidden] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [mode, setMode] = (0, import_react.useState)("combined");
	const [scope, setScope] = (0, import_react.useState)("month");
	const [year, monthIdx] = ym.split("-").map(Number);
	const monthLabel = `${MONTHS_FR$1[(monthIdx ?? 1) - 1]} ${year}`;
	const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const { data, error, isLoading } = useQualifierCreations(scope === "today" ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` : ym);
	const todayIdx = (0, import_react.useMemo)(() => data ? data.axis.findIndex((d) => d === todayIso) : -1, [data, todayIso]);
	const chartData = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const rows = data.axis.map((d, i) => {
			const row = {
				date: d,
				label: String(i + 1).padStart(2, "0")
			};
			let total = 0;
			data.series.forEach((s) => {
				const v = s.points[i]?.value ?? 0;
				row[s.name] = v;
				total += v;
			});
			row["Total"] = total;
			return row;
		});
		if (scope === "today") return todayIdx >= 0 ? [rows[todayIdx]] : [];
		return rows;
	}, [
		data,
		scope,
		todayIdx
	]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const out = [];
		const d = /* @__PURE__ */ new Date();
		for (let i = 0; i < 12; i++) {
			const y = d.getFullYear(), m = d.getMonth();
			out.push({
				value: `${y}-${String(m + 1).padStart(2, "0")}`,
				label: `${MONTHS_FR$1[m]} ${y}`
			});
			d.setMonth(d.getMonth() - 1);
		}
		return out;
	}, []);
	const series = data?.series ?? [];
	const grandTotal = data?.grandTotal ?? 0;
	const visibleSeries = (0, import_react.useMemo)(() => series.filter((s) => !hidden.has(s.username)), [series, hidden]);
	const toggleAgent = (u) => setHidden((prev) => {
		const next = new Set(prev);
		if (next.has(u)) next.delete(u);
		else next.add(u);
		return next;
	});
	const allHidden = series.length > 0 && visibleSeries.length === 0;
	const todayTotal = scope === "today" && todayIdx >= 0 ? series.reduce((acc, s) => acc + (s.points[todayIdx]?.value ?? 0), 0) : 0;
	const scopeLabel = scope === "today" ? `${monthLabel} · Aujourd'hui ${String(now.getDate()).padStart(2, "0")} ${MONTHS_FR$1[now.getMonth()]}: ${todayTotal} fiche${todayTotal > 1 ? "s" : ""}` : monthLabel;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base xl:text-lg flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 xl:h-5 xl:w-5 text-primary" }), title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
				className: "xl:text-sm",
				children: [
					scopeLabel,
					" · ",
					grandTotal,
					" fiche",
					grandTotal > 1 ? "s" : "",
					" créée",
					grandTotal > 1 ? "s" : "",
					series.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						" · ",
						series.length,
						" qualificateur",
						series.length > 1 ? "s" : ""
					] })
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 flex-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex rounded-md border border-border bg-card p-0.5 text-xs",
						children: [{
							v: "month",
							label: "Mois"
						}, {
							v: "today",
							label: "Aujourd'hui"
						}].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setScope(o.v),
							className: `px-2.5 py-1 rounded-sm transition-colors ${scope === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`,
							children: o.label
						}, o.v))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex rounded-md border border-border bg-card p-0.5 text-xs",
						children: [
							{
								v: "combined",
								label: "Combiné"
							},
							{
								v: "stacked",
								label: "Empilées"
							},
							{
								v: "grouped",
								label: "Barres"
							},
							{
								v: "line",
								label: "Lignes"
							}
						].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode(o.v),
							className: `px-2.5 py-1 rounded-sm transition-colors ${mode === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`,
							children: o.label
						}, o.v))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: ym,
						onChange: (e) => setYm(e.target.value),
						disabled: scope === "today",
						className: "text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5 disabled:opacity-50",
						children: monthOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: o.value,
							children: o.label
						}, o.value))
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }),
						"Impossible de charger les données (",
						error.message,
						")."
					]
				}),
				data?.coverage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-muted/30 px-3 py-2 text-[11px] xl:text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground",
							children: data.coverage.totalProspectsInMonth
						}), " fiches au total"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"· ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-emerald-600 dark:text-emerald-400 font-semibold",
								children: data.coverage.fromActivityLog
							}),
							" tracées (log)"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"· ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-amber-600 dark:text-amber-400 font-semibold",
								children: data.coverage.fromAssigneeFallback
							}),
							" attribuées via assignation (historique)"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"· ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive font-semibold",
								children: data.coverage.unattributed
							}),
							" non-attribuables (assigné non-Qualificateur)"
						] })
					]
				}),
				series.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setHidden(/* @__PURE__ */ new Set()),
							className: "rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted",
							children: "Tout"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setHidden(new Set(series.map((s) => s.username))),
							className: "rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted",
							children: "Aucun"
						}),
						series.map((s, idx) => {
							const isHidden = hidden.has(s.username);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => toggleAgent(s.username),
								className: `inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs xl:text-sm transition-opacity hover:bg-muted ${isHidden ? "opacity-40 line-through" : ""}`,
								"aria-pressed": !isHidden,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-2.5 w-2.5 rounded-full",
										style: { background: PALETTE$1[idx % PALETTE$1.length] }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: s.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums text-muted-foreground",
										children: ["· ", s.total]
									})
								]
							}, s.username);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[28rem] xl:h-[34rem] rounded-xl border border-border bg-gradient-to-br from-muted/40 to-background p-3",
					children: series.length === 0 && !isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center text-xs xl:text-sm text-muted-foreground",
						children: scope === "today" ? "Aucune création de fiche aujourd'hui." : "Aucune création de fiche ce mois-ci."
					}) : allHidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center text-xs xl:text-sm text-muted-foreground",
						children: "Sélectionnez au moins un qualificateur."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: mode === "line" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: chartData,
							margin: {
								top: 8,
								right: 12,
								bottom: 4,
								left: -10
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "oklch(0.92 0.008 240)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "oklch(0.52 0.02 250)",
									fontSize: 11
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.52 0.02 250)",
									fontSize: 11,
									allowDecimals: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid oklch(0.92 0.008 240)",
										fontSize: 12
									},
									cursor: { stroke: "oklch(0.85 0.02 240)" },
									labelFormatter: (l) => `Jour ${l}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
								visibleSeries.map((s) => {
									const idx = series.findIndex((x) => x.username === s.username);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: s.name,
										stroke: PALETTE$1[idx % PALETTE$1.length],
										strokeWidth: 2.5,
										dot: { r: 2 },
										activeDot: { r: 5 },
										isAnimationActive: false
									}, s.username);
								})
							]
						}) : mode === "combined" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
							data: chartData,
							margin: {
								top: 16,
								right: 12,
								bottom: 4,
								left: -6
							},
							barCategoryGap: "20%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: visibleSeries.map((s) => {
									const c = PALETTE$1[series.findIndex((x) => x.username === s.username) % PALETTE$1.length];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: `qgrad-${s.username}`,
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: c,
											stopOpacity: .95
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: c,
											stopOpacity: .55
										})]
									}, s.username);
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "oklch(0.92 0.008 240)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									tickMargin: 6
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									allowDecimals: false,
									width: 32
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid oklch(0.92 0.008 240)",
										fontSize: 13
									},
									cursor: { fill: "oklch(0.95 0.01 240 / 0.5)" },
									labelFormatter: (l) => `Jour ${l}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
									wrapperStyle: {
										fontSize: 13,
										paddingTop: 8
									},
									iconSize: 14
								}),
								visibleSeries.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: s.name,
									stackId: "all",
									fill: `url(#qgrad-${s.username})`,
									isAnimationActive: false
								}, s.username)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "Total",
									stroke: "oklch(0.45 0.15 265)",
									strokeWidth: 2.5,
									dot: {
										r: 3,
										fill: "oklch(0.45 0.15 265)"
									},
									activeDot: { r: 5 },
									isAnimationActive: false
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: chartData,
							margin: {
								top: 16,
								right: 12,
								bottom: 4,
								left: -6
							},
							barCategoryGap: "18%",
							barGap: 2,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "oklch(0.92 0.008 240)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									tickMargin: 6
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									allowDecimals: false,
									width: 32
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid oklch(0.92 0.008 240)",
										fontSize: 13
									},
									cursor: { fill: "oklch(0.95 0.01 240 / 0.5)" },
									labelFormatter: (l) => `Jour ${l}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
									wrapperStyle: {
										fontSize: 13,
										paddingTop: 8
									},
									iconSize: 14
								}),
								visibleSeries.map((s) => {
									const idx = series.findIndex((x) => x.username === s.username);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: s.name,
										stackId: mode === "stacked" ? "all" : void 0,
										fill: PALETTE$1[idx % PALETTE$1.length],
										radius: mode === "stacked" ? 0 : [
											4,
											4,
											0,
											0
										],
										minPointSize: 3,
										isAnimationActive: false
									}, s.username);
								})
							]
						})
					})
				}),
				isLoading && !data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: "Chargement…"
				})
			]
		})]
	});
});
var MONTHS_FR = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre"
];
var PALETTE = [
	"oklch(0.65 0.22 265)",
	"oklch(0.70 0.20 145)",
	"oklch(0.68 0.22 30)",
	"oklch(0.70 0.18 200)",
	"oklch(0.65 0.22 320)",
	"oklch(0.72 0.18 60)",
	"oklch(0.62 0.22 10)",
	"oklch(0.70 0.18 170)",
	"oklch(0.65 0.22 280)",
	"oklch(0.72 0.17 120)"
];
var RdvAgentsChart = (0, import_react.memo)(function RdvAgentsChart({ title = "RDV pris par agent" } = {}) {
	const now = /* @__PURE__ */ new Date();
	const [ym, setYm] = (0, import_react.useState)(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
	const [hidden, setHidden] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [mode, setMode] = (0, import_react.useState)("combined");
	const [scope, setScope] = (0, import_react.useState)("month");
	const [year, monthIdx] = ym.split("-").map(Number);
	const monthLabel = `${MONTHS_FR[(monthIdx ?? 1) - 1]} ${year}`;
	const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const { data, error, isLoading } = useRdvAgents(scope === "today" ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}` : ym);
	const todayIdx = (0, import_react.useMemo)(() => data ? data.axis.findIndex((d) => d === todayIso) : -1, [data, todayIso]);
	const chartData = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const rows = data.axis.map((d, i) => {
			const row = {
				date: d,
				label: String(i + 1).padStart(2, "0")
			};
			let total = 0;
			data.series.forEach((s) => {
				const v = s.points[i]?.value ?? 0;
				row[s.name] = v;
				total += v;
			});
			row["Total"] = total;
			return row;
		});
		if (scope === "today") return todayIdx >= 0 ? [rows[todayIdx]] : [];
		return rows;
	}, [
		data,
		scope,
		todayIdx
	]);
	const monthOptions = (0, import_react.useMemo)(() => {
		const out = [];
		const d = /* @__PURE__ */ new Date();
		for (let i = 0; i < 12; i++) {
			const y = d.getFullYear(), m = d.getMonth();
			out.push({
				value: `${y}-${String(m + 1).padStart(2, "0")}`,
				label: `${MONTHS_FR[m]} ${y}`
			});
			d.setMonth(d.getMonth() - 1);
		}
		return out;
	}, []);
	const series = data?.series ?? [];
	const visibleSeries = (0, import_react.useMemo)(() => series.filter((s) => !hidden.has(s.username)), [series, hidden]);
	const toggleAgent = (u) => setHidden((prev) => {
		const next = new Set(prev);
		if (next.has(u)) next.delete(u);
		else next.add(u);
		return next;
	});
	const allHidden = series.length > 0 && visibleSeries.length === 0;
	const grandTotal = data?.grandTotal ?? 0;
	const grandWon = data?.grandWon ?? 0;
	const grandFailed = data?.grandFailed ?? 0;
	const winRate = grandTotal > 0 ? (grandWon / grandTotal * 100).toFixed(1) : "0.0";
	const todayTotal = scope === "today" && todayIdx >= 0 ? series.reduce((acc, s) => acc + (s.points[todayIdx]?.value ?? 0), 0) : 0;
	const scopeLabel = scope === "today" ? `${monthLabel} · Aujourd'hui ${String(now.getDate()).padStart(2, "0")} ${MONTHS_FR[now.getMonth()]}: ${todayTotal} RDV` : monthLabel;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-elegant overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base xl:text-lg flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-4 w-4 xl:h-5 xl:w-5 text-primary" }), title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
				className: "xl:text-sm",
				children: [
					scopeLabel,
					" · ",
					grandTotal,
					" RDV pris · ",
					grandWon,
					" gagné",
					grandWon > 1 ? "s" : "",
					" ",
					"· ",
					grandFailed,
					" échec",
					grandFailed > 1 ? "s" : "",
					" · ",
					winRate,
					"% conversion"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 flex-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex rounded-md border border-border bg-card p-0.5 text-xs",
						children: [{
							v: "month",
							label: "Mois"
						}, {
							v: "today",
							label: "Aujourd'hui"
						}].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setScope(o.v),
							className: `px-2.5 py-1 rounded-sm transition-colors ${scope === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`,
							children: o.label
						}, o.v))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex rounded-md border border-border bg-card p-0.5 text-xs",
						children: [
							{
								v: "combined",
								label: "Combiné"
							},
							{
								v: "stacked",
								label: "Empilées"
							},
							{
								v: "grouped",
								label: "Barres"
							},
							{
								v: "line",
								label: "Lignes"
							}
						].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode(o.v),
							className: `px-2.5 py-1 rounded-sm transition-colors ${mode === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`,
							children: o.label
						}, o.v))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: ym,
						onChange: (e) => setYm(e.target.value),
						disabled: scope === "today",
						className: "text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5 disabled:opacity-50",
						children: monthOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: o.value,
							children: o.label
						}, o.value))
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }),
						"Impossible de charger les données (",
						error.message,
						")."
					]
				}),
				series.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setHidden(/* @__PURE__ */ new Set()),
							className: "rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted",
							children: "Tout"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setHidden(new Set(series.map((s) => s.username))),
							className: "rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted",
							children: "Aucun"
						}),
						series.map((s, idx) => {
							const isHidden = hidden.has(s.username);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => toggleAgent(s.username),
								className: `inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs xl:text-sm transition-opacity hover:bg-muted ${isHidden ? "opacity-40 line-through" : ""}`,
								"aria-pressed": !isHidden,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-2.5 w-2.5 rounded-full",
										style: { background: PALETTE[idx % PALETTE.length] }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-start leading-tight",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: s.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[10px] uppercase tracking-wide text-muted-foreground",
											children: ["@", s.username]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums text-muted-foreground",
										children: [
											"· ",
											s.total,
											" pris"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 tabular-nums",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-3 w-3" }), s.won]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 text-destructive tabular-nums",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3 w-3" }), s.failed]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums text-muted-foreground",
										children: [
											"· ",
											s.conversion,
											"%"
										]
									})
								]
							}, s.username);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[28rem] xl:h-[34rem] rounded-xl border border-border bg-gradient-to-br from-muted/40 to-background p-3",
					children: series.length === 0 && !isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center text-xs xl:text-sm text-muted-foreground",
						children: scope === "today" ? "Aucun RDV pris aujourd'hui." : "Aucun RDV pris ce mois-ci."
					}) : allHidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full items-center justify-center text-xs xl:text-sm text-muted-foreground",
						children: "Sélectionnez au moins un agent."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: mode === "line" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: chartData,
							margin: {
								top: 8,
								right: 12,
								bottom: 4,
								left: -10
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "oklch(0.92 0.008 240)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "oklch(0.52 0.02 250)",
									fontSize: 11
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.52 0.02 250)",
									fontSize: 11,
									allowDecimals: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid oklch(0.92 0.008 240)",
										fontSize: 12
									},
									cursor: { stroke: "oklch(0.85 0.02 240)" },
									labelFormatter: (l) => `Jour ${l}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
								visibleSeries.map((s) => {
									const idx = series.findIndex((x) => x.username === s.username);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: s.name,
										stroke: PALETTE[idx % PALETTE.length],
										strokeWidth: 2.5,
										dot: { r: 2 },
										activeDot: { r: 5 },
										isAnimationActive: false
									}, s.username);
								})
							]
						}) : mode === "combined" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
							data: chartData,
							margin: {
								top: 16,
								right: 12,
								bottom: 4,
								left: -6
							},
							barCategoryGap: "20%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: visibleSeries.map((s) => {
									const c = PALETTE[series.findIndex((x) => x.username === s.username) % PALETTE.length];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: `grad-${s.username}`,
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: c,
											stopOpacity: .95
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: c,
											stopOpacity: .55
										})]
									}, s.username);
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "oklch(0.92 0.008 240)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									tickMargin: 6
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									allowDecimals: false,
									width: 32
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid oklch(0.92 0.008 240)",
										fontSize: 13
									},
									cursor: { fill: "oklch(0.95 0.01 240 / 0.5)" },
									labelFormatter: (l) => `Jour ${l}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
									wrapperStyle: {
										fontSize: 13,
										paddingTop: 8
									},
									iconSize: 14
								}),
								visibleSeries.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: s.name,
									stackId: "all",
									fill: `url(#grad-${s.username})`,
									isAnimationActive: false
								}, s.username)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "Total",
									stroke: "oklch(0.45 0.15 265)",
									strokeWidth: 2.5,
									dot: {
										r: 3,
										fill: "oklch(0.45 0.15 265)"
									},
									activeDot: { r: 5 },
									isAnimationActive: false
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: chartData,
							margin: {
								top: 16,
								right: 12,
								bottom: 4,
								left: -6
							},
							barCategoryGap: "18%",
							barGap: 2,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "oklch(0.92 0.008 240)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									tickMargin: 6
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "oklch(0.35 0.02 250)",
									fontSize: 12,
									allowDecimals: false,
									width: 32
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid oklch(0.92 0.008 240)",
										fontSize: 13
									},
									cursor: { fill: "oklch(0.95 0.01 240 / 0.5)" },
									labelFormatter: (l) => `Jour ${l}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
									wrapperStyle: {
										fontSize: 13,
										paddingTop: 8
									},
									iconSize: 14
								}),
								visibleSeries.map((s) => {
									const idx = series.findIndex((x) => x.username === s.username);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: s.name,
										stackId: mode === "stacked" ? "all" : void 0,
										fill: PALETTE[idx % PALETTE.length],
										radius: mode === "stacked" ? 0 : [
											4,
											4,
											0,
											0
										],
										minPointSize: 3,
										isAnimationActive: false
									}, s.username);
								})
							]
						})
					})
				}),
				isLoading && !data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: "Chargement…"
				})
			]
		})]
	});
});
var VENDEUR_ROLES = /* @__PURE__ */ new Set([
	"Vendeur",
	"Commercial",
	"Sales"
]);
var AGENT_ROLES = /* @__PURE__ */ new Set(["Agent"]);
var QUALIF_ROLES = /* @__PURE__ */ new Set(["Qualificateur"]);
var TABS = [
	{
		id: "vendeurs",
		label: "Vendeurs",
		icon: TrendingUp,
		subtitle: "RDV transformés en vente par vendeur"
	},
	{
		id: "agents",
		label: "Agents",
		icon: CalendarCheck,
		subtitle: "Activité RDV des agents"
	},
	{
		id: "qualificateurs",
		label: "Qualificateurs",
		icon: ClipboardCheck,
		subtitle: "Fiches qualifiées par qualificateur"
	}
];
function AgentsPerformanceSwitch() {
	const [view, setView] = (0, import_react.useState)("vendeurs");
	const current = TABS.find((t) => t.id === view);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground",
				children: "Performance commerciale"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm xl:text-base text-muted-foreground mt-0.5",
				children: current.subtitle
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "tablist",
				"aria-label": "Type d'équipe",
				className: "relative inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-md transition-transform duration-300 ease-out",
					style: {
						width: "calc((100% - 0.5rem) / 3)",
						transform: `translateX(${TABS.findIndex((t) => t.id === view) * 100}%)`
					}
				}), TABS.map((t) => {
					const Icon = t.icon;
					const active = view === t.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						"aria-selected": active,
						onClick: () => setView(t.id),
						className: `relative z-10 inline-flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-semibold transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 xl:h-4 xl:w-4" }), t.label]
					}, t.id);
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "animate-in fade-in slide-in-from-bottom-2 duration-300",
			children: [
				view === "vendeurs" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentSalesMatrix, {
							roleFilter: VENDEUR_ROLES,
							title: "Performance des vendeurs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VendeurConversionMatrix, { title: "Conversion RDV → Vente par vendeur" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RdvAgentsChart, { title: "RDV pris par agent — Gagnés vs Échecs" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualifierCreationsChart, { title: "Comportement de création — Qualificateurs" })
					]
				}),
				view === "agents" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RdvAgentsChart, { title: "RDV pris par agent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RdvAgentsMatrix, {
						roleFilter: AGENT_ROLES,
						title: "Performance des agents RDV"
					})]
				}),
				view === "qualificateurs" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QualifierMatrix, {
					roleFilter: QUALIF_ROLES,
					title: "Fiches qualifiées par qualificateur"
				})
			]
		}, view)]
	});
}
var COLORS = [
	"oklch(0.68 0.17 55)",
	"oklch(0.8 0.14 75)",
	"oklch(0.65 0.16 155)",
	"oklch(0.78 0.15 75)",
	"oklch(0.6 0.22 320)"
];
var normalizeSource = (value) => {
	const source = (value ?? "").trim().replace(/\s+/g, " ");
	return source ? source.toUpperCase() : "AUTRE";
};
var STAT_TONES = {
	indigo: {
		gradient: "from-[oklch(0.68_0.17_55)] via-[oklch(0.72_0.16_60)] to-[oklch(0.78_0.15_70)]",
		ring: "ring-[oklch(0.68_0.17_55_/_0.25)]",
		sparkStroke: "oklch(0.95 0.02 250)",
		sparkFill: "oklch(0.95 0.02 250 / 0.25)"
	},
	emerald: {
		gradient: "from-[oklch(0.55_0.16_165)] via-[oklch(0.62_0.16_155)] to-[oklch(0.75_0.14_140)]",
		ring: "ring-[oklch(0.55_0.16_165_/_0.25)]",
		sparkStroke: "oklch(0.96 0.02 150)",
		sparkFill: "oklch(0.96 0.02 150 / 0.25)"
	},
	amber: {
		gradient: "from-[oklch(0.62_0.18_45)] via-[oklch(0.7_0.17_60)] to-[oklch(0.82_0.14_85)]",
		ring: "ring-[oklch(0.7_0.17_60_/_0.25)]",
		sparkStroke: "oklch(0.97 0.02 80)",
		sparkFill: "oklch(0.97 0.02 80 / 0.25)"
	},
	rose: {
		gradient: "from-[oklch(0.55_0.2_15)] via-[oklch(0.62_0.21_5)] to-[oklch(0.7_0.18_345)]",
		ring: "ring-[oklch(0.6_0.21_10_/_0.25)]",
		sparkStroke: "oklch(0.97 0.02 350)",
		sparkFill: "oklch(0.97 0.02 350 / 0.25)"
	}
};
var Sparkline = (0, import_react.memo)(function Sparkline({ data, stroke, fill }) {
	const series = (0, import_react.useMemo)(() => data.map((v, i) => ({
		i,
		v
	})), [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 42,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
			data: series,
			margin: {
				top: 2,
				right: 0,
				bottom: 0,
				left: 0
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: `sg-${stroke}`,
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: fill,
					stopOpacity: .9
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: fill,
					stopOpacity: 0
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
				type: "monotone",
				dataKey: "v",
				stroke,
				strokeWidth: 1.75,
				fill: `url(#sg-${stroke})`,
				isAnimationActive: false
			})]
		})
	});
});
var Stat = (0, import_react.memo)(function Stat({ label, value, sub, icon, trend, trendDir, tone, spark }) {
	const t = STAT_TONES[tone];
	const TrendIcon = trendDir === "down" ? ArrowDownRight : ArrowUpRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: `relative overflow-hidden border-0 ring-1 ${t.ring} shadow-lg transition-transform hover:-translate-y-0.5`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `absolute inset-0 bg-gradient-to-br ${t.gradient}` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-12 -right-12 h-40 w-40 rounded-full blur-2xl bg-white/20" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-white/30" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "relative p-5 xl:p-6 text-white",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] xl:text-[12px] font-semibold text-white/90 uppercase tracking-[0.18em]",
									children: label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight tabular-nums leading-none",
									children: value
								}),
								sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 text-xs xl:text-sm text-white/85 truncate",
									children: sub
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-10 w-10 xl:h-12 xl:w-12 rounded-lg bg-white/15 text-white backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/25",
							children: icon
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 -mx-1 h-[42px] xl:h-[56px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
							data: spark,
							stroke: t.sparkStroke,
							fill: t.sparkFill
						})
					}),
					trend && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] xl:text-xs font-medium text-white ring-1 ring-white/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendIcon, { className: "h-3 w-3" }),
							" ",
							trend
						]
					})
				]
			})
		]
	});
});
function Dashboard() {
	const { contracts, users, prospects, refresh } = useErp();
	const { user } = useAuth();
	const dashboardStats = useDashboardStats();
	const currency = useCurrency();
	const firstName = user?.fullName?.split(" ")[0] ?? user?.username ?? "Agent";
	const today = /* @__PURE__ */ new Date();
	const dateLabel = today.toLocaleDateString("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	const todayStr = today.toISOString().slice(0, 10);
	(0, import_react.useMemo)(() => {
		const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
		const nowH = today.getHours();
		const todaysContracts = contracts.filter((c) => (c.signatureDate ?? "").startsWith(todayStr));
		return hours.map((h) => {
			const hh = String(h).padStart(2, "0");
			const leads = prospects.filter((p) => {
				const ts = p.createdAt ?? "";
				return ts.startsWith(todayStr) && ts.length >= 13 && ts.slice(11, 13) === hh;
			}).length;
			const contrats = todaysContracts.filter((c) => {
				const ts = c.signatureDate ?? "";
				if (ts.length >= 13) return ts.slice(11, 13) === hh;
				return h === nowH;
			}).length;
			return {
				hour: `${hh}h`,
				leads,
				contrats
			};
		});
	}, [
		prospects,
		contracts,
		todayStr,
		today
	]);
	const [chartMonth, setChartMonth] = (0, import_react.useState)(todayStr.slice(0, 7));
	const monthPrefix = todayStr.slice(0, 7);
	const monthStart = `${monthPrefix}-01`;
	const [monthlyProspectStats, setMonthlyProspectStats] = (0, import_react.useState)(null);
	const { options: billingStatusOptions } = useStatusOptions("contract");
	const cancelledBillingStatuses = (0, import_react.useMemo)(() => new Set(billingStatusOptions.filter((o) => o.color === "destructive").map((o) => o.value)), [billingStatusOptions]);
	const [refreshTick, setRefreshTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			setRefreshTick((t) => t + 1);
			refresh();
		}, 6e5);
		return () => window.clearInterval(id);
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const countProspects = (outcome) => api("/prospects.php", { query: {
			count: 1,
			from: monthStart,
			to: todayStr,
			outcome
		} }).then((r) => r.total ?? 0);
		Promise.all([
			countProspects(),
			countProspects("won"),
			countProspects("lost"),
			countProspects("pending")
		]).then(([total, won, lost, pending]) => {
			if (!cancelled) setMonthlyProspectStats({
				total,
				won,
				lost,
				pending
			});
		}).catch(() => {
			if (!cancelled) setMonthlyProspectStats(null);
		});
		return () => {
			cancelled = true;
		};
	}, [
		monthStart,
		todayStr,
		refreshTick
	]);
	const monthly = (0, import_react.useMemo)(() => {
		const monthProspects = prospects.filter((p) => (p.createdAt ?? "").startsWith(monthPrefix));
		const monthContracts = contracts.filter((c) => (c.signatureDate ?? "").startsWith(monthPrefix)).filter((c) => !cancelledBillingStatuses.has(c.billingStatus));
		const wonMonth = monthProspects.filter((p) => p.outcome === "won").length;
		const lostMonth = monthProspects.filter((p) => p.outcome === "lost").length;
		const pendingMonth = monthProspects.filter((p) => p.outcome === "pending").length;
		const totalMonth = monthProspects.length;
		const revenueMonth = monthContracts.reduce((s, c) => s + (c.premium ?? 0), 0);
		const avg = monthContracts.length ? revenueMonth / monthContracts.length : 0;
		const exactTotal = monthlyProspectStats?.total ?? totalMonth;
		const exactWon = monthlyProspectStats?.won ?? wonMonth;
		const exactLost = monthlyProspectStats?.lost ?? lostMonth;
		const exactPending = monthlyProspectStats?.pending ?? pendingMonth;
		const exactConv = exactTotal ? exactWon / exactTotal * 100 : 0;
		return {
			leadsMonth: exactTotal,
			wonMonth: exactWon,
			lostMonth: exactLost,
			pendingMonth: exactPending,
			contractsMonth: monthContracts.length,
			revenueMonth,
			avgDealMonth: avg,
			conversionMonth: Number(exactConv.toFixed(1))
		};
	}, [
		prospects,
		contracts,
		monthPrefix,
		monthlyProspectStats
	]);
	const [monthSourceBreakdown, setMonthSourceBreakdown] = (0, import_react.useState)(null);
	const [sourceBreakdownLoading, setSourceBreakdownLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const from = `${chartMonth}-01`;
		const [y, m] = chartMonth.split("-").map(Number);
		const last = new Date(y, m, 0).getDate();
		const to = `${chartMonth}-${String(last).padStart(2, "0")}`;
		setSourceBreakdownLoading(true);
		setMonthSourceBreakdown(null);
		const loadSourceBreakdown = async () => {
			const pageSize = 5e3;
			const monthContracts = [];
			for (let page = 1, total = Number.POSITIVE_INFINITY; (page - 1) * pageSize < total && page <= 20; page += 1) {
				const batch = await api("/contracts.php", { query: {
					page,
					pageSize,
					sigFrom: from,
					sigTo: to
				} });
				monthContracts.push(...batch.contracts ?? []);
				total = batch.total ?? monthContracts.length;
				if ((batch.contracts ?? []).length < pageSize) break;
			}
			const prospectIds = Array.from(new Set(monthContracts.map((contract) => contract.prospectId).filter((id) => Boolean(id))));
			const prospectById = /* @__PURE__ */ new Map();
			for (let i = 0; i < prospectIds.length; i += 12) {
				const chunk = prospectIds.slice(i, i + 12);
				(await Promise.all(chunk.map((id) => api("/prospects.php", { query: { id } }).then((response) => response.prospect).catch(() => null)))).forEach((prospect) => {
					if (prospect) prospectById.set(prospect.id, prospect);
				});
			}
			const counts = /* @__PURE__ */ new Map();
			monthContracts.filter((contract) => !cancelledBillingStatuses.has(contract.billingStatus ?? "")).forEach((contract) => {
				const source = normalizeSource((contract.prospectId ? prospectById.get(contract.prospectId) : void 0)?.source || contract.source);
				counts.set(source, (counts.get(source) ?? 0) + 1);
			});
			return Array.from(counts.entries()).map(([source, contrats]) => ({
				source,
				contrats
			})).sort((a, b) => b.contrats - a.contrats);
		};
		loadSourceBreakdown().then((rows) => {
			if (!cancelled) setMonthSourceBreakdown(rows);
		}).catch(() => {
			if (!cancelled) setMonthSourceBreakdown(null);
		}).finally(() => {
			if (!cancelled) setSourceBreakdownLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [chartMonth, refreshTick]);
	const sourceBreakdownPending = sourceBreakdownLoading || monthSourceBreakdown === null;
	const sourceBreakdown = monthSourceBreakdown ?? [];
	const sourceBreakdownKey = `${chartMonth}:${sourceBreakdown.map((row) => `${row.source}-${row.contrats}`).join("|")}`;
	const [sparks, setSparks] = (0, import_react.useState)({
		leads: [],
		won: [],
		conv: [],
		lost: []
	});
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const fetchSeries = (s) => api("/dashboard.php", { query: {
			series: s,
			days: 7
		} }).then((r) => r.points.map((p) => p.value)).catch(() => []);
		Promise.all([
			fetchSeries("leads"),
			fetchSeries("won"),
			fetchSeries("conversion"),
			fetchSeries("lost")
		]).then(([leads, won, conv, lost]) => {
			if (!cancelled) setSparks({
				leads,
				won,
				conv,
				lost
			});
		});
		return () => {
			cancelled = true;
		};
	}, [
		dashboardStats.totalLeads,
		dashboardStats.wonLeads,
		refreshTick
	]);
	const recentActivity = (0, import_react.useMemo)(() => {
		const items = [];
		contracts.slice(0, 6).forEach((c) => items.push({
			id: `c-${c.id}`,
			kind: "contract",
			title: `Contrat signé — ${c.firstName} ${c.lastName}`,
			subtitle: `${c.partner} • ${c.assignedTo} • ${formatAmount(c.premium, currency)}`,
			ts: c.signatureDate
		}));
		prospects.filter((p) => p.outcome === "won").slice(0, 4).forEach((p) => items.push({
			id: `w-${p.id}`,
			kind: "won",
			title: `Lead gagné — ${p.firstName} ${p.lastName}`,
			subtitle: `${p.source} • ${p.assignedTo ?? "Non assigné"}`,
			ts: p.createdAt
		}));
		prospects.filter((p) => p.outcome === "lost").slice(0, 3).forEach((p) => items.push({
			id: `l-${p.id}`,
			kind: "lost",
			title: `Lead perdu — ${p.firstName} ${p.lastName}`,
			subtitle: p.lostReason ?? "Sans motif",
			ts: p.createdAt
		}));
		return items.sort((a, b) => a.ts < b.ts ? 1 : -1).slice(0, 8);
	}, [
		contracts,
		prospects,
		currency
	]);
	const [adminData, setAdminData] = (0, import_react.useState)(null);
	const [lastRefresh, setLastRefresh] = (0, import_react.useState)(/* @__PURE__ */ new Date());
	const [now, setNow] = (0, import_react.useState)(/* @__PURE__ */ new Date());
	const [presentation, setPresentation] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const fetchAdmin = () => api("/dashboard.php", { query: { breakdown: "admin" } }).then((r) => {
			if (!cancelled) {
				setAdminData(r);
				setLastRefresh(/* @__PURE__ */ new Date());
			}
		}).catch(() => {});
		fetchAdmin();
		const id = window.setInterval(fetchAdmin, 6e5);
		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, []);
	const togglePresentation = (0, import_react.useCallback)(async () => {
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen?.();
				setPresentation(true);
			} else {
				await document.exitFullscreen?.();
				setPresentation(false);
			}
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		const onFsChange = () => setPresentation(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", onFsChange);
		return () => document.removeEventListener("fullscreenchange", onFsChange);
	}, []);
	(0, import_react.useEffect)(() => {
		document.body.classList.toggle("presentation-mode", presentation);
		return () => {
			document.body.classList.remove("presentation-mode");
		};
	}, [presentation]);
	const totalRevenue = monthly.revenueMonth;
	const avgDeal = monthly.avgDealMonth;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [presentation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: togglePresentation,
		className: "fixed top-3 right-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 text-xs font-medium shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "h-3.5 w-3.5" }), " Quitter"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 xl:space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-presentation-hide": true,
				className: "relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-6 xl:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative inline-flex h-2 w-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500" })]
							}), "Tableau de bord · Live"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-1 text-2xl md:text-[30px] xl:text-[40px] 2xl:text-[52px] font-semibold tracking-tight leading-tight",
							children: ["Bonjour, ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: firstName
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm xl:text-base text-muted-foreground",
							children: "Voici votre aperçu commercial pour aujourd'hui."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold tabular-nums",
											children: dashboardStats.newLeadsToday
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "en file"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5 xl:h-4 xl:w-4 text-emerald-600" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold tabular-nums",
											children: dashboardStats.contractsToday
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "signé(s) aujourd'hui"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "h-3.5 w-3.5 xl:h-4 xl:w-4 text-amber-600" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-semibold tabular-nums",
											children: [dashboardStats.conversionRate, "%"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "conversion"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 xl:h-4 xl:w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground",
										children: ["MAJ ", lastRefresh.toLocaleTimeString("fr-FR", {
											hour: "2-digit",
											minute: "2-digit"
										})]
									})]
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs xl:text-sm text-muted-foreground sm:text-right space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-4xl xl:text-6xl 2xl:text-7xl font-bold text-foreground tabular-nums leading-none",
								children: now.toLocaleTimeString("fr-FR", {
									hour: "2-digit",
									minute: "2-digit"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), dateLabel]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: togglePresentation,
								className: "inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 text-xs xl:text-sm font-medium transition-opacity",
								children: [presentation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "h-3.5 w-3.5" }), presentation ? "Quitter plein écran" : "Mode présentation"]
							}) })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground",
				children: "Indicateurs clés"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						tone: "indigo",
						label: "Leads du mois",
						value: String(monthly.leadsMonth),
						sub: `${monthly.pendingMonth} en cours`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" }),
						trend: `${dashboardStats.newLeadsToday} en file`,
						trendDir: "up",
						spark: sparks.leads
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						tone: "emerald",
						label: "Contrats du mois",
						value: String(monthly.contractsMonth),
						sub: `${dashboardStats.contractsToday} aujourd'hui`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-5 w-5" }),
						trend: `${monthly.wonMonth} leads gagnés`,
						trendDir: "up",
						spark: sparks.won
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						tone: "emerald",
						label: "CA du mois",
						value: formatCompact(totalRevenue, currency),
						sub: "Mois en cours",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5" }),
						trend: `Panier moy. ${formatAmount(avgDeal, currency)}`,
						trendDir: "up",
						spark: sparks.won
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						tone: "amber",
						label: "Conversion du mois",
						value: `${monthly.conversionMonth}%`,
						sub: "Leads → contrats",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5" }),
						trend: "Mois en cours",
						trendDir: "up",
						spark: sparks.conv
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						tone: "rose",
						label: "Annulés du mois",
						value: String(adminData?.cancelled.contracts ?? 0),
						sub: `CA annulé: ${formatCompact(adminData?.cancelled.revenue ?? 0, currency)}`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-5 w-5" }),
						trend: "Mois en cours",
						trendDir: "down",
						spark: sparks.lost
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						tone: "rose",
						label: "Leads perdus du mois",
						value: String(monthly.lostMonth),
						sub: "Mois en cours",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-5 w-5" }),
						trend: "—",
						trendDir: "down",
						spark: sparks.lost
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentsPerformanceSwitch, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-3 shadow-elegant",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base xl:text-lg",
							children: "Sources des contrats"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "xl:text-sm",
							children: "Répartition du mois"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: chartMonth,
							onChange: (e) => setChartMonth(e.target.value),
							className: "h-8 rounded-md border border-border bg-card px-2 py-1 text-xs xl:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary",
							children: (() => {
								const opts = [];
								const now = /* @__PURE__ */ new Date();
								for (let i = 0; i < 12; i++) {
									const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
									const value = d.toISOString().slice(0, 7);
									const label = d.toLocaleDateString("fr-FR", {
										month: "long",
										year: "numeric"
									});
									opts.push({
										value,
										label: label.charAt(0).toUpperCase() + label.slice(1)
									});
								}
								return opts;
							})().map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: m.value,
								children: m.label
							}, m.value))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-72 xl:h-96",
						children: sourceBreakdownPending && sourceBreakdown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-full items-center justify-center text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 h-4 w-4 animate-spin" }), " Chargement des sources…"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
									data: sourceBreakdown,
									dataKey: "contrats",
									nameKey: "source",
									innerRadius: 50,
									outerRadius: 85,
									paddingAngle: 2,
									isAnimationActive: false,
									children: sourceBreakdown.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: COLORS[i % COLORS.length] }, i))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									borderRadius: 12,
									border: "1px solid oklch(0.92 0.008 240)"
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } })
							] })
						}, sourceBreakdownKey)
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 xl:gap-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-elegant",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base xl:text-lg flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 xl:h-5 xl:w-5 text-primary" }), " Activité récente"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "xl:text-sm",
						children: "Derniers événements du CRM"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-1",
						children: [recentActivity.map((it) => {
							const conf = it.kind === "contract" ? {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" }),
								bg: "bg-[oklch(0.68_0.17_55_/_0.12)]",
								fg: "text-[oklch(0.58_0.17_50)]"
							} : it.kind === "won" ? {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }),
								bg: "bg-[oklch(0.65_0.16_155_/_0.15)]",
								fg: "text-[oklch(0.5_0.16_155)]"
							} : it.kind === "lost" ? {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" }),
								bg: "bg-[oklch(0.65_0.2_15_/_0.12)]",
								fg: "text-[oklch(0.55_0.2_15)]"
							} : {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
								bg: "bg-muted",
								fg: "text-muted-foreground"
							};
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2.5 py-2 border-b border-border/60 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `mt-0.5 h-7 w-7 rounded-full ${conf.bg} ${conf.fg} flex items-center justify-center shrink-0`,
										children: conf.icon
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-medium leading-tight truncate",
											children: it.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-foreground truncate",
											children: it.subtitle
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] text-muted-foreground tabular-nums shrink-0",
										children: new Date(it.ts).toLocaleDateString("fr-FR", {
											day: "2-digit",
											month: "short"
										})
									})
								]
							}, it.id);
						}), recentActivity.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground py-4 text-center",
							children: "Aucune activité récente"
						})]
					})]
				})
			}),
			adminData && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 xl:gap-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-elegant",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base xl:text-lg flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4 xl:h-5 xl:w-5 text-[oklch(0.6_0.21_10)]" }), " Contrats annulés"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
						className: "xl:text-sm",
						children: [
							"Mois en cours · ",
							adminData.cancelled.contracts,
							" annulés · ",
							formatAmount(adminData.cancelled.revenue, currency)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: adminData.companiesCancelled.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground py-6 text-center",
						children: "Aucune annulation ce mois."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1.5 xl:space-y-2",
						children: adminData.companiesCancelled.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 py-1.5 xl:py-2 border-b border-border/60 last:border-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs xl:text-sm font-medium truncate",
								children: c.company
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] xl:text-sm tabular-nums shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: c.contracts
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-[oklch(0.55_0.2_15)]",
									children: formatAmount(c.revenue, currency)
								})]
							})]
						}, c.company))
					}) })]
				})
			})
		]
	})] });
}
export { Dashboard as component };
