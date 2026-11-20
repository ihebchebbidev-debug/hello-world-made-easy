import { i as __toESM } from "../_runtime.mjs";
import { a as CommandInput, i as CommandGroup, n as Command$1, o as CommandItem, r as CommandEmpty, s as CommandList, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { a as cn, c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { O as Textarea } from "./router-BUkYRVTH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { _ as PopoverContent, a as DialogFooter, g as Popover, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, v as PopoverTrigger, w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DpaEa0I_.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as useRouterState, h as Outlet, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $t as Eye, Q as Plus, St as Link2, V as Search, b as Trash2, q as RefreshCw, st as MessageSquareWarning, v as TriangleAlert, wn as Check, yn as ChevronsUpDown } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/reclamations-DzS7Roe8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SERVICES = [
	"Technique",
	"Facturation",
	"Commercial",
	"Autre"
];
var AUDIT = [
	"en_cours",
	"resolu",
	"annule"
];
var PRIORITIES = [
	"low",
	"normal",
	"high",
	"urgent"
];
var AUDIT_LABEL = {
	en_cours: "En cours",
	resolu: "Résolu",
	annule: "Annulé"
};
var AUDIT_CLASS = {
	en_cours: "bg-warning/15 text-warning-foreground border-warning/20",
	resolu: "bg-success/15 text-success border-success/20",
	annule: "bg-destructive/15 text-destructive border-destructive/20"
};
var PRIORITY_LABEL = {
	low: "Basse",
	normal: "Normale",
	high: "Haute",
	urgent: "Urgente"
};
var PRIORITY_CLASS = {
	low: "bg-muted text-muted-foreground border-border",
	normal: "bg-info/15 text-info border-info/20",
	high: "bg-warning/15 text-warning-foreground border-warning/20",
	urgent: "bg-destructive/15 text-destructive border-destructive/20"
};
var ALL = "__all__";
function ReclamationsRoute() {
	return useRouterState({ select: (s) => s.location.pathname === "/reclamations" }) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReclamationsPage, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
function ReclamationsPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { prospects, contracts } = useErp();
	const canManage = user?.role === "Administrateur" || user?.role === "Manager";
	const [items, setItems] = (0, import_react.useState)([]);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [service, setService] = (0, import_react.useState)(ALL);
	const [audit, setAudit] = (0, import_react.useState)(ALL);
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const load = async () => {
		setLoading(true);
		try {
			const r = await api("/reclamations.php", { query: {
				q: q || void 0,
				service: service === ALL ? void 0 : service,
				audit_status: audit === ALL ? void 0 : audit,
				limit: 200
			} });
			setItems(r.reclamations ?? []);
			setTotal(r.total ?? 0);
		} catch (e) {
			toast.error(e?.message || "Échec du chargement");
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [service, audit]);
	const stats = (0, import_react.useMemo)(() => {
		return {
			total: items.length,
			enc: items.filter((r) => r.audit_status === "en_cours").length,
			res: items.filter((r) => r.audit_status === "resolu").length,
			urg: items.filter((r) => r.priority === "urgent" && r.audit_status !== "resolu").length
		};
	}, [items]);
	const prospectMap = (0, import_react.useMemo)(() => new Map(prospects.map((p) => [p.id, p])), [prospects]);
	const contractMap = (0, import_react.useMemo)(() => new Map(contracts.map((c) => [c.id, c])), [contracts]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "table",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Réclamations",
				description: "Suivez les réclamations clients, reliez-les à un prospect ou un contrat, et résolvez-les rapidement.",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareWarning, { className: "h-5 w-5" }),
				eyebrow: "Service client",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: load,
					disabled: loading,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("h-4 w-4", loading && "animate-spin") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline ml-2",
						children: "Actualiser"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => setCreateOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2",
						children: "Nouvelle réclamation"
					})]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3 mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "Total",
						value: total || stats.total,
						tone: "default"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "En cours",
						value: stats.enc,
						tone: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "Résolus",
						value: stats.res,
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KPI, {
						label: "Urgentes ouvertes",
						value: stats.urg,
						tone: "destructive",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 md:grid-cols-[1fr_180px_180px_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Référence, client, téléphone, description…",
								className: "pl-9",
								value: q,
								onChange: (e) => setQ(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") load();
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: service,
							onValueChange: (v) => setService(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Service" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: ALL,
								children: "Tous services"
							}), SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s,
								children: s
							}, s))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: audit,
							onValueChange: (v) => setAudit(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Statut" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: ALL,
								children: "Tous statuts"
							}), AUDIT.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: a,
								children: AUDIT_LABEL[a]
							}, a))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: load,
							children: "Filtrer"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Référence" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Client" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Service" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Lien" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Priorité" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Créée" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [items.length === 0 && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 8,
					className: "py-12 text-center text-muted-foreground text-sm",
					children: "Aucune réclamation pour ces filtres."
				}) }), items.map((r) => {
					const p = r.prospect_id ? prospectMap.get(r.prospect_id) : null;
					const c = r.contract_id ? contractMap.get(r.contract_id) : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "cursor-pointer hover:bg-muted/40",
						onClick: () => navigate({
							to: "/reclamations/$id",
							params: { id: String(r.id) }
						}),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono text-xs",
								children: r.reference
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-medium",
								children: r.client_name || (p ? `${p.firstName} ${p.lastName}` : c ? `${c.firstName} ${c.lastName}` : "—")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground",
								children: r.gsm_client || r.tel_adsl || ""
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: r.service
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-xs",
								children: [
									p && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3 w-3" }),
											"Prospect: ",
											p.firstName,
											" ",
											p.lastName
										]
									}),
									c && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3 w-3" }),
											"Contrat: ",
											c.firstName,
											" ",
											c.lastName
										]
									}),
									!p && !c && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "—"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: PRIORITY_CLASS[r.priority],
								children: PRIORITY_LABEL[r.priority]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: AUDIT_CLASS[r.audit_status],
								children: AUDIT_LABEL[r.audit_status]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-muted-foreground",
								children: formatDate(r.date_creation)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right",
								onClick: (e) => e.stopPropagation(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "ghost",
									size: "icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/reclamations/$id",
										params: { id: String(r.id) },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
									})
								}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: async () => {
										if (!confirm(`Supprimer ${r.reference} ?`)) return;
										try {
											await api(`/reclamations.php?id=${r.id}`, { method: "DELETE" });
											toast.success("Réclamation supprimée");
											load();
										} catch (e) {
											toast.error(e?.message || "Échec");
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
								})]
							})
						]
					}, r.id);
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReclamationDialog, {
				open: createOpen,
				onOpenChange: setCreateOpen,
				onSaved: () => {
					setCreateOpen(false);
					load();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReclamationDetail, {
				rec: detail,
				onOpenChange: (v) => !v && setDetail(null),
				onSaved: () => {
					setDetail(null);
					load();
				},
				canManage
			})
		]
	});
}
function KPI({ label, value, tone, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-semibold mt-1",
				children: value
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br border", {
					default: "from-primary/10 to-primary/5 text-primary border-primary/15",
					warning: "from-warning/10 to-warning/5 text-warning-foreground border-warning/20",
					success: "from-success/10 to-success/5 text-success border-success/20",
					destructive: "from-destructive/10 to-destructive/5 text-destructive border-destructive/20"
				}[tone]),
				children: icon ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareWarning, { className: "h-4 w-4" })
			})]
		})
	});
}
function ReclamationDialog({ open, onOpenChange, onSaved, initial }) {
	const { prospects, contracts } = useErp();
	const [form, setForm] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) setForm(initial ?? {
			service: "Technique",
			audit_status: "en_cours",
			priority: "normal"
		});
	}, [open, initial]);
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const submit = async () => {
		if (!form.client_name && !form.tel_adsl && !form.gsm_client && !form.prospect_id && !form.contract_id) {
			toast.error("Renseignez un client, un téléphone, ou liez à un prospect/contrat");
			return;
		}
		setSaving(true);
		try {
			await api("/reclamations.php", {
				method: "POST",
				body: form
			});
			toast.success("Réclamation créée");
			onSaved();
		} catch (e) {
			toast.error(e?.message || "Échec de la création");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouvelle réclamation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Reliez la réclamation à un prospect ou un contrat existant." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2 grid md:grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityPicker, {
								label: "Prospect lié",
								value: form.prospect_id ?? null,
								onChange: (id) => {
									set("prospect_id", id);
									const p = prospects.find((x) => x.id === id);
									if (p && !form.client_name) set("client_name", `${p.firstName} ${p.lastName}`);
									if (p && !form.gsm_client) set("gsm_client", p.phone);
								},
								options: prospects.map((p) => ({
									id: p.id,
									label: `${p.firstName} ${p.lastName}`,
									sub: p.phone || p.email
								})),
								placeholder: "Aucun prospect"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityPicker, {
								label: "Contrat lié",
								value: form.contract_id ?? null,
								onChange: (id) => {
									set("contract_id", id);
									const c = contracts.find((x) => x.id === id);
									if (c && !form.client_name) set("client_name", `${c.firstName} ${c.lastName}`);
								},
								options: contracts.map((c) => ({
									id: c.id,
									label: `${c.firstName} ${c.lastName}`,
									sub: c.partner
								})),
								placeholder: "Aucun contrat"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom du client",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.client_name ?? "",
								onChange: (e) => set("client_name", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Service",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.service ?? "Technique",
								onValueChange: (v) => set("service", v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s,
									children: s
								}, s)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "GSM client",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.gsm_client ?? "",
								onChange: (e) => set("gsm_client", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tél. fixe / ADSL",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.tel_adsl ?? "",
								onChange: (e) => set("tel_adsl", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "CIN client",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.cin_client ?? "",
								onChange: (e) => set("cin_client", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Référence demande",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.ref_demand ?? "",
								onChange: (e) => set("ref_demand", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Priorité",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.priority ?? "normal",
								onValueChange: (v) => set("priority", v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p,
									children: PRIORITY_LABEL[p]
								}, p)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Statut",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.audit_status ?? "en_cours",
								onValueChange: (v) => set("audit_status", v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: AUDIT.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: a,
									children: AUDIT_LABEL[a]
								}, a)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Localisation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.localisation ?? "",
								onChange: (e) => set("localisation", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								value: form.description ?? "",
								onChange: (e) => set("description", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Remarques internes",
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 2,
								value: form.remarques ?? "",
								onChange: (e) => set("remarques", e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Annuler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					disabled: saving,
					children: saving ? "Création…" : "Créer"
				})] })
			]
		})
	});
}
function ReclamationDetail({ rec, onOpenChange, onSaved, canManage }) {
	const { prospects, contracts } = useErp();
	const [audit, setAudit] = (0, import_react.useState)("en_cours");
	const [priority, setPriority] = (0, import_react.useState)("normal");
	const [remarques, setRemarques] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (rec) {
			setAudit(rec.audit_status);
			setPriority(rec.priority);
			setRemarques(rec.remarques ?? "");
		}
	}, [rec]);
	if (!rec) return null;
	const p = rec.prospect_id ? prospects.find((x) => x.id === rec.prospect_id) : null;
	const c = rec.contract_id ? contracts.find((x) => x.id === rec.contract_id) : null;
	const save = async () => {
		setSaving(true);
		try {
			await api(`/reclamations.php?id=${rec.id}`, {
				method: "PATCH",
				body: {
					audit_status: audit,
					priority,
					remarques
				}
			});
			toast.success("Mise à jour enregistrée");
			onSaved();
		} catch (e) {
			toast.error(e?.message || "Échec de la mise à jour");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: !!rec,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-sm",
							children: rec.reference
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: AUDIT_CLASS[rec.audit_status],
							children: AUDIT_LABEL[rec.audit_status]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: PRIORITY_CLASS[rec.priority],
							children: PRIORITY_LABEL[rec.priority]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					rec.service,
					" · créée le ",
					formatDate(rec.date_creation),
					" par ",
					rec.created_by ?? "—"
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 max-h-[70vh] overflow-y-auto pr-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
									label: "Client",
									value: rec.client_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
									label: "GSM",
									value: rec.gsm_client
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
									label: "Tél. fixe",
									value: rec.tel_adsl
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
									label: "CIN",
									value: rec.cin_client
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
									label: "Réf. demande",
									value: rec.ref_demand
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
									label: "Localisation",
									value: rec.localisation
								})
							]
						}),
						(p || c) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-3 bg-muted/30",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs uppercase tracking-wider text-muted-foreground mb-2",
									children: "Liens"
								}),
								p && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3 w-3" }),
										"Prospect — ",
										p.firstName,
										" ",
										p.lastName,
										" (",
										p.phone,
										")"
									]
								}),
								c && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3 w-3" }),
										"Contrat — ",
										c.firstName,
										" ",
										c.lastName,
										" · ",
										c.partner
									]
								})
							]
						}),
						rec.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs uppercase tracking-wider text-muted-foreground",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm mt-1 whitespace-pre-wrap",
							children: rec.description
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid md:grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Statut",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: audit,
									onValueChange: (v) => setAudit(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: AUDIT.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: a,
										children: AUDIT_LABEL[a]
									}, a)) })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Priorité",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: priority,
									onValueChange: (v) => setPriority(v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: p,
										children: PRIORITY_LABEL[p]
									}, p)) })]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Remarques internes",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								value: remarques,
								onChange: (e) => setRemarques(e.target.value)
							})
						}),
						rec.date_resolution && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: ["Résolue le ", formatDate(rec.date_resolution)]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => onOpenChange(false),
					children: "Fermer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: saving,
					children: saving ? "Enregistrement…" : "Enregistrer"
				})] })
			]
		})
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs",
			children: label
		}), children]
	});
}
function Info$1({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-[11px] uppercase tracking-wider text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm",
		children: value || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: "—"
		})
	})] });
}
function EntityPicker({ label, value, onChange, options, placeholder }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const selected = options.find((o) => o.id === value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					role: "combobox",
					className: "w-full justify-between font-normal",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: selected ? selected.label : placeholder
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "h-4 w-4 opacity-50" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				className: "p-0 w-[--radix-popover-trigger-width]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, { placeholder: "Rechercher…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "Aucun résultat" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => {
						onChange(null);
						setOpen(false);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: placeholder
					})]
				}), options.slice(0, 200).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `${o.label} ${o.sub ?? ""} ${o.id}`,
					onSelect: () => {
						onChange(o.id);
						setOpen(false);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-4 w-4", value === o.id ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: o.label }), o.sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: o.sub
						})]
					})]
				}, o.id))] })] })] })
			})]
		})]
	});
}
function formatDate(iso) {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
}
export { ReclamationsRoute as component };
