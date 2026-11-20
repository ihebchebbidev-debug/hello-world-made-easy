import { i as __toESM } from "../_runtime.mjs";
import { a as cn } from "./input-IbC7Hkfd.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Root } from "../_libs/@radix-ui/react-label+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/label-DN6TwwGu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var logo_protection_default = "/assets/logo-protection-izthDGfa.png";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
export { logo_protection_default as n, Label as t };
