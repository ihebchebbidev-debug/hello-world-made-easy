import { i as __toESM } from "../_runtime.mjs";
import { n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { M as useConfirm } from "./router-Dkp91uPV.mjs";
import { n as useStatusOptions, t as refreshStatusOptions } from "./useStatusOptions-CVlT4V3k.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Bn as ArrowUp, Gn as ArrowDown, Q as Plus, b as Trash2 } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/StatusManagerSimple-BlL9xGn7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Simple status manager — add / rename / reorder / delete.
* No color picker: every new status gets a neutral color server-side.
* Used dynamically in every status Select across the app via useStatusOptions.
*/
function StatusManagerSimple({ entity }) {
	const confirmDialog = useConfirm();
	const { options, refresh } = useStatusOptions(entity);
	const [value, setValue] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const create = async () => {
		const v = value.trim();
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
					color: "muted",
					position: options.length + 1
				}
			});
			setValue("");
			await refresh();
			toast.success("Statut ajouté");
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
			await api("/status_options.php", {
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
			description: "Si ce statut est utilisé, la suppression sera bloquée. Renommez les enregistrements concernés d'abord.",
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "py-4 grid sm:grid-cols-[1fr_auto] gap-2 items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value,
				onChange: (e) => setValue(e.target.value),
				placeholder: "Nouveau statut — ex: En négociation",
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
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "Aucun statut configuré"
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
						onBlur: (e) => rename(o, e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
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
export { StatusManagerSimple as t };
