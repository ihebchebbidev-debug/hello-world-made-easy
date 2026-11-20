import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { a as cn, c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { O as Textarea, l as Route$12 } from "./router-BUkYRVTH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Dn as Calendar, H as Save, Wt as FileText, b as Trash2, q as RefreshCw, s as User, st as MessageSquareWarning, v as TriangleAlert } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/reclamations._id-DuEY4NVb.js
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
function ReclamationDetailPage() {
	const { id } = Route$12.useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { prospects, contracts } = useErp();
	const canManage = user?.role === "Administrateur" || user?.role === "Manager";
	const [rec, setRec] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [form, setForm] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const load = async () => {
		setLoading(true);
		try {
			const r = await api(`/reclamations.php?id=${id}`);
			setRec(r.reclamation);
			setForm(r.reclamation);
		} catch (e) {
			toast.error(e?.message || "Réclamation introuvable");
			navigate({ to: "/reclamations" });
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [id]);
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const save = async () => {
		if (!rec) return;
		setSaving(true);
		try {
			await api(`/reclamations.php?id=${rec.id}`, {
				method: "PATCH",
				body: {
					audit_status: form.audit_status,
					priority: form.priority,
					service: form.service,
					client_name: form.client_name,
					gsm_client: form.gsm_client,
					tel_adsl: form.tel_adsl,
					cin_client: form.cin_client,
					ref_demand: form.ref_demand,
					localisation: form.localisation,
					etat: form.etat,
					statut_crm: form.statut_crm,
					statut_tt: form.statut_tt,
					description: form.description,
					remarques: form.remarques,
					assigned_to: form.assigned_to
				}
			});
			toast.success("Réclamation mise à jour");
			load();
		} catch (e) {
			toast.error(e?.message || "Échec de la mise à jour");
		} finally {
			setSaving(false);
		}
	};
	const remove = async () => {
		if (!rec) return;
		if (!confirm(`Supprimer définitivement ${rec.reference} ?`)) return;
		try {
			await api(`/reclamations.php?id=${rec.id}`, { method: "DELETE" });
			toast.success("Réclamation supprimée");
			navigate({ to: "/reclamations" });
		} catch (e) {
			toast.error(e?.message || "Échec");
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "form",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-center h-64 text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-5 w-5 animate-spin mr-2" }), " Chargement…"]
		})
	});
	if (!rec) return null;
	const linkedProspect = rec.prospect_id ? prospects.find((p) => p.id === rec.prospect_id) : null;
	const linkedContract = rec.contract_id ? contracts.find((c) => c.id === rec.contract_id) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: rec.reference,
			description: rec.client_name || "Réclamation client",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareWarning, { className: "h-5 w-5" }),
			eyebrow: "Réclamations",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: load,
					disabled: loading,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("h-4 w-4", loading && "animate-spin") })
				}),
				canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: remove,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 hidden sm:inline",
						children: "Supprimer"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: save,
					disabled: saving,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2",
						children: saving ? "Enregistrement…" : "Enregistrer"
					})]
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2 mt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: AUDIT_CLASS[rec.audit_status],
					children: AUDIT_LABEL[rec.audit_status]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: PRIORITY_CLASS[rec.priority],
					children: PRIORITY_LABEL[rec.priority]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: rec.service
				}),
				rec.priority === "urgent" && rec.audit_status !== "resolu" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "bg-destructive/15 text-destructive border-destructive/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3 w-3 mr-1" }), " À traiter"]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 mt-4 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-5 lg:col-span-2 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold text-sm uppercase tracking-wider text-muted-foreground",
						children: "Suivi"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-3",
						children: [
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
								label: "Statut CRM",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.statut_crm ?? "",
									onChange: (e) => set("statut_crm", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Statut TT",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.statut_tt ?? "",
									onChange: (e) => set("statut_tt", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "État",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.etat ?? "",
									onChange: (e) => set("etat", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Assigné à",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.assigned_to ?? "",
									onChange: (e) => set("assigned_to", e.target.value),
									placeholder: "username"
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
								label: "Réf. demande",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.ref_demand ?? "",
									onChange: (e) => set("ref_demand", e.target.value)
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Description",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 4,
							value: form.description ?? "",
							onChange: (e) => set("description", e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Remarques internes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 3,
							value: form.remarques ?? "",
							onChange: (e) => set("remarques", e.target.value)
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-sm uppercase tracking-wider text-muted-foreground",
								children: "Client"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Nom",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.client_name ?? "",
									onChange: (e) => set("client_name", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "GSM",
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
								label: "CIN",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.cin_client ?? "",
									onChange: (e) => set("cin_client", e.target.value)
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-sm uppercase tracking-wider text-muted-foreground",
								children: "Liens"
							}),
							linkedProspect ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/prospects/$prospectId",
								params: { prospectId: linkedProspect.id },
								className: "flex items-center gap-2 text-sm hover:text-primary transition-base",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Prospect : ",
									linkedProspect.firstName,
									" ",
									linkedProspect.lastName
								] })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }), " Aucun prospect lié"]
							}),
							linkedContract ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/contracts/$contractId",
								params: { contractId: linkedContract.id },
								className: "flex items-center gap-2 text-sm hover:text-primary transition-base",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Contrat : ",
									linkedContract.firstName,
									" ",
									linkedContract.lastName
								] })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), " Aucun contrat lié"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2",
								children: "Métadonnées"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }),
								label: "Créée le",
								value: fmt(rec.date_creation)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }),
								label: "Résolue le",
								value: fmt(rec.date_resolution)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5" }),
								label: "Créée par",
								value: rec.created_by ?? "—"
							})
						]
					})
				]
			})]
		})
	] });
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs text-muted-foreground",
			children: label
		}), children]
	});
}
function Row({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1.5 text-muted-foreground",
			children: [icon, label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-foreground",
			children: value
		})]
	});
}
function fmt(d) {
	if (!d) return "—";
	try {
		return new Date(d.replace(" ", "T")).toLocaleString("fr-FR");
	} catch {
		return d;
	}
}
export { ReclamationDetailPage as component };
