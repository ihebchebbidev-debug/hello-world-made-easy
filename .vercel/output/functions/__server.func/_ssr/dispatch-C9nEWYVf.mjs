import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Progress } from "./progress-5aBggaNR.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { D as Checkbox, O as Textarea } from "./router-BUkYRVTH.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Cb1NE_Xq.mjs";
import { S as useCurrency, a as DialogFooter, c as DialogTrigger, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $ as Phone, It as Hand, M as Shuffle, Sn as ChevronLeft, V as Search, _n as CircleCheck, a as Users, ft as Mail, kt as Inbox, ln as Clock, pn as CircleX, v as TriangleAlert, vt as LoaderCircle, xn as ChevronRight } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/dispatch-C9nEWYVf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DispatchPage() {
	const { prospects, users, claimLead, markWon, markLost, getAgentStats, refresh } = useErp();
	const currency = useCurrency();
	const auth = useAuth();
	const me = auth.user?.username ?? "";
	const role = auth.user?.role;
	const isDispatcher = role === "Administrateur" || role === "Manager" || role === "Backoffice";
	const queue = (0, import_react.useMemo)(() => prospects.filter((p) => p.assignedTo === null || p.assignedTo === ""), [prospects]);
	const myLeads = (0, import_react.useMemo)(() => prospects.filter((p) => p.assignedTo === me && p.outcome === "pending"), [prospects, me]);
	const agents = (0, import_react.useMemo)(() => users.filter((u) => isAssignableRole(u.role) && u.active), [users]);
	const [search, setSearch] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(0);
	const PAGE_SIZE = 15;
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [bulkAgent, setBulkAgent] = (0, import_react.useState)("");
	const [bulkBusy, setBulkBusy] = (0, import_react.useState)(false);
	const [confirmOpen, setConfirmOpen] = (0, import_react.useState)(false);
	const filteredQueue = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		if (!q) return queue;
		return queue.filter((p) => {
			return `${p.firstName} ${p.lastName} ${p.phone} ${p.email} ${p.city} ${p.source}`.toLowerCase().includes(q);
		});
	}, [queue, search]);
	const totalPages = Math.max(1, Math.ceil(filteredQueue.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages - 1);
	const pagedQueue = (0, import_react.useMemo)(() => filteredQueue.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE), [filteredQueue, safePage]);
	const toggleOne = (id, v) => setSelected((prev) => {
		const next = new Set(prev);
		if (v) next.add(id);
		else next.delete(id);
		return next;
	});
	const allOnPageSelected = pagedQueue.length > 0 && pagedQueue.every((p) => selected.has(p.id));
	const toggleAllOnPage = (v) => {
		setSelected((prev) => {
			const next = new Set(prev);
			pagedQueue.forEach((p) => {
				if (v) next.add(p.id);
				else next.delete(p.id);
			});
			return next;
		});
	};
	const bulkAgentLabel = (0, import_react.useMemo)(() => {
		const a = agents.find((x) => x.username === bulkAgent);
		return a ? `@${a.username}${a.fullName ? ` — ${a.fullName}` : ""}` : `@${bulkAgent}`;
	}, [agents, bulkAgent]);
	const requestBulkAssign = () => {
		if (!bulkAgent) {
			toast.error("Choisissez un agent");
			return;
		}
		if (selected.size === 0) {
			toast.error("Aucun lead sélectionné");
			return;
		}
		setConfirmOpen(true);
	};
	const bulkAssign = async () => {
		const target = bulkAgent;
		const ids = Array.from(selected);
		if (!target || ids.length === 0) {
			setConfirmOpen(false);
			return;
		}
		setBulkBusy(true);
		try {
			await api("/prospects.php", {
				method: "POST",
				body: {
					action: "bulk",
					op: "assign",
					ids,
					assignedTo: target
				}
			});
			await refresh();
			toast.success("Leads attribués", { description: `${ids.length} lead(s) → @${target}` });
			setSelected(/* @__PURE__ */ new Set());
			setConfirmOpen(false);
		} catch (e) {
			toast.error("Échec de l'attribution", { description: e?.message ?? "Erreur serveur" });
		} finally {
			setBulkBusy(false);
		}
	};
	const productQuotas = (0, import_react.useMemo)(() => {
		const colors = [
			"oklch(0.68 0.17 55)",
			"oklch(0.65 0.16 155)",
			"oklch(0.78 0.15 75)",
			"oklch(0.8 0.14 75)",
			"oklch(0.6 0.22 320)",
			"oklch(0.62 0.18 30)"
		];
		const counts = /* @__PURE__ */ new Map();
		prospects.forEach((p) => {
			const k = p.source || "Autre";
			counts.set(k, (counts.get(k) ?? 0) + 1);
		});
		return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s]) => s).map((source, i) => {
			const all = prospects.filter((p) => p.source === source);
			const dispatched = all.filter((p) => p.assignedTo !== null && p.assignedTo !== "").length;
			const waiting = all.filter((p) => p.assignedTo === null || p.assignedTo === "").length;
			return {
				product: source,
				quota: Math.max(10, Math.ceil(all.length / 10) * 10),
				dispatched,
				waiting,
				color: colors[i % colors.length]
			};
		});
	}, [prospects]);
	const handleClaim = (prospectId) => {
		claimLead(prospectId, me);
		toast.success("Lead attribué", { description: `Affecté à @${me}` });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "table",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Dispatch",
				description: "File d'attente, attribution et suivi des résultats par agent",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "h-5 w-5" }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "bg-primary/10 text-primary border-primary/20",
					children: ["Connecté: @", me]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6",
				children: productQuotas.map((p) => {
					const pct = Math.min(100, p.dispatched / p.quota * 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 shadow-elegant",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs uppercase tracking-wider text-muted-foreground",
									children: "Produit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold mt-0.5",
									children: p.product
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-8 w-8 rounded-lg",
									style: { background: p.color }
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl font-semibold",
									children: p.dispatched
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-muted-foreground",
									children: ["/ ", p.quota]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: pct,
								className: "mt-2 h-1.5"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-warning-foreground font-medium",
									children: p.waiting
								}), " en file d'attente"]
							})
						]
					}, p.product);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "queue",
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "queue",
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-4 w-4" }),
								" File d'attente",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "ml-1",
									children: queue.length
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "mine",
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, { className: "h-4 w-4" }),
								" Mes leads",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "ml-1",
									children: myLeads.length
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "agents",
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "h-4 w-4" }), " Performance agents"]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "queue",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "shadow-elegant overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "font-semibold text-sm",
										children: ["Leads non attribués", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-2 text-xs text-muted-foreground font-normal",
											children: [
												"(",
												filteredQueue.length,
												search ? ` / ${queue.length}` : "",
												")"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: isDispatcher ? "Sélectionnez plusieurs leads pour les attribuer en lot." : "Cliquez sur \"Prendre\" pour vous assigner un lead"
									})]
								}),
								queue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "px-4 py-2 border-b border-border bg-background",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative max-w-md",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: search,
											onChange: (e) => {
												setSearch(e.target.value);
												setPage(0);
											},
											placeholder: "Rechercher par nom, téléphone, email, ville, source…",
											className: "h-8 pl-8 text-xs"
										})]
									})
								}),
								isDispatcher && filteredQueue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "px-4 py-2 border-b border-border bg-background flex flex-wrap items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: "select-all-queue",
											checked: allOnPageSelected,
											onCheckedChange: (v) => toggleAllOnPage(!!v)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											htmlFor: "select-all-queue",
											className: "text-xs cursor-pointer",
											children: [
												"Tout sélectionner sur cette page (",
												selected.size,
												" sélectionné",
												selected.size > 1 ? "s" : "",
												")"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "ml-auto flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-muted-foreground" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: bulkAgent,
												onValueChange: setBulkAgent,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 w-[200px] text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir un agent…" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: agents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "px-2 py-1.5 text-xs text-muted-foreground",
													children: "Aucun agent actif"
												}) : agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: a.username,
													children: [
														"@",
														a.username,
														" ",
														a.fullName ? `— ${a.fullName}` : ""
													]
												}, a.id)) })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												onClick: requestBulkAssign,
												disabled: bulkBusy || selected.size === 0 || !bulkAgent,
												children: [
													bulkBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-1.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, { className: "h-4 w-4 mr-1.5" }),
													"Attribuer (",
													selected.size,
													")"
												]
											})
										]
									})]
								}),
								filteredQueue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-10 text-center text-sm text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), queue.length === 0 ? "File vide — tous les leads ont été attribués" : "Aucun résultat pour votre recherche"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "divide-y divide-border",
									children: pagedQueue.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 flex flex-wrap items-center gap-3 hover:bg-muted/20 transition-base",
										children: [
											isDispatcher && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: selected.has(p.id),
												onCheckedChange: (v) => toggleOne(p.id, !!v),
												"aria-label": `Sélectionner ${p.firstName} ${p.lastName}`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0",
												children: [p.firstName[0], p.lastName[0]]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-[160px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "font-medium text-sm",
													children: [
														p.civility,
														" ",
														p.lastName,
														" ",
														p.firstName
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-muted-foreground flex items-center gap-3 mt-0.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }), p.phone]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "hidden sm:flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }), p.email]
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "bg-info/10 text-info border-info/20",
												children: p.source
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-muted-foreground hidden md:flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), p.createdAt]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												onClick: () => handleClaim(p.id),
												className: "bg-primary text-primary-foreground hover:bg-primary/90",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hand, { className: "h-4 w-4 mr-1.5" }), "Prendre"]
											})
										]
									}, p.id))
								}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground",
										children: [
											"Page ",
											safePage + 1,
											" / ",
											totalPages,
											" — ",
											filteredQueue.length,
											" lead",
											filteredQueue.length > 1 ? "s" : ""
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											className: "h-7",
											disabled: safePage === 0,
											onClick: () => setPage((p) => Math.max(0, p - 1)),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "outline",
											className: "h-7",
											disabled: safePage >= totalPages - 1,
											onClick: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
										})]
									})]
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
							open: confirmOpen,
							onOpenChange: (o) => !bulkBusy && setConfirmOpen(o),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-warning-foreground" }), "Confirmer l'attribution"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
								"Vous êtes sur le point d'attribuer",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-foreground",
									children: [
										selected.size,
										" lead",
										selected.size > 1 ? "s" : ""
									]
								}),
								" ",
								"à ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: bulkAgentLabel
								}),
								". Cette action est immédiate et l'agent verra les leads dans son portefeuille."
							] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setConfirmOpen(false),
								disabled: bulkBusy,
								children: "Annuler"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: bulkAssign,
								disabled: bulkBusy,
								children: bulkBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-1.5 animate-spin" }), " Attribution…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "Confirmer l'attribution" })
							})] })] })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "mine",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "shadow-elegant overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-4 py-3 border-b border-border bg-muted/30",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "font-semibold text-sm",
									children: ["Leads à traiter — @", me]
								})
							}), myLeads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-10 text-center text-sm text-muted-foreground",
								children: "Aucun lead en cours. Allez dans la file d'attente pour en prendre."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: myLeads.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 flex flex-wrap items-center gap-3 hover:bg-muted/20 transition-base",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold shrink-0",
											children: [p.firstName[0], p.lastName[0]]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 min-w-[160px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-medium text-sm",
												children: [
													p.civility,
													" ",
													p.lastName,
													" ",
													p.firstName
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs text-muted-foreground",
												children: [
													p.phone,
													" • ",
													p.source
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WonDialog, {
											currency,
											onConfirm: (premium, partner) => {
												markWon(p.id, premium, partner);
												toast.success("Contrat enregistré", { description: `${p.firstName} ${p.lastName} • ${formatAmount(premium, currency)}` });
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LostDialog, { onConfirm: (reason) => {
											markLost(p.id, reason);
											toast("Lead marqué perdu", { description: reason });
										} })
									]
								}, p.id))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "agents",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "shadow-elegant overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-4 py-3 border-b border-border bg-muted/30",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold text-sm",
									children: "Performance par agent"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-border",
								children: agents.map((a) => {
									const s = getAgentStats(a.username);
									const quota = 8;
									const pct = Math.min(100, s.handled / quota * 100);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 flex flex-wrap items-center gap-4 hover:bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold",
												children: a.fullName.split(" ").map((n) => n[0]).join("")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-[140px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-sm",
														children: a.fullName
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-xs text-muted-foreground",
														children: ["@", a.username]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground",
													children: a.team
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "bg-success/15 text-success border-success/20",
														children: [s.won, " gagnés"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "bg-destructive/10 text-destructive border-destructive/20",
														children: [s.lost, " perdus"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														variant: "outline",
														className: "bg-warning/15 text-warning-foreground border-warning/20",
														children: [s.pending, " en cours"]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "hidden md:flex flex-col items-end min-w-[180px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-muted-foreground mb-1",
													children: [
														s.handled,
														" / ",
														quota,
														" leads · conv. ",
														s.conversion.toFixed(1),
														"%"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
													value: pct,
													className: "h-1.5 w-40"
												})]
											})
										]
									}, a.id);
								})
							})]
						})
					})
				]
			})
		]
	});
}
function WonDialog({ onConfirm, currency }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [premium, setPremium] = (0, import_react.useState)("950");
	const { values: PARTNERS } = useOptionList("contract", "partner");
	const [partner, setPartner] = (0, import_react.useState)(PARTNERS[0] ?? "NEOLIANE");
	(0, import_react.useEffect)(() => {
		if (PARTNERS.length && !PARTNERS.includes(partner)) setPartner(PARTNERS[0]);
	}, [PARTNERS, partner]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				className: "border-success/30 text-success hover:bg-success/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 mr-1.5" }), "Gagné"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Marquer comme contrat gagné" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Un nouveau contrat sera créé et les statistiques de l'agent mises à jour." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "partner",
						children: "Partenaire"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: partner,
						onValueChange: setPartner,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "partner",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PARTNERS.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: x,
							children: x
						}, x)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "premium",
						children: [
							"Cotisation annuelle (",
							currency.symbol,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "premium",
						type: "number",
						value: premium,
						onChange: (e) => setPremium(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setOpen(false),
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "bg-primary text-primary-foreground hover:bg-primary/90",
				onClick: () => {
					onConfirm(Number(premium) || 0, partner);
					setOpen(false);
				},
				children: "Confirmer"
			})] })
		] })]
	});
}
function LostDialog({ onConfirm }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("Pas intéressé");
	const [note, setNote] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				className: "border-destructive/30 text-destructive hover:bg-destructive/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 mr-1.5" }), "Perdu"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Marquer le lead comme perdu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Précisez la raison pour analyser les pertes." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "reason",
						children: "Raison"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: reason,
						onValueChange: setReason,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "reason",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
							"Pas intéressé",
							"Trop cher",
							"Concurrent",
							"Injoignable",
							"Autre"
						].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: x,
							children: x
						}, x)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "note",
						children: "Note (optionnel)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "note",
						value: note,
						onChange: (e) => setNote(e.target.value),
						rows: 3
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setOpen(false),
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "destructive",
				onClick: () => {
					onConfirm(note ? `${reason} — ${note}` : reason);
					setOpen(false);
				},
				children: "Confirmer"
			})] })
		] })]
	});
}
export { DispatchPage as component };
