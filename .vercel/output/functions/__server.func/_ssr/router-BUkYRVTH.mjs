import { i as __toESM } from "../_runtime.mjs";
import { _ as PopoverContent, a as DialogFooter, d as DropdownMenuItem, g as Popover, h as ErpProvider, i as DialogDescription, l as DropdownMenu, m as DropdownMenuTrigger, n as Dialog, o as DialogHeader, p as DropdownMenuSeparator, r as DialogContent, s as DialogTitle, u as DropdownMenuContent, v as PopoverTrigger } from "./popover-ePQ9XJ_z.mjs";
import { a as cn, c as useAuth, i as buttonVariants, n as Button, r as Input, t as AuthProvider } from "./input-IbC7Hkfd.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { a as Overlay2, c as Title2, i as Description2, l as Trigger2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as apiUrl, c as setToken, i as apiUpload, n as __exportAll, r as api } from "./api-2UuWgcOn.mjs";
import { S as useRouter, _ as createFileRoute, d as HeadContent, f as useRouterState, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { $t as Eye, At as Image, B as Send, F as ShieldOff, Gn as ArrowDown, Ht as File, Ln as Bell, N as Shield, Ot as Info, P as ShieldX, Q as Plus, R as Settings, Rn as BellOff, Tn as CheckCheck, V as Search, Wt as FileText, _t as LockOpen, a as Users, b as Trash2, ct as MessageCircle, dt as Maximize2, gt as Lock, hn as CircleQuestionMark, in as Download, it as Minus, kt as Inbox, mt as LogOut, n as X, nt as Paperclip, q as RefreshCw, rn as EllipsisVertical, tn as ExternalLink, u as UserPlus, ut as Megaphone, v as TriangleAlert, vt as LoaderCircle, wn as Check } from "../_libs/lucide-react.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
// node_modules/.nitro/vite/services/ssr/assets/alert-dialog-D1ZtbIIF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AlertDialog = Root2;
var AlertDialogTrigger = Trigger2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
// node_modules/.nitro/vite/services/ssr/assets/router-BUkYRVTH.js
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
/**
* Thin top progress bar that tracks router transitions.
* Gives instant visual feedback during route changes / data fetches.
*/
function RouteProgressBar() {
	const isLoading = useRouterState({ select: (s) => s.isLoading || s.isTransitioning });
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [visible, setVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let raf;
		let timeout;
		if (isLoading) {
			setVisible(true);
			setProgress(15);
			const step = () => {
				setProgress((p) => p < 85 ? p + (85 - p) * .08 : p);
				raf = requestAnimationFrame(step);
			};
			raf = requestAnimationFrame(step);
		} else if (visible) {
			setProgress(100);
			timeout = setTimeout(() => {
				setVisible(false);
				setProgress(0);
			}, 220);
		}
		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(timeout);
		};
	}, [isLoading, visible]);
	if (!visible) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed top-0 left-0 right-0 z-[60] h-0.5 bg-transparent pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full bg-gradient-to-r from-[oklch(0.68_0.17_55)] via-[oklch(0.72_0.16_60)] to-[oklch(0.8_0.14_75)] shadow-[0_0_8px_oklch(0.68_0.17_55)] transition-[width] duration-200 ease-out",
			style: { width: `${progress}%` }
		})
	});
}
var ConfirmContext = (0, import_react.createContext)(null);
function ConfirmProvider({ children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [opts, setOpts] = (0, import_react.useState)({});
	const resolverRef = (0, import_react.useRef)(null);
	const lockedRef = (0, import_react.useRef)(false);
	const confirm = (0, import_react.useCallback)((o) => {
		if (lockedRef.current) return Promise.resolve(false);
		lockedRef.current = true;
		setOpts(o);
		setOpen(true);
		return new Promise((resolve) => {
			resolverRef.current = resolve;
		});
	}, []);
	const finish = (0, import_react.useCallback)((v) => {
		const resolve = resolverRef.current;
		resolverRef.current = null;
		setOpen(false);
		if (resolve) resolve(v);
		lockedRef.current = false;
	}, []);
	const isDestructive = !!opts.destructive;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ConfirmContext.Provider, {
		value: confirm,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open,
			onOpenChange: (v) => {
				if (!v) finish(false);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, {
				className: "flex items-center gap-2",
				children: [isDestructive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-destructive" }), opts.title ?? "Confirmer l'action"]
			}), opts.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: opts.description }), isDestructive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive",
						children: "⚠ Action irréversible — les données ne pourront pas être récupérées."
					})]
				})
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
				onClick: () => finish(false),
				children: opts.cancelLabel ?? "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: () => finish(true),
				className: isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "",
				children: opts.confirmLabel ?? (isDestructive ? "Supprimer" : "Confirmer")
			})] })] })
		})]
	});
}
function useConfirm() {
	const ctx = (0, import_react.useContext)(ConfirmContext);
	if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
	return ctx;
}
var pushConfirm = null;
/**
* Imperative confirm dialog. Replaces window.confirm with a styled modal.
* Usage: `if (!(await confirmDialog({ title: "...", tone: "destructive" }))) return;`
*/
function confirmDialog(opts = {}) {
	return new Promise((resolve) => {
		if (!pushConfirm) {
			if (typeof window !== "undefined") resolve(window.confirm(opts.description ? String(opts.description) : opts.title || "Confirmer ?"));
			else resolve(false);
			return;
		}
		pushConfirm({
			...opts,
			resolve
		});
	});
}
var toneIcon = {
	destructive: Trash2,
	warning: TriangleAlert,
	info: Info,
	default: CircleQuestionMark
};
var toneIconClass = {
	destructive: "text-destructive bg-destructive/10",
	warning: "text-warning bg-warning/10",
	info: "text-primary bg-primary/10",
	default: "text-muted-foreground bg-muted"
};
function ConfirmDialogProvider({ children }) {
	const [queue, setQueue] = (0, import_react.useState)([]);
	const current = queue[0];
	(0, import_react.useEffect)(() => {
		pushConfirm = (c) => setQueue((q) => [...q, c]);
		return () => {
			pushConfirm = null;
		};
	}, []);
	const close = (value) => {
		if (!current) return;
		current.resolve(value);
		setQueue((q) => q.slice(1));
	};
	const tone = current?.tone || "default";
	const Icon = toneIcon[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: !!current,
		onOpenChange: (open) => {
			if (!open && current) close(false);
		},
		children: current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", toneIconClass[tone]),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-1.5 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: current.title || "Confirmer l'action" }), current.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: current.description })]
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			onClick: () => close(false),
			children: current.cancelText || "Annuler"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: () => close(true),
			className: cn(tone === "destructive" && buttonVariants({ variant: "destructive" })),
			children: current.confirmText || "Confirmer"
		})] })] })
	})] });
}
var PATH = "/chat.php";
var chatApi = {
	conversations: () => api(PATH, { query: { action: "conversations" } }),
	messages: (conversationId, before, limit = 50) => api(PATH, { query: {
		action: "messages",
		conversation_id: conversationId,
		before,
		limit
	} }),
	poll: () => api(PATH, { query: { action: "poll" } }),
	search: (conversationId, q, limit = 30) => api(PATH, { query: {
		action: "search",
		conversation_id: conversationId,
		q,
		limit
	} }),
	users: () => api(PATH, { query: { action: "users" } }),
	send: (conversationId, body) => api(PATH, {
		method: "POST",
		body: {
			action: "send",
			conversation_id: conversationId,
			body
		}
	}),
	upload: (conversationId, file, caption = "") => apiUpload(PATH, {
		action: "upload",
		conversation_id: conversationId,
		body: caption,
		file
	}),
	createDm: (username) => api(PATH, {
		method: "POST",
		body: {
			action: "create_dm",
			user: username
		}
	}),
	createGroup: (name, members) => api(PATH, {
		method: "POST",
		body: {
			action: "create_group",
			name,
			members
		}
	}),
	addMembers: (conversationId, members) => api(PATH, {
		method: "POST",
		body: {
			action: "add_members",
			conversation_id: conversationId,
			members
		}
	}),
	removeMember: (conversationId, user) => api(PATH, {
		method: "POST",
		body: {
			action: "remove_member",
			conversation_id: conversationId,
			user
		}
	}),
	rename: (conversationId, name) => api(PATH, {
		method: "POST",
		body: {
			action: "rename",
			conversation_id: conversationId,
			name
		}
	}),
	setRole: (conversationId, user, role) => api(PATH, {
		method: "POST",
		body: {
			action: "set_role",
			conversation_id: conversationId,
			user,
			role
		}
	}),
	setPostPolicy: (conversationId, policy) => api(PATH, {
		method: "POST",
		body: {
			action: "set_post_policy",
			conversation_id: conversationId,
			policy
		}
	}),
	markRead: (conversationId) => api(PATH, {
		method: "POST",
		body: {
			action: "mark_read",
			conversation_id: conversationId
		}
	}),
	setMute: (conversationId, muted) => api(PATH, {
		method: "POST",
		body: {
			action: "set_mute",
			conversation_id: conversationId,
			muted
		}
	}),
	leave: (conversationId) => api(PATH, {
		method: "POST",
		body: {
			action: "leave",
			conversation_id: conversationId
		}
	}),
	broadcast: (input) => api(PATH, {
		method: "POST",
		body: {
			action: "broadcast",
			...input
		}
	})
};
var POLL_INTERVAL_MS = 5e3;
var ACTIVE_POLL_INTERVAL_MS = 2500;
var PAGE_SIZE = 30;
var ChatContext = (0, import_react.createContext)(null);
function ChatProvider({ children }) {
	const { user } = useAuth();
	const [conversations, setConversations] = (0, import_react.useState)([]);
	const [totalUnread, setTotalUnread] = (0, import_react.useState)(0);
	const [openIds, setOpenIds] = (0, import_react.useState)([]);
	const [minimized, setMinimized] = (0, import_react.useState)({});
	const [launcherOpen, setLauncherOpen] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [messagesByConv, setMessagesByConv] = (0, import_react.useState)({});
	const [hasMore, setHasMore] = (0, import_react.useState)({});
	const [loadingOlder, setLoadingOlder] = (0, import_react.useState)({});
	const messagesRef = (0, import_react.useRef)({});
	const hasMoreRef = (0, import_react.useRef)({});
	const loadingOlderRef = (0, import_react.useRef)({});
	const lastMsgAtRef = (0, import_react.useRef)({});
	const bootstrappedRef = (0, import_react.useRef)(false);
	const notifiedAtRef = (0, import_react.useRef)({});
	const conversationsRef = (0, import_react.useRef)([]);
	const openIdsRef = (0, import_react.useRef)([]);
	const minimizedRef = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		conversationsRef.current = conversations;
	}, [conversations]);
	(0, import_react.useEffect)(() => {
		openIdsRef.current = openIds;
	}, [openIds]);
	(0, import_react.useEffect)(() => {
		minimizedRef.current = minimized;
	}, [minimized]);
	const refreshConversations = (0, import_react.useCallback)(async () => {
		if (!user) return;
		try {
			const r = await chatApi.conversations();
			setConversations(r.conversations);
		} catch {}
	}, [user]);
	const loadMessages = (0, import_react.useCallback)(async (id) => {
		const r = await chatApi.messages(id, void 0, PAGE_SIZE);
		messagesRef.current[id] = r.messages;
		setMessagesByConv((prev) => ({
			...prev,
			[id]: r.messages
		}));
		const more = r.messages.length >= PAGE_SIZE;
		hasMoreRef.current[id] = more;
		setHasMore((prev) => ({
			...prev,
			[id]: more
		}));
		if (r.messages.length) lastMsgAtRef.current[id] = r.messages[r.messages.length - 1].createdAt;
		return r.messages;
	}, []);
	const loadOlder = (0, import_react.useCallback)(async (id) => {
		const current = messagesRef.current[id] ?? [];
		if (current.length === 0 || hasMoreRef.current[id] === false || loadingOlderRef.current[id]) return 0;
		loadingOlderRef.current[id] = true;
		setLoadingOlder((p) => ({
			...p,
			[id]: true
		}));
		try {
			const before = current[0].createdAt;
			const r = await chatApi.messages(id, before, PAGE_SIZE);
			const seen = new Set(current.map((m) => m.id));
			const fresh = r.messages.filter((m) => !seen.has(m.id));
			const merged = [...fresh, ...current];
			messagesRef.current[id] = merged;
			setMessagesByConv((prev) => ({
				...prev,
				[id]: merged
			}));
			const more = r.messages.length >= PAGE_SIZE;
			hasMoreRef.current[id] = more;
			setHasMore((prev) => ({
				...prev,
				[id]: more
			}));
			return fresh.length;
		} catch {
			return 0;
		} finally {
			loadingOlderRef.current[id] = false;
			setLoadingOlder((p) => ({
				...p,
				[id]: false
			}));
		}
	}, []);
	const markRead = (0, import_react.useCallback)(async (id) => {
		try {
			await chatApi.markRead(id);
		} catch {}
		setConversations((prev) => prev.map((c) => c.id === id ? {
			...c,
			unread: 0,
			lastReadAt: (/* @__PURE__ */ new Date()).toISOString()
		} : c));
	}, []);
	const openConversation = (0, import_react.useCallback)((id, opts) => {
		setOpenIds((prev) => {
			if (prev.includes(id)) return prev;
			return [...prev, id].slice(-3);
		});
		setMinimized((m) => ({
			...m,
			[id]: !!opts?.minimized
		}));
		if (!opts?.silent) setLauncherOpen(false);
		loadMessages(id).then(() => {
			if (!opts?.silent) markRead(id);
		});
	}, [loadMessages, markRead]);
	const closeConversation = (0, import_react.useCallback)((id) => {
		setOpenIds((prev) => prev.filter((x) => x !== id));
	}, []);
	const toggleMinimize = (0, import_react.useCallback)((id) => {
		setMinimized((m) => ({
			...m,
			[id]: !m[id]
		}));
	}, []);
	const ingestMessage = (0, import_react.useCallback)((id, msg) => {
		const merged = [...messagesRef.current[id] ?? [], msg];
		messagesRef.current[id] = merged;
		setMessagesByConv((prev) => ({
			...prev,
			[id]: merged
		}));
		lastMsgAtRef.current[id] = msg.createdAt;
		const preview = msg.body || (msg.attachment ? `📎 ${msg.attachment.filename}` : "");
		setConversations((prev) => prev.map((c) => c.id === id ? {
			...c,
			lastBody: preview,
			lastSender: msg.sender,
			lastMessageAt: msg.createdAt
		} : c));
	}, []);
	const send = (0, import_react.useCallback)(async (id, body) => {
		const r = await chatApi.send(id, body);
		ingestMessage(id, r.message);
	}, [ingestMessage]);
	const uploadFile = (0, import_react.useCallback)(async (id, file, caption = "") => {
		const r = await chatApi.upload(id, file, caption);
		ingestMessage(id, r.message);
	}, [ingestMessage]);
	const setMute = (0, import_react.useCallback)(async (id, muted) => {
		await chatApi.setMute(id, muted);
		setConversations((prev) => prev.map((c) => c.id === id ? {
			...c,
			muted
		} : c));
	}, []);
	const loadAround = (0, import_react.useCallback)(async (id, targetIso) => {
		const before = new Date(new Date(targetIso).getTime() + 1).toISOString();
		const r = await chatApi.messages(id, before, 80);
		messagesRef.current[id] = r.messages;
		setMessagesByConv((prev) => ({
			...prev,
			[id]: r.messages
		}));
		const more = r.messages.length >= 80;
		hasMoreRef.current[id] = more;
		setHasMore((prev) => ({
			...prev,
			[id]: more
		}));
		if (r.messages.length) lastMsgAtRef.current[id] = r.messages[r.messages.length - 1].createdAt;
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") try {
			Notification.requestPermission();
		} catch {}
		let cancelled = false;
		setLoading(true);
		refreshConversations().finally(() => {
			if (cancelled) return;
			setLoading(false);
			setConversations((prev) => {
				for (const c of prev) if (c.lastMessageAt) notifiedAtRef.current[c.id] = c.lastMessageAt;
				bootstrappedRef.current = true;
				return prev;
			});
		});
		let timer;
		const tick = async () => {
			try {
				const p = await chatApi.poll();
				if (cancelled) return;
				setTotalUnread(p.totalUnread);
				let needsRefresh = false;
				const openSet = new Set(openIdsRef.current);
				const currentConvs = conversationsRef.current;
				const currentMinimized = minimizedRef.current;
				for (const c of p.conversations) {
					const known = currentConvs.find((x) => x.id === c.id);
					if (!known || known.lastMessageAt !== c.lastMessageAt) needsRefresh = true;
					if (openSet.has(c.id) && c.lastMessageAt && lastMsgAtRef.current[c.id] !== c.lastMessageAt) loadMessages(c.id).then(() => {
						if (!currentMinimized[c.id]) markRead(c.id);
					});
				}
				if (needsRefresh) {
					await refreshConversations();
					if (bootstrappedRef.current) try {
						const fresh = { conversations: conversationsRef.current };
						for (const conv of fresh.conversations) {
							const seen = notifiedAtRef.current[conv.id];
							if (!conv.lastMessageAt) continue;
							if (seen === conv.lastMessageAt) continue;
							notifiedAtRef.current[conv.id] = conv.lastMessageAt;
							if (conv.lastSender && user && conv.lastSender === user.username || conv.muted) continue;
							const isOpen = openSet.has(conv.id) && !currentMinimized[conv.id];
							const title = conv.name ? conv.name : conv.members.find((m) => m.username !== user?.username)?.fullName ?? "Nouveau message";
							const senderMember = conv.members.find((m) => m.username === conv.lastSender);
							const senderLabel = senderMember?.fullName ?? conv.lastSender ?? "";
							const isBroadcast = conv.type === "broadcast";
							const isAdminGroup = conv.type === "group" && senderMember?.role === "admin";
							const preview = conv.lastBody || "📎 Pièce jointe";
							if (!isOpen) {
								const shouldExpand = isBroadcast || isAdminGroup || conv.type === "dm";
								openConversation(conv.id, {
									silent: true,
									minimized: !shouldExpand
								});
							}
							const toastTitle = isBroadcast ? `📢 Annonce — ${title}` : conv.type === "group" ? `👥 ${title}` : title;
							toast.message(toastTitle, {
								description: senderLabel ? `${senderLabel}: ${preview}` : preview,
								action: {
									label: "Ouvrir",
									onClick: () => openConversation(conv.id)
								}
							});
							if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") try {
								const n = new Notification(toastTitle, {
									body: senderLabel ? `${senderLabel}: ${preview}` : preview,
									tag: conv.id
								});
								n.onclick = () => {
									try {
										window.focus();
									} catch {}
									openConversation(conv.id);
									n.close();
								};
							} catch {}
						}
					} catch {}
				}
			} catch {}
			const interval = openIdsRef.current.length > 0 ? ACTIVE_POLL_INTERVAL_MS : POLL_INTERVAL_MS;
			timer = setTimeout(tick, interval);
		};
		timer = setTimeout(tick, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [user]);
	const value = (0, import_react.useMemo)(() => ({
		conversations,
		totalUnread,
		openIds,
		minimized,
		launcherOpen,
		loading,
		setLauncherOpen,
		openConversation,
		closeConversation,
		toggleMinimize,
		refreshConversations,
		loadMessages,
		loadOlder,
		send,
		uploadFile,
		markRead,
		setMute,
		loadAround,
		messagesByConv,
		hasMore,
		loadingOlder
	}), [
		conversations,
		totalUnread,
		openIds,
		minimized,
		launcherOpen,
		loading,
		openConversation,
		closeConversation,
		toggleMinimize,
		refreshConversations,
		loadMessages,
		loadOlder,
		send,
		uploadFile,
		markRead,
		setMute,
		loadAround,
		messagesByConv,
		hasMore,
		loadingOlder
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatContext.Provider, {
		value,
		children
	});
}
function useChat() {
	const c = (0, import_react.useContext)(ChatContext);
	if (!c) throw new Error("useChat must be used inside ChatProvider");
	return c;
}
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function initials(name) {
	if (!name) return "?";
	return name.split(/[.\s_-]+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}
function timeShort(iso) {
	if (!iso) return "";
	const d = new Date(iso);
	const now = /* @__PURE__ */ new Date();
	if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
	if ((now.getTime() - d.getTime()) / 864e5 < 7) return d.toLocaleDateString(void 0, { weekday: "short" });
	return d.toLocaleDateString();
}
function convTitle(c, meUsername) {
	if (c.name) return c.name;
	if (c.type === "dm") return c.members.find((m) => m.username !== meUsername)?.fullName ?? "Conversation";
	return c.members.map((m) => m.fullName).slice(0, 3).join(", ") || "Groupe";
}
var GRADIENTS = [
	"from-violet-500 to-fuchsia-500",
	"from-blue-500 to-cyan-500",
	"from-emerald-500 to-teal-500",
	"from-amber-500 to-orange-500",
	"from-rose-500 to-pink-500",
	"from-indigo-500 to-purple-600",
	"from-sky-500 to-blue-600",
	"from-lime-500 to-emerald-500"
];
function colorForName(s) {
	if (!s) return GRADIENTS[0];
	let h = 0;
	for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
	return GRADIENTS[h % GRADIENTS.length];
}
function formatDayLabel(iso) {
	const d = new Date(iso);
	const now = /* @__PURE__ */ new Date();
	const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
	const diff = (startOfDay(now) - startOfDay(d)) / 864e5;
	if (diff === 0) return "Aujourd'hui";
	if (diff === 1) return "Hier";
	if (diff < 7) return d.toLocaleDateString(void 0, { weekday: "long" });
	return d.toLocaleDateString(void 0, {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
}
function timeOfDay(iso) {
	return new Date(iso).toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function ConvAvatar({ conv, meUsername, size = 40 }) {
	const cls = `rounded-full flex items-center justify-center font-semibold text-white shrink-0 bg-gradient-to-br ${conv.type === "broadcast" ? "from-amber-500 to-orange-600" : conv.type === "group" ? "from-indigo-500 to-purple-600" : colorForName(conv.members.find((m) => m.username !== meUsername)?.username ?? conv.id)}`;
	const style = {
		height: size,
		width: size,
		fontSize: Math.max(10, size * .34)
	};
	const Icon = conv.type === "broadcast" ? Megaphone : conv.type === "group" ? Users : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cls,
		style,
		children: Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { style: {
			height: size * .45,
			width: size * .45
		} }) : initials(convTitle(conv, meUsername))
	});
}
function UserAvatar({ name, username, size = 28 }) {
	const cls = `rounded-full flex items-center justify-center font-semibold text-white shrink-0 bg-gradient-to-br ${colorForName(username || name)}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cls,
		style: {
			height: size,
			width: size,
			fontSize: Math.max(9, size * .4)
		},
		children: initials(name || username)
	});
}
function AttachmentBubble({ att, mine }) {
	const url = apiUrl(att.url);
	const isImage = att.mimeType?.startsWith("image/");
	const isPdf = att.mimeType === "application/pdf";
	if (isImage) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: url,
		target: "_blank",
		rel: "noreferrer",
		className: `max-w-full block rounded-2xl overflow-hidden border border-border ${mine ? "rounded-br-md" : "rounded-bl-md"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: att.filename,
			className: "block max-h-64 w-auto object-cover",
			loading: "lazy"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: url,
		target: "_blank",
		rel: "noreferrer",
		className: `max-w-full flex items-center gap-2 px-3 py-2 rounded-2xl text-sm border ${mine ? "bg-primary text-primary-foreground border-primary rounded-br-md" : "bg-muted border-border rounded-bl-md"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-8 w-8 rounded-md bg-background/40 flex items-center justify-center shrink-0",
				children: isPdf ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate font-medium",
					children: att.filename
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[10px] opacity-70",
					children: [(att.sizeBytes / 1024).toFixed(1), " Ko"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 opacity-70" })
		]
	});
}
var GROUP_GAP_MS = 3e5;
function isSameGroup(a, b) {
	if (a.isSystem || b.isSystem) return false;
	if (a.sender !== b.sender) return false;
	return Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) <= GROUP_GAP_MS;
}
function isSameDay(a, b) {
	const da = new Date(a);
	const db = new Date(b);
	return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
function ScrollToBottomButton({ show, onClick, unread }) {
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "absolute bottom-3 right-3 z-10 h-9 w-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted/70 transition",
		title: "Aller au dernier message",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-4 w-4" }), !!unread && unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center",
			children: unread > 9 ? "9+" : unread
		})]
	});
}
function DaySeparator({ iso }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 my-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-0.5 bg-muted/40 rounded-full",
				children: formatDayLabel(iso)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" })
		]
	});
}
function MessageList({ conv, messages, meUsername, highlightedId, highlightTerm }) {
	const recipientCount = Math.max(0, conv.members.length - 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-0",
		children: messages.map((m, i) => {
			const prev = messages[i - 1];
			const next = messages[i + 1];
			const showDay = !prev || !isSameDay(prev.createdAt, m.createdAt);
			if (m.isSystem) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [showDay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DaySeparator, { iso: m.createdAt }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-center text-[11px] text-muted-foreground py-1.5",
				children: m.body
			})] }, m.id);
			const mine = m.sender === meUsername;
			const groupedWithPrev = !!prev && !showDay && isSameGroup(prev, m);
			const groupedWithNext = !!next && isSameDay(m.createdAt, next.createdAt) && isSameGroup(m, next);
			const isGroup = conv.type !== "dm";
			const showName = !mine && isGroup && !groupedWithPrev;
			const showAvatar = !mine && isGroup && !groupedWithNext;
			const showTime = !groupedWithNext;
			const bubbleRadius = mine ? `rounded-2xl ${groupedWithPrev ? "rounded-tr-md" : ""} ${groupedWithNext ? "rounded-br-md" : ""}` : `rounded-2xl ${groupedWithPrev ? "rounded-tl-md" : ""} ${groupedWithNext ? "rounded-bl-md" : ""}`;
			const isHighlighted = highlightedId === m.id;
			const showSeen = mine && !groupedWithNext;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-message-id": m.id,
				children: [showDay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DaySeparator, { iso: m.createdAt }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex items-end gap-2 ${mine ? "flex-row-reverse" : ""} ${groupedWithPrev ? "mt-0.5" : "mt-2"}`,
					children: [!mine && isGroup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-7 shrink-0",
						children: showAvatar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
							name: m.senderName,
							username: m.sender,
							size: 28
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex flex-col max-w-[78%] sm:max-w-[68%] ${mine ? "items-end" : "items-start"}`,
						children: [
							showName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground mb-0.5 px-2 font-medium",
								children: m.senderName
							}),
							m.attachment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentBubble, {
								att: m.attachment,
								mine
							}),
							m.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `px-3 py-1.5 text-sm break-words shadow-sm transition-shadow ${bubbleRadius} ${mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} ${m.attachment ? "mt-1" : ""} ${isHighlighted ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-background animate-pulse" : ""}`,
								children: highlightTerm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlighted, {
									text: m.body,
									term: highlightTerm
								}) : m.body
							}),
							showTime && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-muted-foreground mt-0.5 px-1 flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeOfDay(m.createdAt) }), showSeen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeenByIndicator, {
									seenBy: m.seenBy ?? [],
									recipientCount,
									isDm: conv.type === "dm"
								})]
							})
						]
					})]
				})]
			}, m.id);
		})
	});
}
function SeenByIndicator({ seenBy, recipientCount, isDm }) {
	const count = seenBy.length;
	const allSeen = recipientCount > 0 && count >= recipientCount;
	const Icon = count === 0 ? Check : allSeen ? CheckCheck : Eye;
	const label = count === 0 ? "Envoyé" : isDm ? "Vu" : allSeen ? `Vu par tous (${count})` : `Vu par ${count}${recipientCount > 0 ? `/${recipientCount}` : ""}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			disabled: count === 0,
			className: `inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium transition ${count === 0 ? "text-muted-foreground" : allSeen ? "text-primary" : "text-foreground/70"} ${count > 0 ? "hover:bg-muted/60 cursor-pointer" : "cursor-default"}`,
			title: count > 0 ? "Voir qui a lu ce message" : "Pas encore lu",
			onClick: (e) => {
				if (count === 0) e.preventDefault();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
		})
	}), count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
		align: "end",
		className: "w-64 p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-3 py-2 border-b border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs font-semibold",
				children: "Vu par"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-[11px] text-muted-foreground",
				children: [
					count,
					" ",
					count > 1 ? "personnes" : "personne",
					recipientCount > 0 ? ` sur ${recipientCount}` : ""
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-64 overflow-y-auto py-1",
			children: seenBy.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
					name: s.fullName,
					username: s.username,
					size: 26
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-medium truncate",
						children: s.fullName || s.username
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] text-muted-foreground",
						children: [
							formatDayLabel(s.readAt),
							" · ",
							timeOfDay(s.readAt)
						]
					})]
				})]
			}, s.username))
		})]
	})] });
}
function escapeRegex(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Highlighted({ text, term }) {
	if (!term.trim()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: text });
	const parts = text.split(new RegExp(`(${escapeRegex(term)})`, "ig"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: parts.map((p, i) => i % 2 === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
		className: "bg-amber-300/80 text-foreground rounded px-0.5",
		children: p
	}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p }, i)) });
}
function snippet(body, term, radius = 40) {
	if (!term) return body.slice(0, radius * 2);
	const idx = body.toLowerCase().indexOf(term.toLowerCase());
	if (idx < 0) return body.slice(0, radius * 2);
	const start = Math.max(0, idx - radius);
	const end = Math.min(body.length, idx + term.length + radius);
	return (start > 0 ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "");
}
function MessageSearchPanel({ conv, meUsername, onClose, onJump }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [debounced, setDebounced] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		inputRef.current?.focus();
	}, []);
	(0, import_react.useEffect)(() => {
		const t = setTimeout(() => setDebounced(q.trim()), 250);
		return () => clearTimeout(t);
	}, [q]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (debounced.length < 2) {
			setResults([]);
			return;
		}
		setLoading(true);
		chatApi.search(conv.id, debounced).then((r) => {
			if (!cancelled) setResults(r.results);
		}).catch(() => {
			if (!cancelled) setResults([]);
		}).finally(() => {
			if (!cancelled) setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [debounced, conv.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-b border-border bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						value: q,
						onChange: (e) => setQ(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Escape") onClose();
						},
						placeholder: "Rechercher dans la conversation…",
						className: "w-full h-9 pl-8 pr-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
					title: "Fermer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}),
			debounced.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-72 overflow-y-auto border-t border-border bg-background",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 text-center text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin inline mr-1" }), " Recherche…"]
				}) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 text-center text-xs text-muted-foreground",
					children: "Aucun résultat"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-3 py-1.5 text-[11px] text-muted-foreground bg-muted/30 sticky top-0",
					children: [
						results.length,
						" résultat",
						results.length > 1 ? "s" : ""
					]
				}), results.map((m) => {
					const isMe = m.sender === meUsername;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => onJump(m),
						className: "w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border/50 flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
							name: m.senderName,
							username: m.sender,
							size: 26
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold truncate",
									children: isMe ? "Vous" : m.senderName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										timeOfDay(m.createdAt),
										" · ",
										formatDayLabel(m.createdAt)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-foreground mt-0.5 line-clamp-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Highlighted, {
									text: snippet(m.body, debounced),
									term: debounced
								})
							})]
						})]
					}, m.id);
				})] })
			}),
			debounced.length > 0 && debounced.length < 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 py-2 text-[11px] text-muted-foreground border-t border-border",
				children: "Tapez au moins 2 caractères…"
			})
		]
	});
}
function useJumpToMessage(scrollRef) {
	const [highlightedId, setHighlightedId] = (0, import_react.useState)(null);
	const jump = (messageId) => {
		setHighlightedId(messageId);
		setTimeout(() => {
			const root = scrollRef.current;
			if (!root) return;
			const el = root.querySelector(`[data-message-id="${messageId}"]`);
			if (el) el.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
		}, 60);
		setTimeout(() => setHighlightedId((cur) => cur === messageId ? null : cur), 3500);
	};
	return {
		highlightedId,
		jump
	};
}
function useChatScroll(deps) {
	const { messages, convId, minimized, loadOlder, hasMore, loadingOlder } = deps;
	const scrollRef = (0, import_react.useRef)(null);
	const prevFirstIdRef = (0, import_react.useRef)(null);
	const prevScrollHeightRef = (0, import_react.useRef)(0);
	const stickToBottomRef = (0, import_react.useRef)(true);
	const [awayFromBottom, setAwayFromBottom] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = scrollRef.current;
		if (!el || minimized) return;
		const firstId = messages[0]?.id ?? null;
		if (prevFirstIdRef.current && firstId !== prevFirstIdRef.current) {
			const delta = el.scrollHeight - prevScrollHeightRef.current;
			el.scrollTop = el.scrollTop + delta;
		} else if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
		prevFirstIdRef.current = firstId;
		prevScrollHeightRef.current = el.scrollHeight;
	}, [messages, minimized]);
	(0, import_react.useEffect)(() => {
		if (minimized) return;
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
			stickToBottomRef.current = true;
			setAwayFromBottom(false);
		}
	}, [convId, minimized]);
	const onScroll = () => {
		const el = scrollRef.current;
		if (!el) return;
		const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		const near = distanceFromBottom < 80;
		stickToBottomRef.current = near;
		setAwayFromBottom(!near && distanceFromBottom > 200);
		if (el.scrollTop < 60 && hasMore && !loadingOlder) {
			prevScrollHeightRef.current = el.scrollHeight;
			loadOlder();
		}
	};
	const scrollToBottom = () => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTo({
			top: el.scrollHeight,
			behavior: "smooth"
		});
		stickToBottomRef.current = true;
		setAwayFromBottom(false);
	};
	return {
		scrollRef,
		onScroll,
		scrollToBottom,
		awayFromBottom
	};
}
function ChatWidget() {
	const { user } = useAuth();
	if (typeof window !== "undefined" && window.location.pathname.startsWith("/messaging")) return null;
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWidgetInner, {});
}
function ChatWidgetInner() {
	const chat = useChat();
	const { user } = useAuth();
	const isAdmin = user?.role === "Administrateur";
	const isManager = user?.role === "Manager";
	const [search, setSearch] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)("all");
	const [newGroupOpen, setNewGroupOpen] = (0, import_react.useState)(false);
	const [newDmOpen, setNewDmOpen] = (0, import_react.useState)(false);
	const [broadcastOpen, setBroadcastOpen] = (0, import_react.useState)(false);
	const [launcherHidden, setLauncherHidden] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		return window.localStorage.getItem("chat:launcherHidden") === "1";
	});
	const hideLauncher = () => {
		setLauncherHidden(true);
		chat.setLauncherOpen(false);
		try {
			window.localStorage.setItem("chat:launcherHidden", "1");
		} catch {}
	};
	const showLauncher = () => {
		setLauncherHidden(false);
		try {
			window.localStorage.removeItem("chat:launcherHidden");
		} catch {}
	};
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		let list = chat.conversations;
		if (tab === "unread") list = list.filter((c) => c.unread > 0 && !c.muted);
		else if (tab === "groups") list = list.filter((c) => c.type === "group" || c.type === "broadcast");
		if (q) list = list.filter((c) => convTitle(c, user?.username).toLowerCase().includes(q) || c.members.some((m) => m.fullName.toLowerCase().includes(q) || m.username.toLowerCase().includes(q)));
		return list;
	}, [
		chat.conversations,
		search,
		tab,
		user?.username
	]);
	const unreadCount = chat.conversations.filter((c) => c.unread > 0 && !c.muted).length;
	const groupsCount = chat.conversations.filter((c) => c.type === "group" || c.type === "broadcast").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		launcherHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: showLauncher,
			className: "fixed right-0 top-1/2 -translate-y-1/2 z-40 h-12 w-9 rounded-l-xl bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:w-11 transition-all",
			title: "Afficher la messagerie",
			"aria-label": `Afficher la messagerie${chat.totalUnread ? `, ${chat.totalUnread} non lus` : ""}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5" }), chat.totalUnread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -top-1 -left-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background",
				children: chat.totalUnread > 99 ? "99+" : chat.totalUnread
			})]
		}),
		!launcherHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed bottom-5 right-5 z-40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => chat.setLauncherOpen(!chat.launcherOpen),
				className: "relative h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform",
				title: "Messages",
				"aria-label": `Messages${chat.totalUnread ? `, ${chat.totalUnread} non lus` : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-6 w-6" }), chat.totalUnread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-semibold flex items-center justify-center ring-2 ring-background animate-in fade-in zoom-in-75",
					children: chat.totalUnread > 99 ? "99+" : chat.totalUnread
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: hideLauncher,
				className: "absolute -top-1.5 -left-1.5 h-6 w-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors",
				title: "Masquer la messagerie",
				"aria-label": "Masquer la messagerie",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
			})]
		}),
		chat.launcherOpen && !launcherHidden && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed bottom-24 right-5 z-40 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2",
			style: { maxHeight: "min(75vh, 640px)" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-semibold text-sm flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4 text-primary" }), " Messagerie"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-foreground truncate",
							children: chat.totalUnread > 0 ? `${chat.totalUnread} message${chat.totalUnread > 1 ? "s" : ""} non lu${chat.totalUnread > 1 ? "s" : ""}` : "Tout est à jour"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/messaging",
								onClick: () => chat.setLauncherOpen(false),
								className: "h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
								title: "Vue plein écran",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setNewDmOpen(true),
								className: "h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
								title: "Nouveau message",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
							}),
							(isAdmin || isManager) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setNewGroupOpen(true),
								className: "h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
								title: "Nouveau groupe",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
							}),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setBroadcastOpen(true),
								className: "h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
								title: "Annonce",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => chat.setLauncherOpen(false),
								className: "h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
								title: "Fermer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-2 pt-2 border-b border-border bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Rechercher...",
							className: "pl-8 h-9"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 mt-2 mb-1.5",
						children: [
							[
								"all",
								"Toutes",
								chat.conversations.length
							],
							[
								"unread",
								"Non lues",
								unreadCount
							],
							[
								"groups",
								"Groupes",
								groupsCount
							]
						].map(([key, label, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setTab(key),
							className: `flex-1 h-7 text-[12px] rounded-md font-medium transition-colors flex items-center justify-center gap-1 ${tab === key ? "bg-primary text-primary-foreground" : "hover:bg-muted/60 text-muted-foreground"}`,
							children: [label, count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-[10px] px-1 rounded-full ${tab === key ? "bg-primary-foreground/20" : "bg-muted"}`,
								children: count
							})]
						}, key))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1",
					children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-6 py-10 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground/40 mb-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: "Aucune conversation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mb-3",
								children: tab === "unread" ? "Tout est à jour 🎉" : "Démarrez une nouvelle discussion"
							}),
							tab !== "unread" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => setNewDmOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), " Nouveau message"]
							})
						]
					}) : filtered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationListItem, {
						conv: c,
						meUsername: user?.username,
						onClick: () => chat.openConversation(c.id)
					}, c.id))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed bottom-5 right-24 z-40 flex flex-row-reverse items-end gap-3 pointer-events-none",
			children: chat.openIds.map((id) => {
				const conv = chat.conversations.find((c) => c.id === id);
				if (!conv) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWindow, { conv })
				}, id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewDmDialog, {
			open: newDmOpen,
			onOpenChange: setNewDmOpen
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewGroupDialog, {
			open: newGroupOpen,
			onOpenChange: setNewGroupOpen
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BroadcastDialog, {
			open: broadcastOpen,
			onOpenChange: setBroadcastOpen
		})
	] });
}
function ConversationListItem({ conv, meUsername, onClick, active }) {
	const isUnread = conv.unread > 0 && !conv.muted;
	const senderLabel = conv.lastSender && conv.lastSender !== meUsername ? (conv.members.find((m) => m.username === conv.lastSender)?.fullName?.split(" ")[0] ?? conv.lastSender) + ": " : conv.lastSender === meUsername ? "Vous: " : "";
	const typeBadge = conv.type === "broadcast" ? "Annonce" : conv.type === "group" ? "Groupe" : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: `w-full px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left ${active ? "bg-muted/60" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvAvatar, {
			conv,
			meUsername,
			size: 42
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `text-sm truncate ${isUnread ? "font-semibold" : "font-medium"}`,
						children: convTitle(conv, meUsername)
					}),
					typeBadge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase tracking-wide shrink-0",
						children: typeBadge
					}),
					conv.muted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-auto text-[10px] text-muted-foreground shrink-0 whitespace-nowrap",
						children: timeShort(conv.lastMessageAt)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 mt-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `text-xs truncate flex-1 ${isUnread ? "text-foreground" : "text-muted-foreground"}`,
					children: [senderLabel, conv.lastBody ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "italic",
						children: "Aucun message"
					})]
				}), isUnread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center shrink-0",
					children: conv.unread > 99 ? "99+" : conv.unread
				})]
			})]
		})]
	});
}
function ChatWindow({ conv }) {
	const chat = useChat();
	const { user } = useAuth();
	const minimized = !!chat.minimized[conv.id];
	const messages = chat.messagesByConv[conv.id] ?? [];
	const hasMore = chat.hasMore[conv.id] !== false;
	const loadingOlder = !!chat.loadingOlder[conv.id];
	const [text, setText] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [pendingFile, setPendingFile] = (0, import_react.useState)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const fileInputRef = (0, import_react.useRef)(null);
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [manageOpen, setManageOpen] = (0, import_react.useState)(false);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const { scrollRef, onScroll, scrollToBottom, awayFromBottom } = useChatScroll({
		messages,
		convId: conv.id,
		minimized,
		loadOlder: () => chat.loadOlder(conv.id),
		hasMore,
		loadingOlder
	});
	const { highlightedId, jump } = useJumpToMessage(scrollRef);
	const handleJump = async (msg) => {
		if (!messages.some((m) => m.id === msg.id)) try {
			await chat.loadAround(conv.id, msg.createdAt);
		} catch {}
		jump(msg.id);
	};
	const submit = async () => {
		const body = text.trim();
		if (!body && !pendingFile || sending) return;
		setSending(true);
		try {
			if (pendingFile) {
				if (pendingFile.size > 20971520) throw new Error("Fichier trop volumineux (max 20 Mo)");
				await chat.uploadFile(conv.id, pendingFile, body);
				setPendingFile(null);
			} else await chat.send(conv.id, body);
			setText("");
		} catch (e) {
			toast.error(e?.message ?? "Erreur d'envoi");
		} finally {
			setSending(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};
	const onPickFile = (files) => {
		if (!files) return;
		const f = Array.from(files)[0];
		if (!f) return;
		if (f.size > 20971520) {
			toast.error("Fichier trop volumineux (max 20 Mo)");
			return;
		}
		setPendingFile(f);
	};
	const title = convTitle(conv, user?.username);
	const isGroupAdmin = conv.members.find((m) => m.username === user?.username)?.role === "admin" || user?.role === "Administrateur";
	const canPost = conv.type === "dm" || conv.postPolicy === "all" || isGroupAdmin;
	const subtitle = conv.type === "dm" ? "Message direct" : conv.type === "broadcast" ? `Annonce · ${conv.members.length} destinataires` : `${conv.members.length} membres${conv.postPolicy === "admins" ? " · admins seulement" : ""}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-[360px] max-w-[calc(100vw-2rem)] rounded-t-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2",
		style: { height: minimized ? 52 : 540 },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "h-13 px-3 py-2 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex items-center gap-2 cursor-pointer",
				onClick: () => chat.toggleMinimize(conv.id),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvAvatar, {
						conv,
						meUsername: user?.username,
						size: 34
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold truncate",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[10px] text-muted-foreground truncate flex items-center gap-1",
							children: [conv.type === "dm" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" }), subtitle]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-0.5",
						onClick: (e) => e.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSearchOpen((v) => !v),
								className: `h-7 w-7 rounded-md inline-flex items-center justify-center ${searchOpen ? "bg-background text-primary" : "hover:bg-background"}`,
								title: "Rechercher",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/messaging",
								className: "h-7 w-7 rounded-md hover:bg-background inline-flex items-center justify-center",
								title: "Plein écran",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "h-7 w-7 rounded-md hover:bg-background inline-flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-56",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: () => chat.markRead(conv.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-4 w-4 mr-2" }), " Marquer comme lu"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
										onClick: () => chat.setMute(conv.id, !conv.muted),
										children: conv.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 mr-2" }), " Réactiver les notifications"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "h-4 w-4 mr-2" }), " Mettre en sourdine"] })
									}),
									conv.type !== "dm" && isGroupAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => setAddOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4 mr-2" }), " Ajouter des membres"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onClick: () => setManageOpen(true),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4 mr-2" }), " Gérer le groupe"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
											onClick: async () => {
												const next = conv.postPolicy === "admins" ? "all" : "admins";
												try {
													await chatApi.setPostPolicy(conv.id, next);
													await chat.refreshConversations();
													toast.success(next === "admins" ? "Seuls les admins peuvent poster" : "Tous les membres peuvent poster");
												} catch (e) {
													toast.error(e?.message);
												}
											},
											children: conv.postPolicy === "admins" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "h-4 w-4 mr-2" }), " Autoriser tout le monde"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 mr-2" }), " Restreindre aux admins"] })
										})
									] }),
									conv.type !== "dm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										onClick: async () => {
											if (!await confirmDialog({
												title: "Confirmer l'action",
												description: "Quitter cette conversation ?",
												tone: "warning",
												confirmText: "Continuer"
											})) return;
											try {
												await chatApi.leave(conv.id);
												chat.closeConversation(conv.id);
												chat.refreshConversations();
											} catch (e) {
												toast.error(e?.message);
											}
										},
										className: "text-destructive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 mr-2" }), " Quitter"]
									})] })
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: (e) => {
									e.stopPropagation();
									chat.toggleMinimize(conv.id);
								},
								className: "h-7 w-7 rounded-md hover:bg-background inline-flex items-center justify-center",
								title: "Réduire",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: (e) => {
									e.stopPropagation();
									chat.closeConversation(conv.id);
								},
								className: "h-7 w-7 rounded-md hover:bg-background inline-flex items-center justify-center",
								title: "Fermer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					})
				]
			}),
			!minimized && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				searchOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSearchPanel, {
					conv,
					meUsername: user?.username,
					onClose: () => setSearchOpen(false),
					onJump: (m) => handleJump(m)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: scrollRef,
					onScroll,
					onDragOver: (e) => {
						e.preventDefault();
						setDragOver(true);
					},
					onDragLeave: () => setDragOver(false),
					onDrop: (e) => {
						e.preventDefault();
						setDragOver(false);
						onPickFile(e.dataTransfer.files);
					},
					className: `relative flex-1 overflow-y-auto px-3 py-2 bg-background ${dragOver ? "ring-2 ring-inset ring-primary/40" : ""}`,
					children: [
						dragOver && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 z-10 flex items-center justify-center bg-primary/10 pointer-events-none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium text-primary px-3 py-1.5 bg-card rounded-md shadow-md",
								children: "Déposer pour envoyer"
							})
						}),
						loadingOlder && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center text-[11px] text-muted-foreground py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 inline animate-spin mr-1" }), " Chargement…"]
						}),
						!hasMore && messages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center text-[10px] text-muted-foreground/70 py-1",
							children: "Début de la conversation"
						}),
						messages.length === 0 && !loadingOlder && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center py-12",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-3xl mb-2",
									children: "👋"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: "Aucun message"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Soyez le premier à écrire !"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageList, {
							conv,
							messages,
							meUsername: user?.username,
							highlightedId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollToBottomButton, {
							show: awayFromBottom,
							onClick: scrollToBottom,
							unread: conv.unread
						})
					]
				}),
				pendingFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-2 pt-2 flex items-center gap-2 border-t border-border bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-md bg-background border border-border flex items-center justify-center shrink-0",
							children: pendingFile.type.startsWith("image/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-4 w-4" }) : pendingFile.type === "application/pdf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-medium truncate",
								children: pendingFile.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[10px] text-muted-foreground",
								children: [(pendingFile.size / 1024).toFixed(1), " Ko"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPendingFile(null),
							className: "h-7 w-7 inline-flex items-center justify-center rounded hover:bg-background",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
						})
					]
				}),
				!canPost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 border-t border-border bg-muted/30 text-center text-xs text-muted-foreground flex items-center justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" }), " Seuls les administrateurs peuvent poster ici."]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						submit();
					},
					className: "p-2 border-t border-border bg-card flex items-end gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileInputRef,
							type: "file",
							className: "hidden",
							accept: "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip",
							onChange: (e) => onPickFile(e.target.files)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon",
							onClick: () => fileInputRef.current?.click(),
							disabled: sending,
							title: "Joindre un fichier",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: text,
							onChange: (e) => setText(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									submit();
								}
							},
							placeholder: pendingFile ? "Ajouter une légende…" : "Écrire un message...",
							rows: 1,
							className: "min-h-9 max-h-32 resize-none text-sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "icon",
							disabled: !text.trim() && !pendingFile || sending,
							title: "Envoyer (Entrée)",
							children: sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddMembersDialog, {
				open: addOpen,
				onOpenChange: setAddOpen,
				conv
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageGroupDialog, {
				open: manageOpen,
				onOpenChange: setManageOpen,
				conv
			})
		]
	});
}
function useUsers(open) {
	const [users, setUsers] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setLoading(true);
		chatApi.users().then((r) => setUsers(r.users)).catch(() => {}).finally(() => setLoading(false));
	}, [open]);
	return {
		users,
		loading
	};
}
function NewDmDialog({ open, onOpenChange }) {
	const { users, loading } = useUsers(open);
	const { user } = useAuth();
	const chat = useChat();
	const [q, setQ] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) setQ("");
	}, [open]);
	const filtered = users.filter((u) => u.username !== user?.username && (u.fullName.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase())));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouveau message" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Choisissez un utilisateur" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Rechercher un collègue...",
				value: q,
				onChange: (e) => setQ(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-72 overflow-y-auto border border-border rounded-md",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 text-center text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin inline mr-1" }), " Chargement…"]
				}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 text-center text-xs text-muted-foreground",
					children: "Aucun utilisateur trouvé."
				}) : filtered.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: async () => {
						try {
							const r = await chatApi.createDm(u.username);
							await chat.refreshConversations();
							chat.openConversation(r.id);
							onOpenChange(false);
						} catch (e) {
							toast.error(e?.message);
						}
					},
					className: "w-full p-2.5 flex items-center gap-3 hover:bg-muted/60 border-b border-border/50 last:border-0 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-br from-primary/80 to-primary",
						children: initials(u.fullName)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium truncate",
							children: u.fullName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground truncate",
							children: [
								"@",
								u.username,
								" · ",
								u.role,
								u.team ? ` · ${u.team}` : ""
							]
						})]
					})]
				}, u.username))
			})
		] })
	});
}
function NewGroupDialog({ open, onOpenChange }) {
	const { users, loading } = useUsers(open);
	const { user } = useAuth();
	const chat = useChat();
	const [name, setName] = (0, import_react.useState)("");
	const [q, setQ] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (open) {
			setName("");
			setSelected(/* @__PURE__ */ new Set());
			setQ("");
		}
	}, [open]);
	const filtered = users.filter((u) => u.username !== user?.username && (u.fullName.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase())));
	const submit = async () => {
		if (!name.trim() || selected.size === 0) return;
		try {
			const r = await chatApi.createGroup(name.trim(), Array.from(selected));
			await chat.refreshConversations();
			chat.openConversation(r.id);
			onOpenChange(false);
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const selectedUsers = users.filter((u) => selected.has(u.username));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouveau groupe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Créez un groupe et ajoutez des membres" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Nom du groupe (ex. Équipe Tunis)",
						value: name,
						onChange: (e) => setName(e.target.value)
					}),
					selectedUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/40 border border-border",
						children: selectedUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-background border border-border text-xs",
							children: [u.fullName, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSelected((p) => {
									const n = new Set(p);
									n.delete(u.username);
									return n;
								}),
								className: "h-4 w-4 rounded-full hover:bg-muted inline-flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
							})]
						}, u.username))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Rechercher des membres...",
						value: q,
						onChange: (e) => setQ(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [selected.size, " sélectionné(s)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-64 overflow-y-auto border border-border rounded-md",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 text-center text-xs text-muted-foreground",
							children: "Chargement…"
						}) : filtered.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "w-full p-2 flex items-center gap-2 hover:bg-muted/60 border-b border-border/50 last:border-0 cursor-pointer",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: selected.has(u.username),
									onCheckedChange: (v) => {
										setSelected((prev) => {
											const next = new Set(prev);
											if (v) next.add(u.username);
											else next.delete(u.username);
											return next;
										});
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold",
									children: initials(u.fullName)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm truncate",
										children: u.fullName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground truncate",
										children: [
											"@",
											u.username,
											" · ",
											u.role,
											u.team ? ` · ${u.team}` : ""
										]
									})]
								})
							]
						}, u.username))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => onOpenChange(false),
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: submit,
				disabled: !name.trim() || selected.size === 0,
				children: "Créer le groupe"
			})] })
		] })
	});
}
function AddMembersDialog({ open, onOpenChange, conv }) {
	const { users } = useUsers(open);
	const chat = useChat();
	const [q, setQ] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (open) setSelected(/* @__PURE__ */ new Set());
	}, [open]);
	const existing = new Set(conv.members.map((m) => m.username));
	const filtered = users.filter((u) => !existing.has(u.username) && (u.fullName.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase())));
	const submit = async () => {
		if (selected.size === 0) return;
		try {
			await chatApi.addMembers(conv.id, Array.from(selected));
			await chat.refreshConversations();
			onOpenChange(false);
		} catch (e) {
			toast.error(e?.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Ajouter des membres" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Rechercher...",
				value: q,
				onChange: (e) => setQ(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground",
				children: [selected.size, " sélectionné(s)"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-64 overflow-y-auto border border-border rounded-md",
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 text-center text-xs text-muted-foreground",
					children: "Aucun utilisateur disponible."
				}) : filtered.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "w-full p-2 flex items-center gap-2 hover:bg-muted/60 border-b border-border/50 last:border-0 cursor-pointer",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: selected.has(u.username),
							onCheckedChange: (v) => {
								setSelected((prev) => {
									const next = new Set(prev);
									if (v) next.add(u.username);
									else next.delete(u.username);
									return next;
								});
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold",
							children: initials(u.fullName)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm truncate",
								children: u.fullName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground truncate",
								children: [
									"@",
									u.username,
									" · ",
									u.role
								]
							})]
						})
					]
				}, u.username))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => onOpenChange(false),
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: submit,
				disabled: selected.size === 0,
				children: "Ajouter"
			})] })
		] })
	});
}
function BroadcastDialog({ open, onOpenChange }) {
	const { users } = useUsers(open);
	const { user } = useAuth();
	const chat = useChat();
	const [target, setTarget] = (0, import_react.useState)("all");
	const [roleVal, setRoleVal] = (0, import_react.useState)("Agent");
	const [teamVal, setTeamVal] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [body, setBody] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("Annonce");
	const [mode, setMode] = (0, import_react.useState)("individual");
	const [sending, setSending] = (0, import_react.useState)(false);
	const teams = Array.from(new Set(users.map((u) => u.team).filter(Boolean))).sort();
	(0, import_react.useEffect)(() => {
		if (open) {
			setBody("");
			setSelected(/* @__PURE__ */ new Set());
			setTitle("Annonce");
			setTarget("all");
			setMode("individual");
		}
	}, [open]);
	const submit = async () => {
		if (!body.trim()) return;
		setSending(true);
		try {
			const value = target === "users" ? Array.from(selected) : target === "role" ? roleVal : target === "team" ? teamVal : void 0;
			await chatApi.broadcast({
				body: body.trim(),
				title: title.trim() || "Annonce",
				target,
				value,
				mode
			});
			toast.success("Message envoyé");
			await chat.refreshConversations();
			onOpenChange(false);
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		} finally {
			setSending(false);
		}
	};
	if (user?.role !== "Administrateur") return null;
	const recipientsCount = target === "all" ? users.filter((u) => u.username !== user?.username).length : target === "role" ? users.filter((u) => u.role === roleVal && u.username !== user?.username).length : target === "team" ? users.filter((u) => u.team === teamVal && u.username !== user?.username).length : selected.size;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Envoyer une annonce" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Diffusez un message à plusieurs utilisateurs" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Destinataires"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-1 mt-1",
							children: [
								"all",
								"role",
								"team",
								"users"
							].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setTarget(t),
								className: `h-9 text-xs rounded-md border transition-colors ${target === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/60"}`,
								children: t === "all" ? "Tous" : t === "role" ? "Par rôle" : t === "team" ? "Par équipe" : "Choisir"
							}, t))
						})] }),
						target === "role" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: roleVal,
							onChange: (e) => setRoleVal(e.target.value),
							className: "w-full h-9 rounded-md border border-border bg-background px-2 text-sm",
							children: [
								"Administrateur",
								"Manager",
								"Agent",
								"Backoffice"
							].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: r,
								children: r
							}, r))
						}),
						target === "team" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: teamVal,
							onChange: (e) => setTeamVal(e.target.value),
							className: "w-full h-9 rounded-md border border-border bg-background px-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "— Choisir une équipe —"
							}), teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: t,
								children: t
							}, t))]
						}),
						target === "users" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-40 overflow-y-auto border border-border rounded-md",
							children: users.filter((u) => u.username !== user?.username).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "w-full p-2 flex items-center gap-2 hover:bg-muted/60 border-b border-border/50 last:border-0 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: selected.has(u.username),
									onCheckedChange: (v) => {
										setSelected((prev) => {
											const next = new Set(prev);
											if (v) next.add(u.username);
											else next.delete(u.username);
											return next;
										});
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm truncate",
										children: u.fullName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground truncate",
										children: [
											"@",
											u.username,
											" · ",
											u.role
										]
									})]
								})]
							}, u.username))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Sera envoyé à ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "text-foreground",
									children: recipientsCount
								}),
								" destinataire",
								recipientsCount > 1 ? "s" : "",
								"."
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-medium text-muted-foreground",
							children: "Mode d'envoi"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-1 mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setMode("individual"),
								className: `h-9 text-xs rounded-md border ${mode === "individual" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/60"}`,
								children: "Messages individuels"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setMode("group"),
								className: `h-9 text-xs rounded-md border ${mode === "group" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/60"}`,
								children: "Un seul groupe"
							})]
						})] }),
						mode === "group" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Titre de l'annonce",
							value: title,
							onChange: (e) => setTitle(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							placeholder: "Votre message...",
							rows: 4,
							value: body,
							onChange: (e) => setBody(e.target.value)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Annuler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: submit,
					disabled: !body.trim() || sending || target === "users" && selected.size === 0 || target === "team" && !teamVal,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4 mr-2" }), " Envoyer"]
				})] })
			]
		})
	});
}
function ManageGroupDialog({ open, onOpenChange, conv }) {
	const chat = useChat();
	const { user } = useAuth();
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const [renaming, setRenaming] = (0, import_react.useState)(false);
	const [newName, setNewName] = (0, import_react.useState)(conv.name ?? "");
	const isAppAdmin = user?.role === "Administrateur";
	(0, import_react.useEffect)(() => {
		if (open) {
			setQ("");
			setNewName(conv.name ?? "");
			setRenaming(false);
		}
	}, [open, conv.name]);
	const refresh = async () => {
		await chat.refreshConversations();
	};
	const setRole = async (username, role) => {
		setBusy(username);
		try {
			await chatApi.setRole(conv.id, username, role);
			await refresh();
			toast.success(role === "admin" ? "Promu administrateur" : "Rétrogradé membre");
		} catch (e) {
			toast.error(e?.message);
		} finally {
			setBusy(null);
		}
	};
	const removeMember = async (username) => {
		if (!await confirmDialog({
			title: "Suppression",
			description: `Retirer ${username} du groupe ?`,
			tone: "destructive",
			confirmText: "Supprimer"
		})) return;
		setBusy(username);
		try {
			await chatApi.removeMember(conv.id, username);
			await refresh();
		} catch (e) {
			toast.error(e?.message);
		} finally {
			setBusy(null);
		}
	};
	const togglePolicy = async () => {
		const next = conv.postPolicy === "admins" ? "all" : "admins";
		try {
			await chatApi.setPostPolicy(conv.id, next);
			await refresh();
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const rename = async () => {
		if (!newName.trim() || newName.trim() === conv.name) {
			setRenaming(false);
			return;
		}
		try {
			await chatApi.rename(conv.id, newName.trim());
			await refresh();
			setRenaming(false);
			toast.success("Groupe renommé");
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const filteredMembers = conv.members.filter((m) => !q.trim() || m.fullName.toLowerCase().includes(q.toLowerCase()) || m.username.toLowerCase().includes(q.toLowerCase()));
	const adminCount = conv.members.filter((m) => m.role === "admin").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Gérer le groupe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					conv.members.length,
					" membres · ",
					adminCount,
					" admin",
					adminCount > 1 ? "s" : ""
				] })] }),
				(isAppAdmin || conv.members.find((m) => m.username === user?.username)?.role === "admin") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border p-3 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs font-medium text-muted-foreground",
						children: "Nom du groupe"
					}), renaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newName,
								onChange: (e) => setNewName(e.target.value),
								className: "h-8",
								autoFocus: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: rename,
								children: "OK"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setRenaming(false),
								children: "Annuler"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: conv.name ?? "(sans nom)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setRenaming(true),
							children: "Renommer"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border p-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm",
						children: [conv.postPolicy === "admins" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: conv.postPolicy === "admins" ? "Seuls les admins peuvent poster" : "Tout le monde peut poster" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: togglePolicy,
						children: conv.postPolicy === "admins" ? "Autoriser tous" : "Restreindre"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Rechercher un membre...",
					value: q,
					onChange: (e) => setQ(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-72 overflow-y-auto border border-border rounded-md divide-y divide-border",
					children: filteredMembers.map((m) => {
						const me = m.username === user?.username;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-2 flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold",
									children: initials(m.fullName)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-medium truncate flex items-center gap-1.5",
										children: [
											m.fullName,
											" ",
											me && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground",
												children: "(vous)"
											}),
											m.role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-semibold",
												children: "ADMIN"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground truncate",
										children: [
											"@",
											m.username,
											m.userRole ? ` · ${m.userRole}` : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [m.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: busy === m.username || me && !isAppAdmin,
										onClick: () => setRole(m.username, "member"),
										title: "Rétrograder",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "h-4 w-4" })
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: busy === m.username,
										onClick: () => setRole(m.username, "admin"),
										title: "Promouvoir admin",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" })
									}), !me && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: busy === m.username,
										onClick: () => removeMember(m.username),
										title: "Retirer",
										className: "text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
									})]
								})
							]
						}, m.username);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					children: "Fermer"
				}) })
			]
		})
	});
}
/**
* Polls /version.json (regenerated on every build by scripts/gen-version.mjs)
* and prompts users to reload when a new deploy is live.
*
* Behavior:
* - Captures the version on mount as the "current" version.
* - Re-checks every 60s, plus on tab focus / coming back online.
* - On change, shows a sticky toast with a "Recharger" action. After 30s
*   without interaction the page reloads automatically so all sessions
*   converge on the new version.
*/
var POLL_MS = 6e4;
var AUTO_RELOAD_MS = 3e4;
async function fetchVersion() {
	try {
		const res = await fetch(`/version.json?t=${Date.now()}`, {
			cache: "no-store",
			headers: { "cache-control": "no-cache" }
		});
		if (!res.ok) return null;
		return (await res.json())?.version ?? null;
	} catch {
		return null;
	}
}
function hardReload() {
	const url = new URL(window.location.href);
	url.searchParams.set("_v", String(Date.now()));
	window.location.replace(url.toString());
}
function VersionWatcher() {
	const currentRef = (0, import_react.useRef)(null);
	const promptedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		let cancelled = false;
		const check = async () => {
			const v = await fetchVersion();
			if (cancelled || !v) return;
			if (currentRef.current === null) {
				currentRef.current = v;
				return;
			}
			if (v !== currentRef.current && !promptedRef.current) {
				promptedRef.current = true;
				const autoReload = window.setTimeout(hardReload, AUTO_RELOAD_MS);
				toast("Nouvelle version disponible", {
					description: "Une mise à jour de l'application est en ligne. Rechargement automatique dans 30 s.",
					duration: AUTO_RELOAD_MS,
					action: {
						label: "Recharger",
						onClick: () => {
							window.clearTimeout(autoReload);
							hardReload();
						}
					}
				});
			}
		};
		check();
		const interval = window.setInterval(check, POLL_MS);
		const onFocus = () => void check();
		window.addEventListener("focus", onFocus);
		window.addEventListener("online", onFocus);
		return () => {
			cancelled = true;
			window.clearInterval(interval);
			window.removeEventListener("focus", onFocus);
			window.removeEventListener("online", onFocus);
		};
	}, []);
	return null;
}
/**
* Full-screen takeover shown when the backend rejects a request with
* code=IP_NOT_ALLOWED. Mounted once at the app root; listens to the
* `erp:ip-blocked` window event dispatched from src/lib/api.ts.
*/
function IpBlockedScreen() {
	const [detail, setDetail] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const onBlocked = (e) => {
			const d = e.detail;
			setDetail({
				message: d?.message ?? "Accès refusé.",
				ip: d?.ip
			});
			try {
				setToken(null);
			} catch {}
		};
		window.addEventListener("erp:ip-blocked", onBlocked);
		return () => window.removeEventListener("erp:ip-blocked", onBlocked);
	}, []);
	if (!detail) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg rounded-2xl border border-destructive/30 bg-card p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-5 ring-1 ring-destructive/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldX, { className: "h-8 w-8" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight text-foreground",
					children: "Accès non autorisé"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground leading-relaxed",
					children: detail.message
				}),
				detail.ip && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 inline-block rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground",
					children: ["IP détectée : ", detail.ip]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-muted-foreground",
					children: "Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur pour qu'il ajoute votre adresse IP à la liste des accès autorisés."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex items-center justify-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => {
							setDetail(null);
							window.location.href = "/login";
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4 mr-2" }), "Réessayer"]
					})
				})
			]
		})
	});
}
var styles_default = "/assets/styles-CDx9E4D3.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
var Route$42 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Protection ERP — CRM Assurance" },
			{
				name: "description",
				content: "ERP moderne pour centres d'appels assurance: leads, contrats, dispatch, dashboard."
			},
			{
				name: "author",
				content: "Protection"
			},
			{
				property: "og:title",
				content: "Protection ERP"
			},
			{
				property: "og:description",
				content: "ERP moderne pour centres d'appels assurance."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErpProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialogProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ChatProvider, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteProgressBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VersionWatcher, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatWidget, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IpBlockedScreen, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			richColors: true,
			position: "top-right"
		})
	] }) }) }) }) });
}
var $$splitComponentImporter$41 = () => import("./routes-BjpNkdda.mjs");
var Route$41 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Tableau de bord — Protection ERP" }, {
		name: "description",
		content: "Vue d'ensemble: leads, conversion, contrats et performance des agents."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$41, "component")
});
var $$splitComponentImporter$40 = () => import("./backoffice-Clndn5NH.mjs");
var Route$40 = createFileRoute("/backoffice")({
	head: () => ({ meta: [{ title: "Backoffice — Protection ERP" }, {
		name: "description",
		content: "Configuration des données de référence: produits, partenaires, statuts."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$40, "component")
});
var $$splitComponentImporter$39 = () => import("./calendar-BEKhxGYc.mjs");
var Route$39 = createFileRoute("/calendar")({
	head: () => ({ meta: [{ title: "Calendrier — Protection ERP" }, {
		name: "description",
		content: "Calendrier des rendez-vous, rappels et signatures."
	}] }),
	validateSearch: (s) => ({
		prospectId: typeof s.prospectId === "string" ? s.prospectId : void 0,
		newEvent: s.newEvent === "1" || s.newEvent === 1 || s.newEvent === true ? "1" : void 0,
		date: typeof s.date === "string" ? s.date : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$39, "component")
});
var $$splitComponentImporter$38 = () => import("./configuration-CilVHShT.mjs");
var Route$38 = createFileRoute("/configuration")({
	head: () => ({ meta: [{ title: "Configuration — Protection ERP" }, {
		name: "description",
		content: "Personnalisez les champs des prospects, contrats et utilisateurs."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$38, "component")
});
var $$splitComponentImporter$37 = () => import("./dispatch-C9nEWYVf.mjs");
var Route$37 = createFileRoute("/dispatch")({
	head: () => ({ meta: [{ title: "Dispatch — Protection ERP" }, {
		name: "description",
		content: "Affectation des leads aux agents avec quotas et files d'attente."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$37, "component")
});
var $$splitComponentImporter$36 = () => import("./documentation-RgfQHfAe.mjs");
var Route$36 = createFileRoute("/documentation")({
	head: () => ({ meta: [{ title: "Documentation — Protection ERP" }, {
		name: "description",
		content: "Documentation complète de l'ERP : pages, fonctionnalités, modules, API et flux métier."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
var $$splitComponentImporter$35 = () => import("./emails-lFAft5Tj.mjs");
var Route$35 = createFileRoute("/emails")({
	head: () => ({ meta: [{ title: "Emails — Protection ERP" }, {
		name: "description",
		content: "Boîte mail OVH intégrée: lisez, répondez, transférez et organisez vos emails directement dans l'application."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$35, "component")
});
var $$splitComponentImporter$34 = () => import("./groups-CJl3zv4j.mjs");
var Route$34 = createFileRoute("/groups")({
	head: () => ({ meta: [{ title: "Groupes — Protection ERP" }, {
		name: "description",
		content: "Gérer les groupes d'utilisateurs et voir leur composition."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$34, "component")
});
var $$splitComponentImporter$33 = () => import("./login-CM5B6wh3.mjs");
var Route$33 = createFileRoute("/login")({
	head: () => ({ meta: [
		{ title: "Connexion — Protection ERP" },
		{
			name: "description",
			content: "Accédez à votre espace agent Protection ERP."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$33, "component")
});
var $$splitComponentImporter$32 = () => import("./messaging-D46XHl39.mjs");
var Route$32 = createFileRoute("/messaging")({
	validateSearch: (s) => ({ conv: typeof s.conv === "string" ? s.conv : void 0 }),
	head: () => ({ meta: [{ title: "Messagerie — CRM" }, {
		name: "description",
		content: "Conversations directes, groupes et annonces — version pleine page de la messagerie."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$32, "component")
});
var $$splitComponentImporter$31 = () => import("./notifications-BQNJ96vf.mjs");
var Route$31 = createFileRoute("/notifications")({
	head: () => ({ meta: [{ title: "Notifications — Protection ERP" }, {
		name: "description",
		content: "Vos notifications: tâches assignées, mises à jour et alertes."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var $$splitComponentImporter$30 = () => import("./objectives-DLgu-wAb.mjs");
var Route$30 = createFileRoute("/objectives")({
	head: () => ({ meta: [{ title: "Objectifs — Protection ERP" }, {
		name: "description",
		content: "Quotas mensuels par agent: leads, ventes, CA, conversion."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var $$splitComponentImporter$29 = () => import("./options-BIo8FRVJ.mjs");
var Route$29 = createFileRoute("/options")({
	head: () => ({ meta: [{ title: "Options des listes — Protection ERP" }, {
		name: "description",
		content: "Gérez les options des menus déroulants utilisés dans les formulaires prospects et contrats."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var $$splitComponentImporter$28 = () => import("./profile-CFrSwaxU.mjs");
var Route$28 = createFileRoute("/profile")({
	head: () => ({ meta: [
		{ title: "Mon profil — Protection ERP" },
		{
			name: "description",
			content: "Consultez vos informations et changez votre mot de passe."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$28, "component")
});
var $$splitComponentImporter$27 = () => import("./reclamations-DzS7Roe8.mjs");
var Route$27 = createFileRoute("/reclamations")({
	head: () => ({ meta: [{ title: "Réclamations — Protection ERP" }, {
		name: "description",
		content: "Gestion des réclamations clients reliées aux prospects et contrats."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./reconciliation-Bueb99dY.mjs");
var Route$26 = createFileRoute("/reconciliation")({
	head: () => ({ meta: [{ title: "Réconciliation des imports — Protection ERP" }, {
		name: "description",
		content: "Historique des imports CSV: ajouts, mises à jour, ignorés et mappage des champs par entité."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./reports-CfZBxeX9.mjs");
var Route$25 = createFileRoute("/reports")({
	head: () => ({ meta: [{ title: "Rapports — Protection ERP" }, {
		name: "description",
		content: "KPIs par agent, entonnoir de conversion, revenus mensuels, exports CSV/Excel."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./roles-DZtEeX9U.mjs");
var Route$24 = createFileRoute("/roles")({
	head: () => ({ meta: [{ title: "Rôles — Protection ERP" }, {
		name: "description",
		content: "Gestion fine des permissions par rôle."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./signup-internal-x7k2-BY4BTX6Q.mjs");
var Route$23 = createFileRoute("/signup-internal-x7k2")({
	head: () => ({ meta: [{ title: "Création de compte interne" }, {
		name: "robots",
		content: "noindex, nofollow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./stages-Bp-WutAP.mjs");
var Route$22 = createFileRoute("/stages")({
	head: () => ({ meta: [{ title: "Étapes du pipeline — Protection ERP" }, {
		name: "description",
		content: "Configurez les étapes du pipeline commercial."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./tasks-DRcqlOw7.mjs");
var Route$21 = createFileRoute("/tasks")({
	head: () => ({ meta: [{ title: "Tâches — Protection ERP" }, {
		name: "description",
		content: "Liste des tâches assignées avec dates d'échéance et priorités."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./contracts.index-5v2HpP8Y.mjs");
var Route$20 = createFileRoute("/contracts/")({
	head: () => ({ meta: [{ title: "Contrats — Protection ERP" }, {
		name: "description",
		content: "Suivi des contrats signés, en attente de validation et facturation."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./contracts.export-bHNAhv1K.mjs");
var Route$19 = createFileRoute("/contracts/export")({
	head: () => ({ meta: [{ title: "Exporter les contrats — Protection ERP" }, {
		name: "description",
		content: "Exportez la liste des contrats au format CSV, Excel ou JSON."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./contracts.import-C2NqjBB0.mjs");
var Route$18 = createFileRoute("/contracts/import")({
	head: () => ({ meta: [{ title: "Importer des contrats — Protection ERP" }, {
		name: "description",
		content: "Migrez vos contrats signés depuis un CSV ou Excel — mappage assisté."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./contracts.new-DIJRu7ht.mjs");
var Route$17 = createFileRoute("/contracts/new")({
	validateSearch: (search) => ({ prospectId: typeof search.prospectId === "string" ? search.prospectId : void 0 }),
	head: () => ({ meta: [{ title: "Nouveau contrat — Protection ERP" }, {
		name: "description",
		content: "Créer un nouveau contrat (détail client, mutuelle, produit, conjoint, coordonnées bancaires)."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./prospects.index-BYJNjVAh.mjs");
var Route$16 = createFileRoute("/prospects/")({
	head: () => ({ meta: [{ title: "Prospects — Protection ERP" }, {
		name: "description",
		content: "Gestion des leads: filtrage, statut d'appel, assignation et suivi."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./prospects.export-DdJhLMky.mjs");
var Route$15 = createFileRoute("/prospects/export")({
	head: () => ({ meta: [{ title: "Exporter les prospects — Protection ERP" }, {
		name: "description",
		content: "Exportez la liste des prospects au format CSV ou JSON, avec ou sans champs personnalisés."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./prospects.import-iGRQ4pcA.mjs");
var Route$14 = createFileRoute("/prospects/import")({
	head: () => ({ meta: [{ title: "Importer des prospects — Protection ERP" }, {
		name: "description",
		content: "Migrez vos leads depuis un CSV ou Excel — mappage assisté, détection des doublons et fusion."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./prospects.new-CI8FPmmr.mjs");
var Route$13 = createFileRoute("/prospects/new")({
	head: () => ({ meta: [{ title: "Nouveau prospect — Protection ERP" }, {
		name: "description",
		content: "Créer un nouveau prospect avec planification RDV/rappel et envoi optionnel en file de dispatch."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./reclamations._id-DuEY4NVb.mjs");
var Route$12 = createFileRoute("/reclamations/$id")({
	head: () => ({ meta: [{ title: "Détail réclamation — Protection ERP" }, {
		name: "description",
		content: "Détail et suivi d'une réclamation client."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./statuses.contracts-D8RVaf69.mjs");
var Route$11 = createFileRoute("/statuses/contracts")({
	head: () => ({ meta: [{ title: "Statuts contrats — Protection ERP" }, {
		name: "description",
		content: "Gérez les statuts de facturation des contrats."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./statuses.prospects-C8_xcqpr.mjs");
var Route$10 = createFileRoute("/statuses/prospects")({
	head: () => ({ meta: [{ title: "Statuts prospects — Protection ERP" }, {
		name: "description",
		content: "Gérez les statuts des prospects utilisés dans toute l'application."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./users.index-BmdBAib0.mjs");
var Route$9 = createFileRoute("/users/")({
	head: () => ({ meta: [{ title: "Utilisateurs — Protection ERP" }, {
		name: "description",
		content: "Gestion des utilisateurs, équipes et performances individuelles."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./users.import-CwEHR8Gh.mjs");
var Route$8 = createFileRoute("/users/import")({
	head: () => ({ meta: [{ title: "Importer des utilisateurs — Protection ERP" }, {
		name: "description",
		content: "Migrez vos comptes utilisateurs depuis un CSV ou Excel."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./users.new-D4Je42Lf.mjs");
var Route$7 = createFileRoute("/users/new")({
	head: () => ({ meta: [{ title: "Nouvel utilisateur — Protection ERP" }, {
		name: "description",
		content: "Créer un compte agent, manager, backoffice ou administrateur."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitNotFoundComponentImporter = () => import("./contracts._contractId.index-BiDqf8eq.mjs");
var $$splitComponentImporter$6 = () => import("./contracts._contractId.index-BarHVWn3.mjs");
var Route$6 = createFileRoute("/contracts/$contractId/")({
	head: ({ params }) => ({ meta: [{ title: `Contrat ${params.contractId} — Protection ERP` }, {
		name: "description",
		content: "Détail du contrat: parcours client, cotisation, facturation et export."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
var $$splitComponentImporter$5 = () => import("./contracts._contractId.edit-DYHi71bn.mjs");
var Route$5 = createFileRoute("/contracts/$contractId/edit")({
	head: ({ params }) => ({ meta: [{ title: `Modifier contrat ${params.contractId} — Protection ERP` }, {
		name: "description",
		content: "Édition d'un contrat existant."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./prospects._prospectId.index-Cy8uWbUL.mjs");
var Route$4 = createFileRoute("/prospects/$prospectId/")({
	head: ({ params }) => ({ meta: [{ title: `Prospect ${params.prospectId} — Protection ERP` }, {
		name: "description",
		content: "Fiche prospect: vue d'ensemble, RDV, rappels et pièces jointes."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./prospects._prospectId.edit-DpSH6DG7.mjs");
var Route$3 = createFileRoute("/prospects/$prospectId/edit")({
	head: ({ params }) => ({ meta: [{ title: `Modifier prospect ${params.prospectId} — Protection ERP` }, {
		name: "description",
		content: "Édition d'un prospect existant."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./users._username.index-BxqX9elg.mjs");
var Route$2 = createFileRoute("/users/$username/")({
	head: ({ params }) => ({ meta: [{ title: `${params.username} — Protection ERP` }, {
		name: "description",
		content: "Fiche utilisateur: rôle, équipe, performance et champs personnalisés."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./users._username.edit-CpiH7vTp.mjs");
var Route$1 = createFileRoute("/users/$username/edit")({
	head: ({ params }) => ({ meta: [{ title: `Modifier ${params.username} — Protection ERP` }, {
		name: "description",
		content: "Mettre à jour le profil, le rôle, l'équipe et l'état d'un utilisateur."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./users._username.reset-password-CVeIE6Ip.mjs");
var Route = createFileRoute("/users/$username/reset-password")({
	head: ({ params }) => ({ meta: [{ title: `Réinitialiser le mot de passe — ${params.username}` }, {
		name: "description",
		content: "Définir un nouveau mot de passe pour un utilisateur."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$41.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$42
});
var BackofficeRoute = Route$40.update({
	id: "/backoffice",
	path: "/backoffice",
	getParentRoute: () => Route$42
});
var CalendarRoute = Route$39.update({
	id: "/calendar",
	path: "/calendar",
	getParentRoute: () => Route$42
});
var ConfigurationRoute = Route$38.update({
	id: "/configuration",
	path: "/configuration",
	getParentRoute: () => Route$42
});
var DispatchRoute = Route$37.update({
	id: "/dispatch",
	path: "/dispatch",
	getParentRoute: () => Route$42
});
var DocumentationRoute = Route$36.update({
	id: "/documentation",
	path: "/documentation",
	getParentRoute: () => Route$42
});
var EmailsRoute = Route$35.update({
	id: "/emails",
	path: "/emails",
	getParentRoute: () => Route$42
});
var GroupsRoute = Route$34.update({
	id: "/groups",
	path: "/groups",
	getParentRoute: () => Route$42
});
var LoginRoute = Route$33.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$42
});
var MessagingRoute = Route$32.update({
	id: "/messaging",
	path: "/messaging",
	getParentRoute: () => Route$42
});
var NotificationsRoute = Route$31.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => Route$42
});
var ObjectivesRoute = Route$30.update({
	id: "/objectives",
	path: "/objectives",
	getParentRoute: () => Route$42
});
var OptionsRoute = Route$29.update({
	id: "/options",
	path: "/options",
	getParentRoute: () => Route$42
});
var ProfileRoute = Route$28.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$42
});
var ReclamationsRoute = Route$27.update({
	id: "/reclamations",
	path: "/reclamations",
	getParentRoute: () => Route$42
});
var ReconciliationRoute = Route$26.update({
	id: "/reconciliation",
	path: "/reconciliation",
	getParentRoute: () => Route$42
});
var ReportsRoute = Route$25.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => Route$42
});
var RolesRoute = Route$24.update({
	id: "/roles",
	path: "/roles",
	getParentRoute: () => Route$42
});
var SignupInternalX7k2Route = Route$23.update({
	id: "/signup-internal-x7k2",
	path: "/signup-internal-x7k2",
	getParentRoute: () => Route$42
});
var StagesRoute = Route$22.update({
	id: "/stages",
	path: "/stages",
	getParentRoute: () => Route$42
});
var TasksRoute = Route$21.update({
	id: "/tasks",
	path: "/tasks",
	getParentRoute: () => Route$42
});
var ContractsIndexRoute = Route$20.update({
	id: "/contracts/",
	path: "/contracts/",
	getParentRoute: () => Route$42
});
var ContractsExportRoute = Route$19.update({
	id: "/contracts/export",
	path: "/contracts/export",
	getParentRoute: () => Route$42
});
var ContractsImportRoute = Route$18.update({
	id: "/contracts/import",
	path: "/contracts/import",
	getParentRoute: () => Route$42
});
var ContractsNewRoute = Route$17.update({
	id: "/contracts/new",
	path: "/contracts/new",
	getParentRoute: () => Route$42
});
var ProspectsIndexRoute = Route$16.update({
	id: "/prospects/",
	path: "/prospects/",
	getParentRoute: () => Route$42
});
var ProspectsExportRoute = Route$15.update({
	id: "/prospects/export",
	path: "/prospects/export",
	getParentRoute: () => Route$42
});
var ProspectsImportRoute = Route$14.update({
	id: "/prospects/import",
	path: "/prospects/import",
	getParentRoute: () => Route$42
});
var ProspectsNewRoute = Route$13.update({
	id: "/prospects/new",
	path: "/prospects/new",
	getParentRoute: () => Route$42
});
var ReclamationsIdRoute = Route$12.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ReclamationsRoute
});
var StatusesContractsRoute = Route$11.update({
	id: "/statuses/contracts",
	path: "/statuses/contracts",
	getParentRoute: () => Route$42
});
var StatusesProspectsRoute = Route$10.update({
	id: "/statuses/prospects",
	path: "/statuses/prospects",
	getParentRoute: () => Route$42
});
var UsersIndexRoute = Route$9.update({
	id: "/users/",
	path: "/users/",
	getParentRoute: () => Route$42
});
var UsersImportRoute = Route$8.update({
	id: "/users/import",
	path: "/users/import",
	getParentRoute: () => Route$42
});
var UsersNewRoute = Route$7.update({
	id: "/users/new",
	path: "/users/new",
	getParentRoute: () => Route$42
});
var ContractsContractIdIndexRoute = Route$6.update({
	id: "/contracts/$contractId/",
	path: "/contracts/$contractId/",
	getParentRoute: () => Route$42
});
var ContractsContractIdEditRoute = Route$5.update({
	id: "/contracts/$contractId/edit",
	path: "/contracts/$contractId/edit",
	getParentRoute: () => Route$42
});
var ProspectsProspectIdIndexRoute = Route$4.update({
	id: "/prospects/$prospectId/",
	path: "/prospects/$prospectId/",
	getParentRoute: () => Route$42
});
var ProspectsProspectIdEditRoute = Route$3.update({
	id: "/prospects/$prospectId/edit",
	path: "/prospects/$prospectId/edit",
	getParentRoute: () => Route$42
});
var UsersUsernameIndexRoute = Route$2.update({
	id: "/users/$username/",
	path: "/users/$username/",
	getParentRoute: () => Route$42
});
var UsersUsernameEditRoute = Route$1.update({
	id: "/users/$username/edit",
	path: "/users/$username/edit",
	getParentRoute: () => Route$42
});
var UsersUsernameResetPasswordRoute = Route.update({
	id: "/users/$username/reset-password",
	path: "/users/$username/reset-password",
	getParentRoute: () => Route$42
});
var ReclamationsRouteChildren = { ReclamationsIdRoute };
var rootRouteChildren = {
	IndexRoute,
	BackofficeRoute,
	CalendarRoute,
	ConfigurationRoute,
	DispatchRoute,
	DocumentationRoute,
	EmailsRoute,
	GroupsRoute,
	LoginRoute,
	MessagingRoute,
	NotificationsRoute,
	ObjectivesRoute,
	OptionsRoute,
	ProfileRoute,
	ReclamationsRoute: ReclamationsRoute._addFileChildren(ReclamationsRouteChildren),
	ReconciliationRoute,
	ReportsRoute,
	RolesRoute,
	SignupInternalX7k2Route,
	StagesRoute,
	TasksRoute,
	ContractsExportRoute,
	ContractsImportRoute,
	ContractsNewRoute,
	ProspectsExportRoute,
	ProspectsImportRoute,
	ProspectsNewRoute,
	StatusesContractsRoute,
	StatusesProspectsRoute,
	UsersImportRoute,
	UsersNewRoute,
	ContractsIndexRoute,
	ProspectsIndexRoute,
	UsersIndexRoute,
	ContractsContractIdEditRoute,
	ProspectsProspectIdEditRoute,
	UsersUsernameEditRoute,
	UsersUsernameResetPasswordRoute,
	ContractsContractIdIndexRoute,
	ProspectsProspectIdIndexRoute,
	UsersUsernameIndexRoute
};
var routeTree = Route$42._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function DefaultErrorComponent({ error, reset }) {
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						xmlns: "http://www.w3.org/2000/svg",
						className: "h-8 w-8 text-destructive",
						fill: "none",
						viewBox: "0 0 24 24",
						stroke: "currentColor",
						strokeWidth: 2,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "An unexpected error occurred. Please try again."
				}),
				false,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var getRouter = () => {
	return createRouter({
		routeTree,
		context: {},
		scrollRestoration: true,
		defaultViewTransition: true,
		defaultPreload: "intent",
		defaultPreloadDelay: 0,
		defaultPreloadStaleTime: 3e5,
		defaultPendingMs: 400,
		defaultPendingMinMs: 200,
		defaultErrorComponent: DefaultErrorComponent
	});
};
export { chatApi as A, AlertDialogTitle as B, timeShort as C, Checkbox as D, ScrollArea as E, AlertDialogCancel as F, AlertDialogContent as I, AlertDialogDescription as L, useConfirm as M, AlertDialog as N, Textarea as O, AlertDialogAction as P, AlertDialogFooter as R, convTitle as S, useJumpToMessage as T, AlertDialogTrigger as V, NewGroupDialog as _, Route$3 as a, MessageSearchPanel as b, Route$6 as c, Route$32 as d, Route$39 as f, NewDmDialog as g, ManageGroupDialog as h, Route$2 as i, confirmDialog as j, useChat as k, Route$12 as l, BroadcastDialog as m, Route as n, Route$4 as o, AddMembersDialog as p, Route$1 as r, Route$5 as s, router_exports as t, Route$17 as u, ConvAvatar as v, useChatScroll as w, ScrollToBottomButton as x, MessageList as y, AlertDialogHeader as z };
