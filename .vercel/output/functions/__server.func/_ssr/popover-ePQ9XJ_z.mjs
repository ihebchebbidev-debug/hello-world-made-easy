import { i as __toESM } from "../_runtime.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { a as cn, c as useAuth } from "./input-IbC7Hkfd.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { fn as Circle, n as X, wn as Check, xn as ChevronRight } from "../_libs/lucide-react.mjs";
import { _ as Trigger, d as Content, f as Description, g as Title, h as Root, m as Portal, p as Overlay, u as Close } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger$1, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { i as Trigger$2, n as Portal$1, r as Root2$1, t as Content2$1 } from "../_libs/@radix-ui/react-popover+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/popover-ePQ9XJ_z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "erp.currency";
var EVT = "erp:currency-changed";
var DEFAULT_CURRENCY = {
	code: "TND",
	symbol: "TND",
	decimals: 3,
	position: "suffix"
};
function readCurrency() {
	if (typeof window === "undefined") return DEFAULT_CURRENCY;
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return DEFAULT_CURRENCY;
		return {
			...DEFAULT_CURRENCY,
			...JSON.parse(raw)
		};
	} catch {
		return DEFAULT_CURRENCY;
	}
}
function cacheCurrency(c) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(KEY, JSON.stringify(c));
	window.dispatchEvent(new CustomEvent(EVT));
}
/** Persist currency to backend (global setting); falls back to local cache only. */
async function writeCurrency(c) {
	cacheCurrency(c);
	try {
		await api("/settings.php", {
			method: "PUT",
			body: {
				scope: "global",
				key: "currency",
				value: c
			}
		});
	} catch (e) {
		console.warn("Currency persist failed", e);
	}
}
/** Refresh local cache from backend on app load. Deduped across concurrent callers and throttled. */
var _syncInFlight = null;
var _lastSyncAt = 0;
var SYNC_TTL_MS = 6e4;
async function syncCurrencyFromServer() {
	const now = Date.now();
	if (_syncInFlight) return _syncInFlight;
	if (now - _lastSyncAt < SYNC_TTL_MS) return;
	_syncInFlight = (async () => {
		try {
			const r = await api("/settings.php", { query: {
				scope: "global",
				key: "currency"
			} });
			if (r?.value && typeof r.value === "object") cacheCurrency({
				...DEFAULT_CURRENCY,
				...r.value
			});
			_lastSyncAt = Date.now();
		} catch {} finally {
			_syncInFlight = null;
		}
	})();
	return _syncInFlight;
}
function formatAmount(value, c = readCurrency()) {
	const formatted = (Number.isFinite(value) ? value : 0).toLocaleString("fr-FR", {
		minimumFractionDigits: c.decimals,
		maximumFractionDigits: c.decimals
	});
	return c.position === "prefix" ? `${c.symbol} ${formatted}` : `${formatted} ${c.symbol}`;
}
function formatCompact(value, c = readCurrency()) {
	const n = Number.isFinite(value) ? value : 0;
	if (Math.abs(n) >= 1e3) {
		const k = (n / 1e3).toLocaleString("fr-FR", {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		});
		return c.position === "prefix" ? `${c.symbol} ${k}k` : `${k}k ${c.symbol}`;
	}
	return formatAmount(n, c);
}
function useCurrency() {
	const [c, setC] = (0, import_react.useState)(() => readCurrency());
	(0, import_react.useEffect)(() => {
		const update = () => setC(readCurrency());
		window.addEventListener(EVT, update);
		window.addEventListener("storage", update);
		syncCurrencyFromServer().then(update);
		return () => {
			window.removeEventListener(EVT, update);
			window.removeEventListener("storage", update);
		};
	}, []);
	return c;
}
var ErpContext = (0, import_react.createContext)(null);
function recomputeUsers(users, prospects) {
	return users.map((u) => {
		const mine = prospects.filter((p) => p.assignedTo === u.username);
		const won = mine.filter((p) => p.outcome === "won").length;
		const handled = mine.length;
		const conv = handled > 0 ? won / handled * 100 : 0;
		if (u.role !== "Agent" && u.role !== "Manager") return u;
		return {
			...u,
			leadsHandled: handled,
			contractsWon: won,
			conversionRate: Number(conv.toFixed(1))
		};
	});
}
function ErpProvider({ children }) {
	const auth = (() => {
		try {
			return useAuth();
		} catch {
			return null;
		}
	})();
	const isLogged = !!auth?.user;
	const [prospects, setProspects] = (0, import_react.useState)([]);
	const [contracts, setContracts] = (0, import_react.useState)([]);
	const [importedUsers, setImportedUsers] = (0, import_react.useState)([]);
	const [serverUsers, setServerUsers] = (0, import_react.useState)(null);
	const [events, setEvents] = (0, import_react.useState)([]);
	const [activity, setActivity] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const liveUsers = serverUsers;
	const users = (0, import_react.useMemo)(() => recomputeUsers(liveUsers ?? importedUsers, prospects), [
		liveUsers,
		importedUsers,
		prospects
	]);
	const refresh = (0, import_react.useCallback)(async () => {
		if (!isLogged) return;
		setLoading(true);
		setError(null);
		try {
			const [p, c, u, ev] = await Promise.all([
				api("/prospects.php", { query: {
					page: 1,
					pageSize: 2e3
				} }),
				api("/contracts.php", { query: {
					page: 1,
					pageSize: 2e3
				} }),
				api("/users.php"),
				api("/calendar.php")
			]);
			setProspects(p.prospects ?? []);
			setContracts(c.contracts ?? []);
			setServerUsers(u.users ?? []);
			setEvents(ev.events ?? []);
			setHydrated(true);
			api("/activity.php").then((ac) => setActivity(ac.activity ?? [])).catch(() => {});
		} catch (e) {
			console.warn("ERP refresh failed", e);
			const msg = e?.status === 401 ? "Votre session a expiré. Veuillez vous reconnecter." : e?.status === 0 || e?.message === "Failed to fetch" ? "Impossible de joindre le serveur. Vérifiez votre connexion." : e?.status >= 500 ? "Le serveur est momentanément indisponible. Réessayez dans un instant." : e?.message ?? "Une erreur est survenue lors du chargement des données.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}, [isLogged]);
	(0, import_react.useEffect)(() => {
		refresh();
	}, [refresh]);
	const reloadProspects = (0, import_react.useCallback)(async () => {
		if (!isLogged) return;
		try {
			const r = await api("/prospects.php", { query: {
				page: 1,
				pageSize: 2e3
			} });
			setProspects(r.prospects ?? []);
		} catch (e) {
			console.warn("reloadProspects failed", e);
		}
	}, [isLogged]);
	const reloadContracts = (0, import_react.useCallback)(async () => {
		if (!isLogged) return;
		try {
			const r = await api("/contracts.php", { query: {
				page: 1,
				pageSize: 2e3
			} });
			setContracts(r.contracts ?? []);
		} catch (e) {
			console.warn("reloadContracts failed", e);
		}
	}, [isLogged]);
	const reloadEvents = (0, import_react.useCallback)(async () => {
		if (!isLogged) return;
		try {
			const r = await api("/calendar.php");
			setEvents(r.events ?? []);
		} catch (e) {
			console.warn("reloadEvents failed", e);
		}
	}, [isLogged]);
	const reloadUsers = (0, import_react.useCallback)(async () => {
		if (!isLogged) return;
		try {
			const r = await api("/users.php");
			setServerUsers(r.users ?? []);
		} catch (e) {
			console.warn("reloadUsers failed", e);
		}
	}, [isLogged]);
	const logActivityLocal = (0, import_react.useCallback)((contractId, field, previousValue, newValue) => {
		setActivity((prev) => [{
			id: `A-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			contractId,
			field,
			previousValue,
			newValue,
			user: auth?.user?.username ?? "system",
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		}, ...prev]);
	}, [auth?.user?.username]);
	const claimLead = (0, import_react.useCallback)(async (prospectId, agentUsername) => {
		await api("/prospects.php", {
			method: "POST",
			body: {
				action: "claim",
				id: prospectId
			}
		});
		setProspects((prev) => prev.map((p) => p.id === prospectId ? {
			...p,
			assignedTo: agentUsername,
			status: "A recontacter (Voir Commentaire)"
		} : p));
	}, []);
	const markWon = (0, import_react.useCallback)(async (prospectId, premium = 950, partner = "NEOLIANE") => {
		await api("/prospects.php", {
			method: "POST",
			body: {
				action: "mark_won",
				id: prospectId,
				premium,
				partner
			}
		});
		setProspects((prev) => prev.map((p) => p.id === prospectId ? {
			...p,
			outcome: "won",
			status: "Vente"
		} : p));
		reloadContracts();
	}, [reloadContracts, prospects]);
	const markLost = (0, import_react.useCallback)(async (prospectId, reason = "Non précisé") => {
		await api("/prospects.php", {
			method: "POST",
			body: {
				action: "mark_lost",
				id: prospectId,
				reason
			}
		});
		setProspects((prev) => prev.map((p) => p.id === prospectId ? {
			...p,
			outcome: "lost",
			status: "Sans réponse",
			lostReason: reason
		} : p));
	}, []);
	const updateContractBilling = (0, import_react.useCallback)(async (contractId, billingStatus) => {
		await api("/contracts.php", {
			method: "PATCH",
			body: {
				id: contractId,
				billingStatus
			}
		});
		setContracts((prev) => prev.map((c) => c.id === contractId ? {
			...c,
			billingStatus,
			validationDate: billingStatus === "Validé Confirmation" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : c.validationDate
		} : c));
	}, [logActivityLocal]);
	const updateContractPremium = (0, import_react.useCallback)(async (contractId, premium) => {
		await api("/contracts.php", {
			method: "PATCH",
			body: {
				id: contractId,
				premium
			}
		});
		setContracts((prev) => prev.map((c) => c.id === contractId ? {
			...c,
			premium
		} : c));
	}, [logActivityLocal]);
	const updateProspect = (0, import_react.useCallback)(async (id, patch) => {
		await api("/prospects.php", {
			method: "PATCH",
			body: {
				id,
				...patch
			}
		});
		setProspects((prev) => prev.map((p) => p.id === id ? {
			...p,
			...patch
		} : p));
	}, []);
	const deleteProspect = (0, import_react.useCallback)(async (id) => {
		await api(`/prospects.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
		setProspects((prev) => prev.filter((p) => p.id !== id));
	}, []);
	const saveUser = (0, import_react.useCallback)(async (u) => {
		await api("/users.php", {
			method: "POST",
			body: u
		});
		await reloadUsers();
	}, [reloadUsers]);
	const deleteUser = (0, import_react.useCallback)(async (id) => {
		await api(`/users.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
		await reloadUsers();
	}, [reloadUsers]);
	const saveEvent = (0, import_react.useCallback)(async (e) => {
		const currentUser = auth?.user?.username ?? "system";
		const payload = {
			...e,
			agent: e.agent ?? currentUser
		};
		if (payload.id && events.some((x) => x.id === payload.id)) await api("/calendar.php", {
			method: "PUT",
			body: payload
		});
		else await api("/calendar.php", {
			method: "POST",
			body: payload
		});
		await reloadEvents();
	}, [
		reloadEvents,
		events,
		auth?.user?.username
	]);
	const deleteEvent = (0, import_react.useCallback)(async (id) => {
		await api(`/calendar.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
		setEvents((prev) => prev.filter((e) => e.id !== id));
	}, []);
	const getContractActivity = (0, import_react.useCallback)((contractId) => activity.filter((a) => a.contractId === contractId), [activity]);
	const getAgentStats = (0, import_react.useCallback)((username) => {
		const mine = prospects.filter((p) => p.assignedTo === username);
		const won = mine.filter((p) => p.outcome === "won").length;
		const lost = mine.filter((p) => p.outcome === "lost").length;
		const pending = mine.filter((p) => p.outcome === "pending").length;
		const handled = mine.length;
		return {
			handled,
			won,
			lost,
			pending,
			conversion: handled ? won / handled * 100 : 0
		};
	}, [prospects]);
	const value = {
		prospects,
		users,
		contracts,
		activity,
		events,
		loading,
		error,
		hydrated,
		claimLead,
		markWon,
		markLost,
		updateContractBilling,
		updateContractPremium,
		updateProspect,
		deleteProspect,
		saveUser,
		deleteUser,
		saveEvent,
		deleteEvent,
		importProspects: (0, import_react.useCallback)(async (rows) => {
			{
				const CHUNK = 250;
				let added = 0, updated = 0, skipped = 0;
				for (let i = 0; i < rows.length; i += CHUNK) {
					const slice = rows.slice(i, i + CHUNK);
					try {
						const r = await api("/prospects.php", {
							method: "POST",
							body: { rows: slice }
						});
						added += Number(r.added ?? 0);
						updated += Number(r.updated ?? 0);
						skipped += Number(r.skipped ?? 0);
					} catch (err) {
						console.error("[importProspects] batch failed", err);
						skipped += slice.length;
					}
				}
				await reloadProspects();
				return {
					added,
					updated,
					skipped
				};
			}
		}, [reloadProspects]),
		importContracts: (0, import_react.useCallback)(async (rows) => {
			{
				const r = await api("/contracts.php", {
					method: "POST",
					body: { rows }
				});
				await reloadContracts();
				return {
					added: r.added,
					updated: r.updated,
					skipped: r.skipped
				};
			}
		}, [reloadContracts]),
		importUsers: (0, import_react.useCallback)(async (rows) => {
			{
				const r = await api("/users.php", {
					method: "POST",
					body: { rows }
				});
				await reloadUsers();
				return {
					added: r.added,
					updated: r.updated,
					skipped: r.skipped
				};
			}
		}, [reloadUsers, importedUsers]),
		getAgentStats,
		getContractActivity,
		logActivity: logActivityLocal,
		refresh
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErpContext.Provider, {
		value,
		children
	});
}
function useErp() {
	const ctx = (0, import_react.useContext)(ErpContext);
	if (!ctx) throw new Error("useErp must be used within ErpProvider");
	return ctx;
}
function useDashboardStats() {
	const { prospects, contracts } = useErp();
	const [server, setServer] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		api("/dashboard.php").then((r) => {
			if (!cancel && r?.stats) setServer(r.stats);
		}).catch(() => {});
		return () => {
			cancel = true;
		};
	}, [prospects.length, contracts.length]);
	return (0, import_react.useMemo)(() => {
		const total = prospects.length;
		const won = prospects.filter((p) => p.outcome === "won").length;
		const lost = prospects.filter((p) => p.outcome === "lost").length;
		const pending = prospects.filter((p) => p.outcome === "pending").length;
		const unclaimed = prospects.filter((p) => p.assignedTo === null).length;
		const conv = total ? won / total * 100 : 0;
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const contractsToday = contracts.filter((c) => c.signatureDate === today).length;
		return {
			totalLeads: total,
			newLeadsToday: unclaimed,
			contractsThisMonth: contracts.length,
			contractsToday,
			conversionRate: Number(conv.toFixed(1)),
			revenueThisMonth: contracts.reduce((s, c) => s + c.premium, 0),
			wonLeads: won,
			lostLeads: lost,
			pendingLeads: pending,
			...server ?? {}
		};
	}, [
		prospects,
		contracts,
		server
	]);
}
var Dialog = Root;
var DialogTrigger = Trigger;
var DialogPortal = Portal;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = Overlay.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = Content.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = Title.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = Description.displayName;
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger$1;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var Popover = Root2$1;
var PopoverTrigger = Trigger$2;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2$1.displayName;
export { useDashboardStats as C, useCurrency as S, writeCurrency as T, PopoverContent as _, DialogFooter as a, formatCompact as b, DialogTrigger as c, DropdownMenuItem as d, DropdownMenuLabel as f, Popover as g, ErpProvider as h, DialogDescription as i, DropdownMenu as l, DropdownMenuTrigger as m, Dialog as n, DialogHeader as o, DropdownMenuSeparator as p, DialogContent as r, DialogTitle as s, DEFAULT_CURRENCY as t, DropdownMenuContent as u, PopoverTrigger as v, useErp as w, readCurrency as x, formatAmount as y };
