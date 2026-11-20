import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as StatusManagerSimple } from "./StatusManagerSimple-BlL9xGn7.mjs";
import { c as useAuth } from "./input-IbC7Hkfd.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Wt as FileText } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/statuses.contracts-Jqo282K8.js
var import_jsx_runtime = require_jsx_runtime();
function ContractStatusesPage() {
	const { user } = useAuth();
	return !user || user.role === "Administrateur" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" }),
		title: "Statuts contrats",
		description: "Ajoutez, renommez ou réorganisez les statuts de facturation. Ils apparaîtront automatiquement dans tous les menus."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 max-w-2xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusManagerSimple, { entity: "contract" })
	})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
}
export { ContractStatusesPage as component };
