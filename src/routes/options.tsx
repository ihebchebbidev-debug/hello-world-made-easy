import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Sliders, Shield, Lock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { OptionListManager } from "@/components/OptionListManager";
import { useAuth } from "@/lib/auth";
import type { OptionEntity } from "@/lib/useOptionList";
import { EDITABLE_ROLES, useOptionPerms, setFieldPerms, type EditableRole } from "@/lib/useOptionPerms";

export const Route = createFileRoute("/options")({
  head: () => ({
    meta: [
      { title: "Options des listes — Protection ERP" },
      { name: "description", content: "Gérez les options des menus déroulants utilisés dans les formulaires prospects et contrats." },
    ],
  }),
  component: OptionsPage,
});

type FieldDef = { field: string; label: string; help?: string };

const PROSPECT_FIELDS: FieldDef[] = [
  { field: "source",      label: "Source",       help: "Origine du prospect (Web, Recommandation, …)" },
  { field: "regime",      label: "Régime",       help: "Régime de sécurité sociale" },
  { field: "civility",    label: "Civilité" },
  { field: "lost_reason", label: "Motif de perte" },
];

const CONTRACT_FIELDS: FieldDef[] = [
  { field: "source",           label: "Source" },
  { field: "partner",          label: "Partenaire santé" },
  { field: "product",          label: "Produit" },
  { field: "cabinet",          label: "Cabinet" },
  { field: "debit_type",       label: "Type de prélèvement" },
  { field: "termination_type", label: "Type de résiliation" },
  { field: "regime",           label: "Régime" },
  { field: "civility",         label: "Civilité" },
];

function PermissionsDialog({
  entity, field, label, currentRoles, onSaved,
}: {
  entity: OptionEntity; field: string; label: string;
  currentRoles: EditableRole[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<EditableRole[]>(currentRoles);
  const [busy, setBusy] = useState(false);
  const toggle = (r: EditableRole) =>
    setRoles((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));
  const save = async () => {
    setBusy(true);
    try {
      await setFieldPerms(entity, field, roles);
      toast.success("Permissions mises à jour");
      setOpen(false);
      onSaved();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
    finally { setBusy(false); }
  };
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => { setRoles(currentRoles); setOpen(true); }}
      >
        <Shield className="h-3.5 w-3.5 mr-1.5" /> Permissions
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permissions — {label}</DialogTitle>
            <DialogDescription>
              Sélectionnez les rôles autorisés à ajouter, renommer ou réordonner les options
              de cette liste. L'Administrateur a toujours tous les droits. La suppression
              reste réservée à l'Administrateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {EDITABLE_ROLES.map((r) => (
              <Label key={r} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={roles.includes(r)} onCheckedChange={() => toggle(r)} />
                <span>{r}</span>
              </Label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={busy}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FieldSection({
  entity, def, isAdmin, role, onPermsChange,
}: {
  entity: OptionEntity; def: FieldDef; isAdmin: boolean;
  role: string | undefined; onPermsChange: () => void;
}) {
  const { rolesFor, canEdit } = useOptionPerms();
  const allowedRoles = rolesFor(entity, def.field);
  const canEditHere = canEdit(role, entity, def.field);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{def.label}</CardTitle>
            {def.help && <p className="text-xs text-muted-foreground mt-0.5">{def.help}</p>}
            {isAdmin && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="text-[10px]">Administrateur</Badge>
                {allowedRoles.map((r) => (
                  <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                ))}
              </div>
            )}
            {!isAdmin && !canEditHere && (
              <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Lecture seule
              </p>
            )}
          </div>
          {isAdmin && (
            <PermissionsDialog
              entity={entity}
              field={def.field}
              label={def.label}
              currentRoles={allowedRoles}
              onSaved={onPermsChange}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <OptionListManager
          entity={entity}
          field={def.field}
          readOnly={!canEditHere}
          canDelete={isAdmin}
        />
      </CardContent>
    </Card>
  );
}

function OptionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrateur";
  const { canEdit, refresh } = useOptionPerms();
  const [bump, setBump] = useState(0);

  // Non-admins can access the page if they have edit rights on at least one list.
  const anyAllowed =
    isAdmin ||
    PROSPECT_FIELDS.some((d) => canEdit(user?.role, "prospect", d.field)) ||
    CONTRACT_FIELDS.some((d) => canEdit(user?.role, "contract", d.field));

  if (user && !anyAllowed) return <Navigate to="/" />;

  const visibleProspect = isAdmin
    ? PROSPECT_FIELDS
    : PROSPECT_FIELDS.filter((d) => canEdit(user?.role, "prospect", d.field));
  const visibleContract = isAdmin
    ? CONTRACT_FIELDS
    : CONTRACT_FIELDS.filter((d) => canEdit(user?.role, "contract", d.field));

  const onPermsChange = () => { setBump((n) => n + 1); void refresh(); };

  return (
    <AppLayout>
      <PageHeader
        icon={<Sliders className="h-5 w-5" />}
        title="Options des listes"
        description={
          isAdmin
            ? "Gérez les options et choisissez quels rôles peuvent les éditer."
            : "Modifiez les options des listes auxquelles vous avez accès."
        }
      />
      <div className="mt-4" key={bump}>
        <Tabs defaultValue={visibleProspect.length ? "prospect" : "contract"}>
          <TabsList>
            {visibleProspect.length > 0 && <TabsTrigger value="prospect">Prospects</TabsTrigger>}
            {visibleContract.length > 0 && <TabsTrigger value="contract">Contrats</TabsTrigger>}
          </TabsList>
          <TabsContent value="prospect" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleProspect.map((d) => (
              <FieldSection
                key={d.field} entity="prospect" def={d}
                isAdmin={isAdmin} role={user?.role} onPermsChange={onPermsChange}
              />
            ))}
          </TabsContent>
          <TabsContent value="contract" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleContract.map((d) => (
              <FieldSection
                key={d.field} entity="contract" def={d}
                isAdmin={isAdmin} role={user?.role} onPermsChange={onPermsChange}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
