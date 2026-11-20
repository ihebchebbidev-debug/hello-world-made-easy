import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { t as Switch } from "./switch-D6uZdzGr.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Cb1NE_Xq.mjs";
import { B as AlertDialogTitle, E as ScrollArea, F as AlertDialogCancel, I as AlertDialogContent, L as AlertDialogDescription, M as useConfirm, N as AlertDialog, P as AlertDialogAction, R as AlertDialogFooter, z as AlertDialogHeader } from "./router-Dkp91uPV.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { S as useCurrency, T as writeCurrency, t as DEFAULT_CURRENCY, x as readCurrency, y as formatAmount } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bn as ArrowUp, Dn as Calendar, Ft as Hash, Gn as ArrowDown, H as Save, I as ShieldCheck, Lt as Globe, Mt as History, Ot as Info, P as ShieldX, Q as Plus, R as Settings, S as TextAlignStart, U as RotateCcw, b as Trash2, cn as Coins, et as Pencil, h as Type, n as X, q as RefreshCw, sn as Copy, vt as LoaderCircle, wn as Check, x as ToggleLeft, yt as List } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/configuration-CoedNLk0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	enabled: false,
	ranges: [],
	bypassUsers: [],
	bypassRoles: []
};
var ALL_ROLES = [
	"Manager",
	"Superviseur",
	"Backoffice",
	"Agent",
	"Vendeur",
	"Qualificateur"
];
/** Basic CIDR / IP validator (IPv4 + IPv6). */
function isValidRule(rule) {
	const r = rule.trim();
	if (!r) return false;
	const [addr, bitsStr] = r.includes("/") ? r.split("/") : [r, null];
	if (bitsStr !== null) {
		const bits = Number(bitsStr);
		if (!Number.isInteger(bits) || bits < 0) return false;
		if (addr.includes(":") && bits > 128) return false;
		if (!addr.includes(":") && bits > 32) return false;
	}
	const v4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(addr);
	const v6 = /^[0-9a-fA-F:]+$/.test(addr) && addr.includes(":");
	return v4 || v6;
}
function IpAllowlistSettings() {
	const [cfg, setCfg] = (0, import_react.useState)(EMPTY);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [myIp, setMyIp] = (0, import_react.useState)("");
	const [newRange, setNewRange] = (0, import_react.useState)("");
	const [newBypass, setNewBypass] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		(async () => {
			try {
				const r = await api("/settings.php", { query: {
					scope: "global",
					key: "ip_allowlist"
				} });
				if (r.value && typeof r.value === "object") setCfg({
					enabled: !!r.value.enabled,
					ranges: Array.isArray(r.value.ranges) ? r.value.ranges : [],
					bypassUsers: Array.isArray(r.value.bypassUsers) ? r.value.bypassUsers : [],
					bypassRoles: Array.isArray(r.value.bypassRoles) ? r.value.bypassRoles : []
				});
			} catch (e) {
				toast.error("Chargement de la liste IP impossible", { description: e?.message });
			} finally {
				setLoading(false);
			}
			try {
				const j = await (await fetch("https://api.ipify.org?format=json")).json();
				if (j?.ip) setMyIp(j.ip);
			} catch {}
		})();
	}, []);
	const addRange = () => {
		const v = newRange.trim();
		if (!v) return;
		if (!isValidRule(v)) {
			toast.error("Format invalide", { description: "Utilisez une IP (1.2.3.4) ou un CIDR (1.2.3.0/24)." });
			return;
		}
		if (cfg.ranges.includes(v)) {
			toast.warning("Cette plage est déjà dans la liste");
			return;
		}
		setCfg({
			...cfg,
			ranges: [...cfg.ranges, v]
		});
		setNewRange("");
	};
	const removeRange = (r) => setCfg({
		...cfg,
		ranges: cfg.ranges.filter((x) => x !== r)
	});
	const addBypass = () => {
		const v = newBypass.trim();
		if (!v) return;
		if (cfg.bypassUsers.includes(v)) {
			toast.warning("Cet utilisateur est déjà exempté");
			return;
		}
		setCfg({
			...cfg,
			bypassUsers: [...cfg.bypassUsers, v]
		});
		setNewBypass("");
	};
	const removeBypass = (u) => setCfg({
		...cfg,
		bypassUsers: cfg.bypassUsers.filter((x) => x !== u)
	});
	const save = async () => {
		if (cfg.enabled && cfg.ranges.length === 0) {
			toast.error("Liste vide", { description: "Ajoutez au moins une plage avant d'activer la restriction." });
			return;
		}
		setSaving(true);
		try {
			await api("/settings.php", {
				method: "PUT",
				body: {
					scope: "global",
					key: "ip_allowlist",
					value: cfg
				}
			});
			toast.success("Restriction IP enregistrée", { description: cfg.enabled ? `${cfg.ranges.length} plage(s) autorisée(s). Les Administrateurs restent toujours autorisés.` : "La restriction est désactivée — accès libre." });
		} catch (e) {
			toast.error("Enregistrement impossible", { description: e?.message });
		} finally {
			setSaving(false);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6 flex items-center gap-2 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Chargement de la configuration IP…"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold",
						children: "Restriction par adresse IP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mt-0.5",
						children: [
							"Limitez l'accès à l'application aux adresses IP ou plages CIDR autorisées. Les ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Administrateurs" }),
							" restent toujours autorisés (anti-blocage)."
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-lg border border-border p-4 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-sm font-medium",
					children: "Activer la restriction IP"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Lorsqu'elle est active, toute requête venant d'une IP non listée est rejetée."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: cfg.enabled,
					onCheckedChange: (v) => setCfg({
						...cfg,
						enabled: v
					})
				})]
			}),
			myIp && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-4 text-xs text-muted-foreground",
				children: [
					"Votre adresse IP publique actuelle :",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-mono font-semibold text-foreground hover:underline",
						onClick: () => setNewRange(myIp),
						children: myIp
					}),
					" ",
					"(cliquez pour la pré-remplir)."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 rounded-lg border border-border bg-muted/40 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Comment écrire une plage IP ou CIDR ?"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mb-3 leading-relaxed",
						children: [
							"Une ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "IP unique" }),
							" autorise une seule machine. Un ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "bloc CIDR" }),
							" ",
							"(",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "font-mono",
								children: "adresse/bits"
							}),
							") autorise une plage entière. Plus le nombre de bits est ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "petit" }),
							", plus la plage est ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "large" }),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-3 font-medium",
										children: "Exemple"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 pr-3 font-medium",
										children: "Couvre"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1.5 font-medium",
										children: "Quand l'utiliser"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/60",
								children: [
									{
										ex: "41.226.10.5",
										cov: "1 adresse",
										use: "Un poste fixe ou un VPN avec IP dédiée"
									},
									{
										ex: "41.226.10.0/24",
										cov: "256 adresses (41.226.10.0 → .255)",
										use: "Un sous-réseau de bureau standard"
									},
									{
										ex: "197.0.0.0/16",
										cov: "65 536 adresses (197.0.x.x)",
										use: "Une large plage opérateur / pays"
									},
									{
										ex: "10.0.0.0/8",
										cov: "16,7 M d'adresses (10.x.x.x)",
										use: "Tout le réseau privé interne"
									},
									{
										ex: "2001:db8::/32",
										cov: "Plage IPv6",
										use: "Réseau IPv6 (rare)"
									}
								].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "group",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 pr-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => {
													setNewRange(row.ex);
													toast.success("Exemple copié dans le champ");
												},
												className: "inline-flex items-center gap-1 rounded bg-background px-2 py-0.5 font-mono text-foreground border border-border hover:border-primary hover:text-primary transition-colors",
												title: "Cliquer pour pré-remplir",
												children: [row.ex, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3 w-3 opacity-60 group-hover:opacity-100" })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 pr-3 text-muted-foreground",
											children: row.cov
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 text-muted-foreground",
											children: row.use
										})
									]
								}, row.ex))
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-1 text-xs text-muted-foreground list-disc list-inside",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"Le format est ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono",
									children: "a.b.c.d"
								}),
								" ou ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono",
									children: "a.b.c.d/bits"
								}),
								" (bits entre 0 et 32 pour IPv4)."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"Évitez ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "font-mono",
									children: "0.0.0.0/0"
								}),
								" qui autoriserait ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "tout Internet" }),
								"."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "En cas de doute, ajoutez votre IP actuelle (bouton ci-dessus) avant d'activer la restriction." })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Plages autorisées (IP ou CIDR)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: newRange,
							onChange: (e) => setNewRange(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addRange();
								}
							},
							placeholder: "Ex : 41.226.10.5 ou 197.0.0.0/16"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							onClick: addRange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), "Ajouter"]
						})]
					}),
					cfg.ranges.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground italic",
						children: "Aucune plage configurée."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: cfg.ranges.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "secondary",
							className: "font-mono pr-1",
							children: [r, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeRange(r),
								className: "ml-1.5 rounded p-0.5 hover:bg-destructive/20 hover:text-destructive",
								"aria-label": `Supprimer ${r}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})]
						}, r))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rôles exemptés (en plus des Administrateurs)" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Cochez les rôles qui pourront accéder à l'application depuis n'importe quelle IP. Le rôle ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Administrateur" }),
							" est toujours exempté."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: ALL_ROLES.map((r) => {
							const active = cfg.bypassRoles.includes(r);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCfg({
									...cfg,
									bypassRoles: active ? cfg.bypassRoles.filter((x) => x !== r) : [...cfg.bypassRoles, r]
								}),
								className: `px-3 py-1.5 rounded-md border text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`,
								children: r
							}, r);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Utilisateurs exemptés (cas par cas)" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: newBypass,
							onChange: (e) => setNewBypass(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addBypass();
								}
							},
							placeholder: "nom.utilisateur"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							onClick: addBypass,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), "Exempter"]
						})]
					}),
					cfg.bypassUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: cfg.bypassUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "pr-1",
							children: [u, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removeBypass(u),
								className: "ml-1.5 rounded p-0.5 hover:bg-destructive/20 hover:text-destructive",
								"aria-label": `Retirer ${u}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})]
						}, u))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					disabled: saving,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }), saving ? "Enregistrement…" : "Enregistrer"]
				})
			})
		]
	});
}
function relTime(iso) {
	const d = /* @__PURE__ */ new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
	const diff = Math.max(0, Date.now() - d.getTime());
	const m = Math.floor(diff / 6e4);
	if (m < 1) return "à l'instant";
	if (m < 60) return `il y a ${m} min`;
	const h = Math.floor(m / 60);
	if (h < 24) return `il y a ${h} h`;
	return `il y a ${Math.floor(h / 24)} j`;
}
function IpBlocksLog() {
	const confirm = useConfirm();
	const [blocks, setBlocks] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(async () => {
		setRefreshing(true);
		try {
			const [list, st] = await Promise.all([api("/ip_blocks.php", { query: { limit: 200 } }), api("/ip_blocks.php", { query: { stats: 1 } })]);
			setBlocks(list.blocks ?? []);
			setStats({
				total: st.total ?? 0,
				last24h: st.last24h ?? 0,
				uniqueIps7d: st.uniqueIps7d ?? 0
			});
		} catch (e) {
			toast.error("Journal indisponible", { description: e?.message });
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const purgeAll = async () => {
		if (!await confirm({
			title: "Vider le journal ?",
			description: `Supprimer ${blocks.length} entrée(s) de tentatives bloquées. Cette action est irréversible.`,
			confirmLabel: "Vider",
			destructive: true
		})) return;
		try {
			await api("/ip_blocks.php", {
				method: "DELETE",
				query: { all: 1 }
			});
			toast.success("Journal vidé");
			load();
		} catch (e) {
			toast.error("Suppression impossible", { description: e?.message });
		}
	};
	const removeOne = async (id) => {
		try {
			await api("/ip_blocks.php", {
				method: "DELETE",
				query: { id }
			});
			setBlocks((bs) => bs.filter((b) => b.id !== id));
		} catch (e) {
			toast.error("Suppression impossible", { description: e?.message });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3 mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Tentatives d'accès bloquées"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-0.5",
							children: "Journal des requêtes refusées par la restriction IP (30 derniers jours, max 200 lignes)."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: load,
							disabled: refreshing,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}` }), "Actualiser"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: purgeAll,
							disabled: blocks.length === 0,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 mr-1.5" }), " Vider"]
						})]
					})
				]
			}),
			stats && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-3 mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total",
						value: stats.total
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "24 dernières heures",
						value: stats.last24h,
						accent: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "IPs uniques (7 j)",
						value: stats.uniqueIps7d
					})
				]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Chargement du journal…"]
			}) : blocks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldX, { className: "h-6 w-6 mx-auto mb-2 text-muted-foreground/60" }), "Aucune tentative bloquée enregistrée."]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "h-[420px] rounded-lg border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "sticky top-0 bg-muted/60 backdrop-blur text-xs uppercase tracking-wide text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2 font-medium",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2 font-medium",
								children: "IP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2 font-medium",
								children: "Utilisateur"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2 font-medium",
								children: "Endpoint"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-10" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: blocks.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border hover:bg-muted/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-2 whitespace-nowrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium",
									children: relTime(b.attemptedAt)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground",
									children: b.attemptedAt
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-xs",
								children: b.ip
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: b.username ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: b.username }), b.role && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "mt-0.5 text-[10px]",
									children: b.role
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground italic",
									children: "non authentifié"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 font-mono text-[11px] text-muted-foreground truncate max-w-[200px]",
								title: b.path ?? "",
								children: b.path ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive",
									onClick: () => removeOne(b.id),
									"aria-label": "Supprimer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})
							})
						]
					}, b.id)) })]
				})
			})
		]
	});
}
function StatCard({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-lg border p-3 ${accent ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-2xl font-semibold mt-0.5 ${accent ? "text-destructive" : "text-foreground"}`,
			children: value
		})]
	});
}
var TYPE_META = {
	text: {
		label: "Texte",
		icon: Type,
		hint: "Une ligne de texte libre"
	},
	textarea: {
		label: "Texte long",
		icon: TextAlignStart,
		hint: "Plusieurs lignes (commentaires, notes)"
	},
	number: {
		label: "Nombre",
		icon: Hash,
		hint: "Valeur numérique entière ou décimale"
	},
	date: {
		label: "Date",
		icon: Calendar,
		hint: "Sélecteur de date (JJ/MM/AAAA)"
	},
	boolean: {
		label: "Oui / Non",
		icon: ToggleLeft,
		hint: "Interrupteur binaire"
	},
	select: {
		label: "Liste déroulante",
		icon: List,
		hint: "Choix unique parmi une liste"
	}
};
function FieldIcon({ type }) {
	const Icon = TYPE_META[type]?.icon ?? Type;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" });
}
function FieldList({ tab }) {
	const [fields, setFields] = (0, import_react.useState)([]);
	const [label, setLabel] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("text");
	const [optionsRaw, setOptionsRaw] = (0, import_react.useState)("");
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [editLabel, setEditLabel] = (0, import_react.useState)("");
	const [editOptions, setEditOptions] = (0, import_react.useState)("");
	const [deleteTarget, setDeleteTarget] = (0, import_react.useState)(null);
	const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
	const load = async () => {
		try {
			const r = await api("/custom_fields.php", { query: { entity: tab } });
			setFields(r.fields.map((f) => ({
				id: f.id,
				label: f.label,
				type: f.type,
				required: !!f.required,
				key: f.key,
				options: Array.isArray(f.options) ? f.options : [],
				position: Number(f.position) || 0
			})));
		} catch (e) {
			toast.error("Chargement impossible", { description: e?.message });
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [tab]);
	const add = async () => {
		const trimmed = label.trim();
		if (!trimmed) {
			toast.error("Donnez un nom au champ");
			return;
		}
		const newKey = slugify(trimmed);
		const dup = fields.find((f) => f.label.trim().toLowerCase() === trimmed.toLowerCase() || f.key && f.key === newKey);
		if (dup) {
			toast.error("Un champ avec ce nom existe déjà", { description: `« ${dup.label} » utilise déjà la clé "${dup.key ?? newKey}".` });
			return;
		}
		const options = type === "select" ? optionsRaw.split(",").map((s) => s.trim()).filter(Boolean) : void 0;
		if (type === "select" && (!options || options.length === 0)) {
			toast.error("Ajoutez au moins une option (séparées par des virgules)");
			return;
		}
		try {
			await api("/custom_fields.php", {
				method: "POST",
				body: {
					entity: tab,
					label: trimmed,
					type,
					options,
					position: fields.length
				}
			});
			setLabel("");
			setOptionsRaw("");
			toast.success("Champ ajouté");
			await load();
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const confirmRemove = async () => {
		if (!deleteTarget) return;
		const { id, name } = deleteTarget;
		setDeleteTarget(null);
		try {
			await api(`/custom_fields.php?id=${id}`, { method: "DELETE" });
			await load();
			toast.success("Champ supprimé", { description: name });
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const toggleReq = async (id) => {
		const f = fields.find((x) => x.id === id);
		if (!f) return;
		try {
			await api("/custom_fields.php", {
				method: "PATCH",
				body: {
					id,
					required: !f.required
				}
			});
			await load();
		} catch (e) {
			toast.error(e?.message);
		}
	};
	const move = async (id, dir) => {
		const idx = fields.findIndex((f) => f.id === id);
		const swap = idx + dir;
		if (idx < 0 || swap < 0 || swap >= fields.length) return;
		const next = [...fields];
		[next[idx], next[swap]] = [next[swap], next[idx]];
		const reindexed = next.map((f, i) => ({
			...f,
			position: i
		}));
		setFields(reindexed);
		try {
			await Promise.all([api("/custom_fields.php", {
				method: "PATCH",
				body: {
					id: reindexed[idx].id,
					position: idx
				}
			}), api("/custom_fields.php", {
				method: "PATCH",
				body: {
					id: reindexed[swap].id,
					position: swap
				}
			})]);
		} catch (e) {
			toast.error(e?.message);
			await load();
		}
	};
	const startEdit = (f) => {
		setEditingId(f.id);
		setEditLabel(f.label);
		setEditOptions((f.options ?? []).join(", "));
	};
	const cancelEdit = () => {
		setEditingId(null);
		setEditLabel("");
		setEditOptions("");
	};
	const saveEdit = async (f) => {
		const trimmed = editLabel.trim();
		if (!trimmed) {
			toast.error("Le nom est requis");
			return;
		}
		const dup = fields.find((x) => x.id !== f.id && x.label.trim().toLowerCase() === trimmed.toLowerCase());
		if (dup) {
			toast.error("Un autre champ porte déjà ce nom", { description: `« ${dup.label} »` });
			return;
		}
		const body = {
			id: f.id,
			label: trimmed
		};
		if (f.type === "select") {
			const opts = editOptions.split(",").map((s) => s.trim()).filter(Boolean);
			if (opts.length === 0) {
				toast.error("Au moins une option requise");
				return;
			}
			body.options = opts;
		}
		try {
			await api("/custom_fields.php", {
				method: "PATCH",
				body
			});
			cancelEdit();
			await load();
			toast.success("Champ modifié");
		} catch (e) {
			toast.error(e?.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "p-4 shadow-elegant",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium mb-1",
					children: "Ajouter un champ personnalisé"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mb-3",
					children: [
						"Ces champs apparaîtront dans le formulaire ",
						tab === "prospect" ? "prospect" : tab === "contract" ? "contrat" : "utilisateur",
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-[11px] uppercase tracking-wider text-muted-foreground",
								children: "Nom du champ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "ex: Numéro Sécu",
								value: label,
								onChange: (e) => setLabel(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter" && type !== "select") add();
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-[11px] uppercase tracking-wider text-muted-foreground",
								children: "Type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: type,
								onValueChange: setType,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Object.entries(TYPE_META).map(([k, m]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: k,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, { className: "h-3.5 w-3.5" }), m.label]
									})
								}, k)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: add,
								className: "bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), "Ajouter"]
							})
						})
					]
				}),
				type === "select" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground",
						children: "Options (séparées par des virgules)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "ex: Particulier, Professionnel, Entreprise",
						value: optionsRaw,
						onChange: (e) => setOptionsRaw(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground mt-2 italic",
					children: TYPE_META[type]?.hint
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4 shadow-elegant overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					children: "Champs configurés"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "bg-primary/5",
					children: fields.length
				})]
			}), fields.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-10 text-center text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }), "Aucun champ personnalisé pour le moment."]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border",
				children: fields.map((f, idx) => {
					const meta = TYPE_META[f.type];
					const isEditing = editingId === f.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-3 flex items-center gap-3 hover:bg-muted/20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "h-5 w-5",
									disabled: idx === 0,
									onClick: () => move(f.id, -1),
									"aria-label": "Monter",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "h-5 w-5",
									disabled: idx === fields.length - 1,
									onClick: () => move(f.id, 1),
									"aria-label": "Descendre",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3 w-3" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldIcon, { type: f.type })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 min-w-0",
								children: isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: editLabel,
										onChange: (e) => setEditLabel(e.target.value),
										className: "h-8"
									}), f.type === "select" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: editOptions,
										onChange: (e) => setEditOptions(e.target.value),
										placeholder: "Options séparées par virgules",
										className: "h-8 text-xs"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-medium text-sm flex items-center gap-2",
									children: [f.label, f.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-semibold text-destructive uppercase",
										children: "Requis"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground truncate",
									children: [
										meta?.label,
										" · clé: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "text-foreground/70",
											children: f.key ?? slugify(f.label)
										}),
										f.type === "select" && f.options && f.options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											" · ",
											f.options.length,
											" option(s)"
										] })
									]
								})] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden sm:flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs text-muted-foreground cursor-pointer",
									htmlFor: `req-${f.id}`,
									children: "Requis"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									id: `req-${f.id}`,
									checked: f.required,
									onCheckedChange: () => toggleReq(f.id)
								})]
							}),
							isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "text-success hover:bg-success/10",
								onClick: () => saveEdit(f),
								"aria-label": "Enregistrer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: cancelEdit,
								"aria-label": "Annuler",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => startEdit(f),
								"aria-label": `Modifier ${f.label}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => setDeleteTarget({
									id: f.id,
									name: f.label
								}),
								className: "text-destructive hover:bg-destructive/10",
								"aria-label": `Supprimer ${f.label}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})] })
						]
					}, f.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: !!deleteTarget,
			onOpenChange: (o) => {
				if (!o) setDeleteTarget(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Supprimer le champ ?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: deleteTarget ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"Le champ ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
					"« ",
					deleteTarget.name,
					" »"
				] }),
				" et toutes ses valeurs associées seront supprimés. Cette action est irréversible."
			] }) : null })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Annuler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: confirmRemove,
				className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				children: "Supprimer"
			})] })] })
		})
	] });
}
var PRESET_CURRENCIES = [
	{
		code: "TND",
		symbol: "TND",
		decimals: 3,
		position: "suffix"
	},
	{
		code: "TND",
		symbol: "د.ت",
		decimals: 3,
		position: "suffix"
	},
	{
		code: "EUR",
		symbol: "€",
		decimals: 2,
		position: "suffix"
	},
	{
		code: "USD",
		symbol: "$",
		decimals: 2,
		position: "prefix"
	},
	{
		code: "MAD",
		symbol: "DH",
		decimals: 2,
		position: "suffix"
	},
	{
		code: "DZD",
		symbol: "DA",
		decimals: 2,
		position: "suffix"
	}
];
function CurrencySettings() {
	const live = useCurrency();
	const [draft, setDraft] = (0, import_react.useState)(() => readCurrency());
	(0, import_react.useEffect)(() => {
		setDraft(live);
	}, [live]);
	const dirty = JSON.stringify(draft) !== JSON.stringify(live);
	const save = () => {
		if (!draft.symbol.trim()) {
			toast.error("Le symbole est requis");
			return;
		}
		const cleaned = {
			...draft,
			symbol: draft.symbol.trim(),
			code: draft.code.trim().toUpperCase() || "TND",
			decimals: Math.max(0, Math.min(4, Number(draft.decimals) || 0))
		};
		writeCurrency(cleaned);
		toast.success("Devise mise à jour", { description: `Affichée comme ${formatAmount(1234.5, cleaned)}` });
	};
	const reset = () => {
		writeCurrency(DEFAULT_CURRENCY);
		setDraft(DEFAULT_CURRENCY);
		toast.success("Devise réinitialisée à TND");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5 shadow-elegant",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 mb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "h-4 w-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold text-sm",
					children: "Devise de l'application"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: "Symbole, format et décimales utilisés partout (contrats, dashboard, dispatch…)"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-[11px] uppercase tracking-wider text-muted-foreground",
					children: "Préréglages"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: PRESET_CURRENCIES.map((p, i) => {
						const active = p.code === draft.code && p.symbol === draft.symbol;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setDraft(p),
							className: `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-base ${active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/50"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: p.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: p.code
							})]
						}, `${p.code}-${i}`);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: "Code"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.code,
							maxLength: 6,
							onChange: (e) => setDraft({
								...draft,
								code: e.target.value
							}),
							placeholder: "TND"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: "Symbole"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.symbol,
							maxLength: 6,
							onChange: (e) => setDraft({
								...draft,
								symbol: e.target.value
							}),
							placeholder: "TND"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: "Décimales"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: String(draft.decimals),
							onValueChange: (v) => setDraft({
								...draft,
								decimals: Number(v)
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
								0,
								1,
								2,
								3,
								4
							].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: String(d),
								children: d
							}, d)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: "Position"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.position,
							onValueChange: (v) => setDraft({
								...draft,
								position: v
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "suffix",
								children: "Après le montant (1 234 TND)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "prefix",
								children: "Avant le montant ($ 1 234)"
							})] })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 p-4 rounded-lg border border-border bg-muted/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2",
					children: "Aperçu"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline gap-x-6 gap-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground",
							children: "Cotisation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-lg font-semibold",
							children: formatAmount(950, draft)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground",
							children: "CA mensuel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-lg font-semibold",
							children: formatAmount(125430.5, draft)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] text-muted-foreground",
							children: "Petit montant"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-lg font-semibold",
							children: formatAmount(7.5, draft)
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap items-center gap-2 justify-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: reset,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4 mr-1.5" }), "Réinitialiser"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					disabled: !dirty,
					onClick: save,
					className: "bg-primary text-primary-foreground hover:bg-primary/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }), "Enregistrer"]
				})]
			})
		]
	});
}
function ConfigPage() {
	const { user } = useAuth();
	if (!(user?.role === "Administrateur")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Configuration",
			description: "Réservé aux administrateurs",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-6 p-8 text-center text-sm text-muted-foreground",
			children: [
				"Cette page est réservée au rôle ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Administrateur" }),
				"."
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Configuration",
			description: "Devise, formats et champs personnalisés de vos formulaires",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-5 w-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "general",
			className: "mt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "general",
						children: "Général"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "prospect",
						children: "Prospects"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "contract",
						children: "Contrats"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "user",
						children: "Utilisateurs"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "general",
					className: "space-y-4 mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySettings, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IpAllowlistSettings, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IpBlocksLog, {})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "prospect",
					className: "space-y-0 mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldList, { tab: "prospect" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "contract",
					className: "space-y-0 mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldList, { tab: "contract" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "user",
					className: "space-y-0 mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldList, { tab: "user" })
				})
			]
		})]
	});
}
export { ConfigPage as component };
