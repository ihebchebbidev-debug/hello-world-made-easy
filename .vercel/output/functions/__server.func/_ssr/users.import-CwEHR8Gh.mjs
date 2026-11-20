import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as Button } from "./input-IbC7Hkfd.mjs";
import { r as USER_IMPORT_FIELDS, t as ImportFlow } from "./importFields-CF0RAC3i.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Wn as ArrowLeft, p as Upload } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/users.import-CwEHR8Gh.js
var import_jsx_runtime = require_jsx_runtime();
function UserImportPage() {
	const navigate = useNavigate();
	const { users, importUsers } = useErp();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Importer des utilisateurs",
			description: "Mappez les colonnes puis validez.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => navigate({ to: "/users" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), " Retour"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportFlow, {
				title: "Importer des utilisateurs",
				description: "CSV ou Excel — colonnes reconnues automatiquement.",
				fields: USER_IMPORT_FIELDS,
				templateFileName: "modele-utilisateurs.csv",
				existingIds: users.map((u) => u.username),
				idField: "username",
				entity: "user",
				onImport: (rows) => importUsers(rows),
				onDone: () => navigate({ to: "/users" }),
				onCancel: () => navigate({ to: "/users" })
			})
		})]
	});
}
export { UserImportPage as component };
