import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Progress } from "./progress-5aBggaNR.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DpaEa0I_.mjs";
import { S as useCurrency, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Target, H as Save, U as RotateCcw, _ as Trophy, a as Users, y as TrendingUp } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/objectives-DLgu-wAb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "erp_agent_quotas_v1";
var SETTING_KEY = "agent_quotas";
var DEFAULT_QUOTA = {
	leads: 80,
	won: 12,
	revenue: 15e3
};
function loadQuotasCache() {
	if (typeof window === "undefined") return {};
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
	} catch {
		return {};
	}
}
function cacheQuotas(q) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
}
async function fetchQuotas() {
	try {
		const r = await api("/settings.php", { query: {
			scope: "global",
			key: SETTING_KEY
		} });
		return r?.value && typeof r.value === "object" ? r.value : {};
	} catch {
		return null;
	}
}
async function persistQuotas(q) {
	cacheQuotas(q);
	try {
		await api("/settings.php", {
			method: "PUT",
			body: {
				scope: "global",
				key: SETTING_KEY,
				value: q
			}
		});
	} catch (e) {
		toast.error("Impossible d'enregistrer côté serveur", { description: e?.message });
	}
}
var monthOptions = (() => {
	const out = [];
	const d = /* @__PURE__ */ new Date();
	for (let i = 0; i < 6; i++) {
		const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
		const v = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
		out.push({
			value: v,
			label: dt.toLocaleDateString("fr-FR", {
				month: "long",
				year: "numeric"
			})
		});
	}
	return out;
})();
function pct(actual, target) {
	if (target <= 0) return 0;
	return Math.min(100, Math.round(actual / target * 100));
}
function progressTone(p) {
	if (p >= 100) return "bg-success/15 text-success border-success/20";
	if (p >= 75) return "bg-primary/10 text-primary border-primary/20";
	if (p >= 40) return "bg-warning/15 text-warning-foreground border-warning/20";
	return "bg-destructive/10 text-destructive border-destructive/20";
}
function ObjectivesPage() {
	const { users, prospects, contracts } = useErp();
	const currency = useCurrency();
	const [month, setMonth] = (0, import_react.useState)(monthOptions[0].value);
	const [quotas, setQuotas] = (0, import_react.useState)({});
	const [editing, setEditing] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		setQuotas(loadQuotasCache());
		fetchQuotas().then((q) => {
			if (q) {
				setQuotas(q);
				cacheQuotas(q);
			}
		});
	}, []);
	const agents = (0, import_react.useMemo)(() => users.filter((u) => isAssignableRole(u.role) && u.active !== false), [users]);
	const inMonth = (iso) => !!iso && iso.startsWith(month);
	const rows = (0, import_react.useMemo)(() => {
		return agents.map((u) => {
			const myProspects = prospects.filter((p) => p.assignedTo === u.username && inMonth(p.createdAt));
			const won = myProspects.filter((p) => p.outcome === "won").length;
			const lost = myProspects.filter((p) => p.outcome === "lost").length;
			const handled = myProspects.length;
			const myContracts = contracts.filter((c) => c.assignedTo === u.username && inMonth(c.signatureDate));
			const revenue = myContracts.reduce((s, c) => s + (c.premium || 0), 0);
			const conversion = handled ? won / handled * 100 : 0;
			const q = quotas[u.username] ?? DEFAULT_QUOTA;
			return {
				username: u.username,
				fullName: u.fullName,
				role: u.role,
				handled,
				won,
				lost,
				revenue,
				conversion,
				contractsCount: myContracts.length,
				quota: q
			};
		});
	}, [
		agents,
		prospects,
		contracts,
		quotas,
		month
	]);
	const team = (0, import_react.useMemo)(() => {
		const acc = rows.reduce((s, r) => ({
			handled: s.handled + r.handled,
			won: s.won + r.won,
			revenue: s.revenue + r.revenue,
			leadsTarget: s.leadsTarget + r.quota.leads,
			wonTarget: s.wonTarget + r.quota.won,
			revenueTarget: s.revenueTarget + r.quota.revenue
		}), {
			handled: 0,
			won: 0,
			revenue: 0,
			leadsTarget: 0,
			wonTarget: 0,
			revenueTarget: 0
		});
		const conv = acc.handled ? acc.won / acc.handled * 100 : 0;
		return {
			...acc,
			conv
		};
	}, [rows]);
	const startEdit = (username) => {
		setEditing((e) => ({
			...e,
			[username]: { ...quotas[username] ?? DEFAULT_QUOTA }
		}));
	};
	const cancelEdit = (username) => {
		setEditing((e) => {
			const n = { ...e };
			delete n[username];
			return n;
		});
	};
	const saveEdit = async (username) => {
		const next = {
			...quotas,
			[username]: editing[username]
		};
		setQuotas(next);
		await persistQuotas(next);
		cancelEdit(username);
		toast.success(`Objectifs enregistrés pour ${username}`);
	};
	const resetAll = async () => {
		setQuotas({});
		await persistQuotas({});
		toast.success("Objectifs réinitialisés (valeurs par défaut)");
	};
	const topPerformer = rows.reduce((best, r) => !best || r.won > best.won ? r : best, null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Objectifs mensuels",
				description: "Quotas et progression par agent",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "h-5 w-5" }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: month,
						onValueChange: setMonth,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-9 w-[180px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: monthOptions.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: m.value,
							children: m.label
						}, m.value)) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: resetAll,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4 mr-1.5" }), " Réinitialiser"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" }),
						label: "Leads traités",
						value: team.handled,
						target: team.leadsTarget
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-5 w-5" }),
						label: "Ventes",
						value: team.won,
						target: team.wonTarget
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5" }),
						label: "CA",
						value: team.revenue,
						target: team.revenueTarget,
						format: (v) => formatAmount(v, currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 shadow-elegant",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Conversion équipe"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-2xl font-bold",
								children: [team.conv.toFixed(1), "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] text-muted-foreground mt-1",
								children: [
									team.won,
									" ventes / ",
									team.handled,
									" leads"
								]
							})
						]
					})
				]
			}),
			topPerformer && topPerformer.won > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 p-4 shadow-elegant bg-gradient-to-r from-primary/5 to-primary/0 border-primary/20 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm font-semibold truncate",
						children: ["Top performer du mois — ", topPerformer.fullName]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							topPerformer.won,
							" ventes · ",
							formatAmount(topPerformer.revenue, currency),
							" · conversion ",
							topPerformer.conversion.toFixed(1),
							"%"
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 shadow-elegant overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "bg-muted/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Agent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Leads (objectif)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ventes (objectif)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "CA (objectif)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Conversion" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 6,
						className: "text-center text-sm text-muted-foreground py-8",
						children: "Aucun agent actif"
					}) }), rows.map((r) => {
						const ed = editing[r.username];
						const leadsP = pct(r.handled, r.quota.leads);
						const wonP = pct(r.won, r.quota.won);
						const revP = pct(r.revenue, r.quota.revenue);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "align-top",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/users/$username/edit",
									params: { username: r.username },
									className: "font-medium text-sm hover:underline",
									children: r.fullName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground",
									children: [
										r.username,
										" · ",
										r.role
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "min-w-[180px]",
									children: ed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuotaInput, {
										value: ed.leads,
										onChange: (v) => setEditing((e) => ({
											...e,
											[r.username]: {
												...ed,
												leads: v
											}
										}))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCell, {
										actual: r.handled,
										target: r.quota.leads,
										pct: leadsP
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "min-w-[180px]",
									children: ed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuotaInput, {
										value: ed.won,
										onChange: (v) => setEditing((e) => ({
											...e,
											[r.username]: {
												...ed,
												won: v
											}
										}))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCell, {
										actual: r.won,
										target: r.quota.won,
										pct: wonP
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "min-w-[200px]",
									children: ed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuotaInput, {
										value: ed.revenue,
										step: 500,
										onChange: (v) => setEditing((e) => ({
											...e,
											[r.username]: {
												...ed,
												revenue: v
											}
										}))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCell, {
										actual: r.revenue,
										target: r.quota.revenue,
										pct: revP,
										format: (v) => formatAmount(v, currency)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: progressTone(r.conversion),
									children: [r.conversion.toFixed(1), "%"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: [
										r.won,
										"V / ",
										r.lost,
										"P"
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									className: "text-right",
									children: ed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => cancelEdit(r.username),
											children: "Annuler"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											onClick: () => saveEdit(r.username),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5 mr-1" }), " Enregistrer"]
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => startEdit(r.username),
										children: "Définir objectifs"
									})
								})
							]
						}, r.username);
					})] })] })
				})
			})
		]
	});
}
function KpiCard({ icon, label, value, target, format }) {
	const p = pct(value, target);
	const fmt = format ?? ((v) => String(v));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4 shadow-elegant",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center",
					children: icon
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-bold",
				children: fmt(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] text-muted-foreground mt-1",
				children: ["Objectif : ", fmt(target)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: p,
					className: "h-2 flex-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] font-semibold tabular-nums w-9 text-right",
					children: [p, "%"]
				})]
			})
		]
	});
}
function ProgressCell({ actual, target, pct: p, format }) {
	const fmt = format ?? ((v) => String(v));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-sm font-medium tabular-nums",
			children: [
				fmt(actual),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground font-normal",
					children: ["/ ", fmt(target)]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: p,
				className: "h-2 flex-1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: "outline",
				className: `text-[10px] px-1.5 py-0 h-5 ${progressTone(p)}`,
				children: [p, "%"]
			})]
		})]
	});
}
function QuotaInput({ value, onChange, step = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-[10px] text-muted-foreground",
			children: "Objectif"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "number",
			min: 0,
			step,
			value,
			onChange: (e) => onChange(Math.max(0, Number(e.target.value) || 0)),
			className: "h-8 w-32"
		})]
	});
}
export { ObjectivesPage as component };
