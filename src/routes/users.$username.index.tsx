import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Users as UsersIcon, ArrowLeft, Mail, Shield, Activity, LogIn, LogOut, Pencil, Loader2, Search, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import { CustomFieldsCard } from "@/components/CustomFieldsCard";

import { useEffect, useMemo, useState } from "react";
import { api, API_ENABLED } from "@/lib/api";

export const Route = createFileRoute("/users/$username/")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} — Protection ERP` },
      { name: "description", content: "Fiche utilisateur: rôle, équipe, performance et champs personnalisés." },
    ],
  }),
  component: UserDetailPage,
});

const roleColor: Record<string, string> = {
  Administrateur: "bg-primary/10 text-primary border-primary/20",
  Manager: "bg-info/15 text-info border-info/20",
  Agent: "bg-success/15 text-success border-success/20",
  Backoffice: "bg-warning/15 text-warning-foreground border-warning/20",
};

function UserDetailPage() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { users, prospects, contracts, deleteUser } = useErp();
  const { user: me } = useAuth();
  const confirmDialog = useConfirm();
  const u = useMemo(() => users.find((x) => x.username === username), [users, username]);
  const myProspects = useMemo(() => prospects.filter((p) => p.assignedTo === username), [prospects, username]);
  const myContracts = useMemo(() => contracts.filter((c) => c.assignedTo === username), [contracts, username]);

  type ActivityRow = {
    id: string; entityType: string; entityId: string; field: string;
    previousValue: string; newValue: string; user: string; timestamp: string;
  };
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loadingAct, setLoadingAct] = useState(false);
  const [actSearch, setActSearch] = useState("");
  const [actType, setActType] = useState("__all__");
  const [actEntity, setActEntity] = useState("__all__");
  const [actField, setActField] = useState("__all__");
  useEffect(() => {
    if (!API_ENABLED || !u) return;
    let cancelled = false;
    setLoadingAct(true);
    api<{ activity: ActivityRow[] }>(`/user_activity.php?username=${encodeURIComponent(username)}&limit=300`)
      .then((r) => { if (!cancelled) setActivity(r.activity ?? []); })
      .catch(() => { if (!cancelled) setActivity([]); })
      .finally(() => { if (!cancelled) setLoadingAct(false); });
    return () => { cancelled = true; };
  }, [username, u]);

  const entityTypes = useMemo(
    () => Array.from(new Set(activity.map((a) => a.entityType).filter(Boolean))).sort(),
    [activity],
  );
  const fieldNames = useMemo(
    () => Array.from(new Set(activity.map((a) => a.field).filter(Boolean))).sort(),
    [activity],
  );
  const filteredActivity = useMemo(() => {
    const q = actSearch.trim().toLowerCase();
    return activity.filter((a) => {
      const isLogin = a.entityType === "user" && a.field === "login";
      const isLogout = a.entityType === "user" && a.field === "logout";
      const kind = isLogin ? "login" : isLogout ? "logout" : "edit";
      if (actType !== "__all__" && kind !== actType) return false;
      if (actEntity !== "__all__" && a.entityType !== actEntity) return false;
      if (actField !== "__all__" && a.field !== actField) return false;
      if (q) {
        const hay = `${a.entityType} ${a.entityId} ${a.field} ${a.previousValue} ${a.newValue}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activity, actSearch, actType, actEntity, actField]);
  const hasActFilter = actSearch !== "" || actType !== "__all__" || actEntity !== "__all__" || actField !== "__all__";

  if (!u) {
    return (
      <AppLayout skeleton="detail">
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Utilisateur introuvable</h2>
          <Button className="mt-4" onClick={() => navigate({ to: "/users" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout skeleton="detail">
      <PageHeader
        title={u.fullName}
        description={`@${u.username} — ${u.role} · ${u.team}`}
        icon={<UsersIcon className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to="/users/$username/edit" params={{ username: u.username }}>
                <Pencil className="h-4 w-4 mr-1.5" />Modifier
              </Link>
            </Button>
            {me?.role === "Administrateur" && me.username !== u.username && (
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  const ok = await confirmDialog({
                    title: "Supprimer l'utilisateur",
                    description: <>Voulez-vous supprimer définitivement <b>@{u.username}</b> ({u.fullName}) ?</>,
                    destructive: true,
                  });
                  if (!ok) return;
                  try {
                    await deleteUser(u.id);
                    toast.success("Utilisateur supprimé");
                    navigate({ to: "/users" });
                  } catch (e: any) {
                    toast.error(e?.message ?? "Échec de la suppression");
                  }
                }}
              >Supprimer</Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/users" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Retour
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informations</CardTitle>
              <CardDescription>Identité et permissions</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Info icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={u.email || "—"} />
              <Info icon={<Shield className="h-3.5 w-3.5" />} label="Rôle" value={u.role} />
              <Info icon={<UsersIcon className="h-3.5 w-3.5" />} label="Équipe" value={u.team} />
              <Info icon={<Activity className="h-3.5 w-3.5" />} label="Statut" value={u.active ? "Actif" : "Inactif"} />
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance</CardTitle>
              <CardDescription>Activité commerciale</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-sm">
              <Stat label="Leads" value={u.leadsHandled} />
              <Stat label="Contrats" value={u.contractsWon} />
              <Stat label="Conversion" value={`${u.conversionRate.toFixed(1)}%`} />
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Portefeuille</CardTitle>
              <CardDescription>{myProspects.length} prospect(s) · {myContracts.length} contrat(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {myProspects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  to="/prospects/$prospectId"
                  params={{ prospectId: p.id }}
                  className="flex items-center justify-between py-1 hover:text-primary"
                >
                  <span>{p.firstName} {p.lastName}</span>
                  <Badge variant="outline">{p.status}</Badge>
                </Link>
              ))}
              {myProspects.length === 0 && (
                <div className="text-muted-foreground italic">Aucun prospect attribué.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader className="pb-3"><CardTitle className="text-base">Statut</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rôle</span>
                <Badge variant="outline" className={roleColor[u.role]}>{u.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Compte</span>
                <Badge variant="outline">{u.active ? "Actif" : "Inactif"}</Badge>
              </div>
            </CardContent>
          </Card>

          <CustomFieldsCard entity="user" entityId={u.username} />
        </div>
      </div>

      <Card className="shadow-elegant mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Journal d'activité
          </CardTitle>
          <CardDescription>
            Connexions, déconnexions, prospects et contrats modifiés par {u.username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length > 0 && (
            <div className="flex flex-col md:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={actSearch}
                  onChange={(e) => setActSearch(e.target.value)}
                  placeholder="Rechercher (id, valeur…)"
                  className="pl-9"
                />
              </div>
              <Select value={actType} onValueChange={setActType}>
                <SelectTrigger className="md:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous types</SelectItem>
                  <SelectItem value="login">Connexion</SelectItem>
                  <SelectItem value="logout">Déconnexion</SelectItem>
                  <SelectItem value="edit">Modification</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actEntity} onValueChange={setActEntity}>
                <SelectTrigger className="md:w-40"><SelectValue placeholder="Entité" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Toutes entités</SelectItem>
                  {entityTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actField} onValueChange={setActField}>
                <SelectTrigger className="md:w-40"><SelectValue placeholder="Champ" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous champs</SelectItem>
                  {fieldNames.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setActSearch(""); setActType("__all__"); setActEntity("__all__"); setActField("__all__"); }}
                >
                  <X className="h-4 w-4 mr-1" /> Réinitialiser
                </Button>
              )}
              <div className="text-xs text-muted-foreground md:ml-2 md:whitespace-nowrap self-center">
                {filteredActivity.length} / {activity.length}
              </div>
            </div>
          )}
          {loadingAct ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </div>
          ) : activity.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-6 text-center">
              Aucune activité enregistrée pour cet utilisateur.
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-6 text-center">
              Aucun résultat pour ces filtres.
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-[480px] overflow-auto">
              {filteredActivity.map((a) => {
                const isLogin = a.entityType === "user" && a.field === "login";
                const isLogout = a.entityType === "user" && a.field === "logout";
                const Icon = isLogin ? LogIn : isLogout ? LogOut : Pencil;
                const linkEl =
                  a.entityType === "prospect" ? (
                    <Link to="/prospects/$prospectId" params={{ prospectId: a.entityId }} className="text-primary hover:underline truncate">{a.entityId}</Link>
                  ) : a.entityType === "contract" ? (
                    <Link to="/contracts/$contractId" params={{ contractId: a.entityId }} className="text-primary hover:underline truncate">{a.entityId}</Link>
                  ) : (
                    <span className="text-muted-foreground truncate">{a.entityId}</span>
                  );
                return (
                  <li key={a.id} className="py-2.5 flex items-start gap-3 text-sm">
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {a.entityType}
                        </Badge>
                        <span className="font-medium">{a.field}</span>
                        {linkEl}
                      </div>
                      {(a.previousValue || a.newValue) && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {a.previousValue ? <span className="line-through">{a.previousValue}</span> : null}
                          {a.previousValue && a.newValue ? " → " : ""}
                          {a.newValue}
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(a.timestamp).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="mt-0.5 font-medium truncate">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold mt-0.5">{value}</div>
    </div>
  );
}
