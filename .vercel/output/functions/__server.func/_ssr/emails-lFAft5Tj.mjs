import { i as __toESM } from "../_runtime.mjs";
import { a as CommandInput, c as Skeleton, i as CommandGroup, n as Command$1, o as CommandItem, r as CommandEmpty, s as CommandList, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { D as Checkbox, M as useConfirm, O as Textarea } from "./router-BUkYRVTH.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-DR1z1nDt.mjs";
import { _ as PopoverContent, a as DialogFooter, g as Popover, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, v as PopoverTrigger, w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { a as apiUrl, r as api, s as getToken } from "./api-2UuWgcOn.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { B as Send, Bt as Forward, D as SquarePen, Dt as Italic, E as Star, G as Reply, In as Bold, K as ReplyAll, L as ShieldAlert, R as Settings, Sn as ChevronLeft, St as Link2, V as Search, Vt as Folder, X as Quote, Z as Printer, a as Users, b as Trash2, bt as ListOrdered, ft as Mail, kt as Inbox, m as Underline, n as X, nn as Eraser, nt as Paperclip, pt as MailOpen, q as RefreshCw, qn as Archive, qt as FilePen, tt as PenLine, yt as List, zt as Funnel } from "../_libs/lucide-react.mjs";
import { n as stringType } from "../_libs/zod.mjs";
// node_modules/.nitro/vite/services/ssr/assets/emails-lFAft5Tj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** RFC-5322-ish email validator + length cap + CR/LF guard (header injection). */
var emailSchema = stringType().trim().min(3).max(254).email({ message: "Adresse invalide" }).refine((v) => !/[\r\n]/.test(v), { message: "Caractères interdits" });
function isValidEmail(value) {
	return emailSchema.safeParse(value).success;
}
function RecipientField({ label, values, onChange, contacts, placeholder, max = 50 }) {
	const [draft, setDraft] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const lowerSet = (0, import_react.useMemo)(() => new Set(values.map((v) => v.toLowerCase())), [values]);
	const addOne = (raw) => {
		const v = raw.trim().replace(/[,;]+$/, "");
		if (!v) return null;
		const parsed = emailSchema.safeParse(v);
		if (!parsed.success) return parsed.error.issues[0]?.message ?? "Adresse invalide";
		const lower = parsed.data.toLowerCase();
		if (lowerSet.has(lower)) return null;
		if (values.length >= max) return `Maximum ${max} destinataires`;
		onChange([...values, parsed.data]);
		return null;
	};
	const flushDraft = () => {
		if (!draft.trim()) return;
		const parts = draft.split(/[\s,;]+/).filter(Boolean);
		let firstError = null;
		for (const p of parts) {
			const err = addOne(p);
			if (err && !firstError) firstError = err;
		}
		setDraft("");
		return firstError;
	};
	const remove = (email) => onChange(values.filter((v) => v.toLowerCase() !== email.toLowerCase()));
	const filteredContacts = (0, import_react.useMemo)(() => {
		const seen = /* @__PURE__ */ new Set();
		return contacts.filter((c) => isValidEmail(c.email)).filter((c) => {
			const k = c.email.toLowerCase();
			if (seen.has(k) || lowerSet.has(k)) return false;
			seen.add(k);
			return true;
		}).slice(0, 200);
	}, [contacts, lowerSet]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							className: "h-7 px-2 text-xs gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }), " Carnet"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-[320px] p-0",
						align: "end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, { placeholder: "Rechercher un contact…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "Aucun contact" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
							heading: `${filteredContacts.length} contacts`,
							children: filteredContacts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandItem, {
								value: `${c.name ?? ""} ${c.email}`,
								onSelect: () => {
									addOne(c.email);
									setOpen(false);
									setTimeout(() => inputRef.current?.focus(), 50);
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm truncate",
										children: c.name || c.email
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground truncate",
										children: [c.email, c.source ? ` · ${c.source}` : ""]
									})]
								})
							}, `${c.source}:${c.email}`))
						})] })] })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 min-h-9 focus-within:ring-2 focus-within:ring-ring",
				onClick: () => inputRef.current?.focus(),
				children: [values.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "secondary",
					className: "gap-1 pr-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs",
						children: v
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Retirer ${v}`,
						onClick: (e) => {
							e.stopPropagation();
							remove(v);
						},
						className: "rounded hover:bg-muted-foreground/20 p-0.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
					})]
				}, v)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					ref: inputRef,
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter" || e.key === "," || e.key === ";" || e.key === "Tab") {
							if (draft.trim()) {
								e.preventDefault();
								flushDraft();
							}
						} else if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
					},
					onBlur: () => flushDraft(),
					onPaste: (e) => {
						const text = e.clipboardData.getData("text");
						if (/[\s,;]/.test(text)) {
							e.preventDefault();
							setDraft(text);
							setTimeout(() => flushDraft(), 0);
						}
					},
					placeholder: values.length === 0 ? placeholder ?? "email@exemple.com" : "",
					className: "flex-1 min-w-[160px] border-0 shadow-none focus-visible:ring-0 px-1 h-7"
				})]
			}),
			values.length >= max && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-destructive",
				children: [
					"Maximum ",
					max,
					" destinataires atteint."
				]
			})
		]
	});
}
function folderMeta(name) {
	const lower = name.toLowerCase();
	if (lower === "inbox" || lower === "inbox.") return {
		label: "Boîte de réception",
		icon: Inbox,
		order: 0,
		key: "inbox"
	};
	if (lower.includes("sent") || lower.includes("envoy")) return {
		label: "Envoyés",
		icon: Send,
		order: 1,
		key: "sent"
	};
	if (lower.includes("draft") || lower.includes("brouillon")) return {
		label: "Brouillons",
		icon: FilePen,
		order: 2,
		key: "drafts"
	};
	if (lower.includes("spam") || lower.includes("junk") || lower.includes("indésir")) return {
		label: "Indésirables",
		icon: ShieldAlert,
		order: 3,
		key: "spam"
	};
	if (lower.includes("trash") || lower.includes("corbeille") || lower.includes("supprim")) return {
		label: "Corbeille",
		icon: Trash2,
		order: 4,
		key: "trash"
	};
	if (lower.includes("archiv")) return {
		label: "Archives",
		icon: Archive,
		order: 5,
		key: "archive"
	};
	return {
		label: name.replace(/^INBOX[./]/i, "") || name,
		icon: Folder,
		order: 99,
		key: name
	};
}
function fmtListDate(d) {
	if (!d) return "";
	const date = new Date(d);
	const now = /* @__PURE__ */ new Date();
	if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit"
	});
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString()) return "Hier";
	if (date.getFullYear() === now.getFullYear()) return date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short"
	});
	return date.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function initialsFor(name, email) {
	return (name || email || "").trim().split(/[\s<>"@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("") || "?";
}
function colorFor(email) {
	let h = 0;
	for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) % 360;
	return `hsl(${h} 55% 42%)`;
}
function SenderAvatar({ name, email, small = false }) {
	const initials = initialsFor(name || "", email);
	const sizeClass = small ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: { background: colorFor(email) },
		className: `${sizeClass} rounded-full text-white font-semibold flex items-center justify-center shrink-0`,
		children: initials
	});
}
function plainFromHtml(html) {
	return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n").trim();
}
function buildReply(msg, mode, myEmail) {
	const dateStr = msg.date ? new Date(msg.date).toLocaleString("fr-FR") : "";
	const original = msg.textPlain?.trim() || plainFromHtml(msg.textHtml || "");
	const quoted = original.split("\n").map((l) => "> " + l).join("\n");
	if (mode === "forward") {
		const body = `\n\n---------- Message transféré ----------\nDe : ${msg.from}\nDate : ${dateStr}\nObjet : ${msg.subject}\nÀ : ${(msg.to || []).join(", ")}\n\n` + original;
		return {
			subject: /^fwd?:\s/i.test(msg.subject) ? msg.subject : `Fwd: ${msg.subject}`,
			body
		};
	}
	const intro = `\n\nLe ${dateStr}, ${msg.from} a écrit :\n${quoted}\n`;
	const subject = /^re:\s/i.test(msg.subject) ? msg.subject : `Re: ${msg.subject}`;
	const me = myEmail.toLowerCase();
	const initial = {
		to: [msg.fromAddr].filter(Boolean),
		subject,
		body: intro,
		inReplyTo: msg.messageId,
		references: msg.messageId
	};
	if (mode === "replyAll") {
		const everyone = [...msg.to || [], ...msg.cc || []].filter((a) => a && a.toLowerCase() !== me && a.toLowerCase() !== msg.fromAddr.toLowerCase());
		initial.cc = Array.from(new Map(everyone.map((a) => [a.toLowerCase(), a])).values());
	}
	return initial;
}
function EmailsPage() {
	const [configured, setConfigured] = (0, import_react.useState)(null);
	const [account, setAccount] = (0, import_react.useState)(null);
	const [folders, setFolders] = (0, import_react.useState)([]);
	const [folder, setFolder] = (0, import_react.useState)("INBOX");
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [total, setTotal] = (0, import_react.useState)(0);
	const [search, setSearch] = (0, import_react.useState)("");
	const [showOnlyUnread, setShowOnlyUnread] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [resolvedHtml, setResolvedHtml] = (0, import_react.useState)("");
	const blobUrlsRef = (0, import_react.useRef)([]);
	const [imagePreviews, setImagePreviews] = (0, import_react.useState)({});
	const [composeOpen, setComposeOpen] = (0, import_react.useState)(false);
	const [composeInitial, setComposeInitial] = (0, import_react.useState)({});
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const PAGE = 50;
	const loadConfig = (0, import_react.useCallback)(async () => {
		try {
			const r = await api("/emails.php?action=config");
			setConfigured(r.configured);
			setAccount(r.account);
			if (!r.configured) {
				const cached = localStorage.getItem("erp_email_session");
				if (cached) try {
					const c = JSON.parse(cached);
					await api("/emails.php?action=save_account", {
						method: "POST",
						body: c
					});
					const r2 = await api("/emails.php?action=config");
					setConfigured(r2.configured);
					setAccount(r2.account);
					if (!r2.configured) setSettingsOpen(true);
					return;
				} catch {
					localStorage.removeItem("erp_email_session");
				}
				setSettingsOpen(true);
			}
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		}
	}, []);
	const loadFolders = (0, import_react.useCallback)(async () => {
		try {
			const r = await api("/emails.php?action=folders");
			setFolders(r.folders ?? []);
		} catch (e) {
			toast.error("IMAP", { description: e?.message });
		}
	}, []);
	const loadMessages = (0, import_react.useCallback)(async (opts = {}) => {
		if (!configured) return;
		const offset = opts.offset ?? 0;
		setLoading(true);
		try {
			const qs = new URLSearchParams({
				action: "list",
				folder,
				limit: String(PAGE),
				offset: String(offset)
			});
			if (search.trim()) qs.set("search", search.trim());
			const r = await api(`/emails.php?${qs.toString()}`);
			setTotal(r.total ?? 0);
			setMessages((prev) => opts.append ? [...prev, ...r.messages ?? []] : r.messages ?? []);
			if (!opts.append) setSelected(/* @__PURE__ */ new Set());
		} catch (e) {
			toast.error("IMAP", { description: e?.message });
		} finally {
			setLoading(false);
		}
	}, [
		configured,
		folder,
		search
	]);
	(0, import_react.useEffect)(() => {
		loadConfig();
	}, [loadConfig]);
	(0, import_react.useEffect)(() => {
		if (configured) {
			loadFolders();
			loadMessages();
		}
	}, [
		configured,
		loadFolders,
		loadMessages
	]);
	(0, import_react.useEffect)(() => {
		setActive(null);
	}, [folder]);
	const sortedFolders = (0, import_react.useMemo)(() => {
		return [...folders].sort((a, b) => {
			const oa = folderMeta(a.name).order;
			const ob = folderMeta(b.name).order;
			if (oa !== ob) return oa - ob;
			return a.name.localeCompare(b.name);
		});
	}, [folders]);
	const visibleMessages = (0, import_react.useMemo)(() => showOnlyUnread ? messages.filter((m) => !m.seen) : messages, [messages, showOnlyUnread]);
	const fetchAttachmentBlob = (0, import_react.useCallback)(async (uid, a, asInline) => {
		const token = getToken();
		const qs = new URLSearchParams({
			action: "attachment",
			folder,
			uid: String(uid),
			part: a.part,
			encoding: String(a.encoding),
			filename: a.filename,
			mime: a.mime
		});
		if (asInline) qs.set("inline", "1");
		const url = apiUrl(`/emails.php?${qs.toString()}`);
		const res = await fetch(url, { headers: token ? {
			Authorization: `Bearer ${token}`,
			"X-Auth-Token": token
		} : {} });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.blob();
	}, [folder]);
	(0, import_react.useEffect)(() => {
		blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
		blobUrlsRef.current = [];
		setImagePreviews({});
		setResolvedHtml(active?.textHtml ?? "");
		if (!active) return;
		let cancelled = false;
		(async () => {
			const inlineWithCid = active.attachments.filter((a) => a.cid && a.cid.length > 0);
			const imageAttachments = active.attachments.filter((a) => a.mime?.startsWith("image/"));
			const previews = {};
			let html = active.textHtml ?? "";
			for (const a of inlineWithCid) try {
				const blob = await fetchAttachmentBlob(active.uid, a, true);
				const url = URL.createObjectURL(blob);
				blobUrlsRef.current.push(url);
				const escaped = a.cid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
				html = html.replace(new RegExp(`cid:${escaped}`, "gi"), url);
				if (a.mime?.startsWith("image/")) previews[a.part] = url;
			} catch {}
			for (const a of imageAttachments) {
				if (previews[a.part]) continue;
				if (a.size > 5242880) continue;
				try {
					const blob = await fetchAttachmentBlob(active.uid, a, true);
					const url = URL.createObjectURL(blob);
					blobUrlsRef.current.push(url);
					previews[a.part] = url;
				} catch {}
			}
			if (cancelled) return;
			setResolvedHtml(html);
			setImagePreviews(previews);
		})();
		return () => {
			cancelled = true;
		};
	}, [active, fetchAttachmentBlob]);
	(0, import_react.useEffect)(() => () => {
		blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
	}, []);
	const openMessage = async (uid) => {
		try {
			const r = await api(`/emails.php?action=get&folder=${encodeURIComponent(folder)}&uid=${uid}`);
			setActive(r.message);
			setMessages((ms) => ms.map((m) => m.uid === uid ? {
				...m,
				seen: true
			} : m));
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		}
	};
	const setFlag = async (uid, flag, set) => {
		try {
			await api("/emails.php?action=flag", {
				method: "PATCH",
				body: {
					folder,
					uid,
					flag,
					set
				}
			});
			setMessages((ms) => ms.map((m) => m.uid === uid ? {
				...m,
				[flag]: set
			} : m));
			if (active?.uid === uid) setActive({
				...active,
				[flag]: set
			});
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		}
	};
	const deleteMessages = async (uids) => {
		if (uids.length === 0) return;
		try {
			await Promise.all(uids.map((uid) => api(`/emails.php?folder=${encodeURIComponent(folder)}&uid=${uid}`, { method: "DELETE" })));
			setMessages((ms) => ms.filter((m) => !uids.includes(m.uid)));
			setSelected(/* @__PURE__ */ new Set());
			if (active && uids.includes(active.uid)) setActive(null);
			toast.success(uids.length === 1 ? "Déplacé dans la corbeille" : `${uids.length} messages supprimés`);
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		}
	};
	const bulkSetSeen = async (uids, seen) => {
		try {
			await Promise.all(uids.map((uid) => api("/emails.php?action=flag", {
				method: "PATCH",
				body: {
					folder,
					uid,
					flag: "seen",
					set: seen
				}
			})));
			setMessages((ms) => ms.map((m) => uids.includes(m.uid) ? {
				...m,
				seen
			} : m));
			setSelected(/* @__PURE__ */ new Set());
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		}
	};
	const openCompose = (mode = "new") => {
		if (mode === "new" || !active) setComposeInitial({});
		else setComposeInitial(buildReply(active, mode, account?.emailAddress ?? ""));
		setComposeOpen(true);
	};
	const printMessage = () => {
		if (!active) return;
		const w = window.open("", "_blank", "width=900,height=700");
		if (!w) return;
		const dateStr = active.date ? new Date(active.date).toLocaleString("fr-FR") : "";
		const safeHtml = resolvedHtml || active.textHtml || `<pre style="white-space:pre-wrap;font-family:inherit">${(active.textPlain || "").replace(/[<>&]/g, (c) => ({
			"<": "&lt;",
			">": "&gt;",
			"&": "&amp;"
		})[c] || c)}</pre>`;
		w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${active.subject}</title>
      <style>body{font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:24px;max-width:760px;margin:auto}
      h1{font-size:18px;margin:0 0 8px}.meta{color:#555;font-size:12px;margin-bottom:16px}hr{border:0;border-top:1px solid #ddd;margin:16px 0}</style>
      </head><body><h1>${active.subject}</h1><div class="meta">
      <b>De :</b> ${active.from}<br><b>À :</b> ${active.to.join(", ")}${active.cc?.length ? `<br><b>Cc :</b> ${active.cc.join(", ")}` : ""}<br><b>Date :</b> ${dateStr}</div><hr>${safeHtml}</body></html>`);
		w.document.close();
		setTimeout(() => {
			w.focus();
			w.print();
		}, 300);
	};
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (composeOpen || settingsOpen) return;
			const t = e.target;
			const tag = t?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
			const list = visibleMessages;
			const idx = active ? list.findIndex((m) => m.uid === active.uid) : -1;
			if (e.key === "j" && list.length) {
				const next = list[Math.min(list.length - 1, idx + 1)];
				if (next) openMessage(next.uid);
			} else if (e.key === "k" && list.length) {
				const prev = list[Math.max(0, idx - 1)];
				if (prev) openMessage(prev.uid);
			} else if (e.key === "c") {
				e.preventDefault();
				openCompose("new");
			} else if (e.key === "r" && active) {
				e.preventDefault();
				openCompose("reply");
			} else if (e.key === "a" && active) {
				e.preventDefault();
				openCompose("replyAll");
			} else if (e.key === "f" && active) {
				e.preventDefault();
				openCompose("forward");
			} else if ((e.key === "Delete" || e.key === "Backspace") && active) deleteMessages([active.uid]);
			else if (e.key === "u" && active) setFlag(active.uid, "seen", !active.seen);
			else if (e.key === "s" && active) setFlag(active.uid, "flagged", !active.flagged);
			else if (e.key === "Escape" && active) setActive(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		active,
		visibleMessages,
		composeOpen,
		settingsOpen
	]);
	const allChecked = visibleMessages.length > 0 && visibleMessages.every((m) => selected.has(m.uid));
	const someChecked = selected.size > 0 && !allChecked;
	const toggleAll = () => {
		if (allChecked) setSelected(/* @__PURE__ */ new Set());
		else setSelected(new Set(visibleMessages.map((m) => m.uid)));
	};
	const toggleOne = (uid) => {
		setSelected((s) => {
			const n = new Set(s);
			if (n.has(uid)) n.delete(uid);
			else n.add(uid);
			return n;
		});
	};
	const totalUnread = (0, import_react.useMemo)(() => folders.find((f) => folderMeta(f.name).key === "inbox")?.unseen ?? 0, [folders]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "list",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Emails",
				description: configured && account ? `${account.emailAddress}${totalUnread > 0 ? ` · ${totalUnread} non lu(s)` : ""}` : "Boîte mail OVH intégrée — IMAP & SMTP",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => loadMessages(),
							disabled: !configured || loading,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}` }), " Actualiser"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setSettingsOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4 mr-1.5" }), " Compte"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => openCompose("new"),
							disabled: !configured,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-4 w-4 mr-1.5" }), " Nouveau"]
						})
					]
				})
			}),
			configured === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mb-4 border-warning/40 bg-warning/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4 text-sm flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }), "Aucune boîte OVH connectée. Connectez votre adresse pour commencer."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => setSettingsOpen(true),
						children: "Connecter"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 200,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-12 gap-4 min-h-[calc(100vh-220px)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: `col-span-12 md:col-span-2 ${active ? "hidden md:block" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "w-full mb-2",
										onClick: () => openCompose("new"),
										disabled: !configured,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-4 w-4 mr-1.5" }), " Composer"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-0.5",
										children: (sortedFolders.length ? sortedFolders : [{
											name: "INBOX",
											total: 0,
											unseen: 0
										}]).map((f) => {
											const meta = folderMeta(f.name);
											const Icon = meta.icon;
											const isActive = folder === f.name;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setFolder(f.name),
												className: `w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60 text-foreground/80"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-2 truncate",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate",
														children: meta.label
													})]
												}), f.unseen > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: isActive ? "default" : "secondary",
													className: "text-[10px] h-5 px-1.5",
													children: f.unseen
												})]
											}) }, f.name);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 pt-3 border-t border-border/60 px-2 text-[10px] text-muted-foreground space-y-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
													className: "font-mono",
													children: "c"
												}),
												" composer · ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
													className: "font-mono",
													children: "r"
												}),
												" répondre"
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
													className: "font-mono",
													children: "j/k"
												}),
												" nav · ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
													className: "font-mono",
													children: "u"
												}),
												" non lu"
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
													className: "font-mono",
													children: "s"
												}),
												" étoile · ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
													className: "font-mono",
													children: "⌫"
												}),
												" supprimer"
											] })
										]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: `col-span-12 md:col-span-4 ${active ? "hidden md:block" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-0 flex flex-col h-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2 border-b border-border space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "pl-8 h-9",
											placeholder: "Rechercher dans le dossier…",
											value: search,
											onChange: (e) => setSearch(e.target.value),
											onKeyDown: (e) => e.key === "Enter" && loadMessages()
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2 px-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: allChecked ? true : someChecked ? "indeterminate" : false,
												onCheckedChange: toggleAll,
												"aria-label": "Tout sélectionner"
											}), selected.size > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
														asChild: true,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "icon",
															variant: "ghost",
															className: "h-7 w-7",
															onClick: () => bulkSetSeen([...selected], true),
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailOpen, { className: "h-3.5 w-3.5" })
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Marquer comme lu" })] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
														asChild: true,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "icon",
															variant: "ghost",
															className: "h-7 w-7",
															onClick: () => bulkSetSeen([...selected], false),
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" })
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Marquer non lu" })] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
														asChild: true,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "icon",
															variant: "ghost",
															className: "h-7 w-7 text-destructive",
															onClick: () => deleteMessages([...selected]),
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Supprimer" })] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs text-muted-foreground ml-1",
														children: selected.size
													})
												]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setShowOnlyUnread((v) => !v),
												className: `flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors ${showOnlyUnread ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3 w-3" }), showOnlyUnread ? "Non lus" : "Tous"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-muted-foreground",
											children: [
												messages.length,
												"/",
												total
											]
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "divide-y divide-border flex-1 overflow-y-auto",
									children: [
										loading && messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "p-3 flex gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-9 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-3/4" })]
											})]
										}, i)) }),
										!loading && visibleMessages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "p-10 text-sm text-muted-foreground text-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), showOnlyUnread ? "Aucun message non lu" : "Aucun message"]
										}),
										visibleMessages.map((m) => {
											const isActive = active?.uid === m.uid;
											const isSelected = selected.has(m.uid);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												onClick: () => openMessage(m.uid),
												className: `group relative pl-3 pr-2 py-2.5 cursor-pointer transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/50"} ${!m.seen ? "" : ""}`,
												children: [!m.seen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-0 bottom-0 w-0.5 bg-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-2.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "pt-0.5 shrink-0",
														onClick: (e) => {
															e.stopPropagation();
															toggleOne(m.uid);
														},
														children: isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
															checked: true,
															onCheckedChange: () => toggleOne(m.uid)
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "h-8 w-8 -m-0.5 flex items-center justify-center",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "hidden group-hover:block",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
																	checked: false,
																	onCheckedChange: () => toggleOne(m.uid)
																})
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "group-hover:hidden",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SenderAvatar, {
																	name: m.from,
																	email: m.fromAddr
																})
															})]
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex-1 min-w-0",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center justify-between gap-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: `truncate text-sm ${!m.seen ? "font-semibold" : "font-normal"}`,
																	children: m.from?.replace(/<.*>/, "").trim() || m.fromAddr
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] text-muted-foreground shrink-0",
																	children: fmtListDate(m.date)
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: `text-sm truncate ${!m.seen ? "font-medium text-foreground" : "text-foreground/80"}`,
																children: m.subject || "(sans objet)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2 mt-0.5",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																	type: "button",
																	onClick: (e) => {
																		e.stopPropagation();
																		setFlag(m.uid, "flagged", !m.flagged);
																	},
																	className: "text-muted-foreground hover:text-warning transition-colors",
																	"aria-label": m.flagged ? "Retirer l'étoile" : "Mettre en étoile",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-3.5 w-3.5 ${m.flagged ? "fill-warning text-warning" : ""}` })
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "text-[11px] text-muted-foreground",
																	children: [Math.max(1, Math.round(m.size / 1024)), " KB"]
																})]
															})
														]
													})]
												})]
											}, m.uid);
										}),
										messages.length < total && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
											className: "p-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "sm",
												className: "w-full",
												disabled: loading,
												onClick: () => loadMessages({
													append: true,
													offset: messages.length
												}),
												children: loading ? "Chargement…" : `Charger plus (${total - messages.length} restants)`
											})
										})
									]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: `col-span-12 md:col-span-6 ${!active ? "hidden md:block" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0 flex flex-col h-full",
								children: !active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-12 text-center text-sm text-muted-foreground flex-1 flex flex-col items-center justify-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-12 w-12 mb-3 opacity-30" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sélectionnez un message pour le lire" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs mt-1 opacity-70",
											children: [
												"Astuce : ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "j" }),
												"/",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "k" }),
												" pour naviguer"
											]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 p-2 border-b border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												className: "md:hidden",
												onClick: () => setActive(null),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => openCompose("reply"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "h-4 w-4 mr-1.5" }), " Répondre"]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "r" }) })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => openCompose("replyAll"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReplyAll, { className: "h-4 w-4 mr-1.5" }), " Répondre à tous"]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "a" }) })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => openCompose("forward"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forward, { className: "h-4 w-4 mr-1.5" }), " Transférer"]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "f" }) })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-8 w-8",
													onClick: () => setFlag(active.uid, "flagged", !active.flagged),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-4 w-4 ${active.flagged ? "fill-warning text-warning" : ""}` })
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: active.flagged ? "Retirer l'étoile" : "Marquer (s)" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-8 w-8",
													onClick: () => setFlag(active.uid, "seen", !active.seen),
													children: active.seen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailOpen, { className: "h-4 w-4" })
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: active.seen ? "Marquer non lu (u)" : "Marquer lu" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-8 w-8",
													onClick: printMessage,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" })
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Imprimer" })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
												asChild: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "icon",
													variant: "ghost",
													className: "h-8 w-8 text-destructive",
													onClick: () => deleteMessages([active.uid]),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: "Supprimer (⌫)" })] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 border-b border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-lg font-semibold leading-tight mb-3",
												children: active.subject || "(sans objet)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SenderAvatar, {
														name: active.from,
														email: active.fromAddr
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex-1 min-w-0 text-sm",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "font-medium truncate",
																children: active.from?.replace(/<.*>/, "").trim() || active.fromAddr
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-xs text-muted-foreground truncate",
																children: [
																	"<",
																	active.fromAddr,
																	">"
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-xs text-muted-foreground mt-0.5",
																children: [
																	"À : ",
																	active.to.join(", "),
																	active.cc && active.cc.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · Cc : ", active.cc.join(", ")] })
																]
															})
														]
													}),
													active.date && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-xs text-muted-foreground shrink-0",
														children: new Date(active.date).toLocaleString("fr-FR")
													})
												]
											}),
											active.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-1.5 mt-3",
												children: active.attachments.map((a, i) => {
													const handle = async (mode) => {
														try {
															const blob = await fetchAttachmentBlob(active.uid, a, mode === "preview");
															const objUrl = URL.createObjectURL(blob);
															if (mode === "preview") {
																if (!window.open(objUrl, "_blank", "noopener")) toast.error("Aperçu bloqué par le navigateur");
															} else {
																const a2 = document.createElement("a");
																a2.href = objUrl;
																a2.download = a.filename || "piece-jointe";
																document.body.appendChild(a2);
																a2.click();
																a2.remove();
															}
															setTimeout(() => URL.revokeObjectURL(objUrl), 6e4);
														} catch (e) {
															toast.error("Téléchargement échoué", { description: e?.message });
														}
													};
													const previewUrl = imagePreviews[a.part];
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 border border-border rounded-md p-1 bg-card/50",
														children: [
															previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: previewUrl,
																alt: a.filename,
																className: "h-10 w-10 object-cover rounded cursor-pointer",
																onClick: () => handle("preview")
															}) : null,
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																variant: "outline",
																className: "gap-1 cursor-pointer max-w-[220px]",
																onClick: () => handle("preview"),
																title: a.filename,
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3 w-3 shrink-0" }),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "truncate",
																		children: a.filename
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-[10px] text-muted-foreground shrink-0",
																		children: [
																			"(",
																			Math.max(1, Math.round(a.size / 1024)),
																			" KB)"
																		]
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "sm",
																variant: "ghost",
																className: "h-6 px-2",
																onClick: () => handle("download"),
																children: "Télécharger"
															})
														]
													}, i);
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1 overflow-y-auto p-4 bg-background",
										children: active.textHtml ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
											title: "email",
											sandbox: "allow-same-origin",
											className: "w-full min-h-[55vh] border border-border/50 rounded bg-white",
											srcDoc: resolvedHtml || active.textHtml
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
											className: "whitespace-pre-wrap text-sm font-sans leading-relaxed",
											children: active.textPlain || "(message vide)"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border-t border-border p-3 bg-muted/30",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "flex-1",
													onClick: () => openCompose("reply"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "h-3.5 w-3.5 mr-1.5" }), " Répondre"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "flex-1",
													onClick: () => openCompose("replyAll"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReplyAll, { className: "h-3.5 w-3.5 mr-1.5" }), " Tous"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "flex-1",
													onClick: () => openCompose("forward"),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forward, { className: "h-3.5 w-3.5 mr-1.5" }), " Transférer"]
												})
											]
										})
									})
								] })
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposeDialog, {
				open: composeOpen,
				onOpenChange: setComposeOpen,
				from: account?.emailAddress ?? "",
				signatureHtml: account?.signatureHtml ?? "",
				signatureText: account?.signatureText ?? "",
				initial: composeInitial,
				onSent: () => loadMessages()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsDialog, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen,
				account,
				onSaved: () => {
					setSettingsOpen(false);
					loadConfig();
				}
			})
		]
	});
}
function ToolbarBtn({ onClick, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onMouseDown: (e) => e.preventDefault(),
		onClick,
		title,
		className: "h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground",
		children
	});
}
function ComposeDialog({ open, onOpenChange, from, signatureHtml, signatureText, initial, onSent }) {
	const { prospects, contracts } = useErp();
	const confirmDialog = useConfirm();
	const [to, setTo] = (0, import_react.useState)([]);
	const [cc, setCc] = (0, import_react.useState)([]);
	const [bcc, setBcc] = (0, import_react.useState)([]);
	const [showCcBcc, setShowCcBcc] = (0, import_react.useState)(false);
	const [subject, setSubject] = (0, import_react.useState)("");
	const [bodyHtml, setBodyHtml] = (0, import_react.useState)("");
	const [inReplyTo, setInReplyTo] = (0, import_react.useState)();
	const [references, setReferences] = (0, import_react.useState)();
	const [sending, setSending] = (0, import_react.useState)(false);
	const DRAFT_KEY = "erp_email_draft_v1";
	const [draftLoaded, setDraftLoaded] = (0, import_react.useState)(false);
	const [savedAt, setSavedAt] = (0, import_react.useState)(null);
	const editorRef = (0, import_react.useRef)(null);
	const textToHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
	const sigBlockHtml = signatureHtml?.trim() ? `<br><br>--<br>${signatureHtml}` : signatureText?.trim() ? `<br><br>--<br>${textToHtml(signatureText)}` : "";
	(0, import_react.useEffect)(() => {
		if (!open) {
			setDraftLoaded(false);
			return;
		}
		if ((initial.to?.length ?? 0) > 0 || (initial.subject ?? "") !== "" || (initial.body ?? "") !== "") {
			setTo(initial.to ?? []);
			setCc(initial.cc ?? []);
			setBcc(initial.bcc ?? []);
			setShowCcBcc((initial.cc?.length ?? 0) > 0 || (initial.bcc?.length ?? 0) > 0);
			setSubject(initial.subject ?? "");
			setBodyHtml((initial.body ? textToHtml(initial.body) : "") + sigBlockHtml);
			setInReplyTo(initial.inReplyTo);
			setReferences(initial.references);
			setSavedAt(null);
			setDraftLoaded(true);
			return;
		}
		if (draftLoaded) return;
		try {
			const raw = localStorage.getItem(DRAFT_KEY);
			if (raw) {
				const d = JSON.parse(raw);
				if (Array.isArray(d.to)) setTo(d.to);
				if (Array.isArray(d.cc)) setCc(d.cc);
				if (Array.isArray(d.bcc)) setBcc(d.bcc);
				if (typeof d.subject === "string") setSubject(d.subject);
				if (typeof d.bodyHtml === "string") setBodyHtml(d.bodyHtml);
				else if (typeof d.body === "string") setBodyHtml(textToHtml(d.body) + sigBlockHtml);
				else setBodyHtml(sigBlockHtml);
				if ((d.cc?.length ?? 0) > 0 || (d.bcc?.length ?? 0) > 0) setShowCcBcc(true);
				if (typeof d.savedAt === "number") setSavedAt(d.savedAt);
			} else setBodyHtml(sigBlockHtml);
		} catch {}
		setDraftLoaded(true);
	}, [
		open,
		initial,
		draftLoaded,
		sigBlockHtml
	]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const el = editorRef.current;
		if (!el) return;
		if (el.innerHTML !== bodyHtml) el.innerHTML = bodyHtml;
	}, [
		open,
		draftLoaded,
		bodyHtml
	]);
	(0, import_react.useEffect)(() => {
		if (!open || !draftLoaded || inReplyTo) return;
		if (!sigBlockHtml) return;
		if (plainFromHtml(bodyHtml).trim() === "") setBodyHtml(sigBlockHtml);
	}, [
		open,
		draftLoaded,
		sigBlockHtml
	]);
	(0, import_react.useEffect)(() => {
		if (!draftLoaded || inReplyTo) return;
		const plain = plainFromHtml(bodyHtml);
		const isEmpty = to.length === 0 && cc.length === 0 && bcc.length === 0 && subject.trim() === "" && plain.trim() === "";
		const t = window.setTimeout(() => {
			try {
				if (isEmpty) {
					localStorage.removeItem(DRAFT_KEY);
					setSavedAt(null);
				} else {
					const ts = Date.now();
					localStorage.setItem(DRAFT_KEY, JSON.stringify({
						to,
						cc,
						bcc,
						subject,
						bodyHtml,
						savedAt: ts
					}));
					setSavedAt(ts);
				}
			} catch {}
		}, 400);
		return () => window.clearTimeout(t);
	}, [
		to,
		cc,
		bcc,
		subject,
		bodyHtml,
		draftLoaded,
		inReplyTo
	]);
	const clearAll = () => {
		try {
			localStorage.removeItem(DRAFT_KEY);
		} catch {}
		setTo([]);
		setCc([]);
		setBcc([]);
		setSubject("");
		setBodyHtml("");
		if (editorRef.current) editorRef.current.innerHTML = "";
		setInReplyTo(void 0);
		setReferences(void 0);
		setShowCcBcc(false);
		setSavedAt(null);
	};
	const discardDraft = async () => {
		if (!await confirmDialog({
			title: "Supprimer le brouillon",
			description: "Voulez-vous supprimer définitivement ce brouillon ?",
			destructive: true
		})) return;
		clearAll();
		toast.success("Brouillon supprimé");
		onOpenChange(false);
	};
	const contacts = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const p of prospects) {
			const e = (p.email || "").trim();
			if (e) {
				const k = e.toLowerCase();
				if (!map.has(k)) map.set(k, {
					email: e,
					name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || void 0,
					source: "Prospect"
				});
			}
		}
		for (const c of contracts) {
			const e = (c.email || "").trim();
			if (e) {
				const k = e.toLowerCase();
				if (!map.has(k)) map.set(k, {
					email: e,
					name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || void 0,
					source: "Contrat"
				});
			}
		}
		return Array.from(map.values()).sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email, "fr"));
	}, [prospects, contracts]);
	const send = async () => {
		const plain = plainFromHtml(bodyHtml);
		if (to.length === 0 || !subject.trim() || !plain.trim()) {
			toast.error("Destinataire, objet et corps requis");
			return;
		}
		const allRecipients = [
			...to,
			...cc,
			...bcc
		];
		const bad = allRecipients.find((a) => !isValidEmail(a));
		if (bad) {
			toast.error(`Adresse invalide: ${bad}`);
			return;
		}
		if (allRecipients.length > 100) {
			toast.error("Trop de destinataires (max 100)");
			return;
		}
		setSending(true);
		try {
			await api("/emails.php?action=send", {
				method: "POST",
				body: {
					to,
					cc,
					bcc,
					subject,
					text: plain,
					html: bodyHtml,
					inReplyTo,
					references
				}
			});
			toast.success(`Email envoyé à ${allRecipients.length} destinataire(s)`);
			onOpenChange(false);
			clearAll();
			onSent?.();
		} catch (e) {
			toast.error("Envoi échoué", { description: e?.message });
		} finally {
			setSending(false);
		}
	};
	const isReplyOrForward = !!inReplyTo || /^(re|fwd):/i.test(subject);
	const exec = (cmd, val) => {
		editorRef.current?.focus();
		try {
			document.execCommand(cmd, false, val);
		} catch {}
		if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
	};
	const insertLink = () => {
		const url = window.prompt("URL du lien", "https://");
		if (!url) return;
		exec("createLink", url);
	};
	const insertSignature = () => {
		if (!sigBlockHtml) {
			toast.info("Aucune signature configurée", { description: "Ajoutez-la dans les paramètres." });
			return;
		}
		editorRef.current?.focus();
		try {
			document.execCommand("insertHTML", false, sigBlockHtml);
		} catch {}
		if (editorRef.current) setBodyHtml(editorRef.current.innerHTML);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-3xl max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: inReplyTo ? "Répondre" : isReplyOrForward ? "Transférer" : "Nouveau message" }), savedAt && !inReplyTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: ["Brouillon enregistré · ", new Date(savedAt).toLocaleTimeString()]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "De"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: from,
							disabled: true,
							className: "h-9"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipientField, {
							label: "À",
							values: to,
							onChange: setTo,
							contacts,
							placeholder: "email@exemple.com"
						}),
						!showCcBcc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowCcBcc(true),
							className: "text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline",
							children: "Ajouter Cc / Cci"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipientField, {
							label: "Cc",
							values: cc,
							onChange: setCc,
							contacts
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipientField, {
							label: "Cci",
							values: bcc,
							onChange: setBcc,
							contacts
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Objet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: subject,
							onChange: (e) => setSubject(e.target.value),
							className: "h-9"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Message"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: insertSignature,
									className: "text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1",
									title: "Insérer la signature",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3.5 w-3.5" }), " Signature"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border rounded-md overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1 py-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: () => exec("bold"),
											title: "Gras (Ctrl+B)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bold, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: () => exec("italic"),
											title: "Italique (Ctrl+I)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Italic, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: () => exec("underline"),
											title: "Souligné (Ctrl+U)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Underline, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-5 w-px bg-border" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: () => exec("insertUnorderedList"),
											title: "Liste à puces",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: () => exec("insertOrderedList"),
											title: "Liste numérotée",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListOrdered, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: () => exec("formatBlock", "blockquote"),
											title: "Citation",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-5 w-px bg-border" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: insertLink,
											title: "Lien",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolbarBtn, {
											onClick: () => exec("removeFormat"),
											title: "Effacer la mise en forme",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-5 w-px bg-border" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											onChange: (e) => {
												exec("formatBlock", e.target.value);
												e.currentTarget.selectedIndex = 0;
											},
											className: "text-xs bg-transparent border rounded px-1 py-0.5",
											title: "Style",
											defaultValue: "",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													disabled: true,
													children: "Style"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "p",
													children: "Paragraphe"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "h1",
													children: "Titre 1"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "h2",
													children: "Titre 2"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "h3",
													children: "Titre 3"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "pre",
													children: "Code"
												})
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									ref: editorRef,
									contentEditable: true,
									suppressContentEditableWarning: true,
									onInput: (e) => setBodyHtml(e.target.innerHTML),
									className: "min-h-[260px] max-h-[420px] overflow-y-auto p-3 text-sm outline-none prose prose-sm max-w-none [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground mt-1",
								children: "Formatage riche · envoi en HTML + texte brut"
							})
						] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "gap-2 sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: savedAt && !inReplyTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: discardDraft,
							type: "button",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1.5" }), " Supprimer le brouillon"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => onOpenChange(false),
							children: "Fermer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: send,
							disabled: sending,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4 mr-1.5" }),
								" ",
								sending ? "Envoi…" : "Envoyer"
							]
						})]
					})]
				})
			]
		})
	});
}
function SettingsDialog({ open, onOpenChange, account, onSaved }) {
	const [emailAddress, setEmail] = (0, import_react.useState)(account?.emailAddress ?? "");
	const [displayName, setDisplayName] = (0, import_react.useState)(account?.displayName ?? "");
	const [password, setPassword] = (0, import_react.useState)("");
	const [imapHost, setImapHost] = (0, import_react.useState)(account?.imapHost ?? "ssl0.ovh.net");
	const [imapPort, setImapPort] = (0, import_react.useState)(String(account?.imapPort ?? 993));
	const [imapEncryption, setImapEnc] = (0, import_react.useState)(account?.imapEncryption ?? "ssl");
	const [smtpHost, setSmtpHost] = (0, import_react.useState)(account?.smtpHost ?? "ssl0.ovh.net");
	const [smtpPort, setSmtpPort] = (0, import_react.useState)(String(account?.smtpPort ?? 465));
	const [smtpEncryption, setSmtpEnc] = (0, import_react.useState)(account?.smtpEncryption ?? "ssl");
	const [signatureHtml, setSignatureHtml] = (0, import_react.useState)(account?.signatureHtml ?? "");
	const [signatureText, setSignatureText] = (0, import_react.useState)(account?.signatureText ?? "");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [testing, setTesting] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open && account) {
			setEmail(account.emailAddress);
			setDisplayName(account.displayName ?? "");
			setImapHost(account.imapHost);
			setImapPort(String(account.imapPort));
			setImapEnc(account.imapEncryption);
			setSmtpHost(account.smtpHost);
			setSmtpPort(String(account.smtpPort));
			setSmtpEnc(account.smtpEncryption);
			setSignatureHtml(account.signatureHtml ?? "");
			setSignatureText(account.signatureText ?? "");
		}
	}, [open, account]);
	const buildPayload = () => {
		const payload = {
			emailAddress,
			displayName,
			imapHost,
			imapPort: Number(imapPort),
			imapEncryption,
			smtpHost,
			smtpPort: Number(smtpPort),
			smtpEncryption,
			signatureHtml,
			signatureText
		};
		if (password) payload.password = password;
		return payload;
	};
	const save = async () => {
		if (!emailAddress.trim()) {
			toast.error("Email requis");
			return;
		}
		if (!account && !password) {
			toast.error("Mot de passe requis");
			return;
		}
		setSaving(true);
		try {
			const payload = buildPayload();
			await api("/emails.php?action=save_account", {
				method: "POST",
				body: payload
			});
			try {
				if (password) localStorage.setItem("erp_email_session", JSON.stringify({
					...payload,
					password
				}));
			} catch {}
			toast.success("Boîte mail connectée");
			onSaved();
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		} finally {
			setSaving(false);
		}
	};
	const testConnection = async () => {
		setTesting(true);
		try {
			await api("/emails.php?action=save_account", {
				method: "POST",
				body: buildPayload()
			});
			const r = await api("/emails.php?action=test_connection", {
				method: "POST",
				body: {}
			});
			if (r.allOk) toast.success("IMAP & SMTP OK ✓");
			else toast.error("Test échoué", { description: `IMAP: ${r.test.imap.ok ? "OK" : r.test.imap.error}\nSMTP: ${r.test.smtp.ok ? "OK" : r.test.smtp.error}` });
		} catch (e) {
			toast.error("Test échoué", { description: e?.message });
		} finally {
			setTesting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg max-h-[90vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Compte email OVH" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Adresse email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: emailAddress,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "prenom@votredomaine.com"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom d'affichage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: displayName,
							onChange: (e) => setDisplayName(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mot de passe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: account ? "••••••••• (laissez vide pour ne pas changer)" : ""
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Hôte IMAP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: imapHost,
										onChange: (e) => setImapHost(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Port" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: imapPort,
									onChange: (e) => setImapPort(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Chiffrement IMAP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: imapEncryption,
										onValueChange: setImapEnc,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "ssl",
												children: "SSL"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "tls",
												children: "TLS"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "none",
												children: "Aucun"
											})
										] })]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Hôte SMTP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: smtpHost,
										onChange: (e) => setSmtpHost(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Port" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: smtpPort,
									onChange: (e) => setSmtpPort(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Chiffrement SMTP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: smtpEncryption,
										onValueChange: setSmtpEnc,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "ssl",
												children: "SSL"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "tls",
												children: "STARTTLS"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "none",
												children: "Aucun"
											})
										] })]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-2 border-t space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-base font-semibold",
									children: "Signature email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Ajoutée automatiquement à la fin de chaque email envoyé (nouveau, réponse, transfert)."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Signature texte (clients sans HTML)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: signatureText,
									onChange: (e) => setSignatureText(e.target.value),
									placeholder: "Jean Dupont\nCommercial — Protection ERP\n+33 1 23 45 67 89",
									rows: 4,
									maxLength: 5e3
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Signature HTML (rendue dans les clients modernes)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: signatureHtml,
										onChange: (e) => setSignatureHtml(e.target.value),
										placeholder: "<strong>Jean Dupont</strong><br>Commercial — Protection ERP<br><a href=\"mailto:jean@exemple.com\">jean@exemple.com</a>",
										rows: 5,
										className: "font-mono text-xs",
										maxLength: 2e4
									}),
									signatureHtml.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 p-3 border rounded bg-muted/30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground mb-1",
											children: "Aperçu :"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm",
											dangerouslySetInnerHTML: { __html: signatureHtml }
										})]
									})
								] })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => onOpenChange(false),
						children: "Fermer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: testConnection,
						disabled: testing || saving || !emailAddress,
						children: testing ? "Test…" : "Tester la connexion"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						disabled: saving,
						children: saving ? "Enregistrement…" : "Enregistrer"
					})
				] })
			]
		})
	});
}
export { EmailsPage as component };
