import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as Button } from "./input-IbC7Hkfd.mjs";
import { n as PROSPECT_IMPORT_FIELDS, t as ImportFlow } from "./importFields-CF0RAC3i.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as useCustomFieldsTable } from "./useCustomFields-B3TFFvN5.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Wn as ArrowLeft, p as Upload } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/prospects.import-iGRQ4pcA.js
var import_jsx_runtime = require_jsx_runtime();
function ProspectImportPage() {
	const navigate = useNavigate();
	const { prospects, users, importProspects } = useErp();
	const { defs: customDefs } = useCustomFieldsTable("prospect");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Importer des prospects",
			description: "Mappez les colonnes (y compris vos champs personnalisés) puis validez. Imports massifs envoyés par lots de 500 lignes.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => navigate({ to: "/prospects" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportFlow, {
				title: "Importer des prospects",
				description: "CSV ou Excel — mappage automatique sur les colonnes reconnues.",
				fields: PROSPECT_IMPORT_FIELDS,
				customFields: customDefs.map((d) => ({
					key: d.key,
					label: d.label,
					type: d.type
				})),
				templateFileName: "modele-prospects.csv",
				existingIds: prospects.map((p) => p.id),
				existingRecords: prospects.map((p) => ({
					id: p.id,
					label: `${p.lastName} ${p.firstName} — ${p.phone || p.mobile || p.email || p.id}`,
					phone: p.phone,
					mobile: p.mobile ?? void 0,
					email: p.email
				})),
				dedupeOn: ["phone"],
				entity: "prospect",
				batchSize: 500,
				knownUsers: users.filter((u) => u.active !== false).map((u) => ({
					username: u.username,
					fullName: u.fullName
				})),
				onImport: (rows) => importProspects(rows),
				onDone: () => navigate({ to: "/prospects" }),
				onCancel: () => navigate({ to: "/prospects" })
			})
		})]
	});
}
export { ProspectImportPage as component };
