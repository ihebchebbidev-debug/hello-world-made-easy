import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button } from "./input-IbC7Hkfd.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { i as buildContractImportFields, t as ImportFlow } from "./importFields-CF0RAC3i.mjs";
import { S as useCurrency, w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as useCustomFieldsTable } from "./useCustomFields-B3TFFvN5.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { L as ShieldAlert, Wn as ArrowLeft, p as Upload } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/contracts.import-C2NqjBB0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContractImportPage() {
	const navigate = useNavigate();
	const { contracts, users, importContracts } = useErp();
	const { user } = useAuth();
	const currency = useCurrency();
	const { defs: customDefs } = useCustomFieldsTable("contract");
	const isAdmin = user?.role === "Administrateur";
	(0, import_react.useEffect)(() => {
		if (user && !isAdmin) toast.error("Import contrats réservé aux administrateurs");
	}, [user, isAdmin]);
	if (user && !isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Importer des contrats",
			description: "Action réservée aux administrateurs.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => navigate({ to: "/contracts" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-6 p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-10 w-10 mx-auto text-muted-foreground mb-3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: "Accès refusé"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Seul un compte Administrateur peut importer des contrats."
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Importer des contrats",
			description: "Mappez les colonnes (y compris vos champs personnalisés) puis validez. Imports massifs envoyés par lots de 500 lignes.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => navigate({ to: "/contracts" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportFlow, {
				title: "Importer des contrats",
				description: "CSV ou Excel — mappage automatique sur les colonnes reconnues.",
				fields: buildContractImportFields(currency.symbol),
				customFields: customDefs.map((d) => ({
					key: d.key,
					label: d.label,
					type: d.type
				})),
				templateFileName: "modele-contrats.csv",
				existingIds: contracts.map((c) => c.id),
				existingRecords: contracts.map((c) => ({
					id: c.id,
					label: `${c.lastName} ${c.firstName} — ${c.phone || c.email || c.id}`,
					phone: c.phone ?? void 0,
					email: c.email ?? void 0
				})),
				entity: "contract",
				batchSize: 500,
				knownUsers: users.filter((u) => u.active !== false).map((u) => ({
					username: u.username,
					fullName: u.fullName
				})),
				onImport: (rows) => importContracts(rows),
				onDone: () => navigate({ to: "/contracts" }),
				onCancel: () => navigate({ to: "/contracts" })
			})
		})]
	});
}
export { ContractImportPage as component };
