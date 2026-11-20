import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { M as useConfirm, i as Route$2 } from "./router-BUkYRVTH.mjs";
import { t as CustomFieldsCard } from "./CustomFieldsCard-EcIDLht_.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Jn as Activity, N as Shield, V as Search, Wn as ArrowLeft, a as Users, et as Pencil, ft as Mail, ht as LogIn, mt as LogOut, n as X, vt as LoaderCircle } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/users._username.index-BxqX9elg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var roleColor = {
	Administrateur: "bg-primary/10 text-primary border-primary/20",
	Manager: "bg-info/15 text-info border-info/20",
	Agent: "bg-success/15 text-success border-success/20",
	Backoffice: "bg-warning/15 text-warning-foreground border-warning/20"
};
function UserDetailPage() {
	const { username } = Route$2.useParams();
	const navigate = useNavigate();
	const { users, prospects, contracts, deleteUser } = useErp();
	const { user: me } = useAuth();
	const confirmDialog = useConfirm();
	const u = (0, import_react.useMemo)(() => users.find((x) => x.username === username), [users, username]);
	const myProspects = (0, import_react.useMemo)(() => prospects.filter((p) => p.assignedTo === username), [prospects, username]);
	const myContracts = (0, import_react.useMemo)(() => contracts.filter((c) => c.assignedTo === username), [contracts, username]);
	const [activity, setActivity] = (0, import_react.useState)([]);
	const [loadingAct, setLoadingAct] = (0, import_react.useState)(false);
	const [actSearch, setActSearch] = (0, import_react.useState)("");
	const [actType, setActType] = (0, import_react.useState)("__all__");
	const [actEntity, setActEntity] = (0, import_react.useState)("__all__");
	const [actField, setActField] = (0, import_react.useState)("__all__");
	(0, import_react.useEffect)(() => {
		if (!u) return;
		let cancelled = false;
		setLoadingAct(true);
		api(`/user_activity.php?username=${encodeURIComponent(username)}&limit=300`).then((r) => {
			if (!cancelled) setActivity(r.activity ?? []);
		}).catch(() => {
			if (!cancelled) setActivity([]);
		}).finally(() => {
			if (!cancelled) setLoadingAct(false);
		});
		return () => {
			cancelled = true;
		};
	}, [username, u]);
	const entityTypes = (0, import_react.useMemo)(() => Array.from(new Set(activity.map((a) => a.entityType).filter(Boolean))).sort(), [activity]);
	const fieldNames = (0, import_react.useMemo)(() => Array.from(new Set(activity.map((a) => a.field).filter(Boolean))).sort(), [activity]);
	const filteredActivity = (0, import_react.useMemo)(() => {
		const q = actSearch.trim().toLowerCase();
		return activity.filter((a) => {
			const isLogin = a.entityType === "user" && a.field === "login";
			const isLogout = a.entityType === "user" && a.field === "logout";
			if (actType !== "__all__" && (isLogin ? "login" : isLogout ? "logout" : "edit") !== actType) return false;
			if (actEntity !== "__all__" && a.entityType !== actEntity) return false;
			if (actField !== "__all__" && a.field !== actField) return false;
			if (q) {
				if (!`${a.entityType} ${a.entityId} ${a.field} ${a.previousValue} ${a.newValue}`.toLowerCase().includes(q)) return false;
			}
			return true;
		});
	}, [
		activity,
		actSearch,
		actType,
		actEntity,
		actField
	]);
	const hasActFilter = actSearch !== "" || actType !== "__all__" || actEntity !== "__all__" || actField !== "__all__";
	if (!u) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "detail",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold",
				children: "Utilisateur introuvable"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4",
				onClick: () => navigate({ to: "/users" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "detail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: u.fullName,
				description: `@${u.username} — ${u.role} · ${u.team}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/users/$username/edit",
								params: { username: u.username },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 mr-1.5" }), "Modifier"]
							})
						}),
						me?.role === "Administrateur" && me.username !== u.username && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "destructive",
							onClick: async () => {
								if (!await confirmDialog({
									title: "Supprimer l'utilisateur",
									description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										"Voulez-vous supprimer définitivement ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["@", u.username] }),
										" (",
										u.fullName,
										") ?"
									] }),
									destructive: true
								})) return;
								try {
									await deleteUser(u.id);
									toast.success("Utilisateur supprimé");
									navigate({ to: "/users" });
								} catch (e) {
									toast.error(e?.message ?? "Échec de la suppression");
								}
							},
							children: "Supprimer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => navigate({ to: "/users" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "shadow-elegant",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Informations"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Identité et permissions" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" }),
										label: "Email",
										value: u.email || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3.5 w-3.5" }),
										label: "Rôle",
										value: u.role
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
										label: "Équipe",
										value: u.team
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info$1, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3.5 w-3.5" }),
										label: "Statut",
										value: u.active ? "Actif" : "Inactif"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "shadow-elegant",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Performance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Activité commerciale" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "grid grid-cols-3 gap-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Leads",
										value: u.leadsHandled
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Contrats",
										value: u.contractsWon
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Conversion",
										value: `${u.conversionRate.toFixed(1)}%`
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "shadow-elegant",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Portefeuille"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
									myProspects.length,
									" prospect(s) · ",
									myContracts.length,
									" contrat(s)"
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-1 text-sm",
								children: [myProspects.slice(0, 8).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/prospects/$prospectId",
									params: { prospectId: p.id },
									className: "flex items-center justify-between py-1 hover:text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										p.firstName,
										" ",
										p.lastName
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: p.status
									})]
								}, p.id)), myProspects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-muted-foreground italic",
									children: "Aucun prospect attribué."
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "shadow-elegant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Statut"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Rôle"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: roleColor[u.role],
									children: u.role
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Compte"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: u.active ? "Actif" : "Inactif"
								})]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomFieldsCard, {
						entity: "user",
						entityId: u.username
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "shadow-elegant mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4" }), " Journal d'activité"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: ["Connexions, déconnexions, prospects et contrats modifiés par ", u.username] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [activity.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col md:flex-row gap-2 mb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: actSearch,
								onChange: (e) => setActSearch(e.target.value),
								placeholder: "Rechercher (id, valeur…)",
								className: "pl-9"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: actType,
							onValueChange: setActType,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "md:w-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Type" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "__all__",
									children: "Tous types"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "login",
									children: "Connexion"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "logout",
									children: "Déconnexion"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "edit",
									children: "Modification"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: actEntity,
							onValueChange: setActEntity,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "md:w-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Entité" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "__all__",
								children: "Toutes entités"
							}), entityTypes.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: t,
								children: t
							}, t))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: actField,
							onValueChange: setActField,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "md:w-40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Champ" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "__all__",
								children: "Tous champs"
							}), fieldNames.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: f,
								children: f
							}, f))] })]
						}),
						hasActFilter && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								setActSearch("");
								setActType("__all__");
								setActEntity("__all__");
								setActField("__all__");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 mr-1" }), " Réinitialiser"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground md:ml-2 md:whitespace-nowrap self-center",
							children: [
								filteredActivity.length,
								" / ",
								activity.length
							]
						})
					]
				}), loadingAct ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Chargement…"]
				}) : activity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground italic py-6 text-center",
					children: "Aucune activité enregistrée pour cet utilisateur."
				}) : filteredActivity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground italic py-6 text-center",
					children: "Aucun résultat pour ces filtres."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border max-h-[480px] overflow-auto",
					children: filteredActivity.map((a) => {
						const isLogin = a.entityType === "user" && a.field === "login";
						const isLogout = a.entityType === "user" && a.field === "logout";
						const Icon = isLogin ? LogIn : isLogout ? LogOut : Pencil;
						const linkEl = a.entityType === "prospect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/prospects/$prospectId",
							params: { prospectId: a.entityId },
							className: "text-primary hover:underline truncate",
							children: a.entityId
						}) : a.entityType === "contract" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/contracts/$contractId",
							params: { contractId: a.entityId },
							className: "text-primary hover:underline truncate",
							children: a.entityId
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground truncate",
							children: a.entityId
						});
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-2.5 flex items-start gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-muted-foreground" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 flex-wrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] uppercase",
												children: a.entityType
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: a.field
											}),
											linkEl
										]
									}),
									(a.previousValue || a.newValue) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground mt-0.5 truncate",
										children: [
											a.previousValue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "line-through",
												children: a.previousValue
											}) : null,
											a.previousValue && a.newValue ? " → " : "",
											a.newValue
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-muted-foreground mt-0.5",
										children: new Date(a.timestamp).toLocaleString("fr-FR")
									})
								]
							})]
						}, a.id);
					})
				})] })]
			})
		]
	});
}
function Info$1({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1",
		children: [icon, label]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-0.5 font-medium truncate",
		children: value
	})] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-muted/30 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xl font-semibold mt-0.5",
			children: value
		})]
	});
}
export { UserDetailPage as component };
