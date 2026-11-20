import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { t as Switch } from "./switch-D6uZdzGr.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { n as useGroups } from "./groups-Cf_m-uYc.mjs";
import { t as GroupsMultiSelect } from "./GroupsMultiSelect-B2k32GEP.mjs";
import { n as saveUserGroups, t as fetchUserGroups } from "./userGroups-Cq6gRBAA.mjs";
import { r as Route$1 } from "./router-Dkp91uPV.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { H as Save, Wn as ArrowLeft, et as Pencil } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/users._username.edit-CKVYh0Nh.js
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
function EditUserPage() {
	const { username } = Route$1.useParams();
	const navigate = useNavigate();
	const { users, saveUser } = useErp();
	const groups = useGroups();
	const u = (0, import_react.useMemo)(() => users.find((x) => x.username === username), [users, username]);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [usernameInput, setUsernameInput] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("Agent");
	const [active, setActive] = (0, import_react.useState)(true);
	const [memberGroups, setMemberGroups] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!u) return;
		setUsernameInput(u.username);
		setFullName(u.fullName);
		setEmail(u.email);
		setActive(u.active);
		const raw = String(u.role ?? "").trim();
		const match = ROLES.find((r) => r.toLowerCase() === raw.toLowerCase());
		setRole(match ?? "Agent");
		fetchUserGroups(u.id).then((gs) => {
			setMemberGroups(gs.length > 0 ? gs : u.team ? [u.team] : []);
		});
	}, [u]);
	if (!u) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		skeleton: "form",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-10 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold",
				children: "Utilisateur introuvable"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4",
				onClick: () => navigate({ to: "/users" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
			})]
		})
	});
	const submit = async () => {
		const nextUsername = usernameInput.trim();
		if (!nextUsername) {
			toast.error("Nom d'utilisateur requis");
			return;
		}
		if (!fullName.trim()) {
			toast.error("Nom complet requis");
			return;
		}
		if (!role || !ROLES.includes(role)) {
			toast.error("Rôle requis");
			return;
		}
		if (memberGroups.length === 0) {
			toast.error("Au moins un groupe est requis");
			return;
		}
		if (users.find((x) => x.username.toLowerCase() === nextUsername.toLowerCase() && x.id !== u.id)) {
			toast.error("Ce nom d'utilisateur est déjà utilisé");
			return;
		}
		setSaving(true);
		try {
			const primary = memberGroups[0];
			await saveUser({
				id: u.id,
				username: nextUsername,
				fullName: fullName.trim(),
				email: email.trim(),
				role,
				team: primary,
				active
			});
			await saveUserGroups(u.id, memberGroups);
			toast.success("Utilisateur mis à jour");
			navigate({
				to: "/users/$username",
				params: { username: nextUsername }
			});
		} catch (e) {
			toast.error(e?.message ?? "Erreur lors de la mise à jour");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: `Modifier ${u.fullName}`,
			description: `@${u.username}`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate({
						to: "/users/$username",
						params: { username: u.username }
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: submit,
					disabled: saving,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }), saving ? "Enregistrement…" : "Enregistrer"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 space-y-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Profil"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom d'utilisateur *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: usernameInput,
							onChange: (e) => setUsernameInput(e.target.value),
							placeholder: "marie.dupont"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5 sm:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nom complet *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: fullName,
							onChange: (e) => setFullName(e.target.value)
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
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rôle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: role,
							onValueChange: (v) => setRole(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Sélectionner un rôle" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
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
							id: "active"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "active",
							children: "Compte actif"
						})]
					})
				]
			})] })
		})]
	});
}
export { EditUserPage as component };
