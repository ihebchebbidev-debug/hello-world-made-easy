import { isAssignableRole } from "@/lib/permissions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, FileSignature, Pencil, Save } from "lucide-react";

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
import type { Contract } from "@/lib/types";

export const Route = createFileRoute("/contracts/new")({
  validateSearch: (search: Record<string, unknown>): { prospectId?: string } => ({
    prospectId: typeof search.prospectId === "string" ? search.prospectId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nouveau contrat — Protection ERP" },
      { name: "description", content: "Créer un nouveau contrat (détail client, mutuelle, produit, conjoint, coordonnées bancaires)." },
    ],
  }),
  component: NewContractPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {children}
      </CardContent>
    </Card>
  );
}

function Field({
  label, span = 1, children,
}: { label: string; span?: 1 | 2 | 3 | 4; children: React.ReactNode }) {
  const spanCls =
    span === 4 ? "sm:col-span-2 lg:col-span-4" :
    span === 3 ? "sm:col-span-2 lg:col-span-3" :
    span === 2 ? "sm:col-span-2 lg:col-span-2" : "";
  return (
    <div className={`space-y-1.5 ${spanCls}`}>
      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function NewContractPage() {
  const navigate = useNavigate();
  const { prospectId } = Route.useSearch();
  const { importContracts, users, prospects, updateProspect } = useErp();
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrateur" || user?.role === "Manager";

  const SOURCES = useOptionList("contract", "source").values;
  const PARTNERS = useOptionList("contract", "partner").values;
  const PRODUCTS = useOptionList("contract", "product").values;
  const CABINETS = useOptionList("contract", "cabinet").values;
  const DEBIT_TYPES = useOptionList("contract", "debit_type").values;
  const TERMINATION_TYPES = useOptionList("contract", "termination_type").values;
  const REGIMES = useOptionList("contract", "regime").values;
  const CIVILITIES = useOptionList("contract", "civility").values;

  // Source prospect (when converting a "Vente" from a prospect file).
  const sourceProspect = useMemo(
    () => (prospectId ? prospects.find((p) => p.id === prospectId) : undefined),
    [prospects, prospectId],
  );
  const pf = <T,>(v: T | null | undefined, fallback: T): T => (v === null || v === undefined ? fallback : v);

  // Détail client
  const [assignedTo, setAssignedTo] = useState<string>(sourceProspect?.assignedTo ?? user?.username ?? "");
  const [source, setSource] = useState<string>(sourceProspect?.source ?? SOURCES[3]);
  const [civility, setCivility] = useState(sourceProspect?.civility ?? "");
  const [lastName, setLastName] = useState(sourceProspect?.lastName ?? "");
  const [firstName, setFirstName] = useState(sourceProspect?.firstName ?? "");
  const [phone, setPhone] = useState(sourceProspect?.phone ?? "");
  const [mobile, setMobile] = useState(pf(sourceProspect?.mobile, ""));
  const [email, setEmail] = useState(sourceProspect?.email ?? "");
  const [birthDate, setBirthDate] = useState(pf(sourceProspect?.birthDate, ""));

  // Adresse
  const [address, setAddress] = useState(pf(sourceProspect?.address, ""));
  const [postalCode, setPostalCode] = useState(pf(sourceProspect?.postalCode, ""));
  const [city, setCity] = useState(sourceProspect?.city ?? "");

  // Mutuelle Actuelle
  const [currentMutuelle, setCurrentMutuelle] = useState(pf(sourceProspect?.currentMutuelle, ""));
  const [ssn, setSsn] = useState("");
  const [adhesionNumber, setAdhesionNumber] = useState("");
  const [principalMember, setPrincipalMember] = useState("");
  const [previousPremium, setPreviousPremium] = useState(sourceProspect?.cotisation != null ? String(sourceProspect.cotisation) : "");
  const [currentExpiryDate, setCurrentExpiryDate] = useState("");

  // Produit Proposé
  const [partner, setPartner] = useState("");
  const [product, setProduct] = useState("");
  const [productOptions, setProductOptions] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [premium, setPremium] = useState("");
  const [cabinet, setCabinet] = useState(CABINETS[0]);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [complementaryProduct, setComplementaryProduct] = useState("");
  const [complementaryPremium, setComplementaryPremium] = useState("");
  const [complementaryEffectiveDate, setComplementaryEffectiveDate] = useState("");

  // Conjoint
  const [spouseCivility, setSpouseCivility] = useState("");
  const [spouseLastName, setSpouseLastName] = useState("");
  const [spouseFirstName, setSpouseFirstName] = useState("");
  const [spouseBirthDate, setSpouseBirthDate] = useState(pf(sourceProspect?.spouseBirthDate, ""));

  // Bancaires
  const [bankHolderLastName, setBankHolderLastName] = useState("");
  const [bankHolderFirstName, setBankHolderFirstName] = useState("");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [debitDate, setDebitDate] = useState("");
  const [debitType, setDebitType] = useState(DEBIT_TYPES[0]);

  // Commentaires
  const initialComment = [sourceProspect?.demande, sourceProspect?.comment].filter(Boolean).join("\n\n");
  const [commercialComment, setCommercialComment] = useState(initialComment);

  // Résiliation
  const [terminationType, setTerminationType] = useState<string>("");
  // Régime
  const [regime, setRegime] = useState<string>(pf(sourceProspect?.regime, ""));

  // Enfants
  const initialChildrenCount = sourceProspect?.childrenCount != null ? String(sourceProspect.childrenCount) : "0";
  const initialChildrenAges = sourceProspect?.childrenAges
    ? sourceProspect.childrenAges.split(",").map((s) => s.trim())
    : [];
  const [childrenCount, setChildrenCount] = useState<string>(initialChildrenCount);
  const [childrenAges, setChildrenAges] = useState<string[]>(initialChildrenAges);

  // Champs personnalisés contrat (configurables depuis /configuration)
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);

  const agents = users.filter((u) => isAssignableRole(u.role) || u.role === "Administrateur");

  const submit = async () => {
    // Everything is optional, but we need at least *something* identifying.
    if (!lastName.trim() && !firstName.trim() && !email.trim() && !phone.trim() && !mobile.trim()) {
      toast.error("Renseignez au moins un nom, un email ou un téléphone");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Contract> = {
        prospectId: sourceProspect?.id ?? null,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        city: city.trim().toUpperCase(),
        partner: partner || "NEOLIANE",
        cabinet,
        signatureDate: signatureDate || new Date().toISOString().slice(0, 10),
        effectiveDate: effectiveDate || new Date().toISOString().slice(0, 10),
        premium: Number(premium) || 0,
        billingStatus: "Pré-validé",
        source,
        assignedTo: assignedTo || user?.username || "—",
        civility: civility || null,
        phone: phone || null,
        mobile: mobile || null,
        email: email || null,
        birthDate: birthDate || null,
        address: address || null,
        postalCode: postalCode || null,
        currentMutuelle: currentMutuelle || null,
        ssn: ssn || null,
        adhesionNumber: adhesionNumber || null,
        principalMember: principalMember || null,
        previousPremium: previousPremium ? Number(previousPremium) : null,
        currentExpiryDate: currentExpiryDate || null,
        product: product || null,
        productOptions: productOptions || null,
        complementaryProduct: complementaryProduct || null,
        complementaryPremium: complementaryPremium ? Number(complementaryPremium) : null,
        complementaryEffectiveDate: complementaryEffectiveDate || null,
        spouseCivility: spouseCivility || null,
        spouseLastName: spouseLastName || null,
        spouseFirstName: spouseFirstName || null,
        spouseBirthDate: spouseBirthDate || null,
        bankHolderLastName: bankHolderLastName || null,
        bankHolderFirstName: bankHolderFirstName || null,
        iban: iban || null,
        bic: bic || null,
        debitDate: debitDate || null,
        debitType: debitType || null,
        terminationType: terminationType || null,
        regime: regime || null,
        childrenCount: Number(childrenCount) || null,
        childrenAges: childrenAges.filter((a) => a !== "").join(",") || null,
        commercialComment: commercialComment || null,
      };

      // Attach custom field values so the backend persists them in
      // extraneterp_custom_field_values in the same transaction.
      const payloadWithCustom: Partial<Contract> & { customValues?: Record<string, string> } = {
        ...payload,
        ...(Object.keys(customValues).length > 0 ? { customValues } : {}),
      };

      const r = await importContracts([payloadWithCustom]);
      if (r.added + r.updated > 0) {
        // If this contract was created from a prospect "Vente", flip the
        // prospect to won/Vente so it disappears from the active pipeline.
        if (sourceProspect) {
          try {
            await updateProspect(sourceProspect.id, { outcome: "won", status: "Vente" });
          } catch { /* non-blocking */ }
        }
        toast.success(sourceProspect ? "Prospect converti en contrat" : "Contrat créé");
        navigate({ to: "/contracts" });
      } else {
        toast.error("Création impossible");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Nouveau contrat"
        description="Tous les champs sont optionnels — remplissez ce que vous avez."
        icon={<FileSignature className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/contracts" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
            </Button>
            <Button size="sm" onClick={submit} disabled={saving}>
              <Save className="h-4 w-4 mr-1.5" /> {saving ? "Enregistrement…" : "Créer le contrat"}
            </Button>
          </div>
        }
      />

      <div className="mt-6 space-y-4">
        {sourceProspect && (
          <div className="rounded-md border border-success/40 bg-success/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-success" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold">
                    Conversion du prospect{" "}
                    <Link
                      to="/prospects/$prospectId"
                      params={{ prospectId: sourceProspect.id }}
                      className="underline underline-offset-2"
                    >
                      {sourceProspect.firstName} {sourceProspect.lastName} ({sourceProspect.id})
                    </Link>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      to="/prospects/$prospectId/edit"
                      params={{ prospectId: sourceProspect.id }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Compléter la fiche prospect
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Les champs renseignés sur la fiche prospect sont déjà pré-remplis ci-dessous.
                  Vous pouvez aussi les saisir ou les compléter directement dans le contrat.
                </p>
              </div>
            </div>
          </div>
        )}

        <Section title="Détail Client">
          <Field label="Assigné à" span={2}>
            <Select value={assignedTo || "__me__"} onValueChange={(v) => setAssignedTo(v === "__me__" ? (user?.username ?? "") : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {user?.username && <SelectItem value={user.username}>Moi (@{user.username})</SelectItem>}
                {isAdmin && agents.filter((a) => a.username !== user?.username).map((a) => (
                  <SelectItem key={a.username} value={a.username}>{a.fullName} (@{a.username})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Source prospect" span={2}>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Civilité">
            <Select value={civility || "__none__"} onValueChange={(v) => setCivility(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {CIVILITIES.filter(Boolean).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nom"><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></Field>
          <Field label="Prénom" span={2}><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
          <Field label="Téléphone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Tél mobile"><Input value={mobile} onChange={(e) => setMobile(e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Date de naissance"><Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></Field>
        </Section>

        <Section title="Détails Adresse">
          <Field label="Adresse" span={2}><Input value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          <Field label="Code postal"><Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></Field>
          <Field label="Ville"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="PARIS" /></Field>
        </Section>

        <Section title="Mutuelle Actuelle">
          <Field label="Mutuelle"><Input value={currentMutuelle} onChange={(e) => setCurrentMutuelle(e.target.value)} /></Field>
          <Field label="Numéro Sécurité Sociale"><Input value={ssn} onChange={(e) => setSsn(e.target.value)} /></Field>
          <Field label="Numéro d'adhésion"><Input value={adhesionNumber} onChange={(e) => setAdhesionNumber(e.target.value)} /></Field>
          <Field label="Adhérent principale"><Input value={principalMember} onChange={(e) => setPrincipalMember(e.target.value)} /></Field>
          <Field label="Ancien montant de cotisation"><Input type="number" value={previousPremium} onChange={(e) => setPreviousPremium(e.target.value)} /></Field>
          <Field label="Date d'échéance"><Input type="date" value={currentExpiryDate} onChange={(e) => setCurrentExpiryDate(e.target.value)} /></Field>
        </Section>

        <Section title="Produit Proposé">
          <Field label="Partenaire santé">
            <Select value={partner || "__none__"} onValueChange={(v) => setPartner(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Choisir une option" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Choisir une option</SelectItem>
                {PARTNERS.filter(Boolean).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Produit santé">
            <Select value={product || "__none__"} onValueChange={(v) => setProduct(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Choisir une option" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Choisir une option</SelectItem>
                {PRODUCTS.filter(Boolean).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Options"><Input value={productOptions} onChange={(e) => setProductOptions(e.target.value)} /></Field>
          <Field label="Date de signature"><Input type="date" value={signatureDate} onChange={(e) => setSignatureDate(e.target.value)} /></Field>
          <Field label="Montant de cotisation"><Input type="number" value={premium} onChange={(e) => setPremium(e.target.value)} /></Field>
          <Field label="Cabinet">
            <Select value={cabinet} onValueChange={setCabinet}>
              <SelectTrigger><SelectValue placeholder="Choisir une option" /></SelectTrigger>
              <SelectContent>{CABINETS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Date effet"><Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} /></Field>
          <Field label="Type de résiliation">
            <Select value={terminationType || "__none__"} onValueChange={(v) => setTerminationType(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {TERMINATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Régime">
            <Select value={regime || "__none__"} onValueChange={(v) => setRegime(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {REGIMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Produit complémentaire santé">
            <Select value={complementaryProduct || "__none__"} onValueChange={(v) => setComplementaryProduct(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Choisir une option" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Choisir une option</SelectItem>
                {PRODUCTS.filter(Boolean).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Montant cotisation complémentaire"><Input type="number" value={complementaryPremium} onChange={(e) => setComplementaryPremium(e.target.value)} /></Field>
          <Field label="Date d'effet complémentaire"><Input type="date" value={complementaryEffectiveDate} onChange={(e) => setComplementaryEffectiveDate(e.target.value)} /></Field>
        </Section>

        <Section title="Informations Conjoint">
          <Field label="Civilité">
            <Select value={spouseCivility || "__none__"} onValueChange={(v) => setSpouseCivility(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {CIVILITIES.filter(Boolean).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nom"><Input value={spouseLastName} onChange={(e) => setSpouseLastName(e.target.value)} /></Field>
          <Field label="Prénom"><Input value={spouseFirstName} onChange={(e) => setSpouseFirstName(e.target.value)} /></Field>
          <Field label="Date de naissance"><Input type="date" value={spouseBirthDate} onChange={(e) => setSpouseBirthDate(e.target.value)} /></Field>
        </Section>

        <Section title="Enfants">
          <Field label="Nombre d'enfants">
            <Input
              type="number" min={0} max={20} value={childrenCount}
              onChange={(e) => {
                const n = Math.max(0, Math.min(20, Number(e.target.value) || 0));
                setChildrenCount(String(n));
                setChildrenAges((prev) => {
                  const next = [...prev];
                  while (next.length < n) next.push("");
                  next.length = n;
                  return next;
                });
              }}
            />
          </Field>
          {Array.from({ length: Number(childrenCount) || 0 }).map((_, i) => (
            <Field key={i} label={`Âge enfant ${i + 1}`}>
              <Input
                type="number" min={0} max={30}
                value={childrenAges[i] ?? ""}
                onChange={(e) => {
                  setChildrenAges((prev) => {
                    const next = [...prev];
                    while (next.length <= i) next.push("");
                    next[i] = e.target.value;
                    return next;
                  });
                }}
              />
            </Field>
          ))}
        </Section>

        <Section title="Coordonnées Bancaires">
          <Field label="Nom titulaire du compte"><Input value={bankHolderLastName} onChange={(e) => setBankHolderLastName(e.target.value)} /></Field>
          <Field label="Prénom titulaire du compte"><Input value={bankHolderFirstName} onChange={(e) => setBankHolderFirstName(e.target.value)} /></Field>
          <Field label="IBAN" span={2}><Input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="FR76…" /></Field>
          <Field label="BIC"><Input value={bic} onChange={(e) => setBic(e.target.value)} /></Field>
          <Field label="Date de prélèvement"><Input type="date" value={debitDate} onChange={(e) => setDebitDate(e.target.value)} /></Field>
          <Field label="Type de prélèvement">
            <Select value={debitType} onValueChange={setDebitType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DEBIT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </Section>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
              Commentaires Commercial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea rows={4} value={commercialComment} onChange={(e) => setCommercialComment(e.target.value)}
              placeholder="Notes du commercial, contexte de la vente, suivi…" />
          </CardContent>
        </Card>

        {/* Informations Complémentaires — pilotées par les champs personnalisés
            configurés dans /configuration (entité = contract). Le composant
            ne s'affiche que si au moins un champ est défini. */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
              Informations Complémentaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <CustomFieldsInline
                entity="contract"
                values={customValues}
                onChange={setCustomValues}
                hideHeader
              />
              {Object.keys(customValues).length === 0 && (
                <p className="col-span-2 text-xs text-muted-foreground">
                  Aucun champ supplémentaire n'est configuré. Un administrateur
                  peut en ajouter depuis <span className="font-medium">Configuration → Champs personnalisés (Contrat)</span>.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-8">
          <Button variant="outline" onClick={() => navigate({ to: "/contracts" })} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? "Enregistrement…" : "Créer le contrat"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}