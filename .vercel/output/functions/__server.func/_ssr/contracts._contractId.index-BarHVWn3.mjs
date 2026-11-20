import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout, u as isFieldRole } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button, o as formatDate, r as Input, s as formatDateTime } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { S as useCurrency, d as DropdownMenuItem, f as DropdownMenuLabel, l as DropdownMenu, m as DropdownMenuTrigger, p as DropdownMenuSeparator, u as DropdownMenuContent, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { a as printPage, n as exportJSON, o as toContractExportRows, t as exportCSV } from "./exportUtils-D82gKDXZ.mjs";
import { n as ProspectActivityCard, t as AttachmentsCard } from "./ProspectActivityCard-B2EIw-7j.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { t as CustomFieldsCard } from "./CustomFieldsCard-EcIDLht_.mjs";
import { M as useConfirm, O as Textarea, c as Route$6 } from "./router-BUkYRVTH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Gt as FileSpreadsheet, Q as Plus, Wn as ArrowLeft, Wt as FileText, Z as Printer, Zt as FileBraces, in as Download, n as X, st as MessageSquareWarning } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contracts._contractId.index-BarHVWn3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var billingDotColor = {
	success: "bg-success",
	warning: "bg-warning",
	destructive: "bg-destructive",
	info: "bg-info",
	primary: "bg-primary",
	accent: "bg-accent",
	muted: "bg-muted-foreground/60"
};
function getBillingDotClass(status, options) {
	const option = options.find((o) => o.value === status);
	if (option) return billingDotColor[option.color] ?? "bg-muted-foreground/60";
	if (status === "Validé Confirmation") return "bg-success";
	if (status === "Annuler la confirmation") return "bg-destructive";
	if (status === "En attente de validation") return "bg-warning";
	return "bg-muted-foreground/60";
}
function ContractDetailsPage() {
	const { contractId } = Route$6.useParams();
	const navigate = useNavigate();
	const { contracts, prospects, users, events: calendarEvents, updateContractBilling, getContractActivity, logActivity } = useErp();
	const { options: billingOptions } = useStatusOptions("contract");
	const { user } = useAuth();
	const isAgent = isFieldRole(user?.role);
	const currency = useCurrency();
	const confirmDialog = useConfirm();
	const contract = contracts.find((c) => c.id === contractId);
	const [claimDialogOpen, setClaimDialogOpen] = (0, import_react.useState)(false);
	const [claims, setClaims] = (0, import_react.useState)([]);
	const [activityVersion, setActivityVersion] = (0, import_react.useState)(0);
	const loadClaims = async () => {
		if (!contractId) return;
		try {
			const res = await api("/reclamations.php", { query: {
				contract_id: contractId,
				limit: "50"
			} });
			setClaims(res.reclamations ?? []);
		} catch {}
	};
	(0, import_react.useEffect)(() => {
		loadClaims();
	}, [contractId]);
	const validatedBillingStatuses = (0, import_react.useMemo)(() => new Set(billingOptions.filter((o) => o.color === "success").map((o) => o.value)), [billingOptions]);
	const linkedProspect = (0, import_react.useMemo)(() => {
		if (!contract) return void 0;
		return prospects.find((p) => contract.prospectId && p.id === contract.prospectId) ?? prospects.find((p) => p.lastName === contract.lastName && p.firstName === contract.firstName);
	}, [prospects, contract]);
	const agent = (0, import_react.useMemo)(() => contract ? users.find((u) => u.username === contract.assignedTo) : void 0, [users, contract]);
	const timeline = (0, import_react.useMemo)(() => {
		if (!contract) return [];
		const items = [];
		if (linkedProspect) items.push({
			id: "creation",
			date: linkedProspect.createdAt,
			type: "creation",
			title: "Lead créé",
			description: `Source: ${linkedProspect.source}`,
			done: true
		});
		calendarEvents.filter((e) => e.title.toLowerCase().includes(contract.lastName.toLowerCase())).slice(0, 4).forEach((e) => items.push({
			id: e.id,
			date: e.date,
			time: e.time,
			type: e.type,
			title: e.type === "rdv" ? "Rendez-vous" : e.type === "rappel" ? "Rappel client" : "Signature programmée",
			description: `Avec @${e.agent}`,
			done: new Date(e.date) <= /* @__PURE__ */ new Date()
		}));
		items.push({
			id: "sig",
			date: contract.signatureDate,
			type: "signature",
			title: "Contrat signé",
			description: `${contract.partner} • ${formatAmount(contract.premium, currency)}`,
			done: true
		});
		if (contract.validationDate) items.push({
			id: "val",
			date: contract.validationDate,
			type: "validation",
			title: "Validation backoffice",
			description: contract.billingStatus,
			done: validatedBillingStatuses.has(contract.billingStatus)
		});
		else items.push({
			id: "val",
			date: "—",
			type: "validation",
			title: "Validation backoffice",
			description: "En attente de traitement",
			done: false
		});
		return items.sort((a, b) => a.date === "—" ? 1 : b.date === "—" ? -1 : a.date.localeCompare(b.date));
	}, [
		contract,
		linkedProspect,
		calendarEvents
	]);
	const handleExportCSV = () => {
		if (!contract) return;
		exportCSV(`contrat-${contract.id}.csv`, toContractExportRows([contract]));
		toast.success("Export CSV généré");
	};
	const handleExportJSON = () => {
		if (!contract) return;
		exportJSON(`contrat-${contract.id}.json`, {
			contrat: toContractExportRows([contract])[0],
			parcours: timeline,
			agent: agent?.fullName,
			prospect: linkedProspect ? {
				nom: linkedProspect.lastName,
				prenom: linkedProspect.firstName,
				ville: linkedProspect.city
			} : null
		});
		toast.success("Export JSON généré");
	};
	const handleStatusChange = (status) => {
		if (!contract) return;
		updateContractBilling(contract.id, status);
		toast.success("Statut mis à jour", { description: status });
	};
	if (!contract) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "detail",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Contrat introuvable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-2",
					children: [
						"L'identifiant ",
						contractId,
						" n'existe pas dans la base."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-4",
					variant: "outline",
					onClick: () => navigate({ to: "/contracts" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "detail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: `${contract.firstName} ${contract.lastName}`,
				description: `Fiche contrat ${contract.id}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => navigate({ to: "/contracts" }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 mr-1.5" }), "Exporter"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-44",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
								className: "text-xs",
								children: "Format"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: handleExportCSV,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "CSV"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: handleExportJSON,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBraces, { className: "h-4 w-4 mr-2" }), "JSON"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: printPage,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4 mr-2" }), "Imprimer / PDF"]
							})
						]
					})] }),
					!isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contracts/$contractId/edit",
							params: { contractId: contract.id },
							children: "Modifier"
						})
					}),
					(user?.role === "Administrateur" || user?.role === "Manager") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "destructive",
						onClick: async () => {
							if (!await confirmDialog({
								title: "Supprimer le contrat",
								description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Voulez-vous supprimer définitivement le contrat ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: contract.id }),
									" ?"
								] }),
								destructive: true
							})) return;
							try {
								const { api } = await import("./api-2UuWgcOn.mjs").then((n) => n.o).then((n) => n.o);
								await api(`/contracts.php?id=${encodeURIComponent(contract.id)}`, { method: "DELETE" });
								toast.success("Contrat supprimé");
								navigate({ to: "/contracts" });
							} catch (e) {
								toast.error(e?.message ?? "Échec de la suppression");
							}
						},
						children: "Supprimer"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-md border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "px-5 py-4 border-b border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-[0.14em] text-muted-foreground",
							children: "Fiche contrat"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-xl font-semibold tracking-tight mt-0.5",
							children: [
								contract.civility ?? "",
								" ",
								contract.firstName,
								" ",
								contract.lastName
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-xs text-muted-foreground",
							children: ["N° ", contract.id]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Cotisation annuelle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-base font-semibold",
								children: formatAmount(contract.premium, currency)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Statut facturation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full ${getBillingDotClass(contract.billingStatus, billingOptions)}` }), contract.billingStatus]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Partenaire",
							children: contract.partner
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Assigné à",
							children: agent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/users/$username/edit",
								params: { username: agent.username },
								className: "hover:underline",
								children: agent.fullName
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "—"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden lg:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "sticky top-20 rounded-md border border-border bg-card p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-[0.12em] text-muted-foreground px-2 pb-2",
							children: "Sommaire"
						}), [
							["adherent", "Adhérent"],
							["conjoint", "Conjoint"],
							["adresse", "Adresse"],
							["contrat", "Contrat & cotisation"],
							["produit", "Produit proposé"],
							["mutuelle", "Mutuelle actuelle"],
							["sepa", "Coordonnées SEPA"],
							["actions", "Actions facturation"],
							["parcours", "Parcours client"],
							["commentaires", "Commentaires"],
							["documents", "Pièces jointes"],
							["custom", "Champs personnalisés"],
							["activite", "Journal d'activité"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `#${id}`,
							className: "block px-2 py-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50",
							children: label
						}, id))]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "adherent",
							title: "Adhérent",
							subtitle: "Coordonnées de l'adhérent principal",
							children: [
								linkedProspect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Prospect d'origine",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/prospects/$prospectId",
										params: { prospectId: linkedProspect.id },
										className: "text-primary hover:underline font-mono text-xs",
										children: linkedProspect.id
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Civilité",
									value: contract.civility
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Nom",
									value: contract.lastName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Prénom",
									value: contract.firstName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date de naissance",
									value: formatDate(contract.birthDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Téléphone fixe",
									value: contract.phone ?? linkedProspect?.phone
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Téléphone mobile",
									value: contract.mobile
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Email",
									value: contract.email ?? linkedProspect?.email
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "N° Sécurité sociale",
									value: contract.ssn
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "conjoint",
							title: "Conjoint",
							subtitle: "Optionnel — renseigné si applicable",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Civilité",
									value: contract.spouseCivility
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Nom",
									value: contract.spouseLastName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Prénom",
									value: contract.spouseFirstName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date de naissance",
									value: formatDate(contract.spouseBirthDate)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "adresse",
							title: "Adresse",
							subtitle: "Adresse postale",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Adresse",
									value: contract.address,
									full: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Code postal",
									value: contract.postalCode
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Ville",
									value: contract.city
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Cabinet",
									value: contract.cabinet
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "contrat",
							title: "Contrat & cotisation",
							subtitle: "Données contractuelles",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Cotisation annuelle",
									value: formatAmount(contract.premium, currency)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Partenaire",
									value: contract.partner
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Cabinet",
									value: contract.cabinet
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Source",
									value: contract.source
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date de signature",
									value: formatDate(contract.signatureDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date d'effet",
									value: formatDate(contract.effectiveDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date de validation",
									value: formatDate(contract.validationDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Type de résiliation",
									value: contract.terminationType
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Régime",
									value: contract.regime
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Nombre d'enfants",
									value: contract.childrenCount != null ? String(contract.childrenCount) : null
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Âges des enfants",
									value: contract.childrenAges,
									full: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Assigné à",
									value: contract.assignedTo
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "produit",
							title: "Produit proposé",
							subtitle: "Garanties principales et complémentaires",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Produit",
									value: contract.product
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Options",
									value: contract.productOptions,
									full: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Produit complémentaire",
									value: contract.complementaryProduct
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Cotisation complémentaire",
									value: contract.complementaryPremium != null ? formatAmount(contract.complementaryPremium, currency) : null
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date d'effet complémentaire",
									value: formatDate(contract.complementaryEffectiveDate)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "mutuelle",
							title: "Mutuelle actuelle",
							subtitle: "Couverture en cours du client",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Organisme",
									value: contract.currentMutuelle
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "N° d'adhésion",
									value: contract.adhesionNumber
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Membre principal",
									value: contract.principalMember
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Cotisation actuelle",
									value: contract.previousPremium != null ? formatAmount(contract.previousPremium, currency) : null
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date d'échéance",
									value: formatDate(contract.currentExpiryDate)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "sepa",
							title: "Coordonnées SEPA",
							subtitle: "Mandat de prélèvement",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Titulaire — Nom",
									value: contract.bankHolderLastName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Titulaire — Prénom",
									value: contract.bankHolderFirstName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "IBAN",
									value: contract.iban ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs",
										children: contract.iban
									}) : null,
									full: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "BIC",
									value: contract.bic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs",
										children: contract.bic
									}) : null
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date de prélèvement",
									value: formatDate(contract.debitDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Type de prélèvement",
									value: contract.debitType
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "actions",
							title: "Actions facturation",
							subtitle: "Statut et cotisation",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs text-muted-foreground",
										children: "Statut de facturation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: contract.billingStatus,
										onValueChange: handleStatusChange,
										disabled: isAgent,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: billingOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: option.value,
											children: option.value
										}, option.id)) })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs text-muted-foreground",
										children: "Cotisation annuelle"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: formatAmount(contract.premium, currency),
											readOnly: true,
											className: "bg-muted/30"
										}), !isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "outline",
											size: "sm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/contracts/$contractId/edit",
												params: { contractId: contract.id },
												children: "Éditer"
											})
										})]
									})]
								})]
							}), !isAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-full flex flex-wrap gap-2 pt-3 border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => handleStatusChange("Validé Confirmation"),
										children: "Valider"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => handleStatusChange("En attente de validation"),
										children: "Mettre en attente"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => handleStatusChange("Annuler la confirmation"),
										children: "Annuler la confirmation"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							id: "parcours",
							title: "Parcours client",
							subtitle: "RDV, rappels et signature",
							plain: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "relative border-l border-border ml-2 space-y-4",
								children: timeline.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "ml-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute -left-[5px] mt-1.5 h-2 w-2 rounded-full ${t.done ? "bg-foreground" : "bg-muted-foreground/40"}` }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-baseline gap-x-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
													className: "text-sm font-medium",
													children: t.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-muted-foreground",
													children: [formatDate(t.date) ?? "—", t.time ? ` • ${t.time}` : ""]
												}),
												!t.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] uppercase tracking-wider text-muted-foreground",
													children: "à venir"
												})
											]
										}),
										t.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: t.description
										})
									]
								}, t.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "commentaires",
							title: "Commentaires",
							subtitle: "Notes internes liées au contrat",
							plain: true,
							children: [contract.commercialComment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 rounded-md border border-border bg-muted/30 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1",
									children: "Commentaire commercial — saisi à la création"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm whitespace-pre-wrap",
									children: contract.commercialComment
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentsThread, { contract })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							id: "reclamations",
							title: "Réclamations (Claims)",
							subtitle: "Gestion des tickets et réclamations client",
							plain: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [claims.length, " réclamation(s) enregistrée(s)"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: () => setClaimDialogOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), " Nouvelle réclamation"]
								})]
							}), claims.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareWarning, { className: "h-8 w-8 mx-auto mb-2 text-muted-foreground/50" }),
									"Aucune réclamation enregistrée pour ce contrat.",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => setClaimDialogOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Ouvrir une réclamation"]
										})
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border text-left text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 pr-3 font-medium",
												children: "Référence"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-medium",
												children: "Service"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-medium",
												children: "Description"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-medium",
												children: "Priorité"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 px-3 font-medium",
												children: "Statut"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-2 pl-3 font-medium text-right",
												children: "Date"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y divide-border/60",
										children: claims.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-muted/40 transition-colors",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 pr-3 font-mono font-medium text-primary",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/reclamations/$id",
														params: { id: String(r.id) },
														className: "hover:underline",
														children: r.reference
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-3",
													children: r.service
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-3 max-w-[240px] truncate text-muted-foreground",
													children: r.description || "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "capitalize",
														children: r.priority
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 px-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${r.audit_status === "resolu" ? "bg-success/10 text-success border-success/20" : r.audit_status === "annule" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`,
														children: r.audit_status === "resolu" ? "Résolu" : r.audit_status === "annule" ? "Annulé" : "En cours"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "py-2.5 pl-3 text-right text-muted-foreground",
													children: formatDate(r.date_creation) ?? "—"
												})
											]
										}, r.id))
									})]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							id: "documents",
							title: "Pièces jointes",
							subtitle: "Documents associés au contrat",
							plain: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentsCard, {
								entity: "contract",
								entityId: contract.id,
								onAdded: (a) => logActivity(contract.id, "attachment_added", "", `${a.filename} (${(a.sizeBytes / 1024).toFixed(1)} Ko)`),
								onRemoved: (a) => logActivity(contract.id, "attachment_removed", `${a.filename} (${(a.sizeBytes / 1024).toFixed(1)} Ko)`, "")
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							id: "custom",
							title: "Champs personnalisés",
							subtitle: "Définis dans la configuration",
							plain: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomFieldsCard, {
								entity: "contract",
								entityId: contract.id
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							id: "activite",
							title: "Journal d'activité",
							subtitle: "Historique des changements",
							plain: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProspectActivityCard, { contractId: contract.id })
						})
					]
				})]
			})
		]
	});
}
function Section({ id, title, subtitle, children, plain }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id,
		className: "rounded-md border border-border bg-card scroll-mt-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "px-5 py-3 border-b border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold tracking-tight",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-0.5",
				children: subtitle
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: plain ? "p-5" : "p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3",
			children
		})]
	});
}
function isEmptyValue(v) {
	if (v === null || v === void 0) return true;
	if (typeof v === "number") return Number.isNaN(v);
	if (typeof v === "string") {
		const s = v.trim().toLowerCase();
		return s === "" || s === "null" || s === "undefined" || s === "invalid date" || s === "nan";
	}
	return false;
}
function Placeholder() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground/70 select-none",
		"aria-label": "Non renseigné",
		title: "Non renseigné",
		children: "—"
	});
}
function Row({ label, value, full }) {
	const display = isEmptyValue(value) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Placeholder, {}) : value;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-baseline gap-3 border-b border-dashed border-border/60 pb-2 min-h-[28px] ${full ? "sm:col-span-2" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted-foreground min-w-[160px] shrink-0",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-sm font-medium text-foreground flex-1 break-words",
			children: display
		})]
	});
}
function Cell({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 py-3 min-h-[58px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] uppercase tracking-[0.12em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-medium mt-1",
			children: isEmptyValue(children) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Placeholder, {}) : children
		})]
	});
}
function CommentsThread({ contract }) {
	const STORAGE_KEY = `erp_comments_${contract.id}`;
	const [list, setList] = (0, import_react.useState)(() => {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
		} catch {
			return [];
		}
	});
	const [draft, setDraft] = (0, import_react.useState)("");
	const { user } = useAuth();
	const save = (next) => {
		setList(next);
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {}
	};
	const add = () => {
		const t = draft.trim();
		if (!t) return;
		save([{
			id: `c-${Date.now()}`,
			user: user?.username ?? "—",
			text: t,
			ts: (/* @__PURE__ */ new Date()).toISOString()
		}, ...list]);
		setDraft("");
		toast.success("Commentaire ajouté");
	};
	const remove = (id) => save(list.filter((c) => c.id !== id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: draft,
				onChange: (e) => setDraft(e.target.value),
				rows: 2,
				placeholder: "Ajouter un commentaire interne…"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: add,
				className: "self-end",
				size: "sm",
				children: "Ajouter"
			})]
		}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground text-center py-4",
			children: "Aucun commentaire pour le moment."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: list.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "py-3 flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-medium",
							children: ["@", c.user]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground ml-auto",
							children: formatDateTime(c.ts) ?? "—"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm mt-0.5 whitespace-pre-wrap",
						children: c.text
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "h-7 w-7 shrink-0",
					onClick: () => remove(c.id),
					"aria-label": "Supprimer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
				})]
			}, c.id))
		})]
	});
}
export { ContractDetailsPage as component };
