import { isAssignableRole } from "@/lib/permissions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, UserPlus } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomFieldsInline } from "@/components/CustomFieldsInline";

import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { useOptionList } from "@/lib/useOptionList";
import { useStatusOptions } from "@/lib/useStatusOptions";
import { ageFromBirthDate } from "@/lib/age";
import type { Prospect } from "@/lib/types";

export const Route = createFileRoute("/prospects/$prospectId/edit")({
  head: ({ params }) => ({
    meta: [
      { title: `Modifier prospect ${params.prospectId} — Protection ERP` },
      { name: "description", content: "Édition d'un prospect existant." },
    ],
  }),
  component: EditProspectPage,
});

function EditProspectPage() {
  const { prospectId } = Route.useParams();
  const navigate = useNavigate();
  const { prospects, users, updateProspect } = useErp();
  const { user, hasPermission } = useAuth();
  const SOURCES = useOptionList("prospect", "source").values;
  const REGIMES = useOptionList("prospect", "regime").values;
  const STATUSES = useStatusOptions("prospect").values;
  const effectiveStatuses = STATUSES;
  // Tout utilisateur authentifié peut éditer un prospect ; la réassignation
  // suit la permission granulaire `prospect.assign` (Admin/Manager par défaut,
  // activable pour les Agents depuis la page Rôles).
  const canReassign =
    user?.role === "Administrateur" ||
    user?.role === "Manager" ||
    hasPermission("prospect.assign");

  const prospect = useMemo(() => prospects.find((p) => p.id === prospectId), [prospects, prospectId]);

  const [form, setForm] = useState<Partial<Prospect>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prospect) {
      setForm({ ...prospect });
      setCustomValues((prospect as any).customValues ?? {});
    }
  }, [prospect]);

  const set = <K extends keyof Prospect>(k: K, v: Prospect[K] | string | null) =>
    setForm((f) => ({ ...f, [k]: v as any }));

  // Auto-recalcul de l'âge dès qu'une date de naissance est saisie/changée.
  useEffect(() => {
    const a = ageFromBirthDate((form.birthDate as string) || "");
    if (a != null && a !== (form.age as number | null | undefined)) {
      setForm((f) => ({ ...f, age: a }));
    }
  }, [form.birthDate]);
  useEffect(() => {
    const a = ageFromBirthDate((form.spouseBirthDate as string) || "");
    if (a != null && a !== (form.spouseAge as number | null | undefined)) {
      setForm((f) => ({ ...f, spouseAge: a }));
    }
  }, [form.spouseBirthDate]);

  const agents = users.filter((u) => isAssignableRole(u.role));

  if (!prospect) {
    return (
      <AppLayout skeleton="form">
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Prospect introuvable</h2>
          <Button asChild className="mt-4"><Link to="/prospects"><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const submit = async () => {
    if (!String(form.lastName ?? "").trim() || !String(form.firstName ?? "").trim()) {
      toast.error("Nom et prénom obligatoires");
      return;
    }
    setSaving(true);
    try {
      await updateProspect(prospect.id, { ...form, customValues } as any);
      toast.success("Prospect mis à jour");
      navigate({ to: "/prospects/$prospectId", params: { prospectId: prospect.id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const v = (k: keyof Prospect) => (form[k] ?? "") as string;

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title={`Modifier ${prospect.firstName} ${prospect.lastName}`}
        description={`Prospect ${prospect.id}`}
        icon={<UserPlus className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/prospects/$prospectId" params={{ prospectId: prospect.id }}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />Retour
              </Link>
            </Button>
            <Button size="sm" onClick={submit} disabled={saving}>
              <Save className="h-4 w-4 mr-1.5" /> {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        }
      />

      <div className="mt-6 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Civilité</Label>
              <Select value={(form.civility as string) || "M"} onValueChange={(val) => set("civility", val as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="M">M</SelectItem><SelectItem value="Mme">Mme</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Nom *</Label><Input value={v("lastName")} onChange={(e) => set("lastName", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Prénom *</Label><Input value={v("firstName")} onChange={(e) => set("firstName", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Téléphone (fixe)</Label><Input value={v("phone")} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Mobile / GSM</Label><Input value={v("mobile")} onChange={(e) => set("mobile", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={v("email")} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Adresse</Label><Input value={v("address")} onChange={(e) => set("address", e.target.value)} placeholder="N°, rue, complément…" /></div>
            <div className="space-y-1.5"><Label>Ville</Label><Input value={v("city")} onChange={(e) => set("city", e.target.value.toUpperCase())} /></div>
            <div className="space-y-1.5"><Label>Code postal</Label><Input value={v("postalCode")} onChange={(e) => set("postalCode", e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={(form.source as string) || SOURCES[0]} onValueChange={(val) => set("source", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={(form.status as string) || effectiveStatuses[0]} onValueChange={(val) => set("status", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{effectiveStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {canReassign && (
              <div className="space-y-1.5">
                <Label>Assigné à</Label>
                <Select value={(form.assignedTo as string) || "__none__"} onValueChange={(val) => set("assignedTo", val === "__none__" ? null : val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Non assigné —</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a.username} value={a.username}>{a.fullName} (@{a.username})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Profil santé</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Date de naissance</Label>
              <Input type="date" value={v("birthDate")} onChange={(e) => set("birthDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Âge {form.birthDate && <span className="text-xs text-muted-foreground">(auto)</span>}</Label>
              <Input
                type="number" min={0} max={130}
                value={form.age == null ? "" : String(form.age)}
                disabled={!!form.birthDate}
                onChange={(e) => set("age", e.target.value === "" ? null : (Number(e.target.value) as any))}
                placeholder={form.birthDate ? "" : "Saisir l'âge"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date de naissance conjoint</Label>
              <Input type="date" value={v("spouseBirthDate")} onChange={(e) => set("spouseBirthDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Âge conjoint {form.spouseBirthDate && <span className="text-xs text-muted-foreground">(auto)</span>}</Label>
              <Input
                type="number" min={0} max={130}
                value={form.spouseAge == null ? "" : String(form.spouseAge)}
                disabled={!!form.spouseBirthDate}
                onChange={(e) => set("spouseAge", e.target.value === "" ? null : (Number(e.target.value) as any))}
                placeholder={form.spouseBirthDate ? "" : "Saisir l'âge"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mutuelle actuelle</Label>
              <Input value={v("currentMutuelle")} onChange={(e) => set("currentMutuelle", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Régime</Label>
              <Select value={(form.regime as string) || "__none__"} onValueChange={(val) => set("regime", val === "__none__" ? null : val)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {REGIMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cotisation (€)</Label>
              <Input type="number" min={0} step="0.01" value={(form.cotisation ?? "") as any} onChange={(e) => set("cotisation", e.target.value === "" ? null : (Number(e.target.value) as any))} />
            </div>
            <div className="space-y-1.5">
              <Label>Check valeur</Label>
              <Select value={(form.checkValeur as string) || "pending"} onValueChange={(val) => set("checkValeur", val as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="valid">Valide</SelectItem>
                  <SelectItem value="invalid">Invalide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.outcome === "lost" && (
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                <Label>Raison de la perte</Label>
                <Input value={v("lostReason")} onChange={(e) => set("lostReason", e.target.value)} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Enfants</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const ages = String(form.childrenAges ?? "").split(",").map((s) => s.trim()).filter((s) => s !== "");
              const count = Number(form.childrenCount ?? ages.length ?? 0) || 0;
              const setCount = (n: number) => {
                const next = [...ages];
                while (next.length < n) next.push("");
                next.length = n;
                setForm((f) => ({ ...f, childrenCount: n, childrenAges: next.join(",") } as any));
              };
              const setAge = (i: number, val: string) => {
                const next = [...ages];
                while (next.length <= i) next.push("");
                next[i] = val;
                setForm((f) => ({ ...f, childrenAges: next.join(",") } as any));
              };
              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1.5">
                      <Label>Nombre d'enfants</Label>
                      <Input
                        type="number" min={0} max={20}
                        value={count}
                        onChange={(e) => setCount(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                      />
                    </div>
                  </div>
                  {count > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="space-y-1.5">
                          <Label>Âge enfant {i + 1}</Label>
                          <Input type="number" min={0} max={30} value={ages[i] ?? ""} onChange={(e) => setAge(i, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Commentaire & champs personnalisés</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Commentaire</Label>
              <Textarea rows={3} value={v("comment")} onChange={(e) => set("comment", e.target.value)} placeholder="Notes…" />
            </div>
            <div className="space-y-1.5">
              <Label>Demande</Label>
              <Textarea rows={2} value={v("demande")} onChange={(e) => set("demande", e.target.value)} placeholder="Demande / besoin exprimé…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomFieldsInline entity="prospect" values={customValues} onChange={setCustomValues} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-8">
          <Button asChild variant="outline" disabled={saving}>
            <Link to="/prospects/$prospectId" params={{ prospectId: prospect.id }}>Annuler</Link>
          </Button>
          <Button onClick={submit} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
