import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/PageHeader-ByoVWxus.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ title, description, actions, icon, eyebrow }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 mb-1 border-b border-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-4",
			children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-11 w-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/15 flex items-center justify-center shrink-0 shadow-sm",
				children: icon
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1.5",
						children: eyebrow
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl md:text-[26px] font-semibold tracking-tight leading-tight",
						children: title
					}),
					description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1.5 max-w-2xl",
						children: description
					})
				]
			})]
		}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2 flex-wrap shrink-0",
			children: actions
		})]
	});
}
export { PageHeader as t };
