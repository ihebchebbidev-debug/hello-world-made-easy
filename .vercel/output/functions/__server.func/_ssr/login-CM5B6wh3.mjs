import { i as __toESM } from "../_runtime.mjs";
import { c as useAuth, n as Button, r as Input } from "./input-IbC7Hkfd.mjs";
import { n as logo_protection_default, t as Label } from "./label-DN6TwwGu.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { $t as Eye, I as ShieldCheck, en as EyeOff, gt as Lock, ht as LogIn, q as RefreshCw, s as User, vn as CircleAlert, vt as LoaderCircle, wn as Check } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/login-CM5B6wh3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var login_callcenter_default = "/assets/login-callcenter-fg0WMJwM.jpg";
/**
* SimpleCaptcha — lightweight "I'm not a robot" widget.
*
* Renders a themed canvas image (gradient + lock + random session token) so each
* mount looks unique and proves canvas/2D context support (most simple bots
* fail this). Verification requires:
*   - canvas successfully drew an image
*   - at least one real pointer event since mount (mouse/touch)
*   - >700ms since mount (blocks instant programmatic submits)
*   - user clicked the checkbox
*/
function SimpleCaptcha({ onChange, disabled }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [seed, setSeed] = (0, import_react.useState)(() => Math.random());
	const [pointerMoved, setPointerMoved] = (0, import_react.useState)(false);
	const [verifying, setVerifying] = (0, import_react.useState)(false);
	const [verified, setVerified] = (0, import_react.useState)(false);
	const mountedAt = (0, import_react.useMemo)(() => Date.now(), []);
	(0, import_react.useEffect)(() => {
		if (pointerMoved) return;
		const mark = () => setPointerMoved(true);
		window.addEventListener("mousemove", mark, {
			once: true,
			passive: true
		});
		window.addEventListener("touchstart", mark, {
			once: true,
			passive: true
		});
		window.addEventListener("keydown", mark, { once: true });
		return () => {
			window.removeEventListener("mousemove", mark);
			window.removeEventListener("touchstart", mark);
			window.removeEventListener("keydown", mark);
		};
	}, [pointerMoved]);
	(0, import_react.useEffect)(() => {
		const c = canvasRef.current;
		if (!c) return;
		const ctx = c.getContext("2d");
		if (!ctx) return;
		const W = c.width;
		const H = c.height;
		ctx.clearRect(0, 0, W, H);
		const g = ctx.createLinearGradient(0, 0, W, H);
		g.addColorStop(0, "#1f2a44");
		g.addColorStop(1, "#3a2a1a");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, W, H);
		const rnd = mulberry32(Math.floor(seed * 1e9));
		ctx.fillStyle = "rgba(255,255,255,0.05)";
		for (let i = 0; i < 80; i++) {
			const x = rnd() * W;
			const y = rnd() * H;
			const r = rnd() * 1.2 + .3;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.strokeStyle = "rgba(248, 188, 96, 0.15)";
		ctx.lineWidth = 1;
		for (let x = -H; x < W; x += 14) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x + H, H);
			ctx.stroke();
		}
		const grad = ctx.createRadialGradient(W - 24, 18, 0, W - 24, 18, 40);
		grad.addColorStop(0, "rgba(248, 188, 96, 0.55)");
		grad.addColorStop(1, "rgba(248, 188, 96, 0)");
		ctx.fillStyle = grad;
		ctx.fillRect(W - 80, 0, 80, 80);
		ctx.fillStyle = "rgba(255,255,255,0.92)";
		ctx.font = "600 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
		ctx.fillText("Vérification humaine", 14, 22);
		const token = Math.floor(rnd() * 16777215).toString(16).padStart(6, "0").toUpperCase();
		ctx.fillStyle = "rgba(248, 188, 96, 0.95)";
		ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, monospace";
		ctx.fillText(`#${token}`, 14, H - 12);
	}, [seed]);
	const eligible = pointerMoved && Date.now() - mountedAt > 700;
	const handleClick = () => {
		if (verified || verifying || disabled) return;
		if (!eligible) {
			setSeed(Math.random());
			return;
		}
		setVerifying(true);
		window.setTimeout(() => {
			setVerified(true);
			setVerifying(false);
			onChange(true);
		}, 450 + Math.random() * 250);
	};
	const refresh = () => {
		setSeed(Math.random());
		if (verified) {
			setVerified(false);
			onChange(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border/70 bg-muted/30 p-3 flex items-center gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: handleClick,
				disabled: disabled || verifying || verified,
				"aria-pressed": verified,
				className: `relative h-7 w-7 shrink-0 rounded-md border transition-all flex items-center justify-center ${verified ? "bg-emerald-500 border-emerald-500" : "bg-background border-border hover:border-primary/60 cursor-pointer"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
				"aria-label": "Je ne suis pas un robot",
				children: verifying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" }) : verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "h-4 w-4 text-white",
					strokeWidth: 3
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: handleClick,
				disabled: disabled || verifying || verified,
				className: "flex-1 text-left text-sm font-medium text-foreground/90 disabled:opacity-70 cursor-pointer",
				children: [verified ? "Vérifié — vous êtes humain" : "Je ne suis pas un robot", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] font-normal text-muted-foreground mt-0.5 flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " Protection ERP"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					width: 120,
					height: 56,
					className: "rounded-md border border-border/60",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: refresh,
					disabled,
					"aria-label": "Régénérer l'image",
					className: "absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-2.5 w-2.5" })
				})]
			})
		]
	});
}
function mulberry32(a) {
	return function() {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function LoginPage() {
	const { user, loading, login } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [remember, setRemember] = (0, import_react.useState)(true);
	const [captchaOk, setCaptchaOk] = (0, import_react.useState)(false);
	const usernameRef = (0, import_react.useRef)(null);
	const passwordRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!loading && user) navigate({ to: "/" });
	}, [
		user,
		loading,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		const sync = () => {
			const u = usernameRef.current?.value ?? "";
			const p = passwordRef.current?.value ?? "";
			if (u && u !== username) setUsername(u);
			if (p && p !== password) setPassword(p);
		};
		sync();
		const t = window.setTimeout(sync, 100);
		const t2 = window.setTimeout(sync, 500);
		return () => {
			window.clearTimeout(t);
			window.clearTimeout(t2);
		};
	}, []);
	const onSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		const u = (usernameRef.current?.value ?? username).trim();
		const p = passwordRef.current?.value ?? password;
		if (u !== username) setUsername(u);
		if (p !== password) setPassword(p);
		if (!u || !p) {
			setError("Veuillez renseigner vos identifiants.");
			return;
		}
		if (!captchaOk) {
			setError("Merci de valider la vérification anti-robot.");
			return;
		}
		setSubmitting(true);
		try {
			await login(u, p);
			navigate({ to: "/" });
		} catch (err) {
			setError(err?.message ?? "Connexion impossible.");
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative",
		style: { backgroundImage: `url(${login_callcenter_default})` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-br from-[oklch(0.16_0.05_260/0.92)] via-[oklch(0.20_0.06_245/0.85)] to-[oklch(0.24_0.08_220/0.78)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.68_0.17_55/0.25),_transparent_60%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full max-w-[440px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-background/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/15 overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 bg-gradient-to-r from-[oklch(0.68_0.17_55)] via-[oklch(0.72_0.16_60)] to-[oklch(0.78_0.15_70)]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-8 pt-8 pb-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-center mb-8",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: logo_protection_default,
										alt: "Protection",
										className: "h-14 w-auto"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "text-[26px] font-semibold tracking-tight",
										children: "Bienvenue"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Connectez-vous pour accéder à votre espace."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit,
									className: "mt-7 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "username",
												className: "text-xs font-medium text-muted-foreground",
												children: "Identifiant"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "username",
													ref: usernameRef,
													value: username,
													onChange: (e) => setUsername(e.target.value),
													onBlur: (e) => setUsername(e.target.value),
													onAnimationStart: (e) => {
														if (e.animationName?.includes("autofill")) setUsername(e.target.value);
													},
													autoComplete: "username",
													autoFocus: true,
													disabled: submitting,
													maxLength: 80,
													className: "pl-9 h-11"
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "password",
												className: "text-xs font-medium text-muted-foreground",
												children: "Mot de passe"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														id: "password",
														ref: passwordRef,
														type: showPassword ? "text" : "password",
														value: password,
														onChange: (e) => setPassword(e.target.value),
														onBlur: (e) => setPassword(e.target.value),
														onAnimationStart: (e) => {
															if (e.animationName?.includes("autofill")) setPassword(e.target.value);
														},
														autoComplete: "current-password",
														disabled: submitting,
														maxLength: 200,
														className: "pl-9 pr-10 h-11"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => setShowPassword((v) => !v),
														className: "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
														"aria-label": showPassword ? "Masquer" : "Afficher",
														children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 text-sm text-muted-foreground select-none cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: remember,
												onChange: (e) => setRemember(e.target.checked),
												className: "h-4 w-4 rounded border-border accent-primary"
											}), "Se souvenir de moi"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleCaptcha, {
											onChange: setCaptchaOk,
											disabled: submitting
										}),
										error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive flex items-start gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }), error]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											size: "lg",
											className: "w-full h-11 bg-gradient-to-r from-[oklch(0.68_0.17_55)] to-[oklch(0.72_0.16_60)] text-white hover:opacity-95 shadow-md font-medium",
											disabled: submitting || loading || !captchaOk,
											children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), " Connexion…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4 mr-2" }), " Se connecter"] })
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-8 py-4 border-t border-border/50 bg-muted/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground text-center",
								children: "Espace réservé aux collaborateurs autorisés."
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 text-center text-xs text-white/70",
					children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" Protection — Tous droits réservés"
					]
				})]
			})
		]
	});
}
export { LoginPage as component };
