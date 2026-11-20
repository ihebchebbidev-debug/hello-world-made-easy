import { i as __toESM } from "../_runtime.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { n as logo_protection_default, t as Label } from "./label-DN6TwwGu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D0lHOq2D.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as UserPlus, vn as CircleAlert, vt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
// node_modules/.nitro/vite/services/ssr/assets/signup-internal-x7k2-BY4BTX6Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var signupSchema = objectType({
	username: stringType().trim().min(3, "Min. 3 caractères").max(80),
	fullName: stringType().trim().min(2, "Nom requis").max(120),
	email: stringType().trim().email("Email invalide").max(160),
	password: stringType().min(8, "Min. 8 caractères").max(200),
	team: stringType().trim().max(80)
});
var TEAMS = [
	"Direction",
	"Lead-Actifs",
	"Lead-Premium",
	"Backoffice",
	"Pôle 1",
	"Pôle 2"
];
function SignupPage() {
	const { user, loading, signup, apiEnabled } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = (0, import_react.useState)({
		username: "",
		fullName: "",
		email: "",
		password: "",
		team: "Lead-Actifs"
	});
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!loading && user) navigate({ to: "/" });
	}, [
		user,
		loading,
		navigate
	]);
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.value
	}));
	const onSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		const parsed = signupSchema.safeParse(form);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Champs invalides");
			return;
		}
		setSubmitting(true);
		try {
			await signup(parsed.data);
			navigate({ to: "/" });
		} catch (err) {
			setError(err?.message ?? "Création impossible.");
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center bg-background p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-2 mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: logo_protection_default,
						alt: "Protection",
						className: "h-12 w-auto"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
						children: "Création interne"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Nouveau compte agent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1.5 text-sm text-muted-foreground",
					children: [
						"Compte créé avec le rôle ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Agent" }),
						". Un administrateur pourra ajuster les permissions ensuite."
					]
				}),
				!apiEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-warning-foreground flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Mode démo" }), " — aucun compte n'est réellement enregistré."] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-8 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "username",
									children: "Identifiant"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "username",
									autoComplete: "username",
									value: form.username,
									onChange: set("username"),
									required: true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "fullName",
									children: "Nom complet"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "fullName",
									value: form.fullName,
									onChange: set("fullName"),
									required: true
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "email",
								children: "Email professionnel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "email",
								type: "email",
								autoComplete: "email",
								value: form.email,
								onChange: set("email"),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "Mot de passe"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "password",
									type: "password",
									autoComplete: "new-password",
									value: form.password,
									onChange: set("password"),
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "8 caractères minimum."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "team",
								children: "Équipe"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: form.team,
								onValueChange: (v) => setForm((f) => ({
									...f,
									team: v
								})),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "team",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TEAMS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: t,
									children: t
								}, t)) })]
							})]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: submitting,
							children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4 mr-2" }), "Créer le compte"] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-[11px] text-center text-muted-foreground",
					children: ["Déjà inscrit ? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "underline hover:text-foreground",
						children: "Se connecter"
					})]
				})
			]
		})
	});
}
export { SignupPage as component };
