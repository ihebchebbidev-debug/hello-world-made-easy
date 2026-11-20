import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { I as ShieldCheck, Nn as Briefcase, Nt as Heart, T as Stethoscope, Y as Receipt, _n as CircleCheck, a as Users, jn as Building2, o as UsersRound, r as Wrench, rt as Package, w as Tag, xt as ListChecks } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/backoffice-Clndn5NH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BackofficePage() {
	const { users, contracts, prospects } = useErp();
	const items = (0, import_react.useMemo)(() => {
		const teams = new Set(users.map((u) => u.team).filter(Boolean));
		const partners = new Set(contracts.map((c) => c.partner).filter(Boolean));
		const cabinets = new Set(contracts.map((c) => c.cabinet).filter(Boolean));
		const sources = new Set(prospects.map((p) => p.source).filter(Boolean));
		const statuses = new Set(prospects.map((p) => p.status).filter(Boolean));
		const billingStatuses = new Set(contracts.map((c) => c.billingStatus).filter(Boolean));
		return [
			{
				label: "Utilisateur",
				icon: Users,
				count: users.length,
				link: "/users"
			},
			{
				label: "Rôle",
				icon: ShieldCheck,
				count: 4,
				link: "/roles"
			},
			{
				label: "Équipe",
				icon: UsersRound,
				count: teams.size
			},
			{
				label: "Partenaire Santé",
				icon: Heart,
				count: partners.size
			},
			{
				label: "Cabinet",
				icon: Building2,
				count: cabinets.size
			},
			{
				label: "Fournisseur / Produit",
				icon: Package,
				count: partners.size
			},
			{
				label: "Produit Complémentaire Santé",
				icon: Briefcase,
				count: 0
			},
			{
				label: "Produit Santé",
				icon: Stethoscope,
				count: 0
			},
			{
				label: "Garantie",
				icon: CircleCheck,
				count: 0
			},
			{
				label: "Source Prospect",
				icon: Tag,
				count: sources.size
			},
			{
				label: "Statut Appel",
				icon: ListChecks,
				count: statuses.size
			},
			{
				label: "Statut Facturation",
				icon: Receipt,
				count: billingStatuses.size
			}
		];
	}, [
		users,
		contracts,
		prospects
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Backoffice",
			description: "Configurez les données de référence de votre ERP",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6",
			children: items.map((it) => {
				const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "p-5 shadow-elegant hover:shadow-elevated transition-base cursor-pointer group h-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-105 transition-base",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(it.icon, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-sm",
									children: it.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: [
										it.count,
										" entrée",
										it.count > 1 ? "s" : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground group-hover:text-primary transition-base",
								children: "→"
							})
						]
					})
				});
				return it.link ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: it.link,
					children: inner
				}, it.label) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: inner }, it.label);
			})
		})]
	});
}
export { BackofficePage as component };
