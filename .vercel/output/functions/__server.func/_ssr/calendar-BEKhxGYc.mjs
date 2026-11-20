import { i as __toESM } from "../_runtime.mjs";
import { a as CommandInput, i as CommandGroup, n as Command$1, o as CommandItem, r as CommandEmpty, s as CommandList, t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { a as cn, c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { _ as PopoverContent, a as DialogFooter, c as DialogTrigger, g as Popover, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, v as PopoverTrigger, w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as DatePicker } from "./date-picker-BVRMSMeD.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { f as Route$39 } from "./router-BUkYRVTH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Q as Plus, Sn as ChevronLeft, b as Trash2, kn as CalendarDays, ln as Clock, n as X, s as User, wn as Check, xn as ChevronRight, yn as ChevronsUpDown } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/calendar-BEKhxGYc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProspectPicker({ prospects, value, onChange }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return (q ? prospects.filter((p) => `${p.firstName} ${p.lastName} ${p.phone ?? ""} ${p.mobile ?? ""} ${p.city ?? ""}`.toLowerCase().includes(q)) : prospects).slice(0, 50);
	}, [prospects, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open,
			onOpenChange: setOpen,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					role: "combobox",
					"aria-expanded": open,
					className: cn("flex-1 justify-between font-normal", !value && "text-muted-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2 truncate",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3.5 w-3.5 opacity-60" }), value ? `${value.firstName} ${value.lastName}${value.city ? ` — ${value.city}` : ""}` : "Aucun prospect lié"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "h-3.5 w-3.5 opacity-50 shrink-0" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
				className: "p-0 w-[--radix-popover-trigger-width]",
				align: "start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, {
					shouldFilter: false,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
						value: query,
						onValueChange: setQuery,
						placeholder: "Rechercher un prospect…"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "Aucun prospect trouvé" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: p.id,
						onSelect: () => {
							onChange(p);
							setOpen(false);
							setQuery("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-4 w-4", value?.id === p.id ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm",
								children: [
									p.firstName,
									" ",
									p.lastName
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] text-muted-foreground",
								children: [
									p.id,
									p.city ? ` • ${p.city}` : "",
									p.phone ? ` • ${p.phone}` : ""
								]
							})]
						})]
					}, p.id)) })] })]
				})
			})]
		}), value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			className: "h-9 w-9",
			title: "Délier le prospect",
			onClick: () => onChange(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
		})]
	});
}
var monthName = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre"
];
var dayShort = [
	"Lun",
	"Mar",
	"Mer",
	"Jeu",
	"Ven",
	"Sam",
	"Dim"
];
var dayLong = [
	"Lundi",
	"Mardi",
	"Mercredi",
	"Jeudi",
	"Vendredi",
	"Samedi",
	"Dimanche"
];
var typeColor = {
	rdv: "bg-info/15 text-info border-l-2 border-info",
	rappel: "bg-warning/15 text-warning-foreground border-l-2 border-warning",
	signature: "bg-success/15 text-success border-l-2 border-success",
	devis: "bg-primary/15 text-primary border-l-2 border-primary"
};
var typeLabel = {
	rdv: "Rendez-vous",
	rappel: "Rappel",
	signature: "Signature",
	devis: "Devis"
};
var isDevisTitle = (t) => {
	if (!t) return false;
	return /^\s*devis\b/i.test(t.trim());
};
var getDisplayType = (e) => isDevisTitle(e.title) ? "devis" : e.type ?? "rdv";
var displayColor = (e) => typeColor[getDisplayType(e)] ?? typeColor["rdv"];
var displayLabel = (e) => typeLabel[getDisplayType(e)] ?? typeLabel["rdv"];
function pad(n) {
	return String(n).padStart(2, "0");
}
function ymd(d) {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function startOfWeek(d) {
	const x = new Date(d);
	const offset = (x.getDay() + 6) % 7;
	x.setDate(x.getDate() - offset);
	x.setHours(0, 0, 0, 0);
	return x;
}
function frDate(d) {
	return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}
function CalendarPage() {
	const today = /* @__PURE__ */ new Date();
	const [view, setView] = (0, import_react.useState)("mois");
	const search = Route$39.useSearch();
	const initialCursor = search.date ? (() => {
		const [y, m, d] = search.date.split("-").map(Number);
		return new Date(y, (m ?? 1) - 1, d ?? 1);
	})() : new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const [cursor, setCursor] = (0, import_react.useState)(initialCursor);
	const { events, saveEvent, deleteEvent, prospects } = useErp();
	const navigate = useNavigate();
	const openProspect = (id) => navigate({
		to: "/prospects/$prospectId",
		params: { prospectId: id }
	});
	const prefillProspect = (0, import_react.useMemo)(() => search.prospectId ? prospects.find((p) => p.id === search.prospectId) ?? null : null, [prospects, search.prospectId]);
	const [autoOpenKey, setAutoOpenKey] = (0, import_react.useState)(0);
	const consumedRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (search.newEvent === "1" && consumedRef.current !== search.prospectId) {
			consumedRef.current = search.prospectId ?? "__noprospect__";
			setAutoOpenKey((k) => k + 1);
		}
	}, [search.newEvent, search.prospectId]);
	const clearDeepLink = () => {
		if (search.newEvent || search.prospectId || search.date) navigate({
			to: "/calendar",
			search: {},
			replace: true
		});
	};
	const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
	const tokenSet = (s) => new Set(norm(s).split(" ").filter(Boolean));
	const prospectIndex = (0, import_react.useMemo)(() => {
		const exact = /* @__PURE__ */ new Map();
		const tokens = [];
		for (const p of prospects) {
			const fn = (p.firstName ?? "").trim();
			const ln = (p.lastName ?? "").trim();
			const full = norm(`${fn} ${ln}`);
			const rev = norm(`${ln} ${fn}`);
			if (full && !exact.has(full)) exact.set(full, p.id);
			if (rev && !exact.has(rev)) exact.set(rev, p.id);
			const sorted = [...new Set([...full.split(" "), ...rev.split(" ")].filter(Boolean))].sort().join(" ");
			if (sorted && !exact.has(sorted)) exact.set(sorted, p.id);
			tokens.push({
				id: p.id,
				tokens: new Set([fn, ln].map(norm).filter(Boolean))
			});
		}
		return {
			exact,
			tokens
		};
	}, [prospects]);
	const resolveEventProspect = (e) => {
		if (e.prospectId) return e.prospectId;
		const t = (e.title || "").trim();
		if (!t) return null;
		const candidates = /* @__PURE__ */ new Set([t]);
		for (const sep of [
			" — ",
			" – ",
			" - ",
			" : ",
			" | ",
			"—",
			"–",
			":",
			"|"
		]) {
			const idx = t.indexOf(sep);
			if (idx >= 0) candidates.add(t.slice(idx + sep.length));
		}
		for (const c of candidates) {
			const hit = prospectIndex.exact.get(norm(c));
			if (hit) return hit;
		}
		let best = null;
		for (const c of candidates) {
			const cTokens = tokenSet(c);
			if (!cTokens.size) continue;
			for (const { id, tokens } of prospectIndex.tokens) {
				if (!tokens.size) continue;
				let covered = 0;
				for (const t of tokens) if (cTokens.has(t)) covered++;
				if (covered === tokens.size && covered >= 2) {
					if (!best || covered > best.score) best = {
						id,
						score: covered
					};
				}
			}
		}
		return best?.id ?? null;
	};
	const openEventProspect = (e) => {
		const id = resolveEventProspect(e);
		if (id) openProspect(id);
		else toast.info("Aucun prospect lié à cet événement");
	};
	const eventsByDay = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const e of events) {
			const list = map.get(e.date) ?? [];
			list.push(e);
			map.set(e.date, list);
		}
		for (const list of map.values()) list.sort((a, b) => a.time.localeCompare(b.time));
		return map;
	}, [events]);
	const eventsFor = (d) => eventsByDay.get(ymd(d)) ?? [];
	function navigateCal(direction) {
		const d = new Date(cursor);
		if (view === "mois") d.setMonth(d.getMonth() + direction);
		else if (view === "semaine") d.setDate(d.getDate() + direction * 7);
		else d.setDate(d.getDate() + direction);
		setCursor(d);
	}
	const headerLabel = (0, import_react.useMemo)(() => {
		if (view === "mois") return `${monthName[cursor.getMonth()]} ${cursor.getFullYear()}`;
		if (view === "semaine") {
			const s = startOfWeek(cursor);
			const e = new Date(s);
			e.setDate(s.getDate() + 6);
			return `Semaine du ${frDate(s)} au ${frDate(e)}`;
		}
		return `${dayLong[(cursor.getDay() + 6) % 7]} ${frDate(cursor)}`;
	}, [view, cursor]);
	const navLabel = view === "mois" ? "mois" : view === "semaine" ? "semaine" : "jour";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "list",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Calendrier",
			description: `${events.length} événement(s) — Rendez-vous, rappels et signatures`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewEventDialog, {
				defaultDate: ymd(cursor),
				onSave: saveEvent,
				autoOpenKey,
				prefillProspect,
				onClosed: clearDeepLink
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-6 shadow-elegant overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-4 border-b border-border gap-3 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									onClick: () => navigateCal(-1),
									"aria-label": `${navLabel} précédent`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setCursor(new Date(today.getFullYear(), today.getMonth(), today.getDate())),
									children: "Aujourd'hui"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "icon",
									onClick: () => navigateCal(1),
									"aria-label": `${navLabel} suivant`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base sm:text-lg font-semibold capitalize",
							children: headerLabel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden md:flex gap-1 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-info" }), "RDV"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 ml-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-warning" }), "Rappel"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 ml-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-success" }), "Signature"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 ml-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-primary" }), "Devis"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "inline-flex rounded-md border border-border bg-muted/30 p-0.5",
								children: [
									"mois",
									"semaine",
									"jour"
								].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setView(v),
									className: `px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${view === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`,
									children: v
								}, v))
							})]
						})
					]
				}),
				view === "mois" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthView, {
					cursor,
					today,
					eventsFor,
					onDelete: deleteEvent,
					onPickDay: (d) => {
						setCursor(d);
						setView("jour");
					},
					onOpenProspect: openEventProspect
				}),
				view === "semaine" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekView, {
					cursor,
					today,
					eventsFor,
					onDelete: deleteEvent,
					onPickDay: (d) => {
						setCursor(d);
						setView("jour");
					},
					onOpenProspect: openEventProspect
				}),
				view === "jour" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayView, {
					cursor,
					eventsFor,
					onDelete: deleteEvent,
					onSave: saveEvent,
					onOpenProspect: openEventProspect
				})
			]
		})]
	});
}
function NewEventDialog({ defaultDate, onSave, autoOpenKey, prefillProspect, onClosed }) {
	const me = useAuth().user?.username ?? "";
	const { prospects } = useErp();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(defaultDate);
	const [time, setTime] = (0, import_react.useState)("09:00");
	const [type, setType] = (0, import_react.useState)("rdv");
	const [agent, setAgent] = (0, import_react.useState)(me);
	const [linkedProspectId, setLinkedProspectId] = (0, import_react.useState)(void 0);
	const linkedProspect = (0, import_react.useMemo)(() => linkedProspectId ? prospects.find((p) => p.id === linkedProspectId) ?? null : null, [prospects, linkedProspectId]);
	const applyProspect = (p) => {
		if (p) {
			setLinkedProspectId(p.id);
			setTitle(`${type === "rappel" ? "Rappel" : type === "signature" ? "Signature" : type === "devis" ? "Devis" : "RDV"} — ${p.firstName} ${p.lastName}`);
			if (p.assignedTo) setAgent(p.assignedTo);
		} else setLinkedProspectId(void 0);
	};
	(0, import_react.useEffect)(() => {
		if (!autoOpenKey) return;
		if (prefillProspect) {
			setTitle(`RDV — ${prefillProspect.firstName} ${prefillProspect.lastName}`);
			setLinkedProspectId(prefillProspect.id);
			if (prefillProspect.assignedTo) setAgent(prefillProspect.assignedTo);
		}
		setType("rdv");
		setOpen(true);
	}, [autoOpenKey]);
	const submit = async () => {
		if (!title.trim()) {
			toast.error("Titre requis");
			return;
		}
		try {
			await onSave({
				title: title.trim(),
				date,
				time,
				type,
				agent,
				prospectId: linkedProspectId
			});
			toast.success("Événement ajouté");
			setOpen(false);
			setTitle("");
			setTime("09:00");
			setType("rdv");
			setLinkedProspectId(void 0);
			onClosed?.();
		} catch (e) {
			toast.error("Échec", { description: e instanceof Error ? e.message : "" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (v) => {
			setOpen(v);
			if (!v) onClosed?.();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "bg-primary text-primary-foreground hover:bg-primary/90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), "Nouvel événement"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Nouvel événement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Planifiez un RDV, rappel, signature ou devis." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Prospect lié ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground font-normal",
							children: "(optionnel)"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProspectPicker, {
							prospects,
							value: linkedProspect,
							onChange: applyProspect
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Titre" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: title,
							onChange: (e) => setTitle(e.target.value),
							placeholder: "Ex: RDV M. Dupont"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DatePicker, {
								value: date,
								onChange: setDate
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Heure" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: time,
								onChange: (e) => setTime(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: type,
								onValueChange: (v) => setType(v),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "rdv",
										children: "Rendez-vous"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "rappel",
										children: "Rappel"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "signature",
										children: "Signature"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "devis",
										children: "Devis"
									})
								] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Agent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: agent,
								onChange: (e) => setAgent(e.target.value)
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => setOpen(false),
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: submit,
				children: "Créer"
			})] })
		] })]
	});
}
function MonthView({ cursor, today, eventsFor, onDelete, onPickDay, onOpenProspect }) {
	const year = cursor.getFullYear();
	const month = cursor.getMonth();
	const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))];
	while (cells.length % 7) cells.push(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-7 border-b border-border bg-muted/30",
		children: dayShort.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center",
			children: d
		}, d))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-7",
		children: cells.map((d, i) => {
			const isToday = d && ymd(d) === ymd(today);
			const events = d ? eventsFor(d) : [];
			const visible = events.slice(0, 3);
			const overflow = events.length - visible.length;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onClick: () => d && onPickDay(d),
				role: d ? "button" : void 0,
				tabIndex: d ? 0 : -1,
				onKeyDown: (ev) => {
					if (d && (ev.key === "Enter" || ev.key === " ")) {
						ev.preventDefault();
						onPickDay(d);
					}
				},
				className: `min-h-[110px] border-r border-b border-border p-1.5 transition-colors ${d ? "cursor-pointer hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40" : "bg-muted/20"} ${isToday ? "bg-primary/5" : ""}`,
				children: d && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `text-xs font-medium mb-1 ${isToday ? "inline-flex h-6 w-6 rounded-full bg-primary text-primary-foreground items-center justify-center" : "text-muted-foreground"}`,
					children: d.getDate()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [visible.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: (ev) => {
							ev.stopPropagation();
							onOpenProspect(e);
						},
						title: "Ouvrir le prospect",
						className: `text-[10px] px-1.5 py-1 rounded truncate ${displayColor(e)} group flex items-center justify-between gap-1 cursor-pointer hover:brightness-110`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: e.time
							}),
							" ",
							e.title
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: (ev) => {
								ev.stopPropagation();
								onDelete(e.id);
							},
							className: "opacity-0 group-hover:opacity-70 hover:opacity-100",
							"aria-label": "Supprimer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
						})]
					}, e.id)), overflow > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						onClick: (ev) => ev.stopPropagation(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowDialog, {
							date: d,
							events,
							hiddenCount: overflow,
							onDelete,
							onOpenProspect
						})
					})]
				})] })
			}, i);
		})
	})] });
}
function WeekView({ cursor, today, eventsFor, onDelete, onPickDay, onOpenProspect }) {
	const start = startOfWeek(cursor);
	const days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		return d;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-7",
		children: days.map((d, i) => {
			const isToday = ymd(d) === ymd(today);
			const events = eventsFor(d);
			const visible = events.slice(0, 6);
			const overflow = events.length - visible.length;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onClick: () => onPickDay(d),
				role: "button",
				tabIndex: 0,
				onKeyDown: (ev) => {
					if (ev.key === "Enter" || ev.key === " ") {
						ev.preventDefault();
						onPickDay(d);
					}
				},
				className: `min-h-[420px] border-r border-border p-2 cursor-pointer transition-colors hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-primary/40 ${isToday ? "bg-primary/5" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between mb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground",
						children: dayShort[i]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `text-sm font-semibold ${isToday ? "inline-flex h-7 w-7 rounded-full bg-primary text-primary-foreground items-center justify-center" : ""}`,
						children: d.getDate()
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [
						visible.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: (ev) => {
								ev.stopPropagation();
								onOpenProspect(e);
							},
							title: "Ouvrir le prospect",
							className: `text-[11px] px-2 py-1.5 rounded ${displayColor(e)} group cursor-pointer hover:brightness-110`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: e.time
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (ev) => {
										ev.stopPropagation();
										onDelete(e.id);
									},
									className: "opacity-0 group-hover:opacity-70 hover:opacity-100",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate",
								children: e.title
							})]
						}, e.id)),
						overflow > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							onClick: (ev) => ev.stopPropagation(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverflowDialog, {
								date: d,
								events,
								hiddenCount: overflow,
								onDelete,
								onOpenProspect
							})
						}),
						events.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-foreground italic mt-2",
							children: "Aucun événement"
						})
					]
				})]
			}, i);
		})
	});
}
function DayView({ cursor, eventsFor, onDelete, onSave, onOpenProspect }) {
	const auth = useAuth();
	const me = auth.user?.username ?? "";
	const role = auth.user?.role ?? "";
	const canEdit = (e) => [
		"Administrateur",
		"Manager",
		"Backoffice"
	].includes(role) || e.agent === me;
	const STATUS_LABEL = {
		pending: "À traiter",
		nrp: "Ne répond pas",
		lost: "Pas gagné",
		won: "Gagné (contrat)"
	};
	const STATUS_CLASS = {
		pending: "bg-muted text-muted-foreground border-border",
		nrp: "bg-warning/20 text-warning-foreground border-warning/40",
		lost: "bg-destructive/15 text-destructive border-destructive/40",
		won: "bg-success/15 text-success border-success/40"
	};
	const events = eventsFor(cursor);
	const grouped = /* @__PURE__ */ new Map();
	for (const e of events) {
		const h = parseInt(e.time.split(":")[0], 10);
		const list = grouped.get(h) ?? [];
		list.push(e);
		grouped.set(h, list);
	}
	const baseHours = Array.from({ length: 12 }, (_, i) => 8 + i);
	const extraHours = Array.from(grouped.keys()).filter((h) => h < 8 || h > 19);
	const hours = Array.from(/* @__PURE__ */ new Set([...baseHours, ...extraHours])).sort((a, b) => a - b);
	const changeStatus = async (e, next) => {
		try {
			await onSave({
				id: e.id,
				rdvStatus: next
			});
			toast.success(`Statut: ${STATUS_LABEL[next]}`);
		} catch (err) {
			toast.error("Échec", { description: err instanceof Error ? err.message : "" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-semibold capitalize",
				children: [
					dayLong[(cursor.getDay() + 6) % 7],
					" ",
					frDate(cursor)
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground ml-2",
				children: [
					"— ",
					events.length,
					" événement",
					events.length > 1 ? "s" : ""
				]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y divide-border",
		children: hours.map((h) => {
			const list = grouped.get(h) ?? [];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[80px_1fr] gap-3 px-4 py-3 hover:bg-muted/20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground font-medium flex items-start gap-1.5 pt-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3 mt-0.5" }),
						pad(h),
						":00"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1.5",
					children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground/60 italic",
						children: "—"
					}) : list.map((e) => {
						const status = e.rdvStatus ?? "pending";
						const editable = getDisplayType(e) === "rdv" && canEdit(e) && status !== "won";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							title: "Ouvrir le prospect",
							className: `text-sm px-3 py-2 rounded ${displayColor(e)} group hover:brightness-110`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									onClick: () => onOpenProspect(e),
									className: "font-semibold cursor-pointer",
									children: [
										e.time,
										" — ",
										e.title
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] uppercase tracking-wider opacity-70",
										children: displayLabel(e)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: (ev) => {
											ev.stopPropagation();
											onDelete(e.id);
										},
										className: "opacity-50 hover:opacity-100",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground mt-0.5 flex items-center justify-between gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Avec @", e.agent] }), getDisplayType(e) === "rdv" && (editable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: status,
									onValueChange: (v) => changeStatus(e, v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: `h-7 w-[160px] text-[11px] font-semibold border ${STATUS_CLASS[status]}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "pending",
											children: "À traiter"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "nrp",
											children: "Ne répond pas"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "lost",
											children: "Pas gagné"
										})
									] })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[status]}`,
									children: STATUS_LABEL[status]
								}))]
							})]
						}, e.id);
					})
				})]
			}, h);
		})
	})] });
}
function OverflowDialog({ date, events, hiddenCount, onDelete, onOpenProspect }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "text-[10px] font-medium text-primary hover:underline px-1.5 py-0.5",
				children: [
					"+",
					hiddenCount,
					" en plus"
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "w-[min(95vw,640px)] max-h-[90vh] overflow-hidden p-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
					"Événements du ",
					dayLong[(date.getDay() + 6) % 7],
					" ",
					frDate(date)
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					events.length,
					" événement",
					events.length > 1 ? "s" : ""
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-y-auto max-h-[calc(90vh-8rem)] p-3 space-y-3",
					children: events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setOpen(false);
							onOpenProspect(e);
						},
						className: `w-full text-left rounded-lg p-3 ${displayColor(e)} hover:brightness-110 transition`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-semibold text-sm",
								children: [
									e.time,
									" — ",
									e.title
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11px] text-muted-foreground mt-1",
								children: ["@", e.agent]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-wide opacity-80",
								children: displayLabel(e)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.prospectId ? "Prospect lié" : "Aucun prospect lié" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: (ev) => {
									ev.stopPropagation();
									onDelete(e.id);
								},
								className: "text-[10px] text-destructive hover:text-destructive-foreground",
								children: "Supprimer"
							})]
						})]
					}, e.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setOpen(false),
					children: "Fermer"
				}) })
			]
		})]
	});
}
export { CalendarPage as component };
