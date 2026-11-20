import { i as __toESM } from "../_runtime.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/useStatusOptions-CVlT4V3k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var FALLBACK = {
	prospect: [
		"A recontacter (Voir Commentaire)",
		"RDV",
		"Vente",
		"Devis",
		"Sans réponse",
		"Refus",
		"HC âge",
		"HC Cotisation",
		"HC tutelle"
	].map((v, i) => ({
		id: `_fb_p_${i}`,
		entity: "prospect",
		value: v,
		color: "muted",
		position: i + 1
	})),
	contract: [
		"Pré-validé",
		"En attente de validation",
		"Validé Confirmation",
		"Annuler la confirmation"
	].map((v, i) => ({
		id: `_fb_c_${i}`,
		entity: "contract",
		value: v,
		color: "muted",
		position: i + 1
	}))
};
var state = {
	...FALLBACK,
	loaded: false
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
var inflight = null;
async function fetchAll(force = false) {
	if (!force && state.loaded) return;
	if (inflight) return inflight;
	inflight = (async () => {
		try {
			const r = await api("/status_options.php");
			setState({
				prospect: r.prospect?.length ? r.prospect : FALLBACK.prospect,
				contract: r.contract?.length ? r.contract : FALLBACK.contract,
				loaded: true
			});
		} catch {
			setState({ loaded: true });
		} finally {
			inflight = null;
		}
	})();
	return inflight;
}
function subscribe(cb) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}
var getSnapshot = () => state;
function useStatusOptions(entity) {
	const snap = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
	(0, import_react.useEffect)(() => {
		fetchAll();
	}, []);
	const refresh = (0, import_react.useCallback)(() => fetchAll(true), []);
	return {
		options: snap[entity],
		values: snap[entity].map((o) => o.value),
		loaded: snap.loaded,
		refresh
	};
}
function refreshStatusOptions() {
	return fetchAll(true);
}
export { useStatusOptions as n, refreshStatusOptions as t };
