import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, KeyRound, RefreshCcw, Eye, EyeOff } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useErp } from "@/lib/erpStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

function generatePassword(len = 12): string {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += charset[arr[i] % charset.length];
  return out;
}

export const Route = createFileRoute("/users/$username/reset-password")({
  head: ({ params }) => ({
    meta: [
      { title: `Réinitialiser le mot de passe — ${params.username}` },
      { name: "description", content: "Définir un nouveau mot de passe pour un utilisateur." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { users } = useErp();
  const u = useMemo(() => users.find((x) => x.username === username), [users, username]);

  const [pwd, setPwd] = useState(() => generatePassword(12));
  const [show, setShow] = useState(false);
  const [mustChange, setMustChange] = useState(true);
  const [busy, setBusy] = useState(false);

  if (!u) {
    return (
      <AppLayout skeleton="form">
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Utilisateur introuvable</h2>
          <Button className="mt-4" onClick={() => navigate({ to: "/users" })}><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Button>
        </div>
      </AppLayout>
    );
  }

  const submit = async () => {
    if (pwd.length < 8) { toast.error("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setBusy(true);
    try {
      await api("/auth_admin_reset_password.php", {
        method: "POST",
        body: { userId: u.id, username: u.username, newPassword: pwd, mustChange },
      });
      toast.success(`Mot de passe réinitialisé pour ${u.fullName}`, {
        description: mustChange ? "L'utilisateur devra le changer à sa prochaine connexion." : "Communiquez-le par un canal sécurisé.",
      });
      navigate({ to: "/users" });
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de la réinitialisation");
    } finally { setBusy(false); }
  };

  const copyPwd = async () => {
    if (!pwd) return;
    try { await navigator.clipboard.writeText(pwd); toast.success("Mot de passe copié"); } catch { /* ignore */ }
  };

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Réinitialiser le mot de passe"
        description={`${u.fullName} — @${u.username}`}
        icon={<KeyRound className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Retour
          </Button>
        }
      />
      <div className="mt-6 max-w-xl space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Nouveau mot de passe</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mot de passe</Label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Input
                    type={show ? "text" : "password"}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Au moins 8 caractères"
                    className="pr-9 font-mono"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Cacher" : "Afficher"}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={() => setPwd(generatePassword(12))} title="Générer">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{pwd.length} caractère{pwd.length > 1 ? "s" : ""}</span>
                {pwd && <button type="button" onClick={copyPwd} className="underline hover:text-foreground">Copier</button>}
              </div>
            </div>
            <div className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Forcer le changement à la prochaine connexion</Label>
                <p className="text-xs text-muted-foreground">L'utilisateur devra définir un nouveau mot de passe avant d'accéder à l'application.</p>
              </div>
              <Switch checked={mustChange} onCheckedChange={setMustChange} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => navigate({ to: "/users" })} disabled={busy}>Annuler</Button>
              <Button onClick={submit} disabled={busy || pwd.length < 8}>{busy ? "Enregistrement…" : "Réinitialiser"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
