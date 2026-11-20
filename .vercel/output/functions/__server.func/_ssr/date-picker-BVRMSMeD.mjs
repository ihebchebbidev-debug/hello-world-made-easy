import { i as __toESM } from "../_runtime.mjs";
import { a as cn, n as Button } from "./input-IbC7Hkfd.mjs";
import { t as Calendar$1 } from "./calendar-maC5FJWT.mjs";
import { _ as PopoverContent, g as Popover, v as PopoverTrigger } from "./popover-ePQ9XJ_z.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Dn as Calendar, n as X } from "../_libs/lucide-react.mjs";
import { P as fr, S as isValid, a as parse, u as format } from "../_libs/date-fns.mjs";
// node_modules/.nitro/vite/services/ssr/assets/date-picker-BVRMSMeD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Unified, accessible date picker used across the app.
* Wraps shadcn Calendar in a Popover with French locale,
* dropdown month/year navigation and a clear button.
*/
function DatePicker({ value, onChange, placeholder = "Choisir une date", className, disabled, clearable = true, fromYear = 1950, toYear = (/* @__PURE__ */ new Date()).getFullYear() + 5, align = "start", size = "default" }) {
	const date = import_react.useMemo(() => {
		if (!value) return void 0;
		const d = parse(value, "yyyy-MM-dd", /* @__PURE__ */ new Date());
		return isValid(d) ? d : void 0;
	}, [value]);
	const [open, setOpen] = import_react.useState(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				disabled,
				className: cn("w-full justify-start text-left font-normal", size === "sm" && "h-8 text-xs", !date && "text-muted-foreground", className),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: cn("mr-2 h-4 w-4 shrink-0", size === "sm" && "h-3.5 w-3.5") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1 truncate",
						children: date ? format(date, "d MMM yyyy", { locale: fr }) : placeholder
					}),
					clearable && date && !disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						"aria-label": "Effacer la date",
						onClick: (e) => {
							e.stopPropagation();
							onChange("");
						},
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								onChange("");
							}
						},
						className: "ml-1 inline-flex h-5 w-5 items-center justify-center rounded-sm opacity-60 hover:bg-muted hover:opacity-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
			className: "w-auto p-0",
			align,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 border-b px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-medium text-muted-foreground",
					children: date ? format(date, "EEEE d MMMM yyyy", { locale: fr }) : "Sélectionner"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					className: "h-7 px-2 text-xs",
					onClick: () => {
						onChange(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
						setOpen(false);
					},
					children: "Aujourd'hui"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
				mode: "single",
				selected: date,
				onSelect: (d) => {
					if (d) {
						onChange(format(d, "yyyy-MM-dd"));
						setOpen(false);
					} else onChange("");
				},
				captionLayout: "dropdown",
				startMonth: new Date(fromYear, 0),
				endMonth: new Date(toYear, 11),
				defaultMonth: date ?? /* @__PURE__ */ new Date(),
				initialFocus: true,
				className: cn("p-3 pointer-events-auto")
			})]
		})]
	});
}
export { DatePicker as t };
