import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useErp } from "@/lib/erpStore";
import { CustomFieldsInline, validateRequiredCustomValues } from "@/components/CustomFieldsInline";
import { api, API_ENABLED } from "@/lib/api";
import { toast } from "sonner";
import { useGroups } from "@/lib/groups";
import { GroupsMultiSelect } from "@/components/GroupsMultiSelect";
import { saveUserGroups } from "@/lib/userGroups";

const ROLES = ["Agent", "Vendeur", "Qualificateur", "Superviseur", "Manager", "Backoffice", "Présentation", "Administrateur"] as const;

export const Route = createFileRoute("/users/new")({
  head: () => ({
    meta: [
      { title: "Nouvel utilisateur — Protection ERP" },
      { name: "description", content: "Créer un compte agent, manager, backoffice ou administrateur." },
    ],
  }),
  component: NewUserPage,
});

function NewUserPage() {
  const navigate = useNavigate();
  const { saveUser, users: existingUsers } = useErp();
  const groups = useGroups();
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("Agent");
  const [memberGroups, setMemberGroups] = useState<string[]>(groups[0] ? [groups[0]] : ["Lead-Actifs"]);
  const [active, setActive] = useState(true);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const submit = async () => {
    if (!username.trim() || !fullName.trim()) { toast.error("Nom d'utilisateur et nom complet requis"); return; }
    if (!password || password.length < 6) { toast.error("Mot de passe ≥ 6 caractères"); return; }
    if (memberGroups.length === 0) { toast.error("Au moins un groupe est requis"); return; }
    const missing = await validateRequiredCustomValues("user", customValues);
    if (missing) { toast.error(`${missing} est requis`); return; }
    setSaving(true);
    try {
      const primary = memberGroups[0];
      await saveUser({ username: username.trim(), fullName: fullName.trim(), email: email.trim(), role, team: primary, active, password });
      // After saveUser the store reloads; find the freshly-created user to wire memberships.
      try {
        const { api: rawApi, API_ENABLED: enabled } = await import("@/lib/api");
        if (enabled) {
          const r = await rawApi<{ users: Array<{ id: string; username: string }> }>("/users.php");
          const newUser = r.users.find((x) => x.username === username.trim());
          if (newUser?.id) await saveUserGroups(newUser.id, memberGroups);
        } else {
          const local = existingUsers.find((x) => x.username === username.trim());
          if (local?.id) await saveUserGroups(local.id, memberGroups);
        }
      } catch { /* non-blocking */ }
      if (API_ENABLED && Object.keys(customValues).length > 0) {
        try { await api("/custom_field_values.php", { method: "POST", body: { entity: "user", entity_id: username.trim(), values: customValues } }); } catch { /* non-blocking */ }
      }
      toast.success("Utilisateur créé");
      navigate({ to: "/users" });
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la création");
    } finally { setSaving(false); }
  };

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Nouvel utilisateur"
        description="Créez un compte pour un agent, manager, backoffice ou administrateur."
        icon={<UserPlus className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users" })}><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Button>
            <Button size="sm" onClick={submit} disabled={saving}><Save className="h-4 w-4 mr-1.5" />{saving ? "Création…" : "Créer"}</Button>
          </div>
        }
      />
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Nom d'utilisateur *</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="marie.dupont" /></div>
            <div className="space-y-1.5"><Label>Nom complet *</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Marie Dupont" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Mot de passe *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Au moins 6 caractères" /></div>
            <div className="space-y-1.5"><Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Groupes</Label>
              <GroupsMultiSelect value={memberGroups} onChange={setMemberGroups} options={groups} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-1">
              <Switch checked={active} onCheckedChange={setActive} id="user-active" />
              <Label htmlFor="user-active">Compte actif</Label>
            </div>
            <CustomFieldsInline entity="user" values={customValues} onChange={setCustomValues} />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2 pb-8">
          <Button variant="outline" onClick={() => navigate({ to: "/users" })} disabled={saving}>Annuler</Button>
          <Button onClick={submit} disabled={saving}><Save className="h-4 w-4 mr-1.5" />{saving ? "Création…" : "Créer l'utilisateur"}</Button>
        </div>
      </div>
    </AppLayout>
  );
}
