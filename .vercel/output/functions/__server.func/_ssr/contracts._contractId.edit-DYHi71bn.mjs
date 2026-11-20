import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { O as Textarea, s as Route$5 } from "./router-BUkYRVTH.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as Save, Jt as FilePenLine, Wn as ArrowLeft } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contracts._contractId.edit-DYHi71bn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base font-semibold text-muted-foreground uppercase tracking-wide",
				children: title
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
			children
		})]
	});
}
function Field({ label, span = 1, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `space-y-1.5 ${span === 4 ? "sm:col-span-2 lg:col-span-4" : span === 3 ? "sm:col-span-2 lg:col-span-3" : span === 2 ? "sm:col-span-2 lg:col-span-2" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-[11px] font-medium text-muted-foreground uppercase tracking-wide",
			children: label
		}), children]
	});
}
function EditContractPage() {
	const { contractId } = Route$5.useParams();
	const navigate = useNavigate();
	const { contracts, importContracts, users } = useErp();
	const { values: BILLING } = useStatusOptions("contract");
	const SOURCES = useOptionList("contract", "source").values;
	const PARTNERS = useOptionList("contract", "partner").values;
	const PRODUCTS = useOptionList("contract", "product").values;
	const CABINETS = useOptionList("contract", "cabinet").values;
	const DEBIT_TYPES = useOptionList("contract", "debit_type").values;
	const TERMINATION_TYPES = useOptionList("contract", "termination_type").values;
	const REGIMES = useOptionList("contract", "regime").values;
	const CIVILITIES = useOptionList("contract", "civility").values;
	const { user } = useAuth();
	const isAdmin = user?.role === "Administrateur" || user?.role === "Manager";
	const contract = (0, import_react.useMemo)(() => contracts.find((c) => c.id === contractId), [contracts, contractId]);
	const [form, setForm] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (contract) setForm({ ...contract });
	}, [contract]);
	(0, import_react.useEffect)(() => {
		if (user && !isAdmin) {
			toast.error("Seuls les administrateurs et managers peuvent modifier un contrat");
			navigate({
				to: "/contracts/$contractId",
				params: { contractId }
			});
		}
	}, [
		user,
		isAdmin,
		navigate,
		contractId
	]);
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const agents = users.filter((u) => isAssignableRole(u.role) || u.role === "Administrateur");
	if (!contract) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "form",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold",
				children: "Contrat introuvable"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/contracts",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
				})
			})]
		})
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "form",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Accès restreint"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2",
					children: "Seuls les administrateurs et managers peuvent modifier un contrat."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/contracts/$contractId",
						params: { contractId },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
					})
				})
			]
		})
	});
	const submit = async () => {
		setSaving(true);
		try {
			const payload = {
				...form,
				id: contract.id,
				premium: form.premium != null ? Number(form.premium) : contract.premium,
				previousPremium: form.previousPremium != null && form.previousPremium !== "" ? Number(form.previousPremium) : null,
				complementaryPremium: form.complementaryPremium != null && form.complementaryPremium !== "" ? Number(form.complementaryPremium) : null
			};
			const r = await importContracts([payload]);
			if (r.updated + r.added > 0) {
				toast.success("Contrat mis à jour");
				navigate({
					to: "/contracts/$contractId",
					params: { contractId: contract.id }
				});
			} else toast.error("Mise à jour impossible");
		} catch (e) {
			toast.error(e?.message ?? "Erreur lors de la mise à jour");
		} finally {
			setSaving(false);
		}
	};
	const v = (k) => form[k] ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: `Modifier ${contract.firstName} ${contract.lastName}`,
			description: `Contrat ${contract.id}`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/contracts/$contractId",
						params: { contractId: contract.id },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: submit,
					disabled: saving,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
						" ",
						saving ? "Enregistrement…" : "Enregistrer"
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Détail Client",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Assigné à",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.assignedTo || "__none__",
								onValueChange: (val) => set("assignedTo", val === "__none__" ? "" : val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [user?.username && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: user.username,
									children: [
										"Moi (@",
										user.username,
										")"
									]
								}), isAdmin && agents.filter((a) => a.username !== user?.username).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: a.username,
									children: [
										a.fullName,
										" (@",
										a.username,
										")"
									]
								}, a.username))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Source",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.source || SOURCES[0],
								onValueChange: (val) => set("source", val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s,
									children: s
								}, s)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Civilité",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.civility || "__none__",
								onValueChange: (val) => set("civility", val === "__none__" ? null : val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), CIVILITIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c,
									children: c
								}, c))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("lastName"),
								onChange: (e) => set("lastName", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prénom",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("firstName"),
								onChange: (e) => set("firstName", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Téléphone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("phone"),
								onChange: (e) => set("phone", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Mobile",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("mobile"),
								onChange: (e) => set("mobile", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: v("email"),
								onChange: (e) => set("email", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de naissance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("birthDate"),
								onChange: (e) => set("birthDate", e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Adresse",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Adresse",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("address"),
								onChange: (e) => set("address", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Code postal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("postalCode"),
								onChange: (e) => set("postalCode", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ville",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("city"),
								onChange: (e) => set("city", e.target.value.toUpperCase())
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Mutuelle Actuelle",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Mutuelle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("currentMutuelle"),
								onChange: (e) => set("currentMutuelle", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "N° Sécurité Sociale",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("ssn"),
								onChange: (e) => set("ssn", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "N° d'adhésion",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("adhesionNumber"),
								onChange: (e) => set("adhesionNumber", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Adhérent principal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("principalMember"),
								onChange: (e) => set("principalMember", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ancienne cotisation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: v("previousPremium"),
								onChange: (e) => set("previousPremium", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date d'échéance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("currentExpiryDate"),
								onChange: (e) => set("currentExpiryDate", e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Produit & Facturation",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Partenaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.partner || PARTNERS[0],
								onValueChange: (val) => set("partner", val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: PARTNERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p,
									children: p
								}, p)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Produit",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.product || "__none__",
								onValueChange: (val) => set("product", val === "__none__" ? null : val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), PRODUCTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p,
									children: p
								}, p))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Options",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("productOptions"),
								onChange: (e) => set("productOptions", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Cotisation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: v("premium"),
								onChange: (e) => set("premium", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Cabinet",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.cabinet || CABINETS[0],
								onValueChange: (val) => set("cabinet", val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CABINETS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c,
									children: c
								}, c)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de signature",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("signatureDate"),
								onChange: (e) => set("signatureDate", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date d'effet",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("effectiveDate"),
								onChange: (e) => set("effectiveDate", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date validation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("validationDate"),
								onChange: (e) => set("validationDate", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Statut facturation",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.billingStatus || "Pré-validé",
								onValueChange: (val) => set("billingStatus", val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: BILLING.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: b,
									children: b
								}, b)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Produit complémentaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.complementaryProduct || "__none__",
								onValueChange: (val) => set("complementaryProduct", val === "__none__" ? null : val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), PRODUCTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p,
									children: p
								}, p))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Cotisation complémentaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: v("complementaryPremium"),
								onChange: (e) => set("complementaryPremium", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date d'effet complémentaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("complementaryEffectiveDate"),
								onChange: (e) => set("complementaryEffectiveDate", e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Conjoint",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Civilité",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.spouseCivility || "__none__",
								onValueChange: (val) => set("spouseCivility", val === "__none__" ? null : val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), CIVILITIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c,
									children: c
								}, c))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("spouseLastName"),
								onChange: (e) => set("spouseLastName", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prénom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("spouseFirstName"),
								onChange: (e) => set("spouseFirstName", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de naissance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("spouseBirthDate"),
								onChange: (e) => set("spouseBirthDate", e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Coordonnées Bancaires",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom titulaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("bankHolderLastName"),
								onChange: (e) => set("bankHolderLastName", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prénom titulaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("bankHolderFirstName"),
								onChange: (e) => set("bankHolderFirstName", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "IBAN",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("iban"),
								onChange: (e) => set("iban", e.target.value),
								placeholder: "FR76…"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "BIC",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: v("bic"),
								onChange: (e) => set("bic", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de prélèvement",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: v("debitDate"),
								onChange: (e) => set("debitDate", e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Type de prélèvement",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.debitType || DEBIT_TYPES[0],
								onValueChange: (val) => set("debitType", val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DEBIT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t,
									children: t
								}, t)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Type de résiliation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.terminationType || "__none__",
								onValueChange: (val) => set("terminationType", val === "__none__" ? null : val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), TERMINATION_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t,
									children: t
								}, t))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Régime",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.regime || "__none__",
								onValueChange: (val) => set("regime", val === "__none__" ? null : val),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), REGIMES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: r,
									children: r
								}, r))] })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Enfants",
					children: (() => {
						const ages = String(form.childrenAges ?? "").split(",").map((s) => s.trim()).filter((s) => s !== "");
						const count = Number(form.childrenCount ?? ages.length ?? 0) || 0;
						const setCount = (n) => {
							const next = [...ages];
							while (next.length < n) next.push("");
							next.length = n;
							setForm((f) => ({
								...f,
								childrenCount: n,
								childrenAges: next.join(",")
							}));
						};
						const setAge = (i, val) => {
							const next = [...ages];
							while (next.length <= i) next.push("");
							next[i] = val;
							setForm((f) => ({
								...f,
								childrenAges: next.join(",")
							}));
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nombre d'enfants",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								max: 20,
								value: count,
								onChange: (e) => setCount(Math.max(0, Math.min(20, Number(e.target.value) || 0)))
							})
						}), Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `Âge enfant ${i + 1}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								max: 30,
								value: ages[i] ?? "",
								onChange: (e) => setAge(i, e.target.value)
							})
						}, i))] });
					})()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base font-semibold text-muted-foreground uppercase tracking-wide",
							children: "Commentaire commercial"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 4,
						value: v("commercialComment"),
						onChange: (e) => set("commercialComment", e.target.value)
					}) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-2 pb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						disabled: saving,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contracts/$contractId",
							params: { contractId: contract.id },
							children: "Annuler"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: submit,
						disabled: saving,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
							" ",
							saving ? "Enregistrement…" : "Enregistrer"
						]
					})]
				})
			]
		})]
	});
}
export { EditContractPage as component };
