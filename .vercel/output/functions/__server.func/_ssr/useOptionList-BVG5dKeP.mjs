import { i as __toESM } from "../_runtime.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/useOptionList-BVG5dKeP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var FALLBACK = {
	"prospect:source": [
		"Web",
		"Client Existant",
		"RDV CHAUD",
		"Fiches Qualifie",
		"Recommandation"
	],
	"prospect:regime": [
		"CPAM",
		"MSA",
		"RSI",
		"Alsace"
	],
	"prospect:civility": ["M", "Mme"],
	"prospect:lost_reason": [
		"Pas intéressé",
		"Trop cher",
		"Doublon",
		"Coordonnées invalides"
	],
	"contract:source": [
		"Web",
		"Client Existant",
		"RDV CHAUD",
		"Fiches Qualifie",
		"Recommandation"
	],
	"contract:partner": [
		"NEOLIANE",
		"SPVIE",
		"APRIL",
		"ALPTIS",
		"APIVIA",
		"MALAKOFF",
		"MIEL MUTUELLE",
		"TASSUR",
		"Autre"
	],
	"contract:product": [
		"Santé",
		"Prévoyance",
		"Obsèques",
		"Emprunteur",
		"Autre"
	],
	"contract:cabinet": [
		"Cabinet Paris 1",
		"Cabinet Lyon",
		"Cabinet Marseille"
	],
	"contract:debit_type": [
		"Mensuel",
		"Trimestriel",
		"Semestriel",
		"Annuel"
	],
	"contract:termination_type": ["RIA", "Échéance"],
	"contract:regime": [
		"CPAM",
		"MSA",
		"RSI",
		"Alsace"
	],
	"contract:civility": ["M", "Mme"],
	"contract:spouse_civility": ["M", "Mme"]
};
var fallbackFor = (entity, field) => {
	const key = `${entity}:${field}`;
	return (FALLBACK[key] ?? []).map((v, i) => ({
		id: `_fb_${key}_${i}`,
		entity,
		field,
		value: v,
		position: i + 1
	}));
};
var state = {
	items: {},
	loaded: /* @__PURE__ */ new Set()
};
var listeners = /* @__PURE__ */ new Set();
var emit = () => {
	for (const l of listeners) l();
};
var setState = (next) => {
	state = {
		...state,
		...next
	};
	emit();
};
var inflight = /* @__PURE__ */ new Map();
async function fetchOne(entity, field, force = false) {
	const key = `${entity}:${field}`;
	if (!force && state.loaded.has(key)) return;
	const existing = inflight.get(key);
	if (existing) return existing;
	const p = (async () => {
		try {
			const r = await api(`/option_lists.php?entity=${entity}&field=${encodeURIComponent(field)}`);
			const items = { ...state.items };
			items[key] = r.options?.length ? r.options : fallbackFor(entity, field);
			const loaded = new Set(state.loaded);
			loaded.add(key);
			setState({
				items,
				loaded
			});
		} catch {
			const items = { ...state.items };
			if (!items[key]) items[key] = fallbackFor(entity, field);
			const loaded = new Set(state.loaded);
			loaded.add(key);
			setState({
				items,
				loaded
			});
		} finally {
			inflight.delete(key);
		}
	})();
	inflight.set(key, p);
	return p;
}
function subscribe(cb) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}
var getSnapshot = () => state;
function useOptionList(entity, field) {
	const snap = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
	const key = `${entity}:${field}`;
	(0, import_react.useEffect)(() => {
		fetchOne(entity, field);
	}, [entity, field]);
	const refresh = (0, import_react.useCallback)(() => fetchOne(entity, field, true), [entity, field]);
	const items = snap.items[key] ?? fallbackFor(entity, field);
	return {
		options: items,
		values: items.map((o) => o.value),
		loaded: snap.loaded.has(key),
		refresh
	};
}
function refreshOptionList(entity, field) {
	return fetchOne(entity, field, true);
}
export { useOptionList as n, refreshOptionList as t };
