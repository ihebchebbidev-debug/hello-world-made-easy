import { i as __toESM } from "../_runtime.mjs";
import { r as Input } from "./input-IbC7Hkfd.mjs";
import { t as DatePicker } from "./date-picker-BVRMSMeD.mjs";
import { O as Textarea } from "./router-Dkp91uPV.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Switch } from "./switch-D6uZdzGr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/CustomFieldsInline-CexI4zZF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Controlled inline editor for custom fields, designed to be embedded
* in create dialogs. Loads field definitions for the entity and lets
* the parent collect values via `onChange`.
*
* Use `validate()` (returned from the parent via ref-like prop) to
* enforce required-field rules before submit.
*/
function CustomFieldsInline({ entity, values, onChange, hideHeader = false }) {
	const [fields, setFields] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		(async () => {
			try {
				const r = await api("/custom_fields.php", { query: { entity } });
				if (!cancel) setFields((r.fields ?? []).slice().sort((a, b) => a.position - b.position));
			} catch {}
		})();
		return () => {
			cancel = true;
		};
	}, [entity]);
	if (fields.length === 0) return null;
	const set = (k, v) => onChange({
		...values,
		[k]: v
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: hideHeader ? "col-span-2 space-y-2" : "col-span-2 mt-1 border-t pt-3 space-y-2",
		children: [!hideHeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs font-medium text-muted-foreground uppercase tracking-wide",
			children: "Champs personnalisés"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3",
			children: fields.map((f) => {
				const v = values[f.key] ?? "";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: f.type === "textarea" ? "col-span-2 space-y-1.5" : "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [f.label, f.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-destructive ml-1",
						children: "*"
					})] }), f.type === "textarea" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: v,
						onChange: (e) => set(f.key, e.target.value),
						rows: 2
					}) : f.type === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: v,
						onChange: (e) => set(f.key, e.target.value)
					}) : f.type === "date" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
						value: v,
						onChange: (val) => set(f.key, val)
					}) : f.type === "boolean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center h-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: v === "1" || v === "true",
							onCheckedChange: (c) => set(f.key, c ? "1" : "0")
						})
					}) : f.type === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: v,
						onValueChange: (val) => set(f.key, val),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (f.options ?? []).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: o,
							children: o
						}, o)) })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: v,
						onChange: (e) => set(f.key, e.target.value)
					})]
				}, f.id);
			})
		})]
	});
}
/** Validate required custom-field values against fetched defs. Returns first error label, or null. */
async function validateRequiredCustomValues(entity, values) {
	try {
		const r = await api("/custom_fields.php", { query: { entity } });
		for (const f of r.fields ?? []) if (f.required && !String(values[f.key] ?? "").trim()) return f.label;
	} catch {}
	return null;
}
export { validateRequiredCustomValues as n, CustomFieldsInline as t };
