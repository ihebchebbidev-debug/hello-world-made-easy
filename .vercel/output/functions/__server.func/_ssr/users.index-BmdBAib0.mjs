import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DpaEa0I_.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { B as AlertDialogTitle, F as AlertDialogCancel, I as AlertDialogContent, L as AlertDialogDescription, N as AlertDialog, P as AlertDialogAction, R as AlertDialogFooter, V as AlertDialogTrigger, z as AlertDialogHeader } from "./router-Dkp91uPV.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Et as KeyRound, Q as Plus, V as Search, a as Users, b as Trash2, et as Pencil, ft as Mail, p as Upload } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/users.index-BmdBAib0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var roleColor = {
	Administrateur: "bg-primary/10 text-primary border-primary/20",
	Manager: "bg-info/15 text-info border-info/20",
	Superviseur: "bg-info/15 text-info border-info/20",
	Agent: "bg-success/15 text-success border-success/20",
	Vendeur: "bg-success/15 text-success border-success/20",
	Qualificateur: "bg-success/15 text-success border-success/20",
	Backoffice: "bg-warning/15 text-warning-foreground border-warning/20",
	Présentation: "bg-muted text-muted-foreground border-border"
};
var ROLES = [
	"Administrateur",
	"Manager",
	"Superviseur",
	"Agent",
	"Vendeur",
	"Qualificateur",
	"Backoffice",
	"Présentation"
];
var ALL = "__all__";
function UsersPage() {
	const { users, importUsers, deleteUser } = useErp();
	const { user: currentUser } = useAuth();
	const isAdmin = currentUser?.role === "Administrateur";
	const [search, setSearch] = (0, import_react.useState)("");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)(ALL);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)(ALL);
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		return users.filter((u) => {
			if (q) {
				if (!`${u.fullName} ${u.username} ${u.email} ${u.team}`.toLowerCase().includes(q)) return false;
			}
			if (roleFilter !== ALL && u.role !== roleFilter) return false;
			if (statusFilter === "active" && !u.active) return false;
			if (statusFilter === "inactive" && u.active) return false;
			return true;
		});
	}, [
		users,
		search,
		roleFilter,
		statusFilter
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "table",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Utilisateurs",
				description: `${users.length} utilisateurs — gérez les comptes, équipes et performance`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/users/import",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 mr-1.5" }), "Importer"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/users/new",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), "Nouvel utilisateur"]
					})
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-6 p-3 shadow-elegant flex flex-col md:flex-row gap-2 md:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Rechercher par nom, email, équipe…",
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: roleFilter,
						onValueChange: setRoleFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "md:w-44",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Rôle" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: ALL,
							children: "Tous les rôles"
						}), ROLES.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: role,
							children: role
						}, role))] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: setStatusFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "md:w-36",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Statut" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: ALL,
								children: "Tous"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "active",
								children: "Actifs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "inactive",
								children: "Inactifs"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground md:ml-2 md:whitespace-nowrap",
						children: [
							filtered.length,
							" / ",
							users.length
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 shadow-elegant overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "bg-muted/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Utilisateur" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "hidden md:table-cell",
								children: "Rôle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "hidden lg:table-cell",
								children: "Équipe"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "hidden md:table-cell",
								children: "Leads"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contrats" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "hidden lg:table-cell",
								children: "Conversion"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Statut" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 8,
						className: "text-center py-10 text-sm text-muted-foreground",
						children: "Aucun utilisateur ne correspond à votre recherche."
					}) }), filtered.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "hover:bg-muted/30 transition-base",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/users/$username",
								params: { username: u.username },
								className: "flex items-center gap-3 hover:text-primary transition-base",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold",
									children: u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-sm",
									children: u.fullName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }), u.email]
								})] })]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "hidden md:table-cell",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: roleColor[u.role],
									children: u.role
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "hidden lg:table-cell text-sm text-muted-foreground",
								children: u.team
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "hidden md:table-cell font-medium text-sm",
								children: u.leadsHandled
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-semibold text-sm",
								children: u.contractsWon
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "hidden lg:table-cell",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm font-medium",
									children: [u.conversionRate.toFixed(1), "%"]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: u.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "bg-success/15 text-success border-success/20",
								children: "Actif"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "bg-muted text-muted-foreground",
								children: "Inactif"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-end gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											size: "icon",
											variant: "ghost",
											"aria-label": "Modifier",
											title: "Modifier",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/users/$username/edit",
												params: { username: u.username },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
											})
										}),
										isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											size: "icon",
											variant: "ghost",
											"aria-label": "Réinitialiser le mot de passe",
											title: "Réinitialiser le mot de passe",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/users/$username/reset-password",
												params: { username: u.username },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4" })
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "icon",
												variant: "ghost",
												"aria-label": "Supprimer",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer l'utilisateur ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
											u.fullName,
											" (",
											u.username,
											") sera supprimé."
										] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
											onClick: async () => {
												try {
													await deleteUser(u.id);
												} catch (e) {}
											},
											children: "Supprimer"
										})] })] })] })
									]
								})
							})
						]
					}, u.id))] })] })
				})
			})
		]
	});
}
export { UsersPage as component };
