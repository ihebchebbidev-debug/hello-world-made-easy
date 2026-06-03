import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Users as UsersIcon, Plus, Mail, Search, Upload, Pencil, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMemo, useState } from "react";

// importUsers retained — used via /users/import page



export const Route = createFileRoute("/users/")({
  head: () => ({
    meta: [
      { title: "Utilisateurs — Protection ERP" },
      { name: "description", content: "Gestion des utilisateurs, équipes et performances individuelles." },
    ],
  }),
  component: UsersPage,
});

const roleColor: Record<string, string> = {
  Administrateur: "bg-primary/10 text-primary border-primary/20",
  Manager: "bg-info/15 text-info border-info/20",
  Superviseur: "bg-info/15 text-info border-info/20",
  Agent: "bg-success/15 text-success border-success/20",
  Vendeur: "bg-success/15 text-success border-success/20",
  Qualificateur: "bg-success/15 text-success border-success/20",
  Backoffice: "bg-warning/15 text-warning-foreground border-warning/20",
  Présentation: "bg-muted text-muted-foreground border-border",
};

const ROLES = ["Administrateur", "Manager", "Superviseur", "Agent", "Vendeur", "Qualificateur", "Backoffice", "Présentation"] as const;

const ALL = "__all__";

function UsersPage() {
  const { users, importUsers, deleteUser } = useErp();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "Administrateur";
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const hay = `${u.fullName} ${u.username} ${u.email} ${u.team}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (roleFilter !== ALL && u.role !== roleFilter) return false;
      if (statusFilter === "active" && !u.active) return false;
      if (statusFilter === "inactive" && u.active) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <AppLayout skeleton="table">
      <PageHeader
        title="Utilisateurs"
        description={`${users.length} utilisateurs — gérez les comptes, équipes et performance`}
        icon={<UsersIcon className="h-5 w-5" />}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/users/import"><Upload className="h-4 w-4 mr-1.5" />Importer</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/users/new"><Plus className="h-4 w-4 mr-1.5" />Nouvel utilisateur</Link>
            </Button>
          </>
        }
      />

      {/* Quick filter bar */}
      <Card className="mt-6 p-3 shadow-elegant flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, équipe…"
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les rôles</SelectItem>
            {ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-36"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground md:ml-2 md:whitespace-nowrap">
          {filtered.length} / {users.length}
        </div>
      </Card>

      <Card className="mt-4 shadow-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Utilisateur</TableHead>
                <TableHead className="hidden md:table-cell">Rôle</TableHead>
                <TableHead className="hidden lg:table-cell">Équipe</TableHead>
                <TableHead className="hidden md:table-cell">Leads</TableHead>
                <TableHead>Contrats</TableHead>
                <TableHead className="hidden lg:table-cell">Conversion</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-sm text-muted-foreground">
                    Aucun utilisateur ne correspond à votre recherche.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 transition-base">
                  <TableCell>
                    <Link
                      to="/users/$username"
                      params={{ username: u.username }}
                      className="flex items-center gap-3 hover:text-primary transition-base"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{u.fullName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="outline" className={roleColor[u.role]}>{u.role}</Badge></TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{u.team}</TableCell>
                  <TableCell className="hidden md:table-cell font-medium text-sm">{u.leadsHandled}</TableCell>
                  <TableCell className="font-semibold text-sm">{u.contractsWon}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm font-medium">{u.conversionRate.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    {u.active ? (
                      <Badge variant="outline" className="bg-success/15 text-success border-success/20">Actif</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild size="icon" variant="ghost" aria-label="Modifier" title="Modifier">
                        <Link to="/users/$username/edit" params={{ username: u.username }}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild size="icon" variant="ghost" aria-label="Réinitialiser le mot de passe" title="Réinitialiser le mot de passe">
                          <Link to="/users/$username/reset-password" params={{ username: u.username }}><KeyRound className="h-4 w-4" /></Link>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" aria-label="Supprimer"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                            <AlertDialogDescription>{u.fullName} ({u.username}) sera supprimé.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => { try { await deleteUser(u.id); } catch (e: any) { /* noop */ } }}>Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AppLayout>
  );
}
