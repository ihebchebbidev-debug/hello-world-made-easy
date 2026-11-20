import { i as __toESM } from "../_runtime.mjs";
import { a as cn, n as Button } from "./input-IbC7Hkfd.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { _ as PopoverContent, g as Popover, v as PopoverTrigger } from "./popover-ePQ9XJ_z.mjs";
import { a as CommandInput, i as CommandGroup, n as Command$1, o as CommandItem, r as CommandEmpty, s as CommandList } from "./AppLayout-as-kq8uy.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Q as Plus, n as X, wn as Check, yn as ChevronsUpDown } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/GroupsMultiSelect-B2k32GEP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GroupsMultiSelect({ value, onChange, options, placeholder = "Choisir un ou plusieurs groupes…", disabled }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const toggle = (g) => {
		if (value.includes(g)) onChange(value.filter((x) => x !== g));
		else onChange([...value, g]);
	};
	const remove = (g) => onChange(value.filter((x) => x !== g));
	const addCustom = () => {
		const n = query.trim();
		if (!n || value.includes(n)) return;
		onChange([...value, n]);
		setQuery("");
	};
	const canAddCustom = query.trim() !== "" && !options.some((o) => o.toLowerCase() === query.trim().toLowerCase()) && !value.some((v) => v.toLowerCase() === query.trim().toLowerCase());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						role: "combobox",
						disabled,
						className: "w-full justify-between font-normal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("truncate text-left", value.length === 0 && "text-muted-foreground"),
							children: value.length === 0 ? placeholder : value.length === 1 ? value[0] : `${value.length} groupes sélectionnés`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "h-4 w-4 opacity-50 shrink-0" })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
					className: "w-[--radix-popover-trigger-width] p-0",
					align: "start",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
						placeholder: "Rechercher ou créer…",
						value: query,
						onValueChange: setQuery
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: canAddCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: addCustom,
						className: "w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
							" Créer « ",
							query.trim(),
							" »"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 py-3 text-sm text-muted-foreground text-center",
						children: "Aucun groupe"
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, { children: [options.map((g) => {
						const selected = value.includes(g);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
							value: g,
							onSelect: () => toggle(g),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0") }), g]
						}, g);
					}), canAddCustom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `__create__${query}`,
						onSelect: addCustom,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }),
							" Créer « ",
							query.trim(),
							" »"
						]
					})] })] })] })
				})]
			}),
			value.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: value.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: i === 0 ? "default" : "secondary",
					className: "gap-1 pr-1",
					children: [
						i === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase opacity-75",
							children: "Principal"
						}),
						g,
						!disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => remove(g),
							className: "hover:bg-background/30 rounded-sm p-0.5",
							"aria-label": `Retirer ${g}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
						})
					]
				}, g))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground",
				children: [
					"Le premier groupe est le groupe ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "principal" }),
					" (utilisé comme équipe par défaut)."
				]
			})
		]
	});
}
export { GroupsMultiSelect as t };
