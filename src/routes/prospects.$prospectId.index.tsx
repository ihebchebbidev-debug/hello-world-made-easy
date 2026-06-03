import { isAssignableRole, isFieldRole} from "@/lib/permissions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { ClipboardList, ArrowLeft, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { AttachmentsCard } from "@/components/AttachmentsCard";
import { CustomFieldsCard } from "@/components/CustomFieldsCard";
import { ProspectActivityCard } from "@/components/ProspectActivityCard";
import { formatAmount, useCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ConfirmDialog";
import { useStatusOptions } from "@/lib/useStatusOptions";

export const Route = createFileRoute("/prospects/$prospectId/")({
  head: ({ params }) => ({
    meta: [
      { title: `Prospect ${params.prospectId} — Protection ERP` },
      { name: "description", content: "Fiche prospect: vue d'ensemble, RDV, rappels et pièces jointes." },
    ],
  }),
  component: ProspectDetailPage,
});

// STATUS_OPTIONS comes from useStatusOptions() inside the component.

function outcomeLabel(o: string) {
  return o === "won" ? "Vente conclue" : o === "lost" ? "Perdu" : "En cours";
}
function checkLabel(c: string) {
  return c === "valid" ? "Validé" : c === "invalid" ? "Invalide" : "En attente";
}
function dotColor(kind: "ok" | "ko" | "neutral" | "warn") {
  return kind === "ok" ? "bg-success" : kind === "ko" ? "bg-destructive" : kind === "warn" ? "bg-warning" : "bg-muted-foreground/60";
}

function ProspectDetailPage() {
  const { prospectId } = Route.useParams();
  const navigate = useNavigate();
  const { prospects, users, events, contracts, updateProspect, markLost, saveEvent, deleteProspect } = useErp();
  const { values: STATUS_OPTIONS } = useStatusOptions("prospect");
  const currency = useCurrency();
  const { user, hasPermission } = useAuth();
  const isAgent = isFieldRole(user?.role);
  const canReassign =
    user?.role === "Administrateur" ||
    user?.role === "Manager" ||
    hasPermission("prospect.assign");
  const confirmDialog = useConfirm();

  const prospect = useMemo(() => prospects.find((p) => p.id === prospectId), [prospects, prospectId]);
  const agent = useMemo(() => users.find((u) => u.username === prospect?.assignedTo), [users, prospect]);

  const [comment, setComment] = useState(prospect?.comment ?? "");
  useEffect(() => { setComment(prospect?.comment ?? ""); }, [prospect?.comment]);

  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [reminderDate, setReminderDate] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("09:00");
  const [savingEvent, setSavingEvent] = useState(false);

  const linkedEvents = useMemo(() => {
    if (!prospect) return [];
    const needle = `${prospect.firstName} ${prospect.lastName}`.toLowerCase();
    return events
      .filter((e) => e.title.toLowerCase().includes(needle))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [events, prospect]);

  const linkedContracts = useMemo(() => {
    if (!prospect) return [];
    const direct = contracts.filter((c) => c.prospectId === prospect.id);
    if (direct.length) return direct;
    // Fallback for legacy contracts created before the prospect_id link existed.
    const ln = prospect.lastName.toLowerCase();
    const fn = prospect.firstName.toLowerCase();
    return contracts.filter(
      (c) => c.lastName.toLowerCase() === ln && c.firstName.toLowerCase() === fn,
    );
  }, [contracts, prospect]);

  if (!prospect) {
    return (
      <AppLayout skeleton="detail">
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Prospect introuvable</h2>
          <p className="text-sm text-muted-foreground mt-2">L'identifiant {prospectId} n'existe pas.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/prospects" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isAgent && prospect.assignedTo !== user?.username) {
    return (
      <AppLayout skeleton="detail">
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">Accès restreint</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Ce prospect n'est pas dans votre portefeuille.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/prospects" })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour
          </Button>
        </div>
      </AppLayout>
    );
  }

  const saveComment = async () => {
    await updateProspect(prospect.id, { comment });
    toast.success("Commentaire enregistré");
  };

  const needsSchedule = (s: string) => s.startsWith("RDV") || s.startsWith("A recontacter");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pendingStatus) return;
    const t = setTimeout(() => {
      const el = dateInputRef.current;
      if (!el) return;
      el.focus();
      const anyEl = el as HTMLInputElement & { showPicker?: () => void };
      try { anyEl.showPicker?.(); } catch { /* unsupported */ }
    }, 80);
    return () => clearTimeout(t);
  }, [pendingStatus]);

  const changeStatus = async (status: string) => {
    if (status === "Vente") {
      // Open the full contract creation form prefilled with this prospect.
      navigate({ to: "/contracts/new", search: { prospectId: prospect.id } });
      return;
    }
    if (needsSchedule(status)) {
      setPendingStatus(status);
      const today = new Date().toISOString().slice(0, 10);
      setReminderDate(today);
      return;
    }
    await updateProspect(prospect.id, { status });
    toast.success("Statut mis à jour", { description: status });
  };

  const confirmSchedule = async () => {
    if (!pendingStatus || !reminderDate) {
      toast.error("Choisissez une date");
      return;
    }
    setSavingEvent(true);
    try {
      await updateProspect(prospect.id, { status: pendingStatus });
      await saveEvent({
        title: `${pendingStatus.startsWith("RDV") ? "RDV" : "Rappel"} — ${prospect.firstName} ${prospect.lastName}`,
        date: reminderDate,
        time: reminderTime || "09:00",
        type: pendingStatus.startsWith("RDV") ? "rdv" : "rappel",
        agent: prospect.assignedTo ?? user?.username ?? "system",
        prospectId: prospect.id,
      });
      toast.success(pendingStatus.startsWith("RDV") ? "RDV ajouté au calendrier" : "Rappel ajouté au calendrier");
      setPendingStatus(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Impossible d'ajouter au calendrier");
    } finally {
      setSavingEvent(false);
    }
  };

  const changeAssignee = async (assignedTo: string) => {
    await updateProspect(prospect.id, { assignedTo: assignedTo === "__none__" ? null : assignedTo });
    toast.success("Assignation mise à jour");
  };

  const customValues = ((prospect as any).customValues ?? {}) as Record<string, string>;
  const customEntries = Object.entries(customValues).filter(([, v]) => v !== "" && v != null);

  const outcomeKind = prospect.outcome === "won" ? "ok" : prospect.outcome === "lost" ? "ko" : "neutral";
  const checkKind = prospect.checkValeur === "valid" ? "ok" : prospect.checkValeur === "invalid" ? "ko" : "warn";

  return (
    <AppLayout skeleton="detail">
      <PageHeader
        title={`${prospect.civility} ${prospect.firstName} ${prospect.lastName}`}
        description={`Fiche prospect ${prospect.id}`}
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/prospects" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Retour
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/calendar", search: { prospectId: prospect.id, newEvent: "1" } })}
            >
              <CalendarPlus className="h-4 w-4 mr-1.5" />Planifier RDV
            </Button>
            <Button size="sm" variant="outline"
              onClick={async () => { await markLost(prospect.id, "Non précisé"); toast.success("Marqué comme Perdu"); }}>
              Marquer perdu
            </Button>
            <Button size="sm"
              onClick={() => navigate({ to: "/contracts/new", search: { prospectId: prospect.id } })}>
              Convertir en contrat
            </Button>
            <Button asChild size="sm">
              <Link to="/prospects/$prospectId/edit" params={{ prospectId: prospect.id }}>Modifier</Link>
            </Button>
            {(user?.role === "Administrateur" || user?.role === "Manager") && (
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  const ok = await confirmDialog({
                    title: "Supprimer le prospect",
                    description: <>Voulez-vous supprimer définitivement le prospect <b>{prospect.id}</b> ?</>,
                    destructive: true,
                  });
                  if (!ok) return;
                  try {
                    await deleteProspect(prospect.id);
                    toast.success("Prospect supprimé");
                    navigate({ to: "/prospects" });
                  } catch (e: any) {
                    toast.error(e?.message ?? "Échec de la suppression");
                  }
                }}
              >Supprimer</Button>
            )}
          </div>
        }
      />

      {/* En-tête fiche */}
      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="px-5 py-4 border-b border-border">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Fiche prospect</div>
              <h1 className="text-xl font-semibold tracking-tight mt-0.5">
                {prospect.civility} {prospect.firstName} {prospect.lastName}
              </h1>
            </div>
            <div className="font-mono text-xs text-muted-foreground">N° {prospect.id}</div>
          </div>
        </header>
        <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          <Cell label="Statut">
            <span className="inline-flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor("neutral")}`} />
              {prospect.status}
            </span>
          </Cell>
          <Cell label="Résultat">
            <span className="inline-flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor(outcomeKind)}`} />
              {outcomeLabel(prospect.outcome)}
            </span>
          </Cell>
          <Cell label="Check valeur">
            <span className="inline-flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor(checkKind)}`} />
              {checkLabel(prospect.checkValeur)}
            </span>
          </Cell>
          <Cell label="Assigné à">
            {agent ? (
              <Link to="/users/$username/edit" params={{ username: agent.username }} className="hover:underline">
                {agent.fullName}
              </Link>
            ) : <span className="text-muted-foreground">Non attribué</span>}
          </Cell>
        </dl>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="Identité" subtitle="Informations civiles">
            <Row label="Civilité" value={prospect.civility} />
            <Row label="Nom" value={prospect.lastName} />
            <Row label="Prénom" value={prospect.firstName} />
            <Row label="Date de naissance" value={formatDate(prospect.birthDate)} />
            <Row label="Âge" value={prospect.age != null ? `${prospect.age} ans` : "—"} />
            <Row label="Date de naissance conjoint" value={formatDate(prospect.spouseBirthDate)} />
            <Row label="Âge conjoint" value={prospect.spouseAge != null ? `${prospect.spouseAge} ans` : "—"} />
            {(prospect.childrenCount != null || prospect.childrenAges) && (
              <>
                <Row label="Nombre d'enfants" value={prospect.childrenCount != null ? String(prospect.childrenCount) : "—"} />
                <Row label="Âges des enfants" value={prospect.childrenAges || "—"} full />
              </>
            )}
          </Section>

          <Section title="Coordonnées" subtitle="Téléphone, email, adresse">
            <Row label="Téléphone fixe" value={prospect.phone} />
            <Row label="Mobile / GSM" value={prospect.mobile} />
            <Row label="Email" value={prospect.email} />
            <Row label="Adresse" value={prospect.address} full />
            <Row label="Code postal" value={prospect.postalCode} />
            <Row label="Ville" value={prospect.city} />
          </Section>

          <Section title="Profil santé" subtitle="Mutuelle actuelle et tarif estimé">
            <Row label="Régime" value={prospect.regime} />
            <Row label="Mutuelle actuelle" value={prospect.currentMutuelle} />
            <Row label="Cotisation actuelle" value={prospect.cotisation != null ? formatAmount(prospect.cotisation, currency) : "—"} />
            {prospect.demande && <Row label="Demande" value={prospect.demande} full />}
          </Section>

          <Section title="Suivi commercial" subtitle="Statut d'appel, planification et notes">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-full">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Statut d'appel</Label>
                <Select value={pendingStatus ?? prospect.status} onValueChange={changeStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Assigné à</Label>
                {canReassign ? (
                  <Select value={prospect.assignedTo ?? "__none__"} onValueChange={changeAssignee}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Non attribué</SelectItem>
                      {users.filter((u) => isAssignableRole(u.role)).map((u) => (
                        <SelectItem key={u.username} value={u.username}>{u.fullName} (@{u.username})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-9 px-3 rounded-md border border-input bg-muted/30 flex items-center text-sm">
                    {prospect.assignedTo ?? <span className="italic text-muted-foreground">Non attribué</span>}
                  </div>
                )}
              </div>
            </div>

            {pendingStatus && (
              <div className="col-span-full rounded-md border border-border p-4 space-y-3 bg-muted/30">
                <div className="text-sm font-medium">
                  {pendingStatus.startsWith("RDV") ? "Planifier le rendez-vous" : "Planifier le rappel"}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Input ref={dateInputRef} type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Heure</Label>
                    <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setPendingStatus(null)} disabled={savingEvent}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={confirmSchedule} disabled={savingEvent}>
                    {savingEvent ? "Enregistrement…" : "Ajouter au calendrier"}
                  </Button>
                </div>
              </div>
            )}

            <div className="col-span-full space-y-1.5">
              <Label className="text-xs text-muted-foreground">Commentaire</Label>
              <Textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Notes de suivi…" />
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={saveComment}>Enregistrer</Button>
              </div>
            </div>
          </Section>

          {customEntries.length > 0 && (
            <Section title="Données personnalisées" subtitle="Champs renseignés à la création">
              {customEntries.map(([k, v]) => (
                <Row key={k} label={k} value={String(v)} />
              ))}
            </Section>
          )}

          <Section title="Pièces jointes" subtitle="Documents associés à ce prospect" plain>
            <AttachmentsCard entity="prospect" entityId={prospect.id} />
          </Section>

          <Section title="Champs personnalisés" subtitle="Définis dans la configuration" plain>
            <CustomFieldsCard entity="prospect" entityId={prospect.id} />
          </Section>

          {(user?.role === "Administrateur" || user?.role === "Manager") && (
            <Section
              title="Historique complet"
              subtitle="Audit : qui a fait quoi et quand sur cette fiche"
              plain
            >
              <ProspectActivityCard prospectId={prospect.id} />
            </Section>
          )}
        </div>

        {/* Colonne latérale */}
        <aside className="space-y-6">
          <Section title="Synthèse" subtitle={`Créé le ${formatDate(prospect.createdAt) ?? "—"}`} cols={1}>
            <Row label="Identifiant" value={<span className="font-mono text-xs">{prospect.id}</span>} />
            <Row label="Source" value={prospect.source} />
            <Row label="Statut" value={prospect.status} />
            <Row label="Résultat" value={outcomeLabel(prospect.outcome)} />
            <Row label="Check valeur" value={checkLabel(prospect.checkValeur)} />
            <Row label="Agent" value={agent ? agent.fullName : <span className="italic text-muted-foreground">Non assigné</span>} />
          </Section>

          {prospect.outcome === "lost" && prospect.lostReason && (
            <Section title="Raison de la perte" cols={1}>
              <div className="col-span-full text-sm">{prospect.lostReason}</div>
            </Section>
          )}

          <Section title="Contrats liés" subtitle="Contrats créés à partir de ce prospect" plain>
            {linkedContracts.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">Aucun contrat lié.</div>
            ) : (
              <ul className="divide-y divide-border">
                {linkedContracts.map((c) => (
                  <li key={c.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to="/contracts/$contractId"
                        params={{ contractId: c.id }}
                        className="text-sm font-medium text-primary hover:underline truncate block"
                      >
                        {c.id}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {c.partner} • {formatAmount(c.premium, currency)} • {c.billingStatus}
                      </div>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {formatDate(c.signatureDate) ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="RDV & rappels" subtitle="Événements liés à ce prospect" plain>
            {linkedEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">Aucun événement planifié.</div>
            ) : (
              <ul className="divide-y divide-border">
                {linkedEvents.map((e) => (
                  <li key={e.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(e.date) ?? "—"}{e.time ? ` • ${e.time}` : ""}</div>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{e.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </aside>
      </div>
    </AppLayout>
  );
}

/* ---------- helpers (présentation type fiche) ---------- */

function Section({
  title, subtitle, children, plain, cols = 2,
}: { title: string; subtitle?: string; children: React.ReactNode; plain?: boolean; cols?: 1 | 2 }) {
  return (
    <section className="rounded-md border border-border bg-card">
      <header className="px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </header>
      <div className={plain ? "p-5" : `p-5 grid grid-cols-1 ${cols === 2 ? "sm:grid-cols-2" : ""} gap-x-8 gap-y-3`}>
        {children}
      </div>
    </section>
  );
}

function isEmptyValue(v: React.ReactNode): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "number") return Number.isNaN(v);
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "" || s === "null" || s === "undefined" || s === "invalid date" || s === "nan";
  }
  return false;
}

function Placeholder() {
  return (
    <span className="text-muted-foreground/70 select-none" aria-label="Non renseigné" title="Non renseigné">—</span>
  );
}

function Row({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  const display = isEmptyValue(value) ? <Placeholder /> : value;
  return (
    <div className={`flex items-baseline gap-3 border-b border-dashed border-border/60 pb-2 min-h-[28px] ${full ? "sm:col-span-2" : ""}`}>
      <dt className="text-xs text-muted-foreground min-w-[140px] shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-foreground flex-1 break-words">{display}</dd>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 min-h-[58px]">
      <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-1">{isEmptyValue(children) ? <Placeholder /> : children}</div>
    </div>
  );
}
