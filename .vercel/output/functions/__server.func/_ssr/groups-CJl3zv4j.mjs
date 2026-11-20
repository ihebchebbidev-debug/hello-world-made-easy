import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { n as useGroups, t as groupsStore } from "./groups-Cf_m-uYc.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Q as Plus, b as Trash2, et as Pencil, n as X, o as UsersRound, wn as Check } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/groups-CJl3zv4j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GroupsPage() {
	const groups = useGroups();
	const { users } = useErp();
	const { user } = useAuth();
	const [name, setName] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [editValue, setEditValue] = (0, import_react.useState)("");
	const isAdmin = user?.role === "Administrateur";
	const countsByGroup = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		for (const u of users) m.set(u.team, (m.get(u.team) ?? 0) + 1);
		return m;
	}, [users]);
	const totalUsers = users.length;
	const add = async () => {
		const n = name.trim();
		if (!n) return;
		if (groups.includes(n)) {
			toast.error("Ce groupe existe déjà");
			return;
		}
		try {
			await groupsStore.add(n);
			setName("");
			toast.success(`Groupe « ${n} » ajouté`);
		} catch (e) {
			toast.error("Ajout impossible", { description: e?.message });
		}
	};
	const startEdit = (g) => {
		setEditing(g);
		setEditValue(g);
	};
	const commitEdit = async () => {
		if (!editing) return;
		const v = editValue.trim();
		if (!v || v === editing) {
			setEditing(null);
			return;
		}
		try {
			await groupsStore.rename(editing, v);
			toast.success(`Renommé en « ${v} »`);
			setEditing(null);
		} catch (e) {
			toast.error("Renommage impossible", { description: e?.message });
		}
	};
	const remove = async (g) => {
		const used = countsByGroup.get(g) ?? 0;
		if (used > 0) {
			toast.error(`Impossible : ${used} utilisateur(s) appartiennent encore à ce groupe`);
			return;
		}
		try {
			await groupsStore.remove(g);
			toast.success(`Groupe « ${g} » supprimé`);
		} catch (e) {
			toast.error("Suppression impossible", { description: e?.message });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Groupes",
		description: `${groups.length} groupe(s) · ${totalUsers} utilisateur(s) au total`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "h-5 w-5" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 lg:grid-cols-3 gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "lg:col-span-1 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Nouveau groupe"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Crée un groupe puis assigne des utilisateurs depuis leur fiche." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Nom du groupe…",
						value: name,
						onChange: (e) => setName(e.target.value),
						onKeyDown: (e) => e.key === "Enter" && add(),
						disabled: !isAdmin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: add,
						disabled: !isAdmin || !name.trim(),
						className: "w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-2" }), " Ajouter"]
					}),
					!isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Lecture seule : la gestion des groupes est réservée à l'Administrateur."
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "lg:col-span-2 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Groupes existants"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Effectif par groupe (mis à jour en temps réel)." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2",
				children: [groups.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground py-6 text-center",
					children: "Aucun groupe défini."
				}), groups.map((g) => {
					const count = countsByGroup.get(g) ?? 0;
					const isEditing = editing === g;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 hover:border-primary/30 transition-colors",
						children: [
							isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								autoFocus: true,
								value: editValue,
								onChange: (e) => setEditValue(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") commitEdit();
									if (e.key === "Escape") setEditing(null);
								},
								className: "h-8 flex-1"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-sm font-medium text-foreground",
								children: g
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "font-mono",
								children: [
									count,
									" ",
									count > 1 ? "membres" : "membre"
								]
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1",
								children: isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									className: "h-8 w-8",
									onClick: commitEdit,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									className: "h-8 w-8",
									onClick: () => setEditing(null),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									className: "h-8 w-8",
									onClick: () => startEdit(g),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									className: "h-8 w-8 text-destructive hover:text-destructive",
									onClick: () => remove(g),
									disabled: count > 0,
									title: count > 0 ? "Retirez d'abord les utilisateurs" : "Supprimer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})] })
							})
						]
					}, g);
				})]
			})]
		})]
	})] });
}
export { GroupsPage as component };
