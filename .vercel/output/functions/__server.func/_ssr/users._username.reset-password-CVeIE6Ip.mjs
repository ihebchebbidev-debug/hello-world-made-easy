import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Switch } from "./switch-D6uZdzGr.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-B65-f30T.mjs";
import { w as useErp } from "./popover-ePQ9XJ_z.mjs";
import { r as api } from "./api-2UuWgcOn.mjs";
import { n as Route } from "./router-BUkYRVTH.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $t as Eye, Et as KeyRound, J as RefreshCcw, Wn as ArrowLeft, en as EyeOff } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/users._username.reset-password-CVeIE6Ip.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function generatePassword(len = 12) {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
	let out = "";
	const arr = new Uint32Array(len);
	crypto.getRandomValues(arr);
	for (let i = 0; i < len; i++) out += charset[arr[i] % 63];
	return out;
}
function ResetPasswordPage() {
	const { username } = Route.useParams();
	const navigate = useNavigate();
	const { users } = useErp();
	const u = (0, import_react.useMemo)(() => users.find((x) => x.username === username), [users, username]);
	const [pwd, setPwd] = (0, import_react.useState)(() => generatePassword(12));
	const [show, setShow] = (0, import_react.useState)(false);
	const [mustChange, setMustChange] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(false);
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
		if (pwd.length < 8) {
			toast.error("Le mot de passe doit contenir au moins 8 caractères");
			return;
		}
		setBusy(true);
		try {
			await api("/auth_admin_reset_password.php", {
				method: "POST",
				body: {
					userId: u.id,
					username: u.username,
					newPassword: pwd,
					mustChange
				}
			});
			toast.success(`Mot de passe réinitialisé pour ${u.fullName}`, { description: mustChange ? "L'utilisateur devra le changer à sa prochaine connexion." : "Communiquez-le par un canal sécurisé." });
			navigate({ to: "/users" });
		} catch (e) {
			toast.error(e?.message ?? "Échec de la réinitialisation");
		} finally {
			setBusy(false);
		}
	};
	const copyPwd = async () => {
		if (!pwd) return;
		try {
			await navigator.clipboard.writeText(pwd);
			toast.success("Mot de passe copié");
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		skeleton: "form",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Réinitialiser le mot de passe",
			description: `${u.fullName} — @${u.username}`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-5 w-5" }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => navigate({ to: "/users" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4 mr-1.5" }), "Retour"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 max-w-xl space-y-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Nouveau mot de passe"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mot de passe" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: show ? "text" : "password",
										value: pwd,
										onChange: (e) => setPwd(e.target.value),
										placeholder: "Au moins 8 caractères",
										className: "pr-9 font-mono",
										autoFocus: true
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShow((s) => !s),
										className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
										"aria-label": show ? "Cacher" : "Afficher",
										children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "icon",
									onClick: () => setPwd(generatePassword(12)),
									title: "Générer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: "h-4 w-4" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[11px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									pwd.length,
									" caractère",
									pwd.length > 1 ? "s" : ""
								] }), pwd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: copyPwd,
									className: "underline hover:text-foreground",
									children: "Copier"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3 rounded-md border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-sm",
								children: "Forcer le changement à la prochaine connexion"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "L'utilisateur devra définir un nouveau mot de passe avant d'accéder à l'application."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: mustChange,
							onCheckedChange: setMustChange
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => navigate({ to: "/users" }),
							disabled: busy,
							children: "Annuler"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submit,
							disabled: busy || pwd.length < 8,
							children: busy ? "Enregistrement…" : "Réinitialiser"
						})]
					})
				]
			})] })
		})]
	});
}
export { ResetPasswordPage as component };
