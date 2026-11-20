import { n as __exportAll$1 } from "../_runtime.mjs";
// node_modules/.nitro/vite/services/ssr/assets/api-2UuWgcOn.js
var api_2UuWgcOn_exports = /* @__PURE__ */ __exportAll$1({ o: () => api_exports });
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var api_exports = /* @__PURE__ */ __exportAll({
	API_ENABLED: () => true,
	api: () => api
});
var BASE = "https://luccibyey.com.tn/intranetprotec";
var API_BASE = BASE;
/** Build absolute URL to any backend file path (e.g. attachments.php?download=...) */
function apiUrl(path) {
	if (!path) return "";
	if (/^https?:\/\//i.test(path)) return path;
	return BASE + (path.startsWith("/") ? path : `/${path}`);
}
/** Upload one file via multipart/form-data. Used by attachments.php. */
async function apiUpload(path, fields) {
	const url = BASE + (path.startsWith("/") ? path : `/${path}`);
	const fd = new FormData();
	for (const [k, v] of Object.entries(fields)) fd.append(k, v);
	const headers = {};
	const token = getToken();
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
		headers["X-Auth-Token"] = token;
	}
	const res = await fetch(url, {
		method: "POST",
		headers,
		body: fd
	});
	let data = null;
	try {
		data = await res.json();
	} catch {}
	if (!res.ok || data && data.success === false) {
		const msg = data?.message ?? `HTTP ${res.status}`;
		const code = data?.code;
		if (res.status === 401) setToken(null);
		if (code === "IP_NOT_ALLOWED" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("erp:ip-blocked", { detail: {
			message: msg,
			ip: data?.ip
		} }));
		throw new ApiError(msg, res.status, code);
	}
	return data;
}
var TOKEN_KEY = "protection_erp_token";
function getToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
}
function setToken(t) {
	if (typeof window === "undefined") return;
	if (t) localStorage.setItem(TOKEN_KEY, t);
	else localStorage.removeItem(TOKEN_KEY);
}
var ApiError = class extends Error {
	status;
	code;
	constructor(message, status, code) {
		super(message);
		this.status = status;
		this.code = code;
	}
};
/** Broadcast an IP-blocked event so the UI can show a full-screen banner. */
function notifyIpBlocked(message, ip) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("erp:ip-blocked", { detail: {
		message,
		ip
	} }));
}
async function api(path, opts = {}) {
	const url = new URL(BASE + (path.startsWith("/") ? path : `/${path}`));
	if (opts.query) {
		for (const [k, v] of Object.entries(opts.query)) if (v !== void 0 && v !== null) url.searchParams.set(k, String(v));
	}
	const headers = { "Content-Type": "application/json" };
	const token = getToken();
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
		headers["X-Auth-Token"] = token;
	}
	const res = await fetch(url.toString(), {
		method: opts.method ?? "GET",
		headers,
		body: opts.body !== void 0 ? JSON.stringify(opts.body) : void 0
	});
	let data = null;
	try {
		data = await res.json();
	} catch {}
	if (!res.ok || data && data.success === false) {
		const msg = data?.message ?? `HTTP ${res.status}`;
		const code = data?.code;
		if (res.status === 401) setToken(null);
		if (code === "IP_NOT_ALLOWED") notifyIpBlocked(msg, data?.ip);
		throw new ApiError(msg, res.status, code);
	}
	return data;
}
export { apiUrl as a, setToken as c, apiUpload as i, __exportAll as n, api_2UuWgcOn_exports as o, api as r, getToken as s, API_BASE as t };
