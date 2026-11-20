import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/importHistory-DY8ex3tY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** React hook: subscribes to storage + in-tab updates. */
var KEY = "protection_erp_import_runs";
var LIMIT = 50;
var EVT = "import-runs:changed";
function safeParse() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return [];
		const arr = JSON.parse(raw);
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}
function getImportRuns() {
	return safeParse();
}
function recordImportRun(run) {
	const full = {
		...run,
		id: `IR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
		ts: (/* @__PURE__ */ new Date()).toISOString()
	};
	if (typeof window === "undefined") return full;
	const all = [full, ...safeParse()].slice(0, LIMIT);
	try {
		window.localStorage.setItem(KEY, JSON.stringify(all));
		window.dispatchEvent(new CustomEvent(EVT));
	} catch {}
	return full;
}
function clearImportRuns() {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(KEY);
	window.dispatchEvent(new CustomEvent(EVT));
}
function useImportRuns() {
	const [runs, setRuns] = (0, import_react.useState)(() => getImportRuns());
	(0, import_react.useEffect)(() => {
		const sync = () => setRuns(getImportRuns());
		window.addEventListener(EVT, sync);
		window.addEventListener("storage", (e) => {
			if (e.key === KEY) sync();
		});
		return () => {
			window.removeEventListener(EVT, sync);
		};
	}, []);
	return runs;
}
export { recordImportRun as n, useImportRuns as r, clearImportRuns as t };
