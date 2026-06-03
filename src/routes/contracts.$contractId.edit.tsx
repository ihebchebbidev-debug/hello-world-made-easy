import { isAssignableRole } from "@/lib/permissions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileSignature, Save } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import type { Contract } from "@/lib/types";
import { useStatusOptions } from "@/lib/useStatusOptions";
import { useOptionList } from "@/lib/useOptionList";

export const Route = createFileRoute("/contracts/$contractId/edit")({
  head: ({ params }) => ({
    meta: [
      { title: `Modifier contrat ${params.contractId} — Protection ERP` },
      { name: "description", content: "Édition d'un contrat existant." },
    ],
  }),
  component: EditContractPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{children}</CardContent>
    </Card>
  );
}

function Field({ label, span = 1, children }: { label: string; span?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const spanCls = span === 4 ? "sm:col-span-2 lg:col-span-4" : span === 3 ? "sm:col-span-2 lg:col-span-3" : span === 2 ? "sm:col-span-2 lg:col-span-2" : "";
  return (
    <div className={`space-y-1.5 ${spanCls}`}>
      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function EditContractPage() {
  const { contractId } = Route.useParams();
  const navigate = useNavigate();
  const { contracts, importContracts, users } = useErp();
  const { values: BILLING } = useStatusOptions("contract");
  const SOURCES = useOptionList("contract", "source").values;
  const PARTNERS = useOptionList("contract", "partner").values;
  const PRODUCTS = useOptionList("contract", "product").values;
  const CABINETS = useOptionList("contract", "cabinet").values;
  const DEBIT_TYPES = useOptionList("contract", "debit_type").values;
  const TERMINATION_TYPES = useOptionList("contract", "termination_type").values;
  const REGIMES = useOptionList("contract", "regime").values;
  const CIVILITIES = useOptionList("contract", "civility").values;
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrateur" || user?.role === "Manager";
  const contract = useMemo(() => contracts.find((c) => c.id === contractId), [contracts, contractId]);

  const [form, setForm] = useState<Partial<Contract>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (contract) setForm({ ...contract }); }, [contract]);

  // Agents (and any non Admin/Manager) cannot edit contracts.
  useEffect(() => {
    if (user && !isAdmin) {
      toast.error("Seuls les administrateurs et managers peuvent modifier un contrat");
      navigate({ to: "/contracts/$contractId", params: { contractId } });
    }
  }, [user, isAdmin, navigate, contractId]);

  const set = <K extends keyof Contract>(k: K, v: Contract[K] | string | number | null) =>
    setForm((f) => ({ ...f, [k]: v as any }));

  const agents = users.filter((u) => isAssignableRole(u.role) || u.role === "Administrateur");

  if (!contract) {
    return (
      <AppLayout skeleton="form">
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Contrat introuvable</h2>
          <Button asChild className="mt-4"><Link to="/contracts"><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Link></Button>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout skeleton="form">
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Accès restreint</h2>
          <p className="text-sm text-muted-foreground mt-2">Seuls les administrateurs et managers peuvent modifier un contrat.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/contracts/$contractId" params={{ contractId }}><ArrowLeft className="h-4 w-4 mr-1.5" />Retour</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }


  const submit = async () => {
    setSaving(true);
    try {
      const payload: Partial<Contract> = {
        ...form,
        id: contract.id,
        premium: form.premium != null ? Number(form.premium) : contract.premium,
        previousPremium: form.previousPremium != null && form.previousPremium !== "" as any ? Number(form.previousPremium) : null,
        complementaryPremium: form.complementaryPremium != null && form.complementaryPremium !== "" as any ? Number(form.complementaryPremium) : null,
      };
      const r = await importContracts([payload]);
      if (r.updated + r.added > 0) {
        toast.success("Contrat mis à jour");
        navigate({ to: "/contracts/$contractId", params: { contractId: contract.id } });
      } else {
        toast.error("Mise à jour impossible");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const v = (k: keyof Contract) => (form[k] ?? "") as string | number;

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title={`Modifier ${contract.firstName} ${contract.lastName}`}
        description={`Contrat ${contract.id}`}
        icon={<FileSignature className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/contracts/$contractId" params={{ contractId: contract.id }}>
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
        <Section title="Détail Client">
          <Field label="Assigné à" span={2}>
            <Select value={(form.assignedTo as string) || "__none__"} onValueChange={(val) => set("assignedTo", val === "__none__" ? "" : val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {user?.username && <SelectItem value={user.username}>Moi (@{user.username})</SelectItem>}
                {isAdmin && agents.filter((a) => a.username !== user?.username).map((a) => (
                  <SelectItem key={a.username} value={a.username}>{a.fullName} (@{a.username})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Source" span={2}>
            <Select value={(form.source as string) || SOURCES[0]} onValueChange={(val) => set("source", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Civilité">
            <Select value={(form.civility as string) || "__none__"} onValueChange={(val) => set("civility", val === "__none__" ? null : val)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {CIVILITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nom"><Input value={v("lastName")} onChange={(e) => set("lastName", e.target.value)} /></Field>
          <Field label="Prénom" span={2}><Input value={v("firstName")} onChange={(e) => set("firstName", e.target.value)} /></Field>
          <Field label="Téléphone"><Input value={v("phone")} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Mobile"><Input value={v("mobile")} onChange={(e) => set("mobile", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={v("email")} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Date de naissance"><Input type="date" value={v("birthDate")} onChange={(e) => set("birthDate", e.target.value)} /></Field>
        </Section>

        <Section title="Adresse">
          <Field label="Adresse" span={2}><Input value={v("address")} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Code postal"><Input value={v("postalCode")} onChange={(e) => set("postalCode", e.target.value)} /></Field>
          <Field label="Ville"><Input value={v("city")} onChange={(e) => set("city", e.target.value.toUpperCase())} /></Field>
        </Section>

        <Section title="Mutuelle Actuelle">
          <Field label="Mutuelle"><Input value={v("currentMutuelle")} onChange={(e) => set("currentMutuelle", e.target.value)} /></Field>
          <Field label="N° Sécurité Sociale"><Input value={v("ssn")} onChange={(e) => set("ssn", e.target.value)} /></Field>
          <Field label="N° d'adhésion"><Input value={v("adhesionNumber")} onChange={(e) => set("adhesionNumber", e.target.value)} /></Field>
          <Field label="Adhérent principal"><Input value={v("principalMember")} onChange={(e) => set("principalMember", e.target.value)} /></Field>
          <Field label="Ancienne cotisation"><Input type="number" value={v("previousPremium")} onChange={(e) => set("previousPremium", e.target.value as any)} /></Field>
          <Field label="Date d'échéance"><Input type="date" value={v("currentExpiryDate")} onChange={(e) => set("currentExpiryDate", e.target.value)} /></Field>
        </Section>

        <Section title="Produit & Facturation">
          <Field label="Partenaire">
            <Select value={(form.partner as string) || PARTNERS[0]} onValueChange={(val) => set("partner", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PARTNERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Produit">
            <Select value={(form.product as string) || "__none__"} onValueChange={(val) => set("product", val === "__none__" ? null : val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Options"><Input value={v("productOptions")} onChange={(e) => set("productOptions", e.target.value)} /></Field>
          <Field label="Cotisation"><Input type="number" value={v("premium")} onChange={(e) => set("premium", e.target.value as any)} /></Field>
          <Field label="Cabinet">
            <Select value={(form.cabinet as string) || CABINETS[0]} onValueChange={(val) => set("cabinet", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CABINETS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date de signature"><Input type="date" value={v("signatureDate")} onChange={(e) => set("signatureDate", e.target.value)} /></Field>
          <Field label="Date d'effet"><Input type="date" value={v("effectiveDate")} onChange={(e) => set("effectiveDate", e.target.value)} /></Field>
          <Field label="Date validation"><Input type="date" value={v("validationDate")} onChange={(e) => set("validationDate", e.target.value)} /></Field>
          <Field label="Statut facturation" span={2}>
            <Select value={(form.billingStatus as string) || "Pré-validé"} onValueChange={(val) => set("billingStatus", val as Contract["billingStatus"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BILLING.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Produit complémentaire">
            <Select value={(form.complementaryProduct as string) || "__none__"} onValueChange={(val) => set("complementaryProduct", val === "__none__" ? null : val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cotisation complémentaire"><Input type="number" value={v("complementaryPremium")} onChange={(e) => set("complementaryPremium", e.target.value as any)} /></Field>
          <Field label="Date d'effet complémentaire"><Input type="date" value={v("complementaryEffectiveDate")} onChange={(e) => set("complementaryEffectiveDate", e.target.value)} /></Field>
        </Section>

        <Section title="Conjoint">
          <Field label="Civilité">
            <Select value={(form.spouseCivility as string) || "__none__"} onValueChange={(val) => set("spouseCivility", val === "__none__" ? null : val)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {CIVILITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nom"><Input value={v("spouseLastName")} onChange={(e) => set("spouseLastName", e.target.value)} /></Field>
          <Field label="Prénom"><Input value={v("spouseFirstName")} onChange={(e) => set("spouseFirstName", e.target.value)} /></Field>
          <Field label="Date de naissance"><Input type="date" value={v("spouseBirthDate")} onChange={(e) => set("spouseBirthDate", e.target.value)} /></Field>
        </Section>

        <Section title="Coordonnées Bancaires">
          <Field label="Nom titulaire"><Input value={v("bankHolderLastName")} onChange={(e) => set("bankHolderLastName", e.target.value)} /></Field>
          <Field label="Prénom titulaire"><Input value={v("bankHolderFirstName")} onChange={(e) => set("bankHolderFirstName", e.target.value)} /></Field>
          <Field label="IBAN" span={2}><Input value={v("iban")} onChange={(e) => set("iban", e.target.value)} placeholder="FR76…" /></Field>
          <Field label="BIC"><Input value={v("bic")} onChange={(e) => set("bic", e.target.value)} /></Field>
          <Field label="Date de prélèvement"><Input type="date" value={v("debitDate")} onChange={(e) => set("debitDate", e.target.value)} /></Field>
          <Field label="Type de prélèvement">
            <Select value={(form.debitType as string) || DEBIT_TYPES[0]} onValueChange={(val) => set("debitType", val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DEBIT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Type de résiliation">
            <Select value={(form.terminationType as string) || "__none__"} onValueChange={(val) => set("terminationType", val === "__none__" ? null : val)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {TERMINATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Régime">
            <Select value={(form.regime as string) || "__none__"} onValueChange={(val) => set("regime", val === "__none__" ? null : val)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {REGIMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Enfants">
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
                <Field label="Nombre d'enfants">
                  <Input type="number" min={0} max={20} value={count} onChange={(e) => setCount(Math.max(0, Math.min(20, Number(e.target.value) || 0)))} />
                </Field>
                {Array.from({ length: count }).map((_, i) => (
                  <Field key={i} label={`Âge enfant ${i + 1}`}>
                    <Input type="number" min={0} max={30} value={ages[i] ?? ""} onChange={(e) => setAge(i, e.target.value)} />
                  </Field>
                ))}
              </>
            );
          })()}
        </Section>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">Commentaire commercial</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea rows={4} value={v("commercialComment")} onChange={(e) => set("commercialComment", e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-8">
          <Button asChild variant="outline" disabled={saving}>
            <Link to="/contracts/$contractId" params={{ contractId: contract.id }}>Annuler</Link>
          </Button>
          <Button onClick={submit} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
