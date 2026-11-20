import { i as __toESM } from "../_runtime.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/groups-Cf_m-uYc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var CACHE_KEY = "erp.groups.v1";
var DEFAULTS = [
	"Direction",
	"Lead-Actifs",
	"Lead-Premium",
	"Backoffice",
	"TV"
];
function readCache() {
	if (typeof window === "undefined") return DEFAULTS;
	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		if (!raw) return DEFAULTS;
		const arr = JSON.parse(raw);
		return Array.isArray(arr) && arr.length ? arr.map(String) : DEFAULTS;
	} catch {
		return DEFAULTS;
	}
}
var cache = readCache();
var listeners = /* @__PURE__ */ new Set();
var emit = () => {
	for (const l of listeners) l();
};
function writeCache(next) {
	cache = next;
	try {
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
	} catch {}
	emit();
}
var loaded = false;
var loading = null;
async function refresh() {
	if (loading) return loading;
	loading = (async () => {
		try {
			const r = await api("/groups.php");
			if (Array.isArray(r.groups)) writeCache(r.groups);
			loaded = true;
		} catch {} finally {
			loading = null;
		}
	})();
	return loading;
}
refresh();
var groupsStore = {
	list: () => cache,
	refresh,
	async add(name) {
		const n = name.trim();
		if (!n || cache.includes(n)) return;
		writeCache([...cache, n]);
		try {
			const r = await api("/groups.php", {
				method: "POST",
				body: { name: n }
			});
			if (Array.isArray(r.groups)) writeCache(r.groups);
		} catch (e) {
			await refresh();
			throw e;
		}
	},
	async rename(oldName, newName) {
		const n = newName.trim();
		if (!n || n === oldName) return;
		writeCache(cache.map((g) => g === oldName ? n : g));
		try {
			const r = await api("/groups.php", {
				method: "PATCH",
				body: {
					old: oldName,
					new: n
				}
			});
			if (Array.isArray(r.groups)) writeCache(r.groups);
		} catch (e) {
			await refresh();
			throw e;
		}
	},
	async remove(name) {
		const prev = cache;
		writeCache(cache.filter((g) => g !== name));
		try {
			const r = await api(`/groups.php?name=${encodeURIComponent(name)}`, { method: "DELETE" });
			if (Array.isArray(r.groups)) writeCache(r.groups);
		} catch (e) {
			writeCache(prev);
			throw e;
		}
	},
	reorder(next) {
		writeCache(next.filter((v, i, a) => a.indexOf(v) === i));
	}
};
function subscribe(cb) {
	listeners.add(cb);
	if (!loaded) refresh();
	return () => {
		listeners.delete(cb);
	};
}
var getSnapshot = () => cache;
function useGroups() {
	return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
}
export { useGroups as n, groupsStore as t };
