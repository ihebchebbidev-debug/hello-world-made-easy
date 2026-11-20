import { i as __toESM } from "../_runtime.mjs";
import { l as isAssignableRole, t as AppLayout, u as isFieldRole } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button, o as formatDate, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { M as useConfirm, O as Textarea, o as Route$4 } from "./router-Dkp91uPV.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { S as useCurrency, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { n as ProspectActivityCard, t as AttachmentsCard } from "./ProspectActivityCard-B2EIw-7j.mjs";
import { t as CustomFieldsCard } from "./CustomFieldsCard-D2zGZDV2.mjs";
import { n as useStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { On as CalendarPlus, Q as Plus, Wn as ArrowLeft, un as ClipboardList } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/prospects._prospectId.index-q9fKA74k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function outcomeLabel(o) {
	return o === "won" ? "Vente conclue" : o === "lost" ? "Perdu" : "En cours";
}
function checkLabel(c) {
	return c === "valid" ? "Validé" : c === "invalid" ? "Invalide" : "En attente";
}
function dotColor(kind) {
	return kind === "ok" ? "bg-success" : kind === "ko" ? "bg-destructive" : kind === "warn" ? "bg-warning" : "bg-muted-foreground/60";
}
function ProspectDetailPage() {
	const { prospectId } = Route$4.useParams();
	const navigate = useNavigate();
	const { prospects, users, events, contracts, updateProspect, markLost, saveEvent, deleteProspect } = useErp();
	const { values: STATUS_OPTIONS } = useStatusOptions("prospect");
	const currency = useCurrency();
	const { user, hasPermission } = useAuth();
	const isAgent = isFieldRole(user?.role);
	const canReassign = user?.role === "Administrateur" || user?.role === "Manager" || hasPermission("prospect.assign");
	const confirmDialog = useConfirm();
	const prospect = (0, import_react.useMemo)(() => prospects.find((p) => p.id === prospectId), [prospects, prospectId]);
	const agent = (0, import_react.useMemo)(() => users.find((u) => u.username === prospect?.assignedTo), [users, prospect]);
	const [comment, setComment] = (0, import_react.useState)(prospect?.comment ?? "");
	(0, import_react.useEffect)(() => {
		setComment(prospect?.comment ?? "");
	}, [prospect?.comment]);
	const [pendingStatus, setPendingStatus] = (0, import_react.useState)(null);
	const [reminderDate, setReminderDate] = (0, import_react.useState)("");
	const [reminderTime, setReminderTime] = (0, import_react.useState)("09:00");
	const [savingEvent, setSavingEvent] = (0, import_react.useState)(false);
	const linkedEvents = (0, import_react.useMemo)(() => {
		if (!prospect) return [];
		const needle = `${prospect.firstName} ${prospect.lastName}`.toLowerCase();
		return events.filter((e) => e.title.toLowerCase().includes(needle)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
	}, [events, prospect]);
	const linkedContracts = (0, import_react.useMemo)(() => {
		if (!prospect) return [];
		const direct = contracts.filter((c) => c.prospectId === prospect.id);
		if (direct.length) return direct;
		const ln = prospect.lastName.toLowerCase();
		const fn = prospect.firstName.toLowerCase();
		return contracts.filter((c) => c.lastName.toLowerCase() === ln && c.firstName.toLowerCase() === fn);
	}, [contracts, prospect]);
	if (!prospect) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "detail",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Prospect introuvable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-2",
					children: [
						"L'identifiant ",
						prospectId,
						" n'existe pas."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-4",
					variant: "outline",
					onClick: () => navigate({ to: "/prospects" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
				})
			]
		})
	});
	if (isAgent && prospect.assignedTo !== user?.username) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "detail",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Accès restreint"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2",
					children: "Ce prospect n'est pas dans votre portefeuille."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-4",
					variant: "outline",
					onClick: () => navigate({ to: "/prospects" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
				})
			]
		})
	});
	const saveComment = async () => {
		await updateProspect(prospect.id, { comment });
		toast.success("Commentaire enregistré");
	};
	const needsSchedule = (s) => s.startsWith("RDV") || s.startsWith("A recontacter") || s.startsWith("Devis");
	const scheduleKind = (s) => {
		if (s.startsWith("RDV")) return {
			type: "rdv",
			label: "RDV"
		};
		if (s.startsWith("Devis")) return {
			type: "devis",
			label: "Devis"
		};
		return {
			type: "rappel",
			label: "Rappel"
		};
	};
	const dateInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!pendingStatus) return;
		const t = setTimeout(() => {
			const el = dateInputRef.current;
			if (!el) return;
			el.focus();
			const anyEl = el;
			try {
				anyEl.showPicker?.();
			} catch {}
		}, 80);
		return () => clearTimeout(t);
	}, [pendingStatus]);
	const changeStatus = async (status) => {
		if (status === "Vente") {
			navigate({
				to: "/contracts/new",
				search: { prospectId: prospect.id }
			});
			return;
		}
		if (needsSchedule(status)) {
			setPendingStatus(status);
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			setReminderDate(today);
			return;
		}
		await updateProspect(prospect.id, { status });
		toast.success("Statut mis à jour", { description: status });
	};
	const confirmSchedule = async () => {
		if (!pendingStatus || !reminderDate) {
			toast.error("Choisissez une date");
			return;
		}
		setSavingEvent(true);
		try {
			const { type, label } = scheduleKind(pendingStatus);
			await saveEvent({
				title: `${label} — ${prospect.firstName} ${prospect.lastName}`,
				date: reminderDate,
				time: reminderTime || "09:00",
				type,
				agent: prospect.assignedTo ?? user?.username ?? "system",
				prospectId: prospect.id
			});
			await updateProspect(prospect.id, { status: pendingStatus });
			toast.success(`${label} ajouté au calendrier`);
			setPendingStatus(null);
		} catch (e) {
			toast.error(e?.message ?? "Impossible d'ajouter au calendrier");
		} finally {
			setSavingEvent(false);
		}
	};
	const changeAssignee = async (assignedTo) => {
		await updateProspect(prospect.id, { assignedTo: assignedTo === "__none__" ? null : assignedTo });
		toast.success("Assignation mise à jour");
	};
	const customValues = prospect.customValues ?? {};
	const customEntries = Object.entries(customValues).filter(([, v]) => v !== "" && v != null);
	const outcomeKind = prospect.outcome === "won" ? "ok" : prospect.outcome === "lost" ? "ko" : "neutral";
	const checkKind = prospect.checkValeur === "valid" ? "ok" : prospect.checkValeur === "invalid" ? "ko" : "warn";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "detail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: `${prospect.civility} ${prospect.firstName} ${prospect.lastName}`,
				description: `Fiche prospect ${prospect.id}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-5 w-5" }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => navigate({ to: "/prospects" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => navigate({
								to: "/calendar",
								search: {
									prospectId: prospect.id,
									newEvent: "1"
								}
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "h-4 w-4 mr-1.5" }), "Planifier RDV"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: async () => {
								await markLost(prospect.id, "Non précisé");
								toast.success("Marqué comme Perdu");
							},
							children: "Marquer perdu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => navigate({
								to: "/contracts/new",
								search: { prospectId: prospect.id }
							}),
							children: "Convertir en contrat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/prospects/$prospectId/edit",
								params: { prospectId: prospect.id },
								children: "Modifier"
							})
						}),
						(user?.role === "Administrateur" || user?.role === "Manager") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "destructive",
							onClick: async () => {
								if (!await confirmDialog({
									title: "Supprimer le prospect",
									description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										"Voulez-vous supprimer définitivement le prospect ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: prospect.id }),
										" ?"
									] }),
									destructive: true
								})) return;
								try {
									await deleteProspect(prospect.id);
									toast.success("Prospect supprimé");
									navigate({ to: "/prospects" });
								} catch (e) {
									toast.error(e?.message ?? "Échec de la suppression");
								}
							},
							children: "Supprimer"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-md border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "px-5 py-4 border-b border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-[0.14em] text-muted-foreground",
							children: "Fiche prospect"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-xl font-semibold tracking-tight mt-0.5",
							children: [
								prospect.civility,
								" ",
								prospect.firstName,
								" ",
								prospect.lastName
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-xs text-muted-foreground",
							children: ["N° ", prospect.id]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Statut",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full ${dotColor("neutral")}` }), prospect.status]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Résultat",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full ${dotColor(outcomeKind)}` }), outcomeLabel(prospect.outcome)]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							label: "Check valeur",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-1.5 w-1.5 rounded-full ${dotColor(checkKind)}` }), checkLabel(prospect.checkValeur)]
							})
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
								children: "Non attribué"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Identité",
							subtitle: "Informations civiles",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Civilité",
									value: prospect.civility
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Nom",
									value: prospect.lastName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Prénom",
									value: prospect.firstName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date de naissance",
									value: formatDate(prospect.birthDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Âge",
									value: prospect.age != null ? `${prospect.age} ans` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Date de naissance conjoint",
									value: formatDate(prospect.spouseBirthDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Âge conjoint",
									value: prospect.spouseAge != null ? `${prospect.spouseAge} ans` : "—"
								}),
								(prospect.childrenCount != null || prospect.childrenAges) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Nombre d'enfants",
									value: prospect.childrenCount != null ? String(prospect.childrenCount) : "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Âges des enfants",
									value: prospect.childrenAges || "—",
									full: true
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Coordonnées",
							subtitle: "Téléphone, email, adresse",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Téléphone fixe",
									value: prospect.phone
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Mobile / GSM",
									value: prospect.mobile
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Email",
									value: prospect.email
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Adresse",
									value: prospect.address,
									full: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Code postal",
									value: prospect.postalCode
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Ville",
									value: prospect.city
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Profil santé",
							subtitle: "Mutuelle actuelle et tarif estimé",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Régime",
									value: prospect.regime
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Mutuelle actuelle",
									value: prospect.currentMutuelle
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Cotisation actuelle",
									value: prospect.cotisation != null ? formatAmount(prospect.cotisation, currency) : "—"
								}),
								prospect.demande && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Demande",
									value: prospect.demande,
									full: true
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Suivi commercial",
							subtitle: "Statut d'appel, planification et notes",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-full",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs text-muted-foreground",
											children: "Statut d'appel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: pendingStatus ?? prospect.status,
											onValueChange: changeStatus,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUS_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: s,
												children: s
											}, s)) })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs text-muted-foreground",
											children: "Assigné à"
										}), canReassign ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: prospect.assignedTo ?? "__none__",
											onValueChange: changeAssignee,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "__none__",
												children: "Non attribué"
											}), users.filter((u) => isAssignableRole(u.role)).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: u.username,
												children: [
													u.fullName,
													" (@",
													u.username,
													")"
												]
											}, u.username))] })]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-9 px-3 rounded-md border border-input bg-muted/30 flex items-center text-sm",
											children: prospect.assignedTo ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "italic text-muted-foreground",
												children: "Non attribué"
											})
										})]
									})]
								}),
								pendingStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-full rounded-md border border-border p-4 space-y-3 bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium",
											children: pendingStatus.startsWith("RDV") ? "Planifier le rendez-vous" : pendingStatus.startsWith("Devis") ? "Planifier le devis" : "Planifier le rappel"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs text-muted-foreground",
													children: "Date"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													ref: dateInputRef,
													type: "date",
													value: reminderDate,
													onChange: (e) => setReminderDate(e.target.value)
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs text-muted-foreground",
													children: "Heure"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "time",
													value: reminderTime,
													onChange: (e) => setReminderTime(e.target.value)
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-end gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => setPendingStatus(null),
												disabled: savingEvent,
												children: "Annuler"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												onClick: confirmSchedule,
												disabled: savingEvent,
												children: savingEvent ? "Enregistrement…" : "Ajouter au calendrier"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-full space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs text-muted-foreground",
											children: "Commentaire"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 4,
											value: comment,
											onChange: (e) => setComment(e.target.value),
											placeholder: "Notes de suivi…"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex justify-end",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												onClick: saveComment,
												children: "Enregistrer"
											})
										})
									]
								})
							]
						}),
						customEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Données personnalisées",
							subtitle: "Champs renseignés à la création",
							children: customEntries.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: k,
								value: String(v)
							}, k))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Pièces jointes",
							subtitle: "Documents associés à ce prospect",
							plain: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentsCard, {
								entity: "prospect",
								entityId: prospect.id
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Champs personnalisés",
							subtitle: "Définis dans la configuration",
							plain: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomFieldsCard, {
								entity: "prospect",
								entityId: prospect.id
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Historique complet",
							subtitle: "Audit : qui a fait quoi et quand sur cette fiche",
							plain: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProspectActivityCard, { prospectId: prospect.id }, activityVersion)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Synthèse",
							subtitle: `Créé le ${formatDate(prospect.createdAt) ?? "—"}`,
							cols: 1,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Identifiant",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs",
										children: prospect.id
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Source",
									value: prospect.source
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Statut",
									value: prospect.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Résultat",
									value: outcomeLabel(prospect.outcome)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Check valeur",
									value: checkLabel(prospect.checkValeur)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									label: "Agent",
									value: agent ? agent.fullName : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "italic text-muted-foreground",
										children: "Non assigné"
									})
								})
							]
						}),
						prospect.outcome === "lost" && prospect.lostReason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Raison de la perte",
							cols: 1,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "col-span-full text-sm",
								children: prospect.lostReason
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
							title: "Réclamations (Claims)",
							subtitle: "Réclamations associées à cette fiche",
							plain: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: [claims.length, " réclamation(s)"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs",
									onClick: () => setClaimDialogOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Nouvelle réclamation"]
								})]
							}), claims.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground italic",
								children: "Aucune réclamation enregistrée."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: claims.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "py-2.5 flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/reclamations/$id",
												params: { id: String(r.id) },
												className: "text-xs font-mono font-medium text-primary hover:underline block",
												children: r.reference
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-foreground truncate mt-0.5 font-medium",
												children: r.service
											}),
											r.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] text-muted-foreground line-clamp-1 mt-0.5",
												children: r.description
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border shrink-0 ${r.audit_status === "resolu" ? "bg-success/10 text-success border-success/20" : r.audit_status === "annule" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`,
										children: r.audit_status === "resolu" ? "Résolu" : r.audit_status === "annule" ? "Annulé" : "En cours"
									})]
								}, r.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "Contrats liés",
							subtitle: "Contrats créés à partir de ce prospect",
							plain: true,
							children: linkedContracts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground italic",
								children: "Aucun contrat lié."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: linkedContracts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "py-2.5 flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/contracts/$contractId",
											params: { contractId: c.id },
											className: "text-sm font-medium text-primary hover:underline truncate block",
											children: c.id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [
												c.partner,
												" • ",
												formatAmount(c.premium, currency),
												" • ",
												c.billingStatus
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] uppercase tracking-wider text-muted-foreground",
										children: formatDate(c.signatureDate) ?? "—"
									})]
								}, c.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
							title: "RDV & rappels",
							subtitle: "Événements liés à ce prospect",
							plain: true,
							children: linkedEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-muted-foreground italic",
								children: "Aucun événement planifié."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: linkedEvents.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "py-2.5 flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium truncate",
											children: e.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [formatDate(e.date) ?? "—", e.time ? ` • ${e.time}` : ""]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] uppercase tracking-wider text-muted-foreground",
										children: e.type
									})]
								}, e.id))
							})
						})
					]
				})]
			})
		]
	});
}
function Section({ title, subtitle, children, plain, cols = 2 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-md border border-border bg-card",
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
			className: plain ? "p-5" : `p-5 grid grid-cols-1 ${cols === 2 ? "sm:grid-cols-2" : ""} gap-x-8 gap-y-3`,
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
			className: "text-xs text-muted-foreground min-w-[140px] shrink-0",
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
export { ProspectDetailPage as component };
