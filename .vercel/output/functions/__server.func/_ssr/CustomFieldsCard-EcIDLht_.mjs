import { i as __toESM } from "../_runtime.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { O as Textarea } from "./router-BUkYRVTH.mjs";
import { t as DatePicker } from "./date-picker-BVRMSMeD.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Switch } from "./switch-D6uZdzGr.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as Save, k as Sparkles } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/CustomFieldsCard-EcIDLht_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomFieldsCard({ entity, entityId }) {
	const [fields, setFields] = (0, import_react.useState)([]);
	const [values, setValues] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		(async () => {
			setLoading(true);
			try {
				const [defs, vals] = await Promise.all([api("/custom_fields.php", { query: { entity } }), api("/custom_field_values.php", { query: {
					entity,
					entity_id: entityId
				} })]);
				if (cancel) return;
				setFields((defs.fields ?? []).slice().sort((a, b) => a.position - b.position));
				setValues(vals.values ?? {});
			} catch (e) {
				if (!cancel) toast.error(e?.message ?? "Impossible de charger les champs personnalisés");
			} finally {
				if (!cancel) setLoading(false);
			}
		})();
		return () => {
			cancel = true;
		};
	}, [entity, entityId]);
	const setValue = (k, v) => setValues((prev) => ({
		...prev,
		[k]: v
	}));
	const save = async () => {
		for (const f of fields) if (f.required && !String(values[f.key] ?? "").trim()) {
			toast.error(`${f.label} est requis`);
			return;
		}
		setSaving(true);
		try {
			await api("/custom_field_values.php", {
				method: "POST",
				body: {
					entity,
					entity_id: entityId,
					values
				}
			});
			toast.success("Champs enregistrés");
		} catch (e) {
			toast.error(e?.message ?? "Erreur d'enregistrement");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "flex items-center gap-2 text-base",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), " Champs personnalisés"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Champs configurés pour cette entité." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "space-y-3",
		children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground",
			children: "Chargement…"
		}) : fields.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm text-muted-foreground py-2",
			children: "Aucun champ personnalisé n'a été configuré pour cette entité. Un administrateur peut en ajouter depuis la configuration."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
			children: fields.map((f) => {
				const v = values[f.key] ?? "";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: f.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [f.label, f.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-destructive ml-1",
						children: "*"
					})] }), f.type === "textarea" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: v,
						onChange: (e) => setValue(f.key, e.target.value),
						rows: 3
					}) : f.type === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: v,
						onChange: (e) => setValue(f.key, e.target.value)
					}) : f.type === "date" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
						value: v,
						onChange: (val) => setValue(f.key, val)
					}) : f.type === "boolean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center h-10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: v === "1" || v === "true",
							onCheckedChange: (c) => setValue(f.key, c ? "1" : "0")
						})
					}) : f.type === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: v,
						onValueChange: (val) => setValue(f.key, val),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choisir…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (f.options ?? []).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: o,
							children: o
						}, o)) })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: v,
						onChange: (e) => setValue(f.key, e.target.value)
					})]
				}, f.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-end pt-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: save,
				disabled: saving,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
					" ",
					saving ? "Enregistrement…" : "Enregistrer"
				]
			})
		})] })
	})] });
}
export { CustomFieldsCard as t };
