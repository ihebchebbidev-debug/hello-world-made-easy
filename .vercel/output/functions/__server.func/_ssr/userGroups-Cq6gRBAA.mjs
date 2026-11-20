import { i as __toESM } from "../_runtime.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/userGroups-Cq6gRBAA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var cache = {};
var loaded = false;
var loading = null;
var listeners = /* @__PURE__ */ new Set();
var emit = () => {
	for (const l of listeners) l();
};
async function refreshUserGroups() {
	if (loading) return loading;
	loading = (async () => {
		try {
			cache = (await api("/user_groups.php")).memberships ?? {};
			loaded = true;
			emit();
		} catch {} finally {
			loading = null;
		}
	})();
	return loading;
}
async function saveUserGroups(userId, groups) {
	const r = await api("/user_groups.php", {
		method: "PUT",
		body: {
			user_id: userId,
			groups
		}
	});
	cache[userId] = r.groups ?? [];
	emit();
	return cache[userId];
}
async function fetchUserGroups(userId) {
	try {
		const r = await api(`/user_groups.php?user_id=${encodeURIComponent(userId)}`);
		cache[userId] = r.groups ?? [];
		emit();
		return cache[userId];
	} catch {
		return cache[userId] ?? [];
	}
}
var subscribe = (cb) => {
	listeners.add(cb);
	if (!loaded) refreshUserGroups();
	return () => {
		listeners.delete(cb);
	};
};
var getSnapshot = () => cache;
function useAllUserGroups() {
	return (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
}
refreshUserGroups();
export { saveUserGroups as n, useAllUserGroups as r, fetchUserGroups as t };
