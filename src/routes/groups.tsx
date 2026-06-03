import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users2, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGroups, groupsStore } from "@/lib/groups";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groupes — Protection ERP" },
      { name: "description", content: "Gérer les groupes d'utilisateurs et voir leur composition." },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const groups = useGroups();
  const { users } = useErp();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const isAdmin = user?.role === "Administrateur";

  const countsByGroup = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of users) m.set(u.team, (m.get(u.team) ?? 0) + 1);
    return m;
  }, [users]);

  const totalUsers = users.length;

  const add = async () => {
    const n = name.trim();
    if (!n) return;
    if (groups.includes(n)) { toast.error("Ce groupe existe déjà"); return; }
    try {
      await groupsStore.add(n);
      setName("");
      toast.success(`Groupe « ${n} » ajouté`);
    } catch (e: any) {
      toast.error("Ajout impossible", { description: e?.message });
    }
  };

  const startEdit = (g: string) => { setEditing(g); setEditValue(g); };
  const commitEdit = async () => {
    if (!editing) return;
    const v = editValue.trim();
    if (!v || v === editing) { setEditing(null); return; }
    try {
      await groupsStore.rename(editing, v);
      toast.success(`Renommé en « ${v} »`);
      setEditing(null);
    } catch (e: any) {
      toast.error("Renommage impossible", { description: e?.message });
    }
  };
  const remove = async (g: string) => {
    const used = countsByGroup.get(g) ?? 0;
    if (used > 0) { toast.error(`Impossible : ${used} utilisateur(s) appartiennent encore à ce groupe`); return; }
    try {
      await groupsStore.remove(g);
      toast.success(`Groupe « ${g} » supprimé`);
    } catch (e: any) {
      toast.error("Suppression impossible", { description: e?.message });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Groupes"
        description={`${groups.length} groupe(s) · ${totalUsers} utilisateur(s) au total`}
        icon={<Users2 className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nouveau groupe</CardTitle>
            <CardDescription>Crée un groupe puis assigne des utilisateurs depuis leur fiche.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nom du groupe…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              disabled={!isAdmin}
            />
            <Button onClick={add} disabled={!isAdmin || !name.trim()} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Ajouter
            </Button>
            {!isAdmin && (
              <p className="text-xs text-muted-foreground">
                Lecture seule : la gestion des groupes est réservée à l'Administrateur.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Groupes existants</CardTitle>
            <CardDescription>Effectif par groupe (mis à jour en temps réel).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {groups.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Aucun groupe défini.</p>
            )}
            {groups.map((g) => {
              const count = countsByGroup.get(g) ?? 0;
              const isEditing = editing === g;
              return (
                <div
                  key={g}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 hover:border-primary/30 transition-colors"
                >
                  {isEditing ? (
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className="h-8 flex-1"
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-foreground">{g}</span>
                  )}
                  <Badge variant="secondary" className="font-mono">
                    {count} {count > 1 ? "membres" : "membre"}
                  </Badge>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={commitEdit}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(g)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => remove(g)}
                            disabled={count > 0}
                            title={count > 0 ? "Retirez d'abord les utilisateurs" : "Supprimer"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}