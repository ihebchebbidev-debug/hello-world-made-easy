import { i as __toESM } from "../_runtime.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/useCustomFields-B3TFFvN5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Load field definitions + every entity's values for the given entity type.
* Used by list pages to show optional custom columns and filter on them.
*/
function useCustomFieldsTable(entity) {
	const [defs, setDefs] = (0, import_react.useState)([]);
	const [valuesById, setValuesById] = (0, import_react.useState)({});
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		(async () => {
			try {
				const [d, v] = await Promise.all([api("/custom_fields.php", { query: { entity } }), api("/custom_field_values.php", { query: {
					entity,
					all: 1
				} })]);
				if (cancel) return;
				setDefs((d.fields ?? []).slice().sort((a, b) => a.position - b.position));
				setValuesById(v.values ?? {});
			} catch {} finally {
				if (!cancel) setReady(true);
			}
		})();
		return () => {
			cancel = true;
		};
	}, [entity]);
	return {
		defs,
		valuesById,
		ready
	};
}
/** Format a custom value for display based on its type. */
function formatCustomValue(def, raw) {
	if (raw === void 0 || raw === "") return "—";
	switch (def.type) {
		case "boolean": return raw === "1" || raw === "true" ? "Oui" : "Non";
		case "number": return raw;
		case "date": return raw;
		default: return raw;
	}
}
export { useCustomFieldsTable as n, formatCustomValue as t };
