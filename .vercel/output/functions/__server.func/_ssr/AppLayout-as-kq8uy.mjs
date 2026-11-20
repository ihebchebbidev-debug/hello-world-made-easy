import { i as __toESM } from "../_runtime.mjs";
import { a as cn, c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { n as logo_protection_default, t as Label } from "./label-DN6TwwGu.mjs";
import { S as useCurrency, _ as PopoverContent, d as DropdownMenuItem, f as DropdownMenuLabel, g as Popover, i as DialogDescription, l as DropdownMenu, m as DropdownMenuTrigger, n as Dialog, o as DialogHeader, p as DropdownMenuSeparator, r as DialogContent, s as DialogTitle, u as DropdownMenuContent, v as PopoverTrigger, w as useErp, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as useRouterState, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $t as Eye, A as SlidersVertical, C as Target, Dn as Calendar, En as ChartColumn, Fn as BookOpen, I as ShieldCheck, L as ShieldAlert, Ln as Bell, M as Shuffle, O as SquareCheckBig, Q as Plus, R as Settings, Rt as GitMerge, Tt as Layers, V as Search, Wn as ArrowLeft, Wt as FileText, a as Users, en as EyeOff, ft as Mail, hn as CircleQuestionMark, jt as House, k as Sparkles, kn as CalendarDays, lt as Menu, mn as CircleUserRound, mt as LogOut, n as X, o as UsersRound, ot as MessageSquare, q as RefreshCw, r as Wrench, st as MessageSquareWarning, un as ClipboardList, v as TriangleAlert, vt as LoaderCircle, wt as LayoutDashboard } from "../_libs/lucide-react.mjs";
import { t as _e } from "../_libs/cmdk.mjs";
// node_modules/.nitro/vite/services/ssr/assets/AppLayout-as-kq8uy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROUTE_PERMISSION = {
	"/": "dashboard",
	"/prospects": "prospect",
	"/contracts": "contract",
	"/calendar": "calendar",
	"/dispatch": "dispatch",
	"/users": "users",
	"/groups": "users",
	"/roles": "role",
	"/backoffice": "backoffice",
	"/tasks": "tasks",
	"/notifications": "notifications",
	"/emails": "emails",
	"/stages": "stages",
	"/objectives": "objectives",
	"/reports": "reports",
	"/reconciliation": "reconciliation",
	"/configuration": "configuration",
	"/documentation": "documentation"
};
var PUBLIC_AUTH_ROUTES = /* @__PURE__ */ new Set([
	"/profile",
	"/messaging",
	"/reclamations"
]);
function permissionForPath(path) {
	const top = "/" + (path.split("/").filter(Boolean)[0] ?? "");
	if (path === "/") return ROUTE_PERMISSION["/"] ?? null;
	return ROUTE_PERMISSION[top] ?? null;
}
/** "Field" roles: their scope is limited to entities assigned to them. */
var FIELD_ROLES = /* @__PURE__ */ new Set([
	"Agent",
	"Vendeur",
	"Qualificateur"
]);
/** Roles that can OWN a prospect / contract (appear in assignee pickers). */
var ASSIGNABLE_ROLES = /* @__PURE__ */ new Set([
	"Agent",
	"Vendeur",
	"Qualificateur",
	"Manager",
	"Superviseur"
]);
var isFieldRole = (role) => !!role && FIELD_ROLES.has(role);
var isAssignableRole = (role) => !!role && ASSIGNABLE_ROLES.has(role);
var items = [
	{
		title: "Tableau de bord",
		url: "/",
		icon: LayoutDashboard
	},
	{
		title: "Prospects",
		url: "/prospects",
		icon: ClipboardList
	},
	{
		title: "Contrats",
		url: "/contracts",
		icon: FileText
	},
	{
		title: "Emails",
		url: "/emails",
		icon: Mail
	},
	{
		title: "Calendrier",
		url: "/calendar",
		icon: CalendarDays
	},
	{
		title: "Messagerie",
		url: "/messaging",
		icon: MessageSquare
	},
	{
		title: "Réclamations",
		url: "/reclamations",
		icon: MessageSquareWarning
	},
	{
		title: "Tâches",
		url: "/tasks",
		icon: SquareCheckBig
	},
	{
		title: "Notifications",
		url: "/notifications",
		icon: Bell
	},
	{
		title: "Étapes",
		url: "/stages",
		icon: Layers
	},
	{
		title: "Statuts prospects",
		url: "/statuses/prospects",
		icon: ClipboardList
	},
	{
		title: "Statuts contrats",
		url: "/statuses/contracts",
		icon: FileText
	},
	{
		title: "Options des listes",
		url: "/options",
		icon: SlidersVertical
	},
	{
		title: "Objectifs",
		url: "/objectives",
		icon: Target
	},
	{
		title: "Rapports",
		url: "/reports",
		icon: ChartColumn
	},
	{
		title: "Réconciliation",
		url: "/reconciliation",
		icon: GitMerge
	},
	{
		title: "Dispatch",
		url: "/dispatch",
		icon: Shuffle
	},
	{
		title: "Utilisateurs",
		url: "/users",
		icon: Users
	},
	{
		title: "Groupes",
		url: "/groups",
		icon: UsersRound
	},
	{
		title: "Rôles",
		url: "/roles",
		icon: ShieldCheck
	},
	{
		title: "Backoffice",
		url: "/backoffice",
		icon: Wrench
	},
	{
		title: "Configuration",
		url: "/configuration",
		icon: Settings
	},
	{
		title: "Documentation",
		url: "/documentation",
		icon: BookOpen
	}
];
function AppSidebar() {
	const currentPath = useRouterState({ select: (s) => s.location.pathname });
	const isActive = (path) => path === "/" ? currentPath === "/" : currentPath.startsWith(path);
	const { user, hasPermission } = useAuth();
	const [unreadEmails, setUnreadEmails] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancelled = false;
		const fetchUnread = async () => {
			try {
				const r = await api("/emails.php?action=folders");
				if (cancelled) return;
				const inbox = r.folders?.find((f) => /^inbox$/i.test(f.name));
				setUnreadEmails(inbox?.unseen ?? 0);
			} catch {
				if (!cancelled) setUnreadEmails(0);
			}
		};
		fetchUnread();
		const id = window.setInterval(fetchUnread, 6e4);
		const onFocus = () => fetchUnread();
		window.addEventListener("focus", onFocus);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.removeEventListener("focus", onFocus);
		};
	}, [user]);
	const displayName = user?.fullName ?? user?.username ?? "Utilisateur";
	const displayRole = user?.role ?? "—";
	const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
	const isFieldRole = user?.role === "Agent" || user?.role === "Vendeur" || user?.role === "Qualificateur";
	const isAdmin = user?.role === "Administrateur";
	const FIELD_HIDDEN = /* @__PURE__ */ new Set([
		"/reconciliation",
		"/objectives",
		"/reports",
		"/stages"
	]);
	const ADMIN_ONLY = /* @__PURE__ */ new Set([
		"/stages",
		"/statuses/prospects",
		"/statuses/contracts",
		"/documentation",
		"/configuration"
	]);
	const visibleItems = items.filter((it) => {
		if (ADMIN_ONLY.has(it.url)) return isAdmin;
		if (isFieldRole && FIELD_HIDDEN.has(it.url)) return false;
		if (PUBLIC_AUTH_ROUTES.has(it.url)) return true;
		const perm = permissionForPath(it.url);
		if (!perm) return true;
		return hasPermission(perm);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		style: {
			backgroundColor: "var(--sidebar)",
			color: "var(--sidebar-foreground)"
		},
		className: "hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border",
		"data-tour": "sidebar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-5 py-5 border-b border-sidebar-border bg-white/95",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: logo_protection_default,
					alt: "Protection",
					className: "h-10 w-auto mx-auto"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex-1 overflow-y-auto px-3 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50 px-3 mb-2",
					children: "Pilotage"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-0.5",
					children: visibleItems.map((item) => {
						const active = isActive(item.url);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.url,
							className: `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-base ${active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"}`,
							children: [
								active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-sidebar-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: `h-4 w-4 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium flex-1",
									children: item.title
								}),
								item.url === "/emails" && unreadEmails > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold",
									children: unreadEmails > 99 ? "99+" : unreadEmails
								})
							]
						}) }, item.url);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 border-t border-sidebar-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-base p-2.5 cursor-pointer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-full bg-gradient-to-br from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] text-white flex items-center justify-center text-xs font-semibold ring-2 ring-sidebar/50",
							children: initials
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium truncate",
								children: displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-sidebar-foreground/60 truncate",
								children: displayRole
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-success" })
					]
				})
			})
		]
	});
}
var groups = [{
	label: "Pilotage",
	items: [
		{
			title: "Tableau de bord",
			url: "/",
			icon: LayoutDashboard
		},
		{
			title: "Prospects",
			url: "/prospects",
			icon: ClipboardList
		},
		{
			title: "Contrats",
			url: "/contracts",
			icon: FileText
		},
		{
			title: "Calendrier",
			url: "/calendar",
			icon: CalendarDays
		},
		{
			title: "Dispatch",
			url: "/dispatch",
			icon: Shuffle
		}
	]
}, {
	label: "Administration",
	items: [
		{
			title: "Utilisateurs",
			url: "/users",
			icon: Users
		},
		{
			title: "Rôles",
			url: "/roles",
			icon: ShieldCheck
		},
		{
			title: "Backoffice",
			url: "/backoffice",
			icon: Wrench
		},
		{
			title: "Configuration",
			url: "/configuration",
			icon: Settings
		}
	]
}];
function MobileNav() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const currentPath = useRouterState({ select: (s) => s.location.pathname });
	const isActive = (p) => p === "/" ? currentPath === "/" : currentPath.startsWith(p);
	const { user, logout, hasPermission } = useAuth();
	const displayName = user?.fullName ?? user?.username ?? "Utilisateur";
	const displayRole = user?.role ?? "—";
	const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
	const isFieldRole = user?.role === "Agent" || user?.role === "Vendeur" || user?.role === "Qualificateur";
	const FIELD_HIDDEN = /* @__PURE__ */ new Set([
		"/reconciliation",
		"/objectives",
		"/reports",
		"/stages"
	]);
	const filterItems = (items) => items.filter((it) => {
		if (it.url === "/configuration" || it.url === "/documentation") return user?.role === "Administrateur";
		if (isFieldRole && FIELD_HIDDEN.has(it.url)) return false;
		if (PUBLIC_AUTH_ROUTES.has(it.url)) return true;
		const perm = permissionForPath(it.url);
		if (!perm) return true;
		return hasPermission(perm);
	});
	const visibleGroups = groups.map((g) => ({
		...g,
		items: filterItems(g.items)
	})).filter((g) => g.items.length > 0);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [currentPath]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick: () => setOpen(true),
		className: "md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base text-foreground",
		"aria-label": "Ouvrir le menu",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `fixed inset-0 md:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`,
		style: { zIndex: 100 },
		"aria-hidden": !open,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0",
			style: {
				backgroundColor: "rgba(0,0,0,0.55)",
				backdropFilter: "blur(4px)"
			},
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			style: {
				backgroundColor: "oklch(0.18 0.06 250)",
				color: "oklch(0.95 0.01 240)",
				zIndex: 101
			},
			className: `absolute left-0 top-0 bottom-0 h-[100dvh] w-[86%] max-w-xs shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`,
			role: "dialog",
			"aria-label": "Navigation",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-4 border-b border-sidebar-border flex items-center gap-3 bg-white/95",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: logo_protection_default,
						alt: "Protection",
						className: "h-9 w-auto flex-1 object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setOpen(false),
						className: "h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted text-foreground/70 hover:text-foreground transition-base",
						"aria-label": "Fermer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setOpen(false);
							window.__openCommandPalette?.();
						},
						className: "w-full flex items-center gap-2 h-10 px-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: "Rechercher prospects, contrats…"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] text-white text-sm font-medium shadow-md hover:opacity-95 transition-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Créer"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex-1 overflow-y-auto px-3 py-4 mt-1",
					children: visibleGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 last:mb-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50 px-3 mb-1.5",
							children: group.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-0.5",
							children: group.items.map((item) => {
								const active = isActive(item.url);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.url,
									onClick: () => setOpen(false),
									className: `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-base ${active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground active:bg-sidebar-accent/60"}`,
									children: [
										active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-sidebar-primary" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: `h-4 w-4 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground"}` }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: item.title
										})
									]
								}) }, item.url);
							})
						})]
					}, group.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-3 border-t border-sidebar-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-gradient-to-br from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] text-white flex items-center justify-center text-xs font-semibold ring-2 ring-sidebar/50",
								children: initials
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium truncate",
									children: displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-sidebar-foreground/60 truncate",
									children: displayRole
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: logout,
								className: "h-8 w-8 inline-flex items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-base",
								"aria-label": "Déconnexion",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" })
							})
						]
					})
				})
			]
		})]
	})] });
}
var ROUTE_LABELS$1 = {
	"/": "Tableau de bord",
	"/prospects": "Prospects",
	"/contracts": "Contrats",
	"/calendar": "Calendrier",
	"/dispatch": "Dispatch",
	"/users": "Utilisateurs",
	"/roles": "Rôles",
	"/backoffice": "Backoffice",
	"/tasks": "Tâches",
	"/notifications": "Notifications",
	"/stages": "Étapes",
	"/objectives": "Objectifs",
	"/reports": "Rapports",
	"/configuration": "Configuration"
};
/**
* Wraps protected pages. If no user is logged in, redirects to /login.
* Also enforces per-route role permissions, and shows a friendly
* Access-Denied page with a smart fallback to the first allowed route.
*/
function RequireAuth({ children }) {
	const { user, loading, hasPermission, logout } = useAuth();
	const navigate = useNavigate();
	const path = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!user && path !== "/login") navigate({ to: "/login" });
	}, [
		user,
		loading,
		path,
		navigate
	]);
	const requiredPerm = (0, import_react.useMemo)(() => PUBLIC_AUTH_ROUTES.has(path) ? null : permissionForPath(path), [path]);
	const firstAllowed = (0, import_react.useMemo)(() => {
		if (!user) return "/";
		for (const r of [
			"/",
			"/prospects",
			"/contracts",
			"/calendar",
			"/dispatch",
			"/users",
			"/roles",
			"/backoffice"
		]) {
			const p = ROUTE_PERMISSION[r];
			if (!p || hasPermission(p)) return r;
		}
		return "/tasks";
	}, [user, hasPermission]);
	const lastToastKey = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		if (!user || !requiredPerm || hasPermission(requiredPerm)) return;
		const key = `${path}:${user.role}`;
		if (lastToastKey.current === key) return;
		lastToastKey.current = key;
		const pageLabel = ROUTE_LABELS$1[path] ?? path;
		toast.error("Accès refusé", {
			description: `${pageLabel} n'est pas autorisée pour le rôle ${user.role}.`,
			duration: 4e3
		});
	}, [
		user,
		requiredPerm,
		hasPermission,
		path
	]);
	if (loading || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	if (requiredPerm && !hasPermission(requiredPerm)) {
		const pageLabel = ROUTE_LABELS$1[path] ?? path;
		const fallbackLabel = ROUTE_LABELS$1[firstAllowed] ?? "Accueil";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-screen items-center justify-center bg-background px-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm text-center animate-in fade-in zoom-in-95 duration-200",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-5 ring-1 ring-destructive/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-7 w-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight text-foreground",
						children: "Accès refusé"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: [
							"La page ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: pageLabel
							}),
							" ",
							"n'est pas autorisée pour votre rôle\xA0",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: user.role
							}),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur pour ajuster vos permissions."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-col sm:flex-row items-center justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: firstAllowed,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4 mr-2" }),
										"Aller à ",
										fallbackLabel
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => window.history.back(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Retour"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: logout,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 mr-2" }), "Se déconnecter"]
							})
						]
					})
				]
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
function PageSkeleton({ variant = "dashboard" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 animate-in fade-in duration-200",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-64" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-80" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-32" })]
			}),
			variant === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
					children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
					children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-36 rounded-xl" }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "lg:col-span-2 h-80 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-80 rounded-xl" })]
				})
			] }),
			variant === "table" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-3",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-40 rounded-md" }, i))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full rounded-none" }), Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-none border-t border-border" }, i))]
			})] }),
			variant === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" }, i))
			}),
			variant === "detail" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-xl" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 rounded-xl" })]
				})]
			}),
			variant === "form" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-2xl space-y-4",
				children: [Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-md" })]
				}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-32" })]
			})
		]
	});
}
function ErpErrorState({ message }) {
	const { refresh } = useErp();
	const { logout } = useAuth();
	const [retrying, setRetrying] = (0, import_react.useState)(false);
	const onRetry = async () => {
		setRetrying(true);
		try {
			await refresh();
		} finally {
			setRetrying(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center py-16 px-4 animate-in fade-in duration-200",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md w-full text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-7 w-7 text-destructive" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold tracking-tight",
					children: "Chargement des données impossible"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onRetry,
						disabled: retrying,
						size: "sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-2 ${retrying ? "animate-spin" : ""}` }), retrying ? "Nouvelle tentative…" : "Réessayer"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: logout,
						variant: "outline",
						size: "sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 mr-2" }), " Se reconnecter"]
					})]
				})
			]
		})
	});
}
var Command$1 = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = _e.displayName;
var CommandDialog = ({ children, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "overflow-hidden p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command$1, {
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children
			})
		})
	});
};
var CommandInput = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = _e.Input.displayName;
var CommandList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = _e.List.displayName;
var CommandEmpty = import_react.forwardRef((props, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = _e.Empty.displayName;
var CommandGroup = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = _e.Group.displayName;
var CommandSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = _e.Separator.displayName;
var CommandItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(_e.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = _e.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
/**
* Global ⌘K palette — search prospects/contracts/users + quick navigation.
* Mounted once in AppLayout.
*/
function CommandPalette() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const navigate = useNavigate();
	const { prospects, contracts, users, events } = useErp();
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((o) => !o);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => {
		window.__openCommandPalette = () => setOpen(true);
		return () => {
			delete window.__openCommandPalette;
		};
	}, []);
	const q = query.trim().toLowerCase();
	const matchedProspects = (0, import_react.useMemo)(() => {
		if (!q) return prospects.slice(0, 5);
		return prospects.filter((p) => `${p.lastName} ${p.firstName} ${p.phone} ${p.email} ${p.city} ${p.id}`.toLowerCase().includes(q)).slice(0, 8);
	}, [prospects, q]);
	const matchedContracts = (0, import_react.useMemo)(() => {
		if (!q) return contracts.slice(0, 5);
		return contracts.filter((c) => `${c.lastName} ${c.firstName} ${c.city} ${c.partner} ${c.id}`.toLowerCase().includes(q)).slice(0, 8);
	}, [contracts, q]);
	const matchedUsers = (0, import_react.useMemo)(() => {
		if (!q) return users.slice(0, 5);
		return users.filter((u) => `${u.fullName} ${u.username} ${u.email} ${u.team} ${u.role}`.toLowerCase().includes(q)).slice(0, 8);
	}, [users, q]);
	const matchedEvents = (0, import_react.useMemo)(() => {
		if (!q) return events.slice(0, 3);
		return events.filter((e) => `${e.title} ${e.agent} ${e.type} ${e.date}`.toLowerCase().includes(q)).slice(0, 6);
	}, [events, q]);
	const go = (to, params) => {
		setOpen(false);
		setQuery("");
		navigate({
			to,
			params
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandDialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
			value: query,
			onValueChange: setQuery,
			placeholder: "Rechercher prospects, contrats, utilisateurs… ou tapez une commande"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "Aucun résultat." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, {
				heading: "Navigation",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-4 w-4 mr-2" }), " Tableau de bord"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/prospects"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4 mr-2" }), " Prospects"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/contracts"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2" }), " Contrats"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/calendar"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2" }), " Calendrier"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/tasks"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "h-4 w-4 mr-2" }), " Tâches"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/notifications"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 mr-2" }), " Notifications"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/reports"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4 mr-2" }), " Rapports"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/reconciliation"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitMerge, { className: "h-4 w-4 mr-2" }), " Réconciliation des imports"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/users"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 mr-2" }), " Utilisateurs"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/roles"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 mr-2" }), " Rôles"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						onSelect: () => go("/configuration"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4 mr-2" }), " Configuration"]
					})
				]
			}),
			matchedProspects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: `Prospects (${matchedProspects.length})`,
				children: matchedProspects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `prospect-${p.id}-${p.lastName}-${p.firstName}-${p.phone}`,
					onSelect: () => go("/prospects/$prospectId", { prospectId: p.id }),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4 mr-2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium",
							children: [
								p.civility,
								" ",
								p.lastName,
								" ",
								p.firstName
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-xs text-muted-foreground truncate",
							children: [
								p.phone || p.email,
								" · ",
								p.city,
								" · ",
								p.status
							]
						})
					]
				}, p.id))
			})] }),
			matchedContracts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: `Contrats (${matchedContracts.length})`,
				children: matchedContracts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `contract-${c.id}-${c.lastName}-${c.firstName}`,
					onSelect: () => go("/contracts/$contractId", { contractId: c.id }),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 mr-2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium",
							children: [
								c.lastName,
								" ",
								c.firstName
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-xs text-muted-foreground truncate",
							children: [
								c.partner,
								" · ",
								c.city,
								" · ",
								c.billingStatus
							]
						})
					]
				}, c.id))
			})] }),
			matchedUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: `Utilisateurs (${matchedUsers.length})`,
				children: matchedUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `user-${u.username}-${u.fullName}`,
					onSelect: () => go("/users"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 mr-2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: u.fullName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-xs text-muted-foreground truncate",
							children: [
								"@",
								u.username,
								" · ",
								u.role,
								" · ",
								u.team
							]
						})
					]
				}, u.id))
			})] }),
			matchedEvents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
				heading: `Calendrier (${matchedEvents.length})`,
				children: matchedEvents.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					value: `event-${e.id}-${e.title}-${e.agent}`,
					onSelect: () => go("/calendar"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 mr-2 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: e.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-xs text-muted-foreground truncate",
							children: [
								e.date,
								" ",
								e.time,
								" · ",
								e.type,
								" · ",
								e.agent
							]
						})
					]
				}, e.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, {
				heading: "Actions rapides",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => go("/prospects"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), " Nouveau prospect"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
					onSelect: () => go("/dispatch"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 mr-2" }), " Dispatch des leads"]
				})]
			})
		] })]
	});
}
function OnboardingTour() {
	return null;
}
function ForceChangePasswordDialog() {
	const { user, changePassword } = useAuth();
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [show, setShow] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const open = !!user?.mustChangePassword;
	const submit = async () => {
		if (next.length < 8) {
			toast.error("Au moins 8 caractères");
			return;
		}
		if (next !== confirm) {
			toast.error("La confirmation ne correspond pas");
			return;
		}
		if (current === next) {
			toast.error("Le nouveau mot de passe doit être différent");
			return;
		}
		setBusy(true);
		try {
			await changePassword(current, next);
			toast.success("Mot de passe mis à jour");
			setCurrent("");
			setNext("");
			setConfirm("");
		} catch (e) {
			toast.error(e?.message ?? "Échec");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-[440px]",
			onInteractOutside: (e) => e.preventDefault(),
			onEscapeKeyDown: (e) => e.preventDefault(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-warning",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Changement de mot de passe requis" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mot de passe actuel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: show ? "text" : "password",
									value: current,
									onChange: (e) => setCurrent(e.target.value),
									className: "pr-9",
									autoFocus: true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShow((s) => !s),
									className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground",
									"aria-label": "Afficher/Cacher",
									children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nouveau mot de passe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: show ? "text" : "password",
								value: next,
								onChange: (e) => setNext(e.target.value),
								placeholder: "Au moins 8 caractères"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Confirmer le mot de passe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: show ? "text" : "password",
								value: confirm,
								onChange: (e) => setConfirm(e.target.value)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submit,
						disabled: busy || !current || next.length < 8 || next !== confirm,
						children: busy ? "Enregistrement…" : "Mettre à jour"
					})
				})
			]
		})
	});
}
var ROUTE_LABELS = {
	"/": "Tableau de bord",
	"/prospects": "Prospects",
	"/contracts": "Contrats",
	"/calendar": "Calendrier",
	"/tasks": "Tâches",
	"/reports": "Rapports",
	"/objectives": "Objectifs",
	"/dispatch": "Dispatch",
	"/users": "Utilisateurs",
	"/roles": "Rôles",
	"/backoffice": "Backoffice",
	"/configuration": "Configuration"
};
function timeAgo(iso) {
	if (!iso) return "";
	const d = new Date(iso).getTime();
	if (Number.isNaN(d)) return "";
	const diff = Math.max(0, Date.now() - d);
	const m = Math.floor(diff / 6e4);
	if (m < 1) return "à l'instant";
	if (m < 60) return `il y a ${m} min`;
	const h = Math.floor(m / 60);
	if (h < 24) return `il y a ${h} h`;
	return `il y a ${Math.floor(h / 24)} j`;
}
function AppLayout({ children, skeleton = "dashboard" }) {
	const { loading, error, hydrated } = useErp();
	const isHydrating = loading && !hydrated && !error;
	const showError = !!error && !hydrated;
	const currentLabel = ROUTE_LABELS[`/${useRouterState({ select: (s) => s.location.pathname }).split("/").filter(Boolean)[0] ?? ""}`] ?? ROUTE_LABELS["/"] ?? "Tableau de bord";
	const currency = useCurrency();
	const erp = useErp();
	const NOTIFICATIONS = (0, import_react.useMemo)(() => {
		const items = [];
		erp.contracts.slice(0, 3).forEach((c) => items.push({
			id: `c-${c.id}`,
			title: "Contrat signé",
			desc: `${c.firstName} ${c.lastName} · ${formatAmount(c.premium, currency)}`,
			time: timeAgo(c.signatureDate),
			unread: true
		}));
		erp.prospects.filter((p) => p.assignedTo === null).slice(0, 2).forEach((p) => items.push({
			id: `p-${p.id}`,
			title: "Nouveau lead à dispatcher",
			desc: `${p.firstName} ${p.lastName} — ${p.source}`,
			time: timeAgo(p.createdAt),
			unread: true
		}));
		return items.slice(0, 5);
	}, [
		erp.contracts,
		erp.prospects,
		currency
	]);
	const [unread, setUnread] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setUnread(NOTIFICATIONS.filter((n) => n.unread).length);
	}, [NOTIFICATIONS]);
	const { user, logout } = useAuth();
	const displayUsername = user?.username ?? "Utilisateur";
	const displayFullName = user?.fullName ?? displayUsername;
	const displayRole = user?.role ?? "—";
	const displayEmail = user?.email ?? "";
	const initials = displayUsername.split(/[.\s_-]+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
	if (user?.role === "Présentation") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen w-full bg-background",
		"data-tv-mode": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "min-h-screen",
			children: showError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErpErrorState, { message: error }) : isHydrating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { variant: skeleton }) : children
		})
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen w-full bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-full pl-3 pr-3 md:pl-6 md:pr-5 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileNav, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden md:flex items-center gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Protection"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground/50",
										children: "/"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-foreground",
										children: currentLabel
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => window.__openCommandPalette?.(),
								"data-tour": "search",
								className: "flex-1 max-w-xl mx-auto hidden sm:flex items-center gap-2 h-10 px-3.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-base text-sm text-muted-foreground cursor-pointer text-left",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: "Rechercher prospects, contrats, utilisateurs…"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground",
										children: "⌘K"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => window.__openCommandPalette?.(),
								className: "sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base text-muted-foreground hover:text-foreground",
								"aria-label": "Rechercher",
								title: "Rechercher",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										"data-tour": "create",
										className: "hidden md:inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-base shadow-sm",
										title: "Créer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Créer"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => window.__startOnboardingTour?.(),
										"data-tour": "help",
										className: "hidden md:inline-flex h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base items-center justify-center text-muted-foreground hover:text-foreground",
										title: "Relancer la visite guidée",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setUnread(0),
											"data-tour": "notifications",
											className: "relative h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base inline-flex items-center justify-center text-muted-foreground hover:text-foreground",
											title: "Notifications",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background",
												children: unread
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
										align: "end",
										className: "w-80 p-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "px-4 py-3 border-b border-border flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-sm font-semibold",
													children: "Notifications"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "text-xs text-primary hover:underline",
													children: "Tout marquer lu"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "max-h-80 overflow-y-auto",
												children: NOTIFICATIONS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-base",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-start gap-2.5",
														children: [n.unread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: `flex-1 min-w-0 ${!n.unread && "pl-4"}`,
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "text-sm font-medium truncate",
																	children: n.title
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "text-xs text-muted-foreground truncate",
																	children: n.desc
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "text-[11px] text-muted-foreground/70 mt-0.5",
																	children: n.time
																})
															]
														})]
													})
												}, n.id))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "px-4 py-2 border-t border-border text-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													className: "text-xs text-primary hover:underline",
													children: "Voir toutes les notifications"
												})
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden sm:block h-6 w-px bg-border mx-1" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											"data-tour": "user-menu",
											className: "flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-muted/60 transition-base",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-8 w-8 rounded-full bg-gradient-to-br from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] flex items-center justify-center text-xs font-semibold text-white ring-2 ring-background",
													children: initials
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success ring-2 ring-background" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "hidden lg:block text-left leading-tight",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-sm font-medium",
													children: ["@", displayUsername]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] text-muted-foreground",
													children: displayFullName !== displayUsername ? `${displayFullName} • ${displayRole}` : displayRole
												})]
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										align: "end",
										className: "w-56",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-medium",
												children: ["@", displayUsername]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs text-muted-foreground font-normal",
												children: [displayFullName !== displayUsername ? displayFullName : "", displayEmail ? ` • ${displayEmail}` : ""]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
													to: "/profile",
													className: "cursor-pointer",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleUserRound, { className: "h-4 w-4 mr-2" }), " Mon profil"]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
												onClick: logout,
												className: "text-destructive focus:text-destructive cursor-pointer",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 mr-2" }), " Déconnexion"]
											})
										]
									})] })
								]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 px-4 md:px-6 lg:px-8 py-6",
					children: showError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErpErrorState, { message: error }) : isHydrating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, { variant: skeleton }) : children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingTour, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForceChangePasswordDialog, {})
		]
	}) });
}
export { CommandInput as a, Skeleton as c, CommandGroup as i, isAssignableRole as l, Command$1 as n, CommandItem as o, CommandEmpty as r, CommandList as s, AppLayout as t, isFieldRole as u };
