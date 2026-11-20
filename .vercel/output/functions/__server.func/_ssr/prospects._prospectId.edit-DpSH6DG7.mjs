import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { O as Textarea, a as Route$3 } from "./router-BUkYRVTH.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { t as CustomFieldsInline } from "./CustomFieldsInline-wqv8pmOS.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { t as ageFromBirthDate } from "./age-B_oCmxWg.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as Save, Wn as ArrowLeft, u as UserPlus } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/prospects._prospectId.edit-DpSH6DG7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EditProspectPage() {
	const { prospectId } = Route$3.useParams();
	const navigate = useNavigate();
	const { prospects, users, updateProspect } = useErp();
	const { user, hasPermission } = useAuth();
	const SOURCES = useOptionList("prospect", "source").values;
	const REGIMES = useOptionList("prospect", "regime").values;
	const effectiveStatuses = useStatusOptions("prospect").values;
	const canReassign = user?.role === "Administrateur" || user?.role === "Manager" || hasPermission("prospect.assign");
	const prospect = (0, import_react.useMemo)(() => prospects.find((p) => p.id === prospectId), [prospects, prospectId]);
	const [form, setForm] = (0, import_react.useState)({});
	const [customValues, setCustomValues] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (prospect) {
			setForm({ ...prospect });
			setCustomValues(prospect.customValues ?? {});
		}
	}, [prospect]);
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	(0, import_react.useEffect)(() => {
		const a = ageFromBirthDate(form.birthDate || "");
		if (a != null && a !== form.age) setForm((f) => ({
			...f,
			age: a
		}));
	}, [form.birthDate]);
	(0, import_react.useEffect)(() => {
		const a = ageFromBirthDate(form.spouseBirthDate || "");
		if (a != null && a !== form.spouseAge) setForm((f) => ({
			...f,
			spouseAge: a
		}));
	}, [form.spouseBirthDate]);
	const agents = users.filter((u) => isAssignableRole(u.role));
	if (!prospect) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "form",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold",
				children: "Prospect introuvable"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/prospects",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
				})
			})]
		})
	});
	const submit = async () => {
		if (!String(form.lastName ?? "").trim() || !String(form.firstName ?? "").trim()) {
			toast.error("Nom et prénom obligatoires");
			return;
		}
		setSaving(true);
		try {
			await updateProspect(prospect.id, {
				...form,
				customValues
			});
			toast.success("Prospect mis à jour");
			navigate({
				to: "/prospects/$prospectId",
				params: { prospectId: prospect.id }
			});
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
			title: `Modifier ${prospect.firstName} ${prospect.lastName}`,
			description: `Prospect ${prospect.id}`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/prospects/$prospectId",
						params: { prospectId: prospect.id },
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Informations"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Civilité" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.civility || "M",
									onValueChange: (val) => set("civility", val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "M",
										children: "M"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "Mme",
										children: "Mme"
									})] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("lastName"),
									onChange: (e) => set("lastName", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prénom *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("firstName"),
									onChange: (e) => set("firstName", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Téléphone (fixe)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("phone"),
									onChange: (e) => set("phone", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mobile / GSM" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("mobile"),
									onChange: (e) => set("mobile", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: v("email"),
									onChange: (e) => set("email", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2 lg:col-span-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adresse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("address"),
									onChange: (e) => set("address", e.target.value),
									placeholder: "N°, rue, complément…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ville" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("city"),
									onChange: (e) => set("city", e.target.value.toUpperCase())
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Code postal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("postalCode"),
									onChange: (e) => set("postalCode", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Source" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.source || SOURCES[0],
									onValueChange: (val) => set("source", val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s,
										children: s
									}, s)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Statut" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.status || effectiveStatuses[0],
									onValueChange: (val) => set("status", val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: effectiveStatuses.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s,
										children: s
									}, s)) })]
								})]
							}),
							canReassign && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigné à" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.assignedTo || "__none__",
									onValueChange: (val) => set("assignedTo", val === "__none__" ? null : val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "__none__",
										children: "— Non assigné —"
									}), agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: a.username,
										children: [
											a.fullName,
											" (@",
											a.username,
											")"
										]
									}, a.username))] })]
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Profil santé"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date de naissance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: v("birthDate"),
									onChange: (e) => set("birthDate", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Âge ", form.birthDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "(auto)"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									max: 130,
									value: form.age == null ? "" : String(form.age),
									disabled: !!form.birthDate,
									onChange: (e) => set("age", e.target.value === "" ? null : Number(e.target.value)),
									placeholder: form.birthDate ? "" : "Saisir l'âge"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date de naissance conjoint" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: v("spouseBirthDate"),
									onChange: (e) => set("spouseBirthDate", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Âge conjoint ", form.spouseBirthDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "(auto)"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									max: 130,
									value: form.spouseAge == null ? "" : String(form.spouseAge),
									disabled: !!form.spouseBirthDate,
									onChange: (e) => set("spouseAge", e.target.value === "" ? null : Number(e.target.value)),
									placeholder: form.spouseBirthDate ? "" : "Saisir l'âge"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mutuelle actuelle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("currentMutuelle"),
									onChange: (e) => set("currentMutuelle", e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Régime" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.regime || "__none__",
									onValueChange: (val) => set("regime", val === "__none__" ? null : val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "__none__",
										children: "—"
									}), REGIMES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: r,
										children: r
									}, r))] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cotisation (€)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									step: "0.01",
									value: form.cotisation ?? "",
									onChange: (e) => set("cotisation", e.target.value === "" ? null : Number(e.target.value))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Check valeur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.checkValeur || "pending",
									onValueChange: (val) => set("checkValeur", val),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "pending",
											children: "En attente"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "valid",
											children: "Valide"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "invalid",
											children: "Invalide"
										})
									] })]
								})]
							}),
							form.outcome === "lost" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2 lg:col-span-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Raison de la perte" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: v("lostReason"),
									onChange: (e) => set("lostReason", e.target.value)
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Enfants"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-3",
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
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nombre d'enfants" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										max: 20,
										value: count,
										onChange: (e) => setCount(Math.max(0, Math.min(20, Number(e.target.value) || 0)))
									})]
								})
							}), count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3",
								children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Âge enfant ", i + 1] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										max: 30,
										value: ages[i] ?? "",
										onChange: (e) => setAge(i, e.target.value)
									})]
								}, i))
							})] });
						})()
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Commentaire & champs personnalisés"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Commentaire" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 3,
									value: v("comment"),
									onChange: (e) => set("comment", e.target.value),
									placeholder: "Notes…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Demande" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 2,
									value: v("demande"),
									onChange: (e) => set("demande", e.target.value),
									placeholder: "Demande / besoin exprimé…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomFieldsInline, {
									entity: "prospect",
									values: customValues,
									onChange: setCustomValues
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-2 pb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						disabled: saving,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/prospects/$prospectId",
							params: { prospectId: prospect.id },
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
export { EditProspectPage as component };
