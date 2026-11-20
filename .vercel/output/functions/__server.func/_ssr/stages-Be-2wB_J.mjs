import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { M as useConfirm } from "./router-Dkp91uPV.mjs";
import { n as useStatusOptions, t as refreshStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bn as ArrowUp, Gn as ArrowDown, Q as Plus, Tt as Layers, b as Trash2, q as RefreshCw } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/stages-Be-2wB_J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COLORS = [
	"info",
	"primary",
	"success",
	"warning",
	"destructive",
	"muted"
];
function StagesPage() {
	const { user } = useAuth();
	const confirmDialog = useConfirm();
	const canEdit = user?.role === "Administrateur" || user?.role === "Manager";
	const canDelete = user?.role === "Administrateur";
	const [stages, setStages] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [color, setColor] = (0, import_react.useState)("info");
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const r = await api("/stages.php");
			setStages((r.stages ?? []).slice().sort((a, b) => a.position - b.position));
		} catch (e) {
			toast.error("Erreur", { description: e?.message });
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const create = async () => {
		if (!name.trim()) {
			toast.error("Nom requis");
			return;
		}
		try {
			await api("/stages.php", {
				method: "POST",
				body: {
					name: name.trim(),
					color,
					position: stages.length + 1
				}
			});
			setName("");
			toast.success("Étape créée");
			await load();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		}
	};
	const remove = async (id) => {
		if (!await confirmDialog({
			title: "Supprimer l'étape",
			description: "Voulez-vous supprimer cette étape ?",
			destructive: true
		})) return;
		try {
			await api(`/stages.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
			await load();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		}
	};
	const move = async (idx, dir) => {
		const swap = idx + dir;
		if (swap < 0 || swap >= stages.length) return;
		const arr = stages.slice();
		[arr[idx], arr[swap]] = [arr[swap], arr[idx]];
		const reindexed = arr.map((s, i) => ({
			...s,
			position: i + 1
		}));
		setStages(reindexed);
		try {
			await Promise.all([api("/stages.php", {
				method: "PATCH",
				body: {
					id: reindexed[idx].id,
					position: reindexed[idx].position
				}
			}), api("/stages.php", {
				method: "PATCH",
				body: {
					id: reindexed[swap].id,
					position: reindexed[swap].position
				}
			})]);
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
			load();
		}
	};
	const recolor = async (id, c) => {
		setStages((prev) => prev.map((s) => s.id === id ? {
			...s,
			color: c
		} : s));
		try {
			await api("/stages.php", {
				method: "PATCH",
				body: {
					id,
					color: c
				}
			});
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
			load();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-5 w-5" }),
			title: "Étapes du pipeline",
			description: "Configurez les étapes par lesquelles vos prospects progressent.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: load,
				disabled: loading,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}` }), " Actualiser"]
			})
		}),
		canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-4 grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom de l'étape" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "ex: Qualification"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Couleur" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: color,
							onValueChange: setColor,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c,
								children: c
							}, c)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: create,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), " Ajouter"]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: stages.length === 0 && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Aucune étape"
			}) }) : stages.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-3 flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "w-7 justify-center",
						children: s.position
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium flex-1 min-w-0 truncate",
						children: s.name
					}),
					canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: s.color,
						onValueChange: (c) => recolor(s.id, c),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-[120px] h-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c,
							children: c
						}, c)) })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						children: s.color
					}),
					canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => move(i, -1),
							disabled: i === 0,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => move(i, 1),
							disabled: i === stages.length - 1,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-4 w-4" })
						})]
					}),
					canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => remove(s.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
					})
				]
			}) }, s.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusManager, {
				entity: "prospect",
				title: "Statuts Prospects"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusManager, {
				entity: "contract",
				title: "Statuts Contrats (facturation)"
			})]
		})
	] });
}
function StatusManager({ entity, title }) {
	const { user } = useAuth();
	const confirmDialog = useConfirm();
	const canEdit = user?.role === "Administrateur" || user?.role === "Manager";
	const canDelete = user?.role === "Administrateur";
	const { options, refresh } = useStatusOptions(entity);
	const [newValue, setNewValue] = (0, import_react.useState)("");
	const [newColor, setNewColor] = (0, import_react.useState)("info");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const create = async () => {
		const v = newValue.trim();
		if (!v) {
			toast.error("Nom requis");
			return;
		}
		setBusy(true);
		try {
			await api("/status_options.php", {
				method: "POST",
				body: {
					entity,
					value: v,
					color: newColor,
					position: options.length + 1
				}
			});
			setNewValue("");
			await refresh();
			toast.success("Statut ajouté");
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		} finally {
			setBusy(false);
		}
	};
	const rename = async (opt, value) => {
		if (value === opt.value) return;
		try {
			await api("/status_options.php", {
				method: "PATCH",
				body: {
					id: opt.id,
					value
				}
			});
			await refresh();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
			refresh();
		}
	};
	const recolor = async (opt, c) => {
		try {
			await api("/status_options.php", {
				method: "PATCH",
				body: {
					id: opt.id,
					color: c
				}
			});
			await refresh();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		}
	};
	const remove = async (opt) => {
		if (!await confirmDialog({
			title: `Supprimer "${opt.value}" ?`,
			description: "Si ce statut est utilisé, la suppression sera bloquée. Renommez d'abord les enregistrements concernés.",
			destructive: true
		})) return;
		try {
			await api(`/status_options.php?id=${encodeURIComponent(opt.id)}`, { method: "DELETE" });
			await refresh();
			await refreshStatusOptions();
			toast.success("Statut supprimé");
		} catch (e) {
			toast.error(e?.message ?? "Suppression impossible");
		}
	};
	const move = async (idx, dir) => {
		const swap = idx + dir;
		if (swap < 0 || swap >= options.length) return;
		const arr = options.slice();
		[arr[idx], arr[swap]] = [arr[swap], arr[idx]];
		try {
			await Promise.all(arr.map((o, i) => api("/status_options.php", {
				method: "PATCH",
				body: {
					id: o.id,
					position: i + 1
				}
			})));
			await refresh();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
			refresh();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "py-4 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					children: options.length
				})]
			}),
			canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[1fr_120px_auto] gap-2 items-end pb-2 border-b",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Nouveau statut"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: newValue,
							onChange: (e) => setNewValue(e.target.value),
							placeholder: "ex: En négociation",
							onKeyDown: (e) => {
								if (e.key === "Enter") create();
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs",
							children: "Couleur"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: newColor,
							onValueChange: setNewColor,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c,
								children: c
							}, c)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: create,
						disabled: busy,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1" }), " Ajouter"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [options.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted-foreground py-4 text-center",
					children: "Aucun statut configuré"
				}), options.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "w-7 justify-center text-xs",
							children: i + 1
						}),
						canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							defaultValue: o.value,
							className: "h-8 flex-1",
							onBlur: (e) => rename(o, e.target.value.trim())
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 text-sm",
							children: o.value
						}),
						canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: o.color,
							onValueChange: (c) => recolor(o, c),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-[110px] h-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c,
								children: c
							}, c)) })]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: o.color
						}),
						canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => move(i, -1),
								disabled: i === 0,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => move(i, 1),
								disabled: i === options.length - 1,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-4 w-4" })
							})]
						}),
						canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => remove(o),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
						})
					]
				}, o.id))]
			})
		]
	}) });
}
export { StagesPage as component };
