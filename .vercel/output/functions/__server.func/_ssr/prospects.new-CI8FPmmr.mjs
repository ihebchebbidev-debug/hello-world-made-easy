import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { D as Checkbox, O as Textarea } from "./router-BUkYRVTH.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { n as validateRequiredCustomValues, t as CustomFieldsInline } from "./CustomFieldsInline-wqv8pmOS.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { t as ageFromBirthDate } from "./age-B_oCmxWg.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as Save, Wn as ArrowLeft, u as UserPlus } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/prospects.new-CI8FPmmr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewProspectPage() {
	const navigate = useNavigate();
	const { importProspects, users, saveEvent, prospects } = useErp();
	const { user } = useAuth();
	const SOURCES = useOptionList("prospect", "source").values;
	const REGIMES = useOptionList("prospect", "regime").values;
	const STATUSES = useStatusOptions("prospect").values;
	const role = user?.role;
	const canDispatch = role === "Administrateur" || role === "Manager";
	const effectiveStatuses = STATUSES;
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [civility, setCivility] = (0, import_react.useState)("M");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [mobile, setMobile] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [postalCode, setPostalCode] = (0, import_react.useState)("");
	const [source, setSource] = (0, import_react.useState)(SOURCES[0]);
	const [status, setStatus] = (0, import_react.useState)(effectiveStatuses[0]);
	const [assignedTo, setAssignedTo] = (0, import_react.useState)(user?.username ?? "__none__");
	const [sendToDispatch, setSendToDispatch] = (0, import_react.useState)(false);
	const [comment, setComment] = (0, import_react.useState)("");
	const [demande, setDemande] = (0, import_react.useState)("");
	const [customValues, setCustomValues] = (0, import_react.useState)({});
	const [reminderDate, setReminderDate] = (0, import_react.useState)("");
	const [reminderTime, setReminderTime] = (0, import_react.useState)("09:00");
	const [birthDate, setBirthDate] = (0, import_react.useState)("");
	const [age, setAge] = (0, import_react.useState)("");
	const [spouseBirthDate, setSpouseBirthDate] = (0, import_react.useState)("");
	const [spouseAge, setSpouseAge] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const a = ageFromBirthDate(birthDate);
		if (a != null) setAge(String(a));
	}, [birthDate]);
	(0, import_react.useEffect)(() => {
		const a = ageFromBirthDate(spouseBirthDate);
		if (a != null) setSpouseAge(String(a));
	}, [spouseBirthDate]);
	const [currentMutuelle, setCurrentMutuelle] = (0, import_react.useState)("");
	const [regime, setRegime] = (0, import_react.useState)("");
	const [cotisation, setCotisation] = (0, import_react.useState)("");
	const [checkValeur, setCheckValeur] = (0, import_react.useState)("pending");
	const [childrenCount, setChildrenCount] = (0, import_react.useState)("0");
	const [childrenAges, setChildrenAges] = (0, import_react.useState)([]);
	const agents = users.filter((u) => isAssignableRole(u.role));
	const needsSchedule = status.startsWith("RDV") || status.startsWith("A recontacter");
	const dateInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!needsSchedule) return;
		if (!reminderDate) setReminderDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
		const t = setTimeout(() => {
			const el = dateInputRef.current;
			if (!el) return;
			el.focus();
			const anyEl = el;
			try {
				anyEl.showPicker?.();
			} catch {}
		}, 60);
		return () => clearTimeout(t);
	}, [needsSchedule]);
	const submit = async () => {
		if (!lastName.trim() || !firstName.trim()) {
			toast.error("Nom et prénom obligatoires");
			return;
		}
		const missing = await validateRequiredCustomValues("prospect", customValues);
		if (missing) {
			toast.error(`${missing} est requis`);
			return;
		}
		setSaving(true);
		try {
			const finalAssignee = sendToDispatch ? null : assignedTo === "__none__" ? user?.username ?? null : assignedTo;
			const r = await importProspects([{
				civility,
				lastName: lastName.trim(),
				firstName: firstName.trim(),
				phone: phone.trim(),
				mobile: mobile.trim() || null,
				email: email.trim(),
				city: city.trim().toUpperCase(),
				address: address.trim() || null,
				postalCode: postalCode.trim() || null,
				source,
				status,
				assignedTo: finalAssignee,
				createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				comment: comment.trim() || void 0,
				demande: demande.trim() || null,
				birthDate: birthDate || null,
				age: age === "" ? null : Number(age),
				spouseBirthDate: spouseBirthDate || null,
				spouseAge: spouseAge === "" ? null : Number(spouseAge),
				currentMutuelle: currentMutuelle.trim() || null,
				regime: regime || null,
				cotisation: cotisation === "" ? null : Number(cotisation),
				childrenCount: childrenCount === "" ? null : Number(childrenCount) || 0,
				childrenAges: childrenAges.filter((a) => a !== "").join(",") || null,
				checkValeur,
				customValues
			}]);
			if (r.added + r.updated > 0) {
				if (needsSchedule && reminderDate) try {
					const ln = lastName.trim().toLowerCase();
					const fn = firstName.trim().toLowerCase();
					const phoneDigits = (phone || "").replace(/\D+/g, "");
					const linked = prospects.find((p) => {
						const pln = (p.lastName ?? "").toLowerCase();
						const pfn = (p.firstName ?? "").toLowerCase();
						if (pln !== ln || pfn !== fn) return false;
						if (!phoneDigits) return true;
						return ((p.phone ?? "") + (p.mobile ?? "")).replace(/\D+/g, "").includes(phoneDigits.slice(-9));
					});
					await saveEvent({
						title: `${status.startsWith("RDV") ? "RDV" : "Rappel"} — ${firstName.trim()} ${lastName.trim()}`,
						date: reminderDate,
						time: reminderTime || "09:00",
						type: status.startsWith("RDV") ? "rdv" : "rappel",
						agent: finalAssignee ?? user?.username ?? "system",
						prospectId: linked?.id
					});
				} catch (e) {
					console.warn("Failed to create reminder event", e);
				}
				toast.success(sendToDispatch ? "Prospect envoyé en file de dispatch" : "Prospect créé dans votre portefeuille");
				navigate({ to: "/prospects" });
			} else toast.error("Création impossible");
		} catch (e) {
			console.error("Prospect create failed", e);
			const status = e?.status ? ` (HTTP ${e.status})` : "";
			toast.error("Création du prospect échouée" + status, { description: e?.message ?? "Une erreur est survenue côté serveur." });
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Nouveau prospect",
			description: "Renseignez les informations du lead — un RDV ou rappel sera ajouté au calendrier si planifié.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate({ to: "/prospects" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: submit,
					disabled: saving,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
						" ",
						saving ? "Création…" : "Créer le prospect"
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
							children: "Informations du prospect"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Civilité" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: civility,
									onValueChange: (v) => setCivility(v),
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
									value: lastName,
									onChange: (e) => setLastName(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Prénom *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: firstName,
									onChange: (e) => setFirstName(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Téléphone (fixe)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: phone,
									onChange: (e) => setPhone(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mobile / GSM" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: mobile,
									onChange: (e) => setMobile(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2 lg:col-span-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adresse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: address,
									onChange: (e) => setAddress(e.target.value),
									placeholder: "N°, rue, complément…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ville" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: city,
									onChange: (e) => setCity(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Code postal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: postalCode,
									onChange: (e) => setPostalCode(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Source" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: source,
									onValueChange: setSource,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s,
										children: s
									}, s)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Statut" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: status,
									onValueChange: setStatus,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: effectiveStatuses.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: s,
										children: s
									}, s)) })]
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
									value: birthDate,
									onChange: (e) => setBirthDate(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Âge ", birthDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "(auto)"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									max: 130,
									value: age,
									disabled: !!birthDate,
									onChange: (e) => setAge(e.target.value),
									placeholder: birthDate ? "" : "Saisir l'âge"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date de naissance conjoint" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: spouseBirthDate,
									onChange: (e) => setSpouseBirthDate(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Âge conjoint ", spouseBirthDate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "(auto)"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									max: 130,
									value: spouseAge,
									disabled: !!spouseBirthDate,
									onChange: (e) => setSpouseAge(e.target.value),
									placeholder: spouseBirthDate ? "" : "Saisir l'âge"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mutuelle actuelle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: currentMutuelle,
									onChange: (e) => setCurrentMutuelle(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Régime" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: regime || "__none__",
									onValueChange: (v) => setRegime(v === "__none__" ? "" : v),
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
									value: cotisation,
									onChange: (e) => setCotisation(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Check valeur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: checkValeur,
									onValueChange: (v) => setCheckValeur(v),
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nombre d'enfants" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									max: 20,
									value: childrenCount,
									onChange: (e) => {
										const n = Math.max(0, Math.min(20, Number(e.target.value) || 0));
										setChildrenCount(String(n));
										setChildrenAges((prev) => {
											const next = [...prev];
											while (next.length < n) next.push("");
											next.length = n;
											return next;
										});
									}
								})]
							})
						}), Number(childrenCount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3",
							children: Array.from({ length: Number(childrenCount) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Âge enfant ", i + 1] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 0,
									max: 30,
									value: childrenAges[i] ?? "",
									onChange: (e) => {
										setChildrenAges((prev) => {
											const next = [...prev];
											next[i] = e.target.value;
											return next;
										});
									}
								})]
							}, i))
						})]
					})]
				}),
				needsSchedule && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm border-primary/30 bg-primary/5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base text-primary",
							children: status.startsWith("RDV") ? "Planifier le rendez-vous" : "Planifier le rappel"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								ref: dateInputRef,
								type: "date",
								value: reminderDate,
								onChange: (e) => setReminderDate(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Heure" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: reminderTime,
								onChange: (e) => setReminderTime(e.target.value)
							})]
						})]
					})]
				}),
				canDispatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Attribution"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								checked: sendToDispatch,
								onCheckedChange: (v) => setSendToDispatch(!!v)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Envoyer en file de dispatch (au lieu de l'attribuer maintenant)" })]
						}), !sendToDispatch && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigné à" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: assignedTo,
								onValueChange: setAssignedTo,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [user?.username && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: user.username,
									children: [
										"Moi (@",
										user.username,
										")"
									]
								}), agents.filter((a) => a.username !== user?.username).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: a.username,
									children: [
										a.fullName,
										" (@",
										a.username,
										")"
									]
								}, a.username))] })]
							})]
						})]
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
									value: comment,
									onChange: (e) => setComment(e.target.value),
									placeholder: "Notes…"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Demande" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 2,
									value: demande,
									onChange: (e) => setDemande(e.target.value),
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
						variant: "outline",
						onClick: () => navigate({ to: "/prospects" }),
						disabled: saving,
						children: "Annuler"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: submit,
						disabled: saving,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
							" ",
							saving ? "Création…" : "Créer le prospect"
						]
					})]
				})
			]
		})]
	});
}
export { NewProspectPage as component };
