import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { O as Textarea, u as Route$17 } from "./router-Dkp91uPV.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { t as CustomFieldsInline } from "./CustomFieldsInline-CexI4zZF.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as useOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as Save, Jt as FilePenLine, Wn as ArrowLeft, et as Pencil, v as TriangleAlert } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contracts.new-CJ0cqSFW.js
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
function NewContractPage() {
	const navigate = useNavigate();
	const { prospectId } = Route$17.useSearch();
	const { importContracts, users, prospects, updateProspect } = useErp();
	const { user } = useAuth();
	const isAdmin = user?.role === "Administrateur" || user?.role === "Manager";
	const SOURCES = useOptionList("contract", "source").values;
	const PARTNERS = useOptionList("contract", "partner").values;
	const PRODUCTS = useOptionList("contract", "product").values;
	const CABINETS = useOptionList("contract", "cabinet").values;
	const DEBIT_TYPES = useOptionList("contract", "debit_type").values;
	const TERMINATION_TYPES = useOptionList("contract", "termination_type").values;
	const REGIMES = useOptionList("contract", "regime").values;
	const CIVILITIES = useOptionList("contract", "civility").values;
	const sourceProspect = (0, import_react.useMemo)(() => prospectId ? prospects.find((p) => p.id === prospectId) : void 0, [prospects, prospectId]);
	const pf = (v, fallback) => v === null || v === void 0 ? fallback : v;
	const [assignedTo, setAssignedTo] = (0, import_react.useState)(sourceProspect?.assignedTo ?? user?.username ?? "");
	const [source, setSource] = (0, import_react.useState)(sourceProspect?.source ?? SOURCES[3]);
	const [civility, setCivility] = (0, import_react.useState)(sourceProspect?.civility ?? "");
	const [lastName, setLastName] = (0, import_react.useState)(sourceProspect?.lastName ?? "");
	const [firstName, setFirstName] = (0, import_react.useState)(sourceProspect?.firstName ?? "");
	const [phone, setPhone] = (0, import_react.useState)(sourceProspect?.phone ?? "");
	const [mobile, setMobile] = (0, import_react.useState)(pf(sourceProspect?.mobile, ""));
	const [email, setEmail] = (0, import_react.useState)(sourceProspect?.email ?? "");
	const [birthDate, setBirthDate] = (0, import_react.useState)(pf(sourceProspect?.birthDate, ""));
	const [address, setAddress] = (0, import_react.useState)(pf(sourceProspect?.address, ""));
	const [postalCode, setPostalCode] = (0, import_react.useState)(pf(sourceProspect?.postalCode, ""));
	const [city, setCity] = (0, import_react.useState)(sourceProspect?.city ?? "");
	const [currentMutuelle, setCurrentMutuelle] = (0, import_react.useState)(pf(sourceProspect?.currentMutuelle, ""));
	const [ssn, setSsn] = (0, import_react.useState)("");
	const [adhesionNumber, setAdhesionNumber] = (0, import_react.useState)("");
	const [principalMember, setPrincipalMember] = (0, import_react.useState)("");
	const [previousPremium, setPreviousPremium] = (0, import_react.useState)(sourceProspect?.cotisation != null ? String(sourceProspect.cotisation) : "");
	const [currentExpiryDate, setCurrentExpiryDate] = (0, import_react.useState)("");
	const [partner, setPartner] = (0, import_react.useState)("");
	const [product, setProduct] = (0, import_react.useState)("");
	const [productOptions, setProductOptions] = (0, import_react.useState)("");
	const [signatureDate, setSignatureDate] = (0, import_react.useState)("");
	const [premium, setPremium] = (0, import_react.useState)("");
	const [cabinet, setCabinet] = (0, import_react.useState)(CABINETS[0]);
	const [effectiveDate, setEffectiveDate] = (0, import_react.useState)("");
	const [complementaryProduct, setComplementaryProduct] = (0, import_react.useState)("");
	const [complementaryPremium, setComplementaryPremium] = (0, import_react.useState)("");
	const [complementaryEffectiveDate, setComplementaryEffectiveDate] = (0, import_react.useState)("");
	const [spouseCivility, setSpouseCivility] = (0, import_react.useState)("");
	const [spouseLastName, setSpouseLastName] = (0, import_react.useState)("");
	const [spouseFirstName, setSpouseFirstName] = (0, import_react.useState)("");
	const [spouseBirthDate, setSpouseBirthDate] = (0, import_react.useState)(pf(sourceProspect?.spouseBirthDate, ""));
	const [bankHolderLastName, setBankHolderLastName] = (0, import_react.useState)("");
	const [bankHolderFirstName, setBankHolderFirstName] = (0, import_react.useState)("");
	const [iban, setIban] = (0, import_react.useState)("");
	const [bic, setBic] = (0, import_react.useState)("");
	const [debitDate, setDebitDate] = (0, import_react.useState)("");
	const [debitType, setDebitType] = (0, import_react.useState)(DEBIT_TYPES[0]);
	const initialComment = [sourceProspect?.demande, sourceProspect?.comment].filter(Boolean).join("\n\n");
	const [commercialComment, setCommercialComment] = (0, import_react.useState)(initialComment);
	const [terminationType, setTerminationType] = (0, import_react.useState)("");
	const [regime, setRegime] = (0, import_react.useState)(pf(sourceProspect?.regime, ""));
	const initialChildrenCount = sourceProspect?.childrenCount != null ? String(sourceProspect.childrenCount) : "0";
	const initialChildrenAges = sourceProspect?.childrenAges ? sourceProspect.childrenAges.split(",").map((s) => s.trim()) : [];
	const [childrenCount, setChildrenCount] = (0, import_react.useState)(initialChildrenCount);
	const [childrenAges, setChildrenAges] = (0, import_react.useState)(initialChildrenAges);
	const [customValues, setCustomValues] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const agents = users.filter((u) => isAssignableRole(u.role) || u.role === "Administrateur");
	const submit = async () => {
		if (!lastName.trim() && !firstName.trim() && !email.trim() && !phone.trim() && !mobile.trim()) {
			toast.error("Renseignez au moins un nom, un email ou un téléphone");
			return;
		}
		setSaving(true);
		try {
			const payloadWithCustom = {
				prospectId: sourceProspect?.id ?? null,
				lastName: lastName.trim(),
				firstName: firstName.trim(),
				city: city.trim().toUpperCase(),
				partner: partner || "NEOLIANE",
				cabinet,
				signatureDate: signatureDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				effectiveDate: effectiveDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				premium: Number(premium) || 0,
				billingStatus: "Pré-validé",
				source,
				assignedTo: assignedTo || user?.username || "—",
				civility: civility || null,
				phone: phone || null,
				mobile: mobile || null,
				email: email || null,
				birthDate: birthDate || null,
				address: address || null,
				postalCode: postalCode || null,
				currentMutuelle: currentMutuelle || null,
				ssn: ssn || null,
				adhesionNumber: adhesionNumber || null,
				principalMember: principalMember || null,
				previousPremium: previousPremium ? Number(previousPremium) : null,
				currentExpiryDate: currentExpiryDate || null,
				product: product || null,
				productOptions: productOptions || null,
				complementaryProduct: complementaryProduct || null,
				complementaryPremium: complementaryPremium ? Number(complementaryPremium) : null,
				complementaryEffectiveDate: complementaryEffectiveDate || null,
				spouseCivility: spouseCivility || null,
				spouseLastName: spouseLastName || null,
				spouseFirstName: spouseFirstName || null,
				spouseBirthDate: spouseBirthDate || null,
				bankHolderLastName: bankHolderLastName || null,
				bankHolderFirstName: bankHolderFirstName || null,
				iban: iban || null,
				bic: bic || null,
				debitDate: debitDate || null,
				debitType: debitType || null,
				terminationType: terminationType || null,
				regime: regime || null,
				childrenCount: Number(childrenCount) || null,
				childrenAges: childrenAges.filter((a) => a !== "").join(",") || null,
				commercialComment: commercialComment || null,
				...Object.keys(customValues).length > 0 ? { customValues } : {}
			};
			const r = await importContracts([payloadWithCustom]);
			if (r.added + r.updated > 0) {
				if (sourceProspect) try {
					await updateProspect(sourceProspect.id, {
						outcome: "won",
						status: "Vente"
					});
				} catch {}
				toast.success(sourceProspect ? "Prospect converti en contrat" : "Contrat créé");
				navigate({ to: "/contracts" });
			} else toast.error("Création impossible");
		} catch (e) {
			toast.error(e?.message ?? "Erreur lors de la création");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Nouveau contrat",
			description: "Tous les champs sont optionnels — remplissez ce que vous avez.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate({ to: "/contracts" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: submit,
					disabled: saving,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
						" ",
						saving ? "Enregistrement…" : "Créer le contrat"
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4",
			children: [
				sourceProspect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-success/40 bg-success/10 p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 mt-0.5 flex-shrink-0 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm font-semibold",
									children: [
										"Conversion du prospect",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/prospects/$prospectId",
											params: { prospectId: sourceProspect.id },
											className: "underline underline-offset-2",
											children: [
												sourceProspect.firstName,
												" ",
												sourceProspect.lastName,
												" (",
												sourceProspect.id,
												")"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									variant: "outline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/prospects/$prospectId/edit",
										params: { prospectId: sourceProspect.id },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5 mr-1.5" }), " Compléter la fiche prospect"]
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-1",
								children: "Les champs renseignés sur la fiche prospect sont déjà pré-remplis ci-dessous. Vous pouvez aussi les saisir ou les compléter directement dans le contrat."
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Détail Client",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Assigné à",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: assignedTo || "__me__",
								onValueChange: (v) => setAssignedTo(v === "__me__" ? user?.username ?? "" : v),
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
							label: "Source prospect",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: source,
								onValueChange: setSource,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SOURCES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s,
									children: s
								}, s)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Civilité",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: civility || "__none__",
								onValueChange: (v) => setCivility(v === "__none__" ? "" : v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), CIVILITIES.filter(Boolean).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c,
									children: c
								}, c))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: lastName,
								onChange: (e) => setLastName(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prénom",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: firstName,
								onChange: (e) => setFirstName(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Téléphone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: phone,
								onChange: (e) => setPhone(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tél mobile",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: mobile,
								onChange: (e) => setMobile(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de naissance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: birthDate,
								onChange: (e) => setBirthDate(e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Détails Adresse",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Adresse",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: address,
								onChange: (e) => setAddress(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Code postal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: postalCode,
								onChange: (e) => setPostalCode(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ville",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: city,
								onChange: (e) => setCity(e.target.value),
								placeholder: "PARIS"
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
								value: currentMutuelle,
								onChange: (e) => setCurrentMutuelle(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Numéro Sécurité Sociale",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: ssn,
								onChange: (e) => setSsn(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Numéro d'adhésion",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: adhesionNumber,
								onChange: (e) => setAdhesionNumber(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Adhérent principale",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: principalMember,
								onChange: (e) => setPrincipalMember(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ancien montant de cotisation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: previousPremium,
								onChange: (e) => setPreviousPremium(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date d'échéance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: currentExpiryDate,
								onChange: (e) => setCurrentExpiryDate(e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Produit Proposé",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Partenaire santé",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: partner || "__none__",
								onValueChange: (v) => setPartner(v === "__none__" ? "" : v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir une option" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "Choisir une option"
								}), PARTNERS.filter(Boolean).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p,
									children: p
								}, p))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Produit santé",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: product || "__none__",
								onValueChange: (v) => setProduct(v === "__none__" ? "" : v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir une option" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "Choisir une option"
								}), PRODUCTS.filter(Boolean).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p,
									children: p
								}, p))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Options",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: productOptions,
								onChange: (e) => setProductOptions(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de signature",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: signatureDate,
								onChange: (e) => setSignatureDate(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Montant de cotisation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: premium,
								onChange: (e) => setPremium(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Cabinet",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: cabinet,
								onValueChange: setCabinet,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir une option" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CABINETS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c,
									children: c
								}, c)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date effet",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: effectiveDate,
								onChange: (e) => setEffectiveDate(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Type de résiliation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: terminationType || "__none__",
								onValueChange: (v) => setTerminationType(v === "__none__" ? "" : v),
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
								value: regime || "__none__",
								onValueChange: (v) => setRegime(v === "__none__" ? "" : v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), REGIMES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: r,
									children: r
								}, r))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Produit complémentaire santé",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: complementaryProduct || "__none__",
								onValueChange: (v) => setComplementaryProduct(v === "__none__" ? "" : v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir une option" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "Choisir une option"
								}), PRODUCTS.filter(Boolean).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: p,
									children: p
								}, p))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Montant cotisation complémentaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								value: complementaryPremium,
								onChange: (e) => setComplementaryPremium(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date d'effet complémentaire",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: complementaryEffectiveDate,
								onChange: (e) => setComplementaryEffectiveDate(e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Informations Conjoint",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Civilité",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: spouseCivility || "__none__",
								onValueChange: (v) => setSpouseCivility(v === "__none__" ? "" : v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "—" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__none__",
									children: "—"
								}), CIVILITIES.filter(Boolean).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: c,
									children: c
								}, c))] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: spouseLastName,
								onChange: (e) => setSpouseLastName(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prénom",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: spouseFirstName,
								onChange: (e) => setSpouseFirstName(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de naissance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: spouseBirthDate,
								onChange: (e) => setSpouseBirthDate(e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Enfants",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nombre d'enfants",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
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
						})
					}), Array.from({ length: Number(childrenCount) || 0 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `Âge enfant ${i + 1}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							max: 30,
							value: childrenAges[i] ?? "",
							onChange: (e) => {
								setChildrenAges((prev) => {
									const next = [...prev];
									while (next.length <= i) next.push("");
									next[i] = e.target.value;
									return next;
								});
							}
						})
					}, i))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Coordonnées Bancaires",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nom titulaire du compte",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: bankHolderLastName,
								onChange: (e) => setBankHolderLastName(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prénom titulaire du compte",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: bankHolderFirstName,
								onChange: (e) => setBankHolderFirstName(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "IBAN",
							span: 2,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: iban,
								onChange: (e) => setIban(e.target.value),
								placeholder: "FR76…"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "BIC",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: bic,
								onChange: (e) => setBic(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Date de prélèvement",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: debitDate,
								onChange: (e) => setDebitDate(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Type de prélèvement",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: debitType,
								onValueChange: setDebitType,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DEBIT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t,
									children: t
								}, t)) })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base font-semibold text-muted-foreground uppercase tracking-wide",
							children: "Commentaires Commercial"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 4,
						value: commercialComment,
						onChange: (e) => setCommercialComment(e.target.value),
						placeholder: "Notes du commercial, contexte de la vente, suivi…"
					}) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base font-semibold text-muted-foreground uppercase tracking-wide",
							children: "Informations Complémentaires"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomFieldsInline, {
							entity: "contract",
							values: customValues,
							onChange: setCustomValues,
							hideHeader: true
						}), Object.keys(customValues).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "col-span-2 text-xs text-muted-foreground",
							children: [
								"Aucun champ supplémentaire n'est configuré. Un administrateur peut en ajouter depuis ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: "Configuration → Champs personnalisés (Contrat)"
								}),
								"."
							]
						})]
					}) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-end gap-2 pb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => navigate({ to: "/contracts" }),
						disabled: saving,
						children: "Annuler"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: submit,
						disabled: saving,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
							" ",
							saving ? "Enregistrement…" : "Créer le contrat"
						]
					})]
				})
			]
		})]
	});
}
export { NewContractPage as component };
