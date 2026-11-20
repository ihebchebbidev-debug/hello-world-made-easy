import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { n as Button } from "./input-IbC7Hkfd.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Ln as Bell, Tn as CheckCheck, b as Trash2, q as RefreshCw, wn as Check } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/notifications-BQNJ96vf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotificationsPage() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [unread, setUnread] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const r = await api("/notifications.php");
			setItems(r.notifications ?? []);
			setUnread(r.unread ?? 0);
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const markRead = async (id) => {
		try {
			await api("/notifications.php", {
				method: "PATCH",
				body: { id }
			});
			await load();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		}
	};
	const markAll = async () => {
		try {
			await api("/notifications.php", {
				method: "PATCH",
				body: { all: true }
			});
			toast.success("Tout marqué comme lu");
			await load();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		}
	};
	const remove = async (id) => {
		try {
			await api(`/notifications.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
			await load();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-5 w-5" }),
		title: "Notifications",
		description: unread > 0 ? `${unread} non lue(s)` : "Tout est à jour",
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: load,
				disabled: loading,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}` }), " Actualiser"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: markAll,
				disabled: unread === 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-4 w-4 mr-1.5" }), " Tout marquer lu"]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: items.length === 0 && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "py-12 text-center text-sm text-muted-foreground",
			children: "Aucune notification"
		}) }) : items.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: n.read ? "opacity-70" : "",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-3 flex items-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mt-1 h-2 w-2 rounded-full shrink-0 ${n.read ? "bg-muted" : "bg-primary"}` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium text-sm truncate",
									children: n.title
								}), !n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-[10px]",
									children: "Nouveau"
								})]
							}),
							n.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mt-0.5 break-words",
								children: n.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground/70 mt-1",
								children: new Date(n.createdAt).toLocaleString("fr-FR")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1 shrink-0",
						children: [!n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => markRead(n.id),
							title: "Marquer lu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => remove(n.id),
							title: "Supprimer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
						})]
					})
				]
			})
		}, n.id))
	})] });
}
export { NotificationsPage as component };
