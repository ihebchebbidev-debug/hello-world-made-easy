import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, Pencil } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useErp } from "@/lib/erpStore";
import { toast } from "sonner";
import { useGroups } from "@/lib/groups";
import { GroupsMultiSelect } from "@/components/GroupsMultiSelect";
import { fetchUserGroups, saveUserGroups } from "@/lib/userGroups";

const ROLES = ["Agent", "Vendeur", "Qualificateur", "Superviseur", "Manager", "Backoffice", "Présentation", "Administrateur"] as const;

export const Route = createFileRoute("/users/$username/edit")({
  head: ({ params }) => ({
    meta: [
      { title: `Modifier ${params.username} — Protection ERP` },
      { name: "description", content: "Mettre à jour le profil, le rôle, l'équipe et l'état d'un utilisateur." },
    ],
  }),
  component: EditUserPage,
});

function EditUserPage() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { users, saveUser } = useErp();
  const groups = useGroups();
  const u = useMemo(() => users.find((x) => x.username === username), [users, username]);

  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("Agent");
  const [active, setActive] = useState(true);
  const [memberGroups, setMemberGroups] = useState<string[]>([]);

  useEffect(() => {
    if (!u) return;
    setFullName(u.fullName); setEmail(u.email); setActive(u.active);
    // Normalize role: match case-insensitively against ROLES, fallback to "Agent"
    const raw = String(u.role ?? "").trim();
    const match = ROLES.find((r) => r.toLowerCase() === raw.toLowerCase());
    setRole((match ?? "Agent") as (typeof ROLES)[number]);
    // Load memberships (falls back to single team if none yet)
    void fetchUserGroups(u.id).then((gs) => {
      setMemberGroups(gs.length > 0 ? gs : (u.team ? [u.team] : []));
    });
  }, [u]);

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
    if (!fullName.trim()) { toast.error("Nom complet requis"); return; }
    if (!role || !ROLES.includes(role)) { toast.error("Rôle requis"); return; }
    if (memberGroups.length === 0) { toast.error("Au moins un groupe est requis"); return; }
    setSaving(true);
    try {
      const primary = memberGroups[0];
      await saveUser({ id: u.id, username: u.username, fullName: fullName.trim(), email: email.trim(), role, team: primary, active });
      await saveUserGroups(u.id, memberGroups);
      toast.success("Utilisateur mis à jour");
      navigate({ to: "/users/$username", params: { username: u.username } });
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la mise à jour");
    } finally { setSaving(false); }
  };

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title={`Modifier ${u.fullName}`}
        description={`@${u.username}`}
        icon={<Pencil className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users/$username", params: { username: u.username } })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Retour
            </Button>
            <Button size="sm" onClick={submit} disabled={saving}><Save className="h-4 w-4 mr-1.5" />{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </div>
        }
      />
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Profil</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2"><Label>Nom complet *</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}><SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Groupes</Label>
              <GroupsMultiSelect value={memberGroups} onChange={setMemberGroups} options={groups} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-1">
              <Switch checked={active} onCheckedChange={setActive} id="active" />
              <Label htmlFor="active">Compte actif</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
