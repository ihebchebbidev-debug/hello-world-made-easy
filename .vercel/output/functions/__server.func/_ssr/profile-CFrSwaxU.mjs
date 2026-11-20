import { i as __toESM } from "../_runtime.mjs";
import { t as AppLayout } from "./AppLayout-as-kq8uy.mjs";
import { t as PageHeader } from "./PageHeader-ByoVWxus.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-B65-f30T.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { t as Label } from "./label-DN6TwwGu.mjs";
import { t as Badge } from "./badge-Bh6YAa03.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { $t as Eye, N as Shield, a as Users, en as EyeOff, ft as Mail, gt as Lock, s as User, vt as LoaderCircle } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/profile-CFrSwaxU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { user, changePassword } = useAuth();
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showCurrent, setShowCurrent] = (0, import_react.useState)(false);
	const [showNew, setShowNew] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const username = user?.username ?? "—";
	const fullName = user?.fullName || username;
	const initials = username.split(/[.\s_-]+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
	const onSubmit = async (e) => {
		e.preventDefault();
		if (submitting) return;
		if (!currentPassword || !newPassword) {
			toast.error("Champs requis", { description: "Renseignez les deux mots de passe." });
			return;
		}
		if (newPassword.length < 8) {
			toast.error("Mot de passe trop court", { description: "8 caractères minimum." });
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("Confirmation invalide", { description: "Les deux mots de passe ne correspondent pas." });
			return;
		}
		if (newPassword === currentPassword) {
			toast.error("Mot de passe identique", { description: "Choisissez un mot de passe différent de l'actuel." });
			return;
		}
		setSubmitting(true);
		try {
			await changePassword(currentPassword, newPassword);
			toast.success("Mot de passe mis à jour");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			toast.error("Échec", { description: err?.message ?? "Impossible de modifier le mot de passe." });
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Mon profil",
				description: "Vos informations personnelles et la sécurité de votre compte."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "shadow-elegant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Informations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Issues de votre compte connecté." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 pb-5 border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-14 w-14 rounded-full bg-gradient-to-br from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] flex items-center justify-center text-base font-semibold text-white",
							children: initials || "?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-base font-semibold truncate",
								children: ["@", username]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground truncate",
								children: fullName
							})]
						}),
						user?.active === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "destructive",
							className: "ml-auto",
							children: "Désactivé"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" }),
							label: "Username",
							value: username
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }),
							label: "Email",
							value: user?.email || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" }),
							label: "Rôle",
							value: user?.role || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" }),
							label: "Équipe",
							value: user?.team || "—"
						})
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "shadow-elegant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-primary" }), " Changer le mot de passe"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "8 caractères minimum. Vous resterez connecté après modification." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "space-y-4 max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "current",
								children: "Mot de passe actuel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "current",
									type: showCurrent ? "text" : "password",
									autoComplete: "current-password",
									value: currentPassword,
									onChange: (e) => setCurrentPassword(e.target.value),
									required: true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowCurrent((v) => !v),
									className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
									"aria-label": showCurrent ? "Masquer" : "Afficher",
									children: showCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "new",
								children: "Nouveau mot de passe"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "new",
									type: showNew ? "text" : "password",
									autoComplete: "new-password",
									minLength: 8,
									maxLength: 200,
									value: newPassword,
									onChange: (e) => setNewPassword(e.target.value),
									required: true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowNew((v) => !v),
									className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
									"aria-label": showNew ? "Masquer" : "Afficher",
									children: showNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "confirm",
									children: "Confirmer le nouveau mot de passe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "confirm",
									type: showNew ? "text" : "password",
									autoComplete: "new-password",
									minLength: 8,
									maxLength: 200,
									value: confirmPassword,
									onChange: (e) => setConfirmPassword(e.target.value),
									required: true
								}),
								confirmPassword && newPassword !== confirmPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive",
									children: "Les mots de passe ne correspondent pas."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: submitting,
							className: "w-full sm:w-auto",
							children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), " Mise à jour…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "Mettre à jour" })
						})
					]
				}) })]
			})
		]
	}) });
}
function Field({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-muted/30 px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground",
			children: [
				icon,
				" ",
				label
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 text-sm font-medium truncate",
			children: value
		})]
	});
}
export { ProfilePage as component };
