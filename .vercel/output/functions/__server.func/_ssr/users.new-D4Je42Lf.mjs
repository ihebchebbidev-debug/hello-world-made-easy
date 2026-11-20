import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { t as Switch } from "./switch-D6uZdzGr.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as validateRequiredCustomValues, t as CustomFieldsInline } from "./CustomFieldsInline-wqv8pmOS.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { n as useGroups } from "./groups-Cf_m-uYc.mjs";
import { t as GroupsMultiSelect } from "./GroupsMultiSelect-B2k32GEP.mjs";
import { n as saveUserGroups } from "./userGroups-Cq6gRBAA.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as Save, Wn as ArrowLeft, u as UserPlus } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/users.new-D4Je42Lf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLES = [
	"Agent",
	"Vendeur",
	"Qualificateur",
	"Superviseur",
	"Manager",
	"Backoffice",
	"Présentation",
	"Administrateur"
];
function NewUserPage() {
	const navigate = useNavigate();
	const { saveUser, users: existingUsers } = useErp();
	const groups = useGroups();
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [username, setUsername] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("Agent");
	const [memberGroups, setMemberGroups] = (0, import_react.useState)(groups[0] ? [groups[0]] : ["Lead-Actifs"]);
	const [active, setActive] = (0, import_react.useState)(true);
	const [customValues, setCustomValues] = (0, import_react.useState)({});
	const submit = async () => {
		if (!username.trim() || !fullName.trim()) {
			toast.error("Nom d'utilisateur et nom complet requis");
			return;
		}
		if (!password || password.length < 6) {
			toast.error("Mot de passe ≥ 6 caractères");
			return;
		}
		if (memberGroups.length === 0) {
			toast.error("Au moins un groupe est requis");
			return;
		}
		const missing = await validateRequiredCustomValues("user", customValues);
		if (missing) {
			toast.error(`${missing} est requis`);
			return;
		}
		setSaving(true);
		try {
			const primary = memberGroups[0];
			await saveUser({
				username: username.trim(),
				fullName: fullName.trim(),
				email: email.trim(),
				role,
				team: primary,
				active,
				password
			});
			try {
				const { api: rawApi, API_ENABLED: enabled } = await import("./api-2UuWgcOn.mjs").then((n) => n.o).then((n) => n.o);
				if (enabled) {
					const newUser = (await rawApi("/users.php")).users.find((x) => x.username === username.trim());
					if (newUser?.id) await saveUserGroups(newUser.id, memberGroups);
				} else {
					const local = existingUsers.find((x) => x.username === username.trim());
					if (local?.id) await saveUserGroups(local.id, memberGroups);
				}
			} catch {}
			if (Object.keys(customValues).length > 0) try {
				await api("/custom_field_values.php", {
					method: "POST",
					body: {
						entity: "user",
						entity_id: username.trim(),
						values: customValues
					}
				});
			} catch {}
			toast.success("Utilisateur créé");
			navigate({ to: "/users" });
		} catch (e) {
			toast.error(e?.message ?? "Erreur lors de la création");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Nouvel utilisateur",
			description: "Créez un compte pour un agent, manager, backoffice ou administrateur.",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate({ to: "/users" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: submit,
					disabled: saving,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }), saving ? "Création…" : "Créer"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Informations"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom d'utilisateur *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: username,
							onChange: (e) => setUsername(e.target.value),
							placeholder: "marie.dupont"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom complet *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: fullName,
							onChange: (e) => setFullName(e.target.value),
							placeholder: "Marie Dupont"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mot de passe *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "Au moins 6 caractères"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rôle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: role,
							onValueChange: (v) => setRole(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: r,
								children: r
							}, r)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Groupes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupsMultiSelect, {
							value: memberGroups,
							onChange: setMemberGroups,
							options: groups
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sm:col-span-2 flex items-center gap-3 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: active,
							onCheckedChange: setActive,
							id: "user-active"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "user-active",
							children: "Compte actif"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomFieldsInline, {
						entity: "user",
						values: customValues,
						onChange: setCustomValues
					})
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => navigate({ to: "/users" }),
					disabled: saving,
					children: "Annuler"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: submit,
					disabled: saving,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }), saving ? "Création…" : "Créer l'utilisateur"]
				})]
			})]
		})]
	});
}
export { NewUserPage as component };
