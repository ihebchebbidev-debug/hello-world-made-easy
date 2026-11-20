import { i as __toESM } from "../_runtime.mjs";
import { c as setToken, r as api, s as getToken } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as Slot } from "../_libs/@radix-ui/react-label+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/input-IbC7Hkfd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(null);
async function loadPermissionsForRole(role) {
	if (role === "Administrateur") return new Proxy({}, { get: () => true });
	try {
		const raw = (await api("/roles.php")).permissions?.[role];
		if (!raw || Array.isArray(raw)) return {};
		return raw;
	} catch {
		return {};
	}
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(!!getToken());
	const [permissions, setPermissions] = (0, import_react.useState)({});
	const applyPermsForUser = (0, import_react.useCallback)(async (u) => {
		if (!u) {
			setPermissions({});
			return;
		}
		const perms = await loadPermissionsForRole(u.role);
		setPermissions(perms);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!getToken()) {
			setLoading(false);
			return;
		}
		api("/auth_me.php").then(async (r) => {
			setUser(r.user);
			await applyPermsForUser(r.user);
		}).catch(() => {
			setToken(null);
			setUser(null);
		}).finally(() => setLoading(false));
	}, [applyPermsForUser]);
	const login = async (username, password) => {
		const r = await api("/auth_login.php", {
			method: "POST",
			body: {
				username,
				password
			}
		});
		setToken(r.token);
		setUser(r.user);
		await applyPermsForUser(r.user);
	};
	const signup = async (input) => {
		const r = await api("/auth_signup.php", {
			method: "POST",
			body: input
		});
		setToken(r.token);
		setUser(r.user);
		await applyPermsForUser(r.user);
	};
	const changePassword = async (currentPassword, newPassword) => {
		if (!newPassword || newPassword.length < 8) throw new Error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
		if (currentPassword === newPassword) throw new Error("Le nouveau mot de passe doit être différent de l'actuel.");
		await api("/auth_change_password.php", {
			method: "POST",
			body: {
				currentPassword,
				newPassword
			}
		});
		setUser((u) => u ? {
			...u,
			mustChangePassword: false
		} : u);
	};
	const clearMustChange = () => setUser((u) => u ? {
		...u,
		mustChangePassword: false
	} : u);
	const logout = () => {
		api("/auth_logout.php", { method: "POST" }).catch(() => {});
		setToken(null);
		setUser(null);
		setPermissions({});
		if (typeof window !== "undefined") window.location.href = "/login";
	};
	const hasPermission = (0, import_react.useCallback)((key) => {
		if (!user) return false;
		if (user.role === "Administrateur") return true;
		if (user.role === "Présentation" && key === "dashboard") return permissions[key] !== false;
		if (key === "emails") return permissions[key] !== false;
		if (key === "contract") {
			if (permissions[key] !== void 0) return !!permissions[key];
			return user.role === "Agent" || user.role === "Vendeur" || user.role === "Manager" || user.role === "Superviseur" || user.role === "Backoffice";
		}
		return !!permissions[key];
	}, [user, permissions]);
	const refreshPermissions = (0, import_react.useCallback)(async () => {
		await applyPermsForUser(user);
	}, [user, applyPermsForUser]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user,
			loading,
			apiEnabled: true,
			permissions,
			hasPermission,
			refreshPermissions,
			login,
			signup,
			changePassword,
			clearMustChange,
			logout
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/**
* Format a date-ish value to "DD/MM/YYYY" (fr-FR).
* Returns null for empty/invalid input — callers can render "—" themselves
* or pass the result to <Row value={...}/> which already handles null.
*/
function formatDate(value) {
	if (value === null || value === void 0) return null;
	if (typeof value === "string") {
		const s = value.trim();
		if (!s || [
			"null",
			"undefined",
			"invalid date",
			"nan",
			"—",
			"-"
		].includes(s.toLowerCase())) return null;
	}
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	const pad = (n) => String(n).padStart(2, "0");
	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
/**
* Format a datetime-ish value to "DD/MM/YYYY HH:mm" (fr-FR). Returns null on invalid input.
*/
function formatDateTime(value) {
	if (value === null || value === void 0) return null;
	if (typeof value === "string") {
		const s = value.trim();
		if (!s || [
			"null",
			"undefined",
			"invalid date",
			"nan"
		].includes(s.toLowerCase())) return null;
	}
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	const pad = (n) => String(n).padStart(2, "0");
	return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
export { cn as a, useAuth as c, buttonVariants as i, Button as n, formatDate as o, Input as r, formatDateTime as s, AuthProvider as t };
