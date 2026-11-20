import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { A as chatApi, C as timeShort, E as ScrollArea, O as Textarea, S as convTitle, T as useJumpToMessage, _ as NewGroupDialog, b as MessageSearchPanel, d as Route$32, g as NewDmDialog, h as ManageGroupDialog, j as confirmDialog, k as useChat, m as BroadcastDialog, p as AddMembersDialog, v as ConvAvatar, w as useChatScroll, x as ScrollToBottomButton, y as MessageList } from "./router-Dkp91uPV.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { d as DropdownMenuItem, l as DropdownMenu, m as DropdownMenuTrigger, p as DropdownMenuSeparator, u as DropdownMenuContent } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { At as Image, B as Send, Ht as File, Ln as Bell, Q as Plus, R as Settings, Rn as BellOff, Sn as ChevronLeft, Tn as CheckCheck, V as Search, Wt as FileText, _t as LockOpen, a as Users, ct as MessageCircle, gt as Lock, kt as Inbox, mt as LogOut, n as X, nt as Paperclip, rn as EllipsisVertical, u as UserPlus, ut as Megaphone, vt as LoaderCircle } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/messaging-ZNc1alvs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MessagingPage() {
	const { user } = useAuth();
	const chat = useChat();
	const isAdmin = user?.role === "Administrateur";
	const isManager = user?.role === "Manager";
	const { conv: convFromUrl } = Route$32.useSearch();
	const [search, setSearch] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)("all");
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [newDmOpen, setNewDmOpen] = (0, import_react.useState)(false);
	const [newGroupOpen, setNewGroupOpen] = (0, import_react.useState)(false);
	const [broadcastOpen, setBroadcastOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (convFromUrl && chat.conversations.some((c) => c.id === convFromUrl)) setActiveId(convFromUrl);
	}, [convFromUrl, chat.conversations]);
	(0, import_react.useEffect)(() => {
		if (!activeId && chat.conversations.length > 0) setActiveId(chat.conversations[0].id);
	}, [chat.conversations, activeId]);
	(0, import_react.useEffect)(() => {
		if (!activeId) return;
		chat.loadMessages(activeId).then(() => chat.markRead(activeId));
	}, [activeId]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		let list = chat.conversations;
		if (tab === "unread") list = list.filter((c) => c.unread > 0 && !c.muted);
		else if (tab === "dm") list = list.filter((c) => c.type === "dm");
		else if (tab === "groups") list = list.filter((c) => c.type === "group" || c.type === "broadcast");
		if (q) list = list.filter((c) => convTitle(c, user?.username).toLowerCase().includes(q) || c.members.some((m) => m.fullName.toLowerCase().includes(q) || m.username.toLowerCase().includes(q)));
		return list;
	}, [
		chat.conversations,
		search,
		tab,
		user?.username
	]);
	const counts = (0, import_react.useMemo)(() => ({
		all: chat.conversations.length,
		unread: chat.conversations.filter((c) => c.unread > 0 && !c.muted).length,
		dm: chat.conversations.filter((c) => c.type === "dm").length,
		groups: chat.conversations.filter((c) => c.type === "group" || c.type === "broadcast").length
	}), [chat.conversations]);
	const active = chat.conversations.find((c) => c.id === activeId) ?? null;
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-[calc(100vh-4rem)] flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 sm:px-6 pt-4 pb-3 border-b border-border flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-xl font-semibold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5 text-primary" }), " Messagerie"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						counts.all,
						" conversation",
						counts.all > 1 ? "s" : "",
						counts.unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-primary font-medium",
							children: [
								counts.unread,
								" non lue",
								counts.unread > 1 ? "s" : ""
							]
						})] })
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setNewDmOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), " Message"]
						}),
						(isAdmin || isManager) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setNewGroupOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 mr-1.5" }), " Groupe"]
						}),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setBroadcastOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4 mr-1.5" }), " Annonce"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 grid grid-cols-1 md:grid-cols-[340px_1fr] min-h-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: `border-r border-border bg-card flex flex-col min-h-0 ${active ? "hidden md:flex" : "flex"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-2 border-b border-border space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: search,
								onChange: (e) => setSearch(e.target.value),
								placeholder: "Rechercher une conversation…",
								className: "pl-8 h-9"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-1",
							children: [
								["all", "Toutes"],
								["unread", "Non lues"],
								["dm", "Direct"],
								["groups", "Groupes"]
							].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setTab(key),
								className: `h-8 text-[11px] rounded-md font-medium transition-colors flex items-center justify-center gap-1 ${tab === key ? "bg-primary text-primary-foreground" : "hover:bg-muted/60 text-muted-foreground"}`,
								children: [label, counts[key] > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[10px] px-1 rounded-full ${tab === key ? "bg-primary-foreground/20" : "bg-muted"}`,
									children: counts[key]
								})]
							}, key))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
						className: "flex-1",
						children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-12 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground/40 mb-2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: "Aucune conversation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground mt-1",
									children: tab === "unread" ? "Tout est à jour 🎉" : "Démarrez une nouvelle discussion"
								})
							]
						}) : filtered.map((c) => {
							const isUnread = c.unread > 0 && !c.muted;
							const senderLabel = c.lastSender && c.lastSender !== user.username ? (c.members.find((m) => m.username === c.lastSender)?.fullName?.split(" ")[0] ?? c.lastSender) + ": " : c.lastSender === user.username ? "Vous: " : "";
							const typeBadge = c.type === "broadcast" ? "Annonce" : c.type === "group" ? "Groupe" : null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setActiveId(c.id),
								className: `w-full px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left ${activeId === c.id ? "bg-muted/70" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvAvatar, {
									conv: c,
									meUsername: user?.username,
									size: 42
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `text-sm truncate ${isUnread ? "font-semibold" : "font-medium"}`,
												children: convTitle(c, user?.username)
											}),
											typeBadge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase tracking-wide shrink-0",
												children: typeBadge
											}),
											c.muted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "ml-auto text-[10px] text-muted-foreground shrink-0 whitespace-nowrap",
												children: timeShort(c.lastMessageAt)
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5 mt-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `text-xs truncate flex-1 ${isUnread ? "text-foreground" : "text-muted-foreground"}`,
											children: [senderLabel, c.lastBody ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "italic",
												children: "Aucun message"
											})]
										}), isUnread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center shrink-0",
											children: c.unread > 99 ? "99+" : c.unread
										})]
									})]
								})]
							}, c.id);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: `min-h-0 flex flex-col ${active ? "flex" : "hidden md:flex"}`,
					children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationPane, {
						conv: active,
						onBack: () => setActiveId(null)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 flex flex-col items-center justify-center text-center px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-7 w-7 text-muted-foreground" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: "Sélectionnez une conversation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground mt-1 max-w-xs",
								children: "Choisissez une discussion à gauche, ou démarrez-en une nouvelle."
							})
						]
					})
				})]
			})]
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
function ConversationPane({ conv, onBack }) {
	const { user } = useAuth();
	const chat = useChat();
	const messages = chat.messagesByConv[conv.id] ?? [];
	const hasMore = chat.hasMore[conv.id] !== false;
	const loadingOlder = !!chat.loadingOlder[conv.id];
	const [text, setText] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [pendingFile, setPendingFile] = (0, import_react.useState)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [addOpen, setAddOpen] = (0, import_react.useState)(false);
	const [manageOpen, setManageOpen] = (0, import_react.useState)(false);
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const fileInputRef = (0, import_react.useRef)(null);
	const { scrollRef, onScroll, scrollToBottom, awayFromBottom } = useChatScroll({
		messages,
		convId: conv.id,
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
	const title = convTitle(conv, user?.username);
	const isGroupAdmin = conv.members.find((m) => m.username === user?.username)?.role === "admin" || user?.role === "Administrateur";
	const canPost = conv.type === "dm" || conv.postPolicy === "all" || isGroupAdmin;
	const subtitle = conv.type === "dm" ? "Message direct" : conv.type === "broadcast" ? `Annonce · ${conv.members.length} destinataires` : `${conv.members.length} membre(s)${conv.postPolicy === "admins" ? " · admins seulement" : ""}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-14 px-3 sm:px-4 border-b border-border bg-card flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onBack,
					className: "md:hidden h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => conv.type !== "dm" && isGroupAdmin && setManageOpen(true),
					className: `flex items-center gap-2 flex-1 min-w-0 text-left ${conv.type !== "dm" && isGroupAdmin ? "hover:bg-muted/40 -mx-1 px-1 rounded-md" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvAvatar, {
						conv,
						meUsername: user?.username,
						size: 38
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold truncate",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-muted-foreground truncate flex items-center gap-1",
							children: [conv.type === "dm" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" }), subtitle]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setSearchOpen((v) => !v),
					className: `h-8 w-8 rounded-md inline-flex items-center justify-center ${searchOpen ? "bg-muted text-primary" : "hover:bg-muted/60"}`,
					title: "Rechercher dans la conversation",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "h-8 w-8 rounded-md hover:bg-muted/60 inline-flex items-center justify-center",
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
									} catch (e) {
										toast.error(e?.message);
									}
								},
								children: conv.postPolicy === "admins" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "h-4 w-4 mr-2" }), " Autoriser tout le monde"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 mr-2" }), " Restreindre aux admins"] })
							})
						] }),
						conv.type !== "dm" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							className: "text-destructive",
							onClick: async () => {
								if (!await confirmDialog({
									title: "Confirmer l'action",
									description: "Quitter cette conversation ?",
									tone: "warning",
									confirmText: "Continuer"
								})) return;
								try {
									await chatApi.leave(conv.id);
									onBack();
									await chat.refreshConversations();
								} catch (e) {
									toast.error(e?.message);
								}
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4 mr-2" }), " Quitter"]
						})] })
					]
				})] })
			]
		}),
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
			className: `relative flex-1 overflow-y-auto px-3 sm:px-6 py-3 bg-background ${dragOver ? "ring-2 ring-inset ring-primary/40" : ""}`,
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
					className: "text-center py-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-4xl mb-2",
							children: "👋"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: "Aucun message pour le moment"
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
			className: "px-3 py-2 flex items-center gap-2 border-t border-border bg-muted/30",
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
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5" }), " Seuls les administrateurs peuvent poster dans ce groupe."]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				submit();
			},
			className: "p-2 sm:p-3 border-t border-border bg-card flex items-end gap-1.5",
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
					placeholder: pendingFile ? "Ajouter une légende…" : "Écrire un message…",
					rows: 1,
					className: "min-h-9 max-h-40 resize-none text-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "icon",
					disabled: !text.trim() && !pendingFile || sending,
					title: "Envoyer (Entrée)",
					children: sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
				})
			]
		}),
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
	] });
}
export { MessagingPage as component };
