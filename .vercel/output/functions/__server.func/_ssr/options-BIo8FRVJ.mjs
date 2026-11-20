import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-Cb1NE_Xq.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { D as Checkbox, M as useConfirm } from "./router-BUkYRVTH.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { a as DialogFooter, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./popover-ePQ9XJ_z.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { n as useOptionList, t as refreshOptionList } from "./useOptionList-BVG5dKeP.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as SlidersVertical, Bn as ArrowUp, Gn as ArrowDown, N as Shield, Q as Plus, b as Trash2, gt as Lock } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/options-BIo8FRVJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Generic admin manager for a single option list (entity, field).
* Used inside the /options admin page; mirrors StatusManagerSimple.
*/
function OptionListManager({ entity, field, readOnly = false, canDelete = false }) {
	const confirmDialog = useConfirm();
	const { options, refresh } = useOptionList(entity, field);
	const [value, setValue] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const create = async () => {
		const v = value.trim();
		if (!v) {
			toast.error("Valeur requise");
			return;
		}
		setBusy(true);
		try {
			await api("/option_lists.php", {
				method: "POST",
				body: {
					entity,
					field,
					value: v,
					position: options.length + 1
				}
			});
			setValue("");
			await refresh();
			toast.success("Option ajoutée");
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		} finally {
			setBusy(false);
		}
	};
	const rename = async (opt, next) => {
		const v = next.trim();
		if (!v || v === opt.value) return;
		try {
			await api("/option_lists.php", {
				method: "PATCH",
				body: {
					id: opt.id,
					value: v
				}
			});
			await refresh();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
			refresh();
		}
	};
	const remove = async (opt) => {
		if (!await confirmDialog({
			title: `Supprimer "${opt.value}" ?`,
			description: "Si cette option est utilisée, la suppression sera bloquée.",
			destructive: true
		})) return;
		try {
			await api(`/option_lists.php?id=${encodeURIComponent(opt.id)}`, { method: "DELETE" });
			await refresh();
			await refreshOptionList(entity, field);
			toast.success("Option supprimée");
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
			await Promise.all(arr.map((o, i) => api("/option_lists.php", {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "py-4 grid sm:grid-cols-[1fr_auto] gap-2 items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				onChange: (e) => setValue(e.target.value),
				placeholder: "Nouvelle option…",
				onKeyDown: (e) => {
					if (e.key === "Enter") create();
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: create,
				disabled: busy,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4 mr-1.5" }), " Ajouter"]
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-1.5",
			children: options.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "Aucune option configurée"
			}) }) : options.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "py-2.5 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "w-8 justify-center text-xs",
						children: i + 1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						defaultValue: o.value,
						className: "h-9 flex-1",
						readOnly,
						onBlur: (e) => rename(o, e.target.value)
					}),
					!readOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
			}) }, o.id))
		})]
	});
}
var EDITABLE_ROLES = [
	"Manager",
	"Superviseur",
	"Agent",
	"Vendeur",
	"Qualificateur",
	"Backoffice"
];
var state = {
	perms: {},
	loaded: false
};
var listeners = /* @__PURE__ */ new Set();
var emit = () => {
	for (const l of listeners) l();
};
var inflight = null;
async function load(force = false) {
	if (!force && state.loaded) return;
	if (inflight) return inflight;
	inflight = (async () => {
		try {
			state = {
				perms: (await api("/option_lists.php?action=perms")).perms ?? {},
				loaded: true
			};
		} catch {
			state = {
				perms: state.perms,
				loaded: true
			};
		} finally {
			inflight = null;
			emit();
		}
	})();
	return inflight;
}
async function setFieldPerms(entity, field, roles) {
	await api("/option_lists.php", {
		method: "POST",
		body: {
			action: "set_perms",
			entity,
			field,
			roles
		}
	});
	state = {
		perms: {
			...state.perms,
			[`${entity}:${field}`]: roles
		},
		loaded: true
	};
	emit();
}
function subscribe(cb) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}
var getSnapshot = () => state;
function useOptionPerms() {
	const snap = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const rolesFor = (0, import_react.useCallback)((entity, field) => snap.perms[`${entity}:${field}`] ?? [], [snap]);
	const canEdit = (0, import_react.useCallback)((role, entity, field) => {
		if (!role) return false;
		if (role === "Administrateur") return true;
		return rolesFor(entity, field).includes(role);
	}, [rolesFor]);
	return {
		loaded: snap.loaded,
		rolesFor,
		canEdit,
		refresh: () => load(true)
	};
}
var PROSPECT_FIELDS = [
	{
		field: "source",
		label: "Source",
		help: "Origine du prospect (Web, Recommandation, …)"
	},
	{
		field: "regime",
		label: "Régime",
		help: "Régime de sécurité sociale"
	},
	{
		field: "civility",
		label: "Civilité"
	},
	{
		field: "lost_reason",
		label: "Motif de perte"
	}
];
var CONTRACT_FIELDS = [
	{
		field: "source",
		label: "Source"
	},
	{
		field: "partner",
		label: "Partenaire santé"
	},
	{
		field: "product",
		label: "Produit"
	},
	{
		field: "cabinet",
		label: "Cabinet"
	},
	{
		field: "debit_type",
		label: "Type de prélèvement"
	},
	{
		field: "termination_type",
		label: "Type de résiliation"
	},
	{
		field: "regime",
		label: "Régime"
	},
	{
		field: "civility",
		label: "Civilité"
	}
];
function PermissionsDialog({ entity, field, label, currentRoles, onSaved }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [roles, setRoles] = (0, import_react.useState)(currentRoles);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const toggle = (r) => setRoles((cur) => cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]);
	const save = async () => {
		setBusy(true);
		try {
			await setFieldPerms(entity, field, roles);
			toast.success("Permissions mises à jour");
			setOpen(false);
			onSaved();
		} catch (e) {
			toast.error(e?.message ?? "Erreur");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "sm",
		variant: "outline",
		onClick: () => {
			setRoles(currentRoles);
			setOpen(true);
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3.5 w-3.5 mr-1.5" }), " Permissions"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Permissions — ", label] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Sélectionnez les rôles autorisés à ajouter, renommer ou réordonner les options de cette liste. L'Administrateur a toujours tous les droits. La suppression reste réservée à l'Administrateur." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 py-2",
				children: EDITABLE_ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
					className: "flex items-center gap-2 cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: roles.includes(r),
						onCheckedChange: () => toggle(r)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r })]
				}, r))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => setOpen(false),
				children: "Annuler"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				disabled: busy,
				children: "Enregistrer"
			})] })
		] })
	})] });
}
function FieldSection({ entity, def, isAdmin, role, onPermsChange }) {
	const { rolesFor, canEdit } = useOptionPerms();
	const allowedRoles = rolesFor(entity, def.field);
	const canEditHere = canEdit(role, entity, def.field);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
		className: "pb-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: def.label
				}),
				def.help && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: def.help
				}),
				isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1 mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-[10px]",
						children: "Administrateur"
					}), allowedRoles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-[10px]",
						children: r
					}, r))]
				}),
				!isAdmin && !canEditHere && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-2 inline-flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3" }), " Lecture seule"]
				})
			] }), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionsDialog, {
				entity,
				field: def.field,
				label: def.label,
				currentRoles: allowedRoles,
				onSaved: onPermsChange
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionListManager, {
		entity,
		field: def.field,
		readOnly: !canEditHere,
		canDelete: isAdmin
	}) })] });
}
function OptionsPage() {
	const { user } = useAuth();
	const isAdmin = user?.role === "Administrateur";
	const { canEdit, refresh } = useOptionPerms();
	const [bump, setBump] = (0, import_react.useState)(0);
	const anyAllowed = isAdmin || PROSPECT_FIELDS.some((d) => canEdit(user?.role, "prospect", d.field)) || CONTRACT_FIELDS.some((d) => canEdit(user?.role, "contract", d.field));
	if (user && !anyAllowed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	const visibleProspect = isAdmin ? PROSPECT_FIELDS : PROSPECT_FIELDS.filter((d) => canEdit(user?.role, "prospect", d.field));
	const visibleContract = isAdmin ? CONTRACT_FIELDS : CONTRACT_FIELDS.filter((d) => canEdit(user?.role, "contract", d.field));
	const onPermsChange = () => {
		setBump((n) => n + 1);
		refresh();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-5 w-5" }),
		title: "Options des listes",
		description: isAdmin ? "Gérez les options et choisissez quels rôles peuvent les éditer." : "Modifiez les options des listes auxquelles vous avez accès."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: visibleProspect.length ? "prospect" : "contract",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [visibleProspect.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "prospect",
					children: "Prospects"
				}), visibleContract.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "contract",
					children: "Contrats"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "prospect",
					className: "mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4",
					children: visibleProspect.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
						entity: "prospect",
						def: d,
						isAdmin,
						role: user?.role,
						onPermsChange
					}, d.field))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "contract",
					className: "mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4",
					children: visibleContract.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
						entity: "contract",
						def: d,
						isAdmin,
						role: user?.role,
						onPermsChange
					}, d.field))
				})
			]
		})
	}, bump)] });
}
export { OptionsPage as component };
