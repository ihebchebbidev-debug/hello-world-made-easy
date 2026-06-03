import { isAssignableRole } from "@/lib/permissions";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, UserPlus } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomFieldsInline, validateRequiredCustomValues } from "@/components/CustomFieldsInline";

import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { useOptionList } from "@/lib/useOptionList";
import { useStatusOptions } from "@/lib/useStatusOptions";
import { ageFromBirthDate } from "@/lib/age";

export const Route = createFileRoute("/prospects/new")({
  head: () => ({
    meta: [
      { title: "Nouveau prospect — Protection ERP" },
      { name: "description", content: "Créer un nouveau prospect avec planification RDV/rappel et envoi optionnel en file de dispatch." },
    ],
  }),
  component: NewProspectPage,
});

function NewProspectPage() {
  const navigate = useNavigate();
  const { importProspects, users, saveEvent, prospects } = useErp();
  const { user } = useAuth();
  const SOURCES = useOptionList("prospect", "source").values;
  const REGIMES = useOptionList("prospect", "regime").values;
  const STATUSES = useStatusOptions("prospect").values;
  const role = user?.role;
  const canDispatch = role === "Administrateur" || role === "Manager";
  const effectiveStatuses = STATUSES;

  const [saving, setSaving] = useState(false);
  const [civility, setCivility] = useState<"M" | "Mme">("M");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [status, setStatus] = useState(effectiveStatuses[0]);
  const [assignedTo, setAssignedTo] = useState<string>(user?.username ?? "__none__");
  const [sendToDispatch, setSendToDispatch] = useState(false);
  const [comment, setComment] = useState("");
  const [demande, setDemande] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  // Profil santé
  const [birthDate, setBirthDate] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [spouseBirthDate, setSpouseBirthDate] = useState<string>("");
  const [spouseAge, setSpouseAge] = useState<string>("");

  useEffect(() => {
    const a = ageFromBirthDate(birthDate);
    if (a != null) setAge(String(a));
  }, [birthDate]);
  useEffect(() => {
    const a = ageFromBirthDate(spouseBirthDate);
    if (a != null) setSpouseAge(String(a));
  }, [spouseBirthDate]);
  const [currentMutuelle, setCurrentMutuelle] = useState("");
  const [regime, setRegime] = useState<string>("");
  const [cotisation, setCotisation] = useState<string>("");
  const [checkValeur, setCheckValeur] = useState<"pending" | "valid" | "invalid">("pending");
  const [childrenCount, setChildrenCount] = useState<string>("0");
  const [childrenAges, setChildrenAges] = useState<string[]>([]);

  const agents = users.filter((u) => isAssignableRole(u.role));
  const needsSchedule = status.startsWith("RDV") || status.startsWith("A recontacter");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!needsSchedule) return;
    if (!reminderDate) setReminderDate(new Date().toISOString().slice(0, 10));
    const t = setTimeout(() => {
      const el = dateInputRef.current;
      if (!el) return;
      el.focus();
      const anyEl = el as HTMLInputElement & { showPicker?: () => void };
      try { anyEl.showPicker?.(); } catch { /* unsupported */ }
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSchedule]);

  const submit = async () => {
    if (!lastName.trim() || !firstName.trim()) {
      toast.error("Nom et prénom obligatoires");
      return;
    }
    const missing = await validateRequiredCustomValues("prospect", customValues);
    if (missing) { toast.error(`${missing} est requis`); return; }

    setSaving(true);
    try {
      const finalAssignee =
        sendToDispatch
          ? null
          : assignedTo === "__none__"
            ? (user?.username ?? null)
            : assignedTo;

      const r = await importProspects([{
        civility, lastName: lastName.trim(), firstName: firstName.trim(),
        phone: phone.trim(), mobile: mobile.trim() || null, email: email.trim(),
        city: city.trim().toUpperCase(), address: address.trim() || null, postalCode: postalCode.trim() || null,
        source, status,
        assignedTo: finalAssignee,
        createdAt: new Date().toISOString().slice(0, 10),
        comment: comment.trim() || undefined,
        demande: demande.trim() || null,
        birthDate: birthDate || null,
        age: age === "" ? null : Number(age),
        spouseBirthDate: spouseBirthDate || null,
        spouseAge: spouseAge === "" ? null : Number(spouseAge),
        currentMutuelle: currentMutuelle.trim() || null,
        regime: regime || null,
        cotisation: cotisation === "" ? null : Number(cotisation),
        childrenCount: childrenCount === "" ? null : Number(childrenCount) || 0,
        childrenAges: childrenAges.filter((a) => a !== "").join(",") || null,
        checkValeur,
        customValues,
      } as any]);

      if (r.added + r.updated > 0) {
        if (needsSchedule && reminderDate) {
          try {
            // Best-effort: find the freshly created/updated prospect so the
            // calendar event carries prospect_id. Without this link, the
            // "RDV pris par agent" widget has to guess the prospect from
            // the title string, which is fragile.
            const ln = lastName.trim().toLowerCase();
            const fn = firstName.trim().toLowerCase();
            const phoneDigits = (phone || "").replace(/\D+/g, "");
            const linked = prospects.find((p) => {
              const pln = (p.lastName ?? "").toLowerCase();
              const pfn = (p.firstName ?? "").toLowerCase();
              if (pln !== ln || pfn !== fn) return false;
              if (!phoneDigits) return true;
              const pd = ((p.phone ?? "") + (p.mobile ?? "")).replace(/\D+/g, "");
              return pd.includes(phoneDigits.slice(-9));
            });
            await saveEvent({
              title: `${status.startsWith("RDV") ? "RDV" : "Rappel"} — ${firstName.trim()} ${lastName.trim()}`,
              date: reminderDate,
              time: reminderTime || "09:00",
              type: status.startsWith("RDV") ? "rdv" : "rappel",
              agent: finalAssignee ?? user?.username ?? "system",
              prospectId: linked?.id,
            });
          } catch (e) {
            console.warn("Failed to create reminder event", e);
          }
        }
        toast.success(
          sendToDispatch
            ? "Prospect envoyé en file de dispatch"
            : "Prospect créé dans votre portefeuille",
        );
        navigate({ to: "/prospects" });
      } else {
        toast.error("Création impossible");
      }
    } catch (e: any) {
      console.error("Prospect create failed", e);
      const status = e?.status ? ` (HTTP ${e.status})` : "";
      toast.error("Création du prospect échouée" + status, {
        description: e?.message ?? "Une erreur est survenue côté serveur.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Nouveau prospect"
        description="Renseignez les informations du lead — un RDV ou rappel sera ajouté au calendrier si planifié."
        icon={<UserPlus className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/prospects" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
            </Button>
            <Button size="sm" onClick={submit} disabled={saving}>
              <Save className="h-4 w-4 mr-1.5" /> {saving ? "Création…" : "Créer le prospect"}
            </Button>
          </div>
        }
      />

      <div className="mt-6 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Informations du prospect</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Civilité</Label>
              <Select value={civility} onValueChange={(v) => setCivility(v as "M" | "Mme")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="M">M</SelectItem><SelectItem value="Mme">Mme</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Nom *</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Prénom *</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Téléphone (fixe)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Mobile / GSM</Label><Input value={mobile} onChange={(e) => setMobile(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Adresse</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="N°, rue, complément…" /></div>
            <div className="space-y-1.5"><Label>Ville</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Code postal</Label><Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{effectiveStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Profil santé</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5"><Label>Date de naissance</Label><Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Âge {birthDate && <span className="text-xs text-muted-foreground">(auto)</span>}</Label>
              <Input type="number" min={0} max={130} value={age} disabled={!!birthDate} onChange={(e) => setAge(e.target.value)} placeholder={birthDate ? "" : "Saisir l'âge"} />
            </div>
            <div className="space-y-1.5"><Label>Date de naissance conjoint</Label><Input type="date" value={spouseBirthDate} onChange={(e) => setSpouseBirthDate(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Âge conjoint {spouseBirthDate && <span className="text-xs text-muted-foreground">(auto)</span>}</Label>
              <Input type="number" min={0} max={130} value={spouseAge} disabled={!!spouseBirthDate} onChange={(e) => setSpouseAge(e.target.value)} placeholder={spouseBirthDate ? "" : "Saisir l'âge"} />
            </div>
            <div className="space-y-1.5"><Label>Mutuelle actuelle</Label><Input value={currentMutuelle} onChange={(e) => setCurrentMutuelle(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Régime</Label>
              <Select value={regime || "__none__"} onValueChange={(v) => setRegime(v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {REGIMES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Cotisation (€)</Label><Input type="number" min={0} step="0.01" value={cotisation} onChange={(e) => setCotisation(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Check valeur</Label>
              <Select value={checkValeur} onValueChange={(v) => setCheckValeur(v as typeof checkValeur)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="valid">Valide</SelectItem>
                  <SelectItem value="invalid">Invalide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Enfants</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre d'enfants</Label>
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
              </div>
            </div>
            {Number(childrenCount) > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Array.from({ length: Number(childrenCount) }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Label>Âge enfant {i + 1}</Label>
                    <Input
                      type="number" min={0} max={30}
                      value={childrenAges[i] ?? ""}
                      onChange={(e) => {
                        setChildrenAges((prev) => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {needsSchedule && (
          <Card className="shadow-sm border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-primary">
                {status.startsWith("RDV") ? "Planifier le rendez-vous" : "Planifier le rappel"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Date</Label><Input ref={dateInputRef} type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Heure</Label><Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} /></div>
            </CardContent>
          </Card>
        )}

        {canDispatch && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Attribution</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sendToDispatch} onCheckedChange={(v) => setSendToDispatch(!!v)} />
                <span>Envoyer en file de dispatch (au lieu de l'attribuer maintenant)</span>
              </label>
              {!sendToDispatch && (
                <div className="space-y-1.5">
                  <Label>Assigné à</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {user?.username && <SelectItem value={user.username}>Moi (@{user.username})</SelectItem>}
                      {agents.filter((a) => a.username !== user?.username).map((a) => (
                        <SelectItem key={a.username} value={a.username}>{a.fullName} (@{a.username})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Commentaire & champs personnalisés</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Commentaire</Label>
              <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Notes…" />
            </div>
            <div className="space-y-1.5">
              <Label>Demande</Label>
              <Textarea rows={2} value={demande} onChange={(e) => setDemande(e.target.value)} placeholder="Demande / besoin exprimé…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomFieldsInline entity="prospect" values={customValues} onChange={setCustomValues} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2 pb-8">
          <Button variant="outline" onClick={() => navigate({ to: "/prospects" })} disabled={saving}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? "Création…" : "Créer le prospect"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}