import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, LogIn, User, Lock, Eye, EyeOff } from "lucide-react";
import bgImage from "@/assets/login-callcenter.jpg";
import logo from "@/assets/logo-protection.png";
import { SimpleCaptcha } from "@/components/SimpleCaptcha";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — Protection ERP" },
      { name: "description", content: "Accédez à votre espace agent Protection ERP." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [captchaOk, setCaptchaOk] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  // Sync state with browser-autofilled values that may not trigger onChange
  useEffect(() => {
    const sync = () => {
      const u = usernameRef.current?.value ?? "";
      const p = passwordRef.current?.value ?? "";
      if (u && u !== username) setUsername(u);
      if (p && p !== password) setPassword(p);
    };
    sync();
    const t = window.setTimeout(sync, 100);
    const t2 = window.setTimeout(sync, 500);
    return () => { window.clearTimeout(t); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Read directly from DOM to capture browser autofill that may not fire onChange
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
    } catch (err: any) {
      setError(err?.message ?? "Connexion impossible.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.16_0.05_260/0.92)] via-[oklch(0.20_0.06_245/0.85)] to-[oklch(0.24_0.08_220/0.78)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.68_0.17_55/0.25),_transparent_60%)]" />

      <div className="relative w-full max-w-[440px]">
        <div className="rounded-2xl bg-background/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/15 overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-[oklch(0.68_0.17_55)] via-[oklch(0.72_0.16_60)] to-[oklch(0.78_0.15_70)]" />

          <div className="px-8 pt-8 pb-7">
            <div className="flex items-center justify-center mb-8">
              <img src={logo} alt="Protection" className="h-14 w-auto" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-[26px] font-semibold tracking-tight">Bienvenue</h1>
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour accéder à votre espace.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Identifiant</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="username"
                    ref={usernameRef}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={(e) => setUsername(e.target.value)}
                    onAnimationStart={(e) => {
                      if ((e as any).animationName?.includes("autofill")) {
                        setUsername((e.target as HTMLInputElement).value);
                      }
                    }}
                    autoComplete="username"
                    autoFocus
                    disabled={submitting}
                    maxLength={80}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={(e) => setPassword(e.target.value)}
                    onAnimationStart={(e) => {
                      if ((e as any).animationName?.includes("autofill")) {
                        setPassword((e.target as HTMLInputElement).value);
                      }
                    }}
                    autoComplete="current-password"
                    disabled={submitting}
                    maxLength={200}
                    className="pl-9 pr-10 h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted-foreground select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Se souvenir de moi
              </label>

              <SimpleCaptcha onChange={setCaptchaOk} disabled={submitting} />

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-11 bg-gradient-to-r from-[oklch(0.68_0.17_55)] to-[oklch(0.72_0.16_60)] text-white hover:opacity-95 shadow-md font-medium"
                disabled={submitting || loading || !captchaOk}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connexion…</>
                ) : (
                  <><LogIn className="h-4 w-4 mr-2" /> Se connecter</>
                )}
              </Button>
            </form>
          </div>

          <div className="px-8 py-4 border-t border-border/50 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Espace réservé aux collaborateurs autorisés.
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-white/70">
          © {new Date().getFullYear()} Protection — Tous droits réservés
        </p>
      </div>
    </div>
  );
}
