import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout, u as isFieldRole } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { c as useAuth, n as Button } from "./input-IbC7Hkfd.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { D as Checkbox } from "./router-Dkp91uPV.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { c as withCustomFields, n as exportJSON, s as toProspectExportRows, t as exportCSV } from "./exportUtils-D82gKDXZ.mjs";
import { n as useCustomFieldsTable } from "./useCustomFields-B3TFFvN5.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Gt as FileSpreadsheet, Wn as ArrowLeft, Zt as FileBraces, in as Download } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/prospects.export-B_fu9PtA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProspectsExportPage() {
	const navigate = useNavigate();
	const { prospects } = useErp();
	const { user } = useAuth();
	const isAgent = isFieldRole(user?.role);
	const myUsername = user?.username ?? "";
	const scope = isAgent ? prospects.filter((p) => p.assignedTo === myUsername) : prospects;
	const { defs, valuesById } = useCustomFieldsTable("prospect");
	const [includeCustom, setIncludeCustom] = (0, import_react.useState)(true);
	const buildRows = () => {
		const enriched = includeCustom ? withCustomFields(scope, defs, valuesById) : scope;
		return toProspectExportRows(enriched);
	};
	const onCSV = () => {
		exportCSV("prospects.csv", buildRows());
		toast.success("Export CSV généré");
	};
	const onJSON = () => {
		exportJSON("prospects.json", buildRows());
		toast.success("Export JSON généré");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Exporter les prospects",
			description: `${scope.length.toLocaleString("fr-FR")} prospect(s) à exporter`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/prospects",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Options"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configurez le contenu de votre export." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: includeCustom,
							onCheckedChange: (v) => setIncludeCustom(!!v)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Inclure les champs personnalisés (",
							defs.length,
							")"
						] })]
					}) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Choisir un format"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Le téléchargement démarre immédiatement." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "h-auto py-4 justify-start",
							onClick: onCSV,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5 mr-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: "CSV"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Tableur (Excel, Numbers, Google Sheets)"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "h-auto py-4 justify-start",
							onClick: onJSON,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBraces, { className: "h-5 w-5 mr-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: "JSON"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Intégration / sauvegarde"
								})]
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => navigate({ to: "/prospects" }),
						children: "Terminer"
					})
				})
			]
		})]
	});
}
export { ProspectsExportPage as component };
