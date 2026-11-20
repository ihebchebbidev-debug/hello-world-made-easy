import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { t as Switch } from "./switch-D6uZdzGr.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $t as Eye, I as ShieldCheck, Nn as Briefcase, Pt as Headphones, V as Search, d as UserCog, f as UserCheck, g as Tv, on as Crown, r as Wrench } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/roles-DZtEeX9U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		title: "Modules",
		perms: [
			{
				key: "dashboard",
				label: "Tableau de bord"
			},
			{
				key: "backoffice",
				label: "Backoffice"
			},
			{
				key: "users",
				label: "Utilisateur"
			},
			{
				key: "calendar",
				label: "Calendrier"
			},
			{
				key: "prospect",
				label: "Prospect"
			},
			{
				key: "contract",
				label: "Contrat"
			},
			{
				key: "role",
				label: "Rôle"
			},
			{
				key: "dispatch",
				label: "Dispatch"
			},
			{
				key: "tasks",
				label: "Tâches"
			},
			{
				key: "notifications",
				label: "Notifications"
			},
			{
				key: "emails",
				label: "Emails"
			},
			{
				key: "stages",
				label: "Étapes"
			},
			{
				key: "objectives",
				label: "Objectifs"
			},
			{
				key: "reports",
				label: "Rapports"
			},
			{
				key: "reconciliation",
				label: "Rapprochement"
			},
			{
				key: "configuration",
				label: "Configuration"
			},
			{
				key: "documentation",
				label: "Documentation"
			}
		]
	},
	{
		title: "Options Prospects",
		perms: [
			{
				key: "prospect.edit",
				label: "Editer Prospect"
			},
			{
				key: "prospect.source",
				label: "Modifier Source Prospect"
			},
			{
				key: "prospect.status",
				label: "Modifier Statut Appel"
			},
			{
				key: "prospect.assign",
				label: "Modifier Assigné À Prospect"
			},
			{
				key: "prospect.add",
				label: "Ajouter Prospect"
			},
			{
				key: "prospect.delete",
				label: "Supprimer Prospect"
			}
		]
	},
	{
		title: "Options Contrats",
		perms: [
			{
				key: "contract.edit",
				label: "Editer Contrat"
			},
			{
				key: "contract.validate",
				label: "Valider Contrat"
			},
			{
				key: "contract.cancel",
				label: "Annuler Contrat"
			},
			{
				key: "contract.export",
				label: "Exporter Contrats"
			}
		]
	}
];
var roles = [
	{
		name: "Administrateur",
		icon: Crown,
		color: "from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)]",
		desc: "Accès complet"
	},
	{
		name: "Manager",
		icon: UserCog,
		color: "from-[oklch(0.78_0.15_70)] to-[oklch(0.72_0.16_180)]",
		desc: "Pilotage d'équipe"
	},
	{
		name: "Superviseur",
		icon: Eye,
		color: "from-[oklch(0.72_0.16_180)] to-[oklch(0.68_0.16_220)]",
		desc: "Supervision & lecture"
	},
	{
		name: "Agent",
		icon: Headphones,
		color: "from-[oklch(0.72_0.16_180)] to-[oklch(0.78_0.16_140)]",
		desc: "Gestion des leads"
	},
	{
		name: "Vendeur",
		icon: Briefcase,
		color: "from-[oklch(0.78_0.16_140)] to-[oklch(0.74_0.17_100)]",
		desc: "Closing & contrats"
	},
	{
		name: "Qualificateur",
		icon: UserCheck,
		color: "from-[oklch(0.74_0.17_100)] to-[oklch(0.78_0.15_70)]",
		desc: "Qualification leads"
	},
	{
		name: "Backoffice",
		icon: Wrench,
		color: "from-[oklch(0.78_0.13_70)] to-[oklch(0.72_0.16_30)]",
		desc: "Validation contrats"
	},
	{
		name: "Présentation",
		icon: Tv,
		color: "from-[oklch(0.55_0.16_265)] to-[oklch(0.65_0.18_295)]",
		desc: "Affichage TV — dashboard"
	}
];
var ALL_PERMS = sections.flatMap((s) => s.perms.map((p) => p.key));
var AGENT_DEFAULT_MODULES = /* @__PURE__ */ new Set([
	"dashboard",
	"prospect",
	"contract",
	"calendar",
	"notifications",
	"tasks",
	"emails"
]);
var AGENT_DEFAULT_OPTIONS = /* @__PURE__ */ new Set([
	"prospect.add",
	"prospect.edit",
	"prospect.status",
	"prospect.source",
	"prospect.assign"
]);
var MANAGER_DEFAULT_OFF = /* @__PURE__ */ new Set(["configuration", "documentation"]);
var BACKOFFICE_DEFAULT_ON = /* @__PURE__ */ new Set([
	"dashboard",
	"contract",
	"contract.edit",
	"contract.validate",
	"contract.cancel",
	"contract.export",
	"reconciliation",
	"notifications",
	"tasks"
]);
var SUPERVISEUR_DEFAULT_OFF = /* @__PURE__ */ new Set([
	"users",
	"role",
	"configuration",
	"documentation",
	"backoffice",
	"contract.validate",
	"contract.cancel",
	"prospect.delete"
]);
var VENDEUR_DEFAULT_ON = /* @__PURE__ */ new Set([
	"dashboard",
	"prospect",
	"contract",
	"calendar",
	"notifications",
	"tasks",
	"emails",
	"prospect.add",
	"prospect.edit",
	"prospect.status",
	"prospect.source",
	"prospect.assign",
	"contract.edit",
	"contract.export"
]);
var QUALIFICATEUR_DEFAULT_ON = /* @__PURE__ */ new Set([
	"dashboard",
	"prospect",
	"calendar",
	"notifications",
	"tasks",
	"emails",
	"prospect.add",
	"prospect.edit",
	"prospect.status",
	"prospect.source",
	"prospect.assign"
]);
var PRESENTATION_DEFAULT_ON = /* @__PURE__ */ new Set(["dashboard"]);
function defaultFor(roleName, key) {
	if (roleName === "Administrateur") return true;
	if (roleName === "Manager") return !MANAGER_DEFAULT_OFF.has(key);
	if (roleName === "Superviseur") return !SUPERVISEUR_DEFAULT_OFF.has(key);
	if (roleName === "Agent") return AGENT_DEFAULT_MODULES.has(key) || AGENT_DEFAULT_OPTIONS.has(key);
	if (roleName === "Vendeur") return VENDEUR_DEFAULT_ON.has(key);
	if (roleName === "Qualificateur") return QUALIFICATEUR_DEFAULT_ON.has(key);
	if (roleName === "Backoffice") return BACKOFFICE_DEFAULT_ON.has(key);
	if (roleName === "Présentation") return PRESENTATION_DEFAULT_ON.has(key);
	return false;
}
function RolesPage() {
	const [role, setRole] = (0, import_react.useState)("Administrateur");
	const [search, setSearch] = (0, import_react.useState)("");
	const [permsByRole, setPermsByRole] = (0, import_react.useState)(() => {
		const init = {};
		roles.forEach((r) => {
			init[r.name] = {};
			ALL_PERMS.forEach((k) => init[r.name][k] = defaultFor(r.name, k));
		});
		return init;
	});
	const [dirty, setDirty] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setLoading(true);
		api("/roles.php").then((res) => {
			if (cancelled) return;
			setPermsByRole((prev) => {
				const next = { ...prev };
				for (const r of roles) {
					const incoming = res.permissions?.[r.name] ?? {};
					next[r.name] = Object.fromEntries(ALL_PERMS.map((k) => [k, incoming[k] ?? defaultFor(r.name, k)]));
				}
				return next;
			});
			setDirty({});
		}).catch((e) => toast.error(e?.message ?? "Échec du chargement des permissions")).finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, []);
	const perms = permsByRole[role];
	const markDirty = () => setDirty((d) => ({
		...d,
		[role]: true
	}));
	const toggle = (k) => {
		setPermsByRole((prev) => ({
			...prev,
			[role]: {
				...prev[role],
				[k]: !prev[role][k]
			}
		}));
		markDirty();
	};
	const setSection = (sectionPerms, value) => {
		setPermsByRole((prev) => {
			const next = { ...prev[role] };
			sectionPerms.forEach((k) => next[k] = value);
			return {
				...prev,
				[role]: next
			};
		});
		markDirty();
		toast.success(value ? "Section activée" : "Section désactivée");
	};
	const save = async () => {
		setSaving(true);
		try {
			await api("/roles.php", {
				method: "PUT",
				body: {
					role,
					permissions: perms
				}
			});
			setDirty((d) => ({
				...d,
				[role]: false
			}));
			toast.success(`Permissions enregistrées pour ${role}`);
		} catch (e) {
			toast.error(e?.message ?? "Échec de l'enregistrement");
		} finally {
			setSaving(false);
		}
	};
	const resetDefaults = () => {
		setPermsByRole((prev) => ({
			...prev,
			[role]: Object.fromEntries(ALL_PERMS.map((k) => [k, defaultFor(role, k)]))
		}));
		markDirty();
		toast.success(`Permissions de ${role} réinitialisées`);
	};
	const totalActive = (0, import_react.useMemo)(() => Object.values(perms).filter(Boolean).length, [perms]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Rôles & Permissions",
				description: `${totalActive} / ${ALL_PERMS.length} permissions actives pour ${role}${loading ? " (chargement…)" : ""}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: resetDefaults,
					disabled: loading || saving,
					children: "Réinitialiser"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: save,
					disabled: saving || loading || !dirty[role],
					children: saving ? "Enregistrement…" : dirty[role] ? "Enregistrer" : "Enregistré"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6",
				children: roles.map((r) => {
					const active = role === r.name;
					const count = Object.values(permsByRole[r.name]).filter(Boolean).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setRole(r.name),
						className: `text-left rounded-xl border p-4 transition-base ${active ? "border-primary bg-primary/5 shadow-elegant ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/40 hover:shadow-sm"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `h-10 w-10 rounded-lg bg-gradient-to-br ${r.color} text-white flex items-center justify-center shadow-sm`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(r.icon, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-sm truncate",
									children: r.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground truncate",
									children: r.desc
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: count
								}),
								" / ",
								ALL_PERMS.length,
								" permissions"
							]
						})]
					}, r.name);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 p-3 shadow-elegant flex flex-col sm:flex-row gap-2 sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Rechercher une permission…",
						className: "pl-9"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							setPermsByRole((prev) => ({
								...prev,
								[role]: Object.fromEntries(ALL_PERMS.map((k) => [k, true]))
							}));
							markDirty();
							toast.success("Toutes les permissions activées");
						},
						children: "Tout activer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							setPermsByRole((prev) => ({
								...prev,
								[role]: Object.fromEntries(ALL_PERMS.map((k) => [k, false]))
							}));
							markDirty();
							toast.success("Toutes les permissions désactivées");
						},
						children: "Tout désactiver"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4 mt-4",
				children: sections.map((s) => {
					const visible = s.perms.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()));
					if (visible.length === 0) return null;
					const sectionKeys = s.perms.map((p) => p.key);
					const allOn = sectionKeys.every((k) => perms[k]);
					const noneOn = sectionKeys.every((k) => !perms[k]);
					const activeInSection = sectionKeys.filter((k) => perms[k]).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "shadow-elegant overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-sm",
								children: s.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground",
								children: [
									activeInSection,
									" / ",
									sectionKeys.length,
									" actives"
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									className: "h-7 text-xs",
									onClick: () => setSection(sectionKeys, !allOn),
									disabled: allOn ? false : noneOn ? false : false,
									children: allOn ? "Tout désactiver" : "Tout activer"
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-border",
							children: visible.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "px-4 py-3 flex items-center justify-between hover:bg-muted/20 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: p.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: perms[p.key] ?? false,
									onCheckedChange: () => toggle(p.key)
								})]
							}, p.key))
						})]
					}, s.title);
				})
			})
		]
	});
}
export { RolesPage as component };
