import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { a as DialogFooter, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./popover-ePQ9XJ_z.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { O as Textarea } from "./router-Dkp91uPV.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { st as MessageSquareWarning } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contracts._contractId.index-B3RAyjEw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SERVICES = [
	"Technique",
	"Facturation",
	"Commercial",
	"Autre"
];
var PRIORITIES = [
	{
		value: "low",
		label: "Basse"
	},
	{
		value: "normal",
		label: "Normale"
	},
	{
		value: "high",
		label: "Haute"
	},
	{
		value: "urgent",
		label: "Urgente"
	}
];
function CreateClaimDialog({ open, onOpenChange, contractId, prospectId, defaultClientName, defaultPhone, onSuccess }) {
	const [service, setService] = (0, import_react.useState)("Technique");
	const [priority, setPriority] = (0, import_react.useState)("normal");
	const [clientName, setClientName] = (0, import_react.useState)(defaultClientName ?? "");
	const [phone, setPhone] = (0, import_react.useState)(defaultPhone ?? "");
	const [description, setDescription] = (0, import_react.useState)("");
	const [remarques, setRemarques] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const handleOpenChange = (nextOpen) => {
		if (nextOpen) {
			setClientName(defaultClientName ?? "");
			setPhone(defaultPhone ?? "");
			setDescription("");
			setRemarques("");
			setService("Technique");
			setPriority("normal");
		}
		onOpenChange(nextOpen);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!description.trim() && !clientName.trim() && !contractId && !prospectId) {
			toast.error("Veuillez renseigner les détails de la réclamation");
			return;
		}
		setSaving(true);
		try {
			await api("/reclamations.php", {
				method: "POST",
				body: {
					contract_id: contractId || null,
					prospect_id: prospectId || null,
					client_name: clientName.trim() || null,
					gsm_client: phone.trim() || null,
					service,
					priority,
					audit_status: "en_cours",
					description: description.trim() || null,
					remarques: remarques.trim() || null
				}
			});
			toast.success("Réclamation créée et enregistrée dans l'historique");
			onOpenChange(false);
			onSuccess?.();
		} catch (err) {
			toast.error(err?.message || "Échec de la création de la réclamation");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "max-w-lg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-2 rounded-md bg-amber-500/10 text-amber-600",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareWarning, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouvelle réclamation (Claim)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: contractId ? `Associée au contrat ${contractId}` : prospectId ? `Associée au prospect ${prospectId}` : "Créer un ticket de réclamation client" })] })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 py-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Service"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: service,
										onValueChange: (v) => setService(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-9",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: s,
											children: s
										}, s)) })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Priorité"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: priority,
										onValueChange: setPriority,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-9",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: p.value,
											children: p.label
										}, p.value)) })]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Client"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: clientName,
										onChange: (e) => setClientName(e.target.value),
										placeholder: "Nom du client",
										className: "h-9"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Téléphone / Mobile"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: phone,
										onChange: (e) => setPhone(e.target.value),
										placeholder: "06...",
										className: "h-9"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Objet / Description de la réclamation *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 3,
									value: description,
									onChange: (e) => setDescription(e.target.value),
									placeholder: "Détails du problème, motif de réclamation…",
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground",
									children: "Remarques internes (optionnel)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 2,
									value: remarques,
									onChange: (e) => setRemarques(e.target.value),
									placeholder: "Consignes internes pour le traitement…"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						disabled: saving,
						children: "Annuler"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: saving,
						children: saving ? "Enregistrement…" : "Créer la réclamation"
					})] })
				]
			})
		})
	});
}
var SplitNotFoundComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
	skeleton: "detail",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-semibold",
			children: "Contrat introuvable"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/contracts",
			className: "text-primary text-sm mt-2 inline-block",
			children: "← Retour aux contrats"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateClaimDialog, {
		open: claimDialogOpen,
		onOpenChange: setClaimDialogOpen,
		contractId: contract.id,
		prospectId: contract.prospectId,
		defaultClientName: `${contract.firstName} ${contract.lastName}`.trim(),
		defaultPhone: contract.phone || contract.mobile,
		onSuccess: () => {
			loadClaims();
			setActivityVersion((v) => v + 1);
		}
	})]
});
export { SplitNotFoundComponent as notFoundComponent };
