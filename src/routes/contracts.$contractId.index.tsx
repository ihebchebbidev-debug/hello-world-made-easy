import { isFieldRole } from "@/lib/permissions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { FileText, ArrowLeft, Download, Printer, FileJson, FileSpreadsheet, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useErp } from "@/lib/erpStore";
import { useStatusOptions } from "@/lib/useStatusOptions";
import { useAuth } from "@/lib/auth";
import { formatAmount, useCurrency } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/utils";
import { exportCSV, exportJSON, exportXLSX, printPage, toContractExportRows } from "@/lib/exportUtils";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AttachmentsCard } from "@/components/AttachmentsCard";
import { CustomFieldsCard } from "@/components/CustomFieldsCard";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/contracts/$contractId/")({
  head: ({ params }) => ({
    meta: [
      { title: `Contrat ${params.contractId} — Protection ERP` },
      { name: "description", content: "Détail du contrat: parcours client, cotisation, facturation et export." },
    ],
  }),
  component: ContractDetailsPage,
  notFoundComponent: () => (
    <AppLayout skeleton="detail">
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Contrat introuvable</h2>
        <Link to="/contracts" className="text-primary text-sm mt-2 inline-block">← Retour aux contrats</Link>
      </div>
    </AppLayout>
  ),
});

// billingOptions now comes from useStatusOptions("contract") inside the component.

const billingDotColor: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  primary: "bg-primary",
  accent: "bg-accent",
  muted: "bg-muted-foreground/60",
};

function getBillingDotClass(status: string, options: { value: string; color: string }[]) {
  const option = options.find((o) => o.value === status);
  if (option) return billingDotColor[option.color] ?? "bg-muted-foreground/60";
  if (status === "Validé Confirmation") return "bg-success";
  if (status === "Annuler la confirmation") return "bg-destructive";
  if (status === "En attente de validation") return "bg-warning";
  return "bg-muted-foreground/60";
}

type TimelineItem = {
  id: string;
  date: string;
  time?: string;
  type: "rdv" | "rappel" | "signature" | "validation" | "creation";
  title: string;
  description?: string;
  done: boolean;
};

function ContractDetailsPage() {
  const { contractId } = Route.useParams();
  const navigate = useNavigate();
  const { contracts, prospects, users, events: calendarEvents, updateContractBilling, getContractActivity, logActivity } = useErp();
  const { options: billingOptions } = useStatusOptions("contract");
  const { user } = useAuth();
  const isAgent = isFieldRole(user?.role);
  const currency = useCurrency();
  const confirmDialog = useConfirm();

  const contract = contracts.find((c) => c.id === contractId);

  const validatedBillingStatuses = useMemo(
    () => new Set(billingOptions.filter((o) => o.color === "success").map((o) => o.value)),
    [billingOptions],
  );

  const linkedProspect = useMemo(() => {
    if (!contract) return undefined;
    return (
      prospects.find((p) => contract.prospectId && p.id === contract.prospectId) ??
      prospects.find((p) => p.lastName === contract.lastName && p.firstName === contract.firstName)
    );
  }, [prospects, contract]);

  const agent = useMemo(
    () => (contract ? users.find((u) => u.username === contract.assignedTo) : undefined),
    [users, contract],
  );

  const timeline: TimelineItem[] = useMemo(() => {
    if (!contract) return [];
    const items: TimelineItem[] = [];
    if (linkedProspect) {
      items.push({
        id: "creation", date: linkedProspect.createdAt, type: "creation",
        title: "Lead créé", description: `Source: ${linkedProspect.source}`, done: true,
      });
    }
    const related = calendarEvents
      .filter((e) => e.title.toLowerCase().includes(contract.lastName.toLowerCase()))
      .slice(0, 4);
    related.forEach((e) =>
      items.push({
        id: e.id, date: e.date, time: e.time, type: e.type,
        title: e.type === "rdv" ? "Rendez-vous" : e.type === "rappel" ? "Rappel client" : "Signature programmée",
        description: `Avec @${e.agent}`,
        done: new Date(e.date) <= new Date(),
      }),
    );
    items.push({
      id: "sig", date: contract.signatureDate, type: "signature",
      title: "Contrat signé", description: `${contract.partner} • ${formatAmount(contract.premium, currency)}`, done: true,
    });
    if (contract.validationDate) {
      items.push({
        id: "val", date: contract.validationDate, type: "validation",
        title: "Validation backoffice", description: contract.billingStatus,
        done: validatedBillingStatuses.has(contract.billingStatus),
      });
    } else {
      items.push({
        id: "val", date: "—", type: "validation",
        title: "Validation backoffice", description: "En attente de traitement", done: false,
      });
    }
    return items.sort((a, b) => (a.date === "—" ? 1 : b.date === "—" ? -1 : a.date.localeCompare(b.date)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, linkedProspect, calendarEvents]);

  const handleExportCSV = () => {
    exportCSV(`contrat-${contract.id}.csv`, toContractExportRows([contract as unknown as Record<string, unknown>]));
    toast.success("Export CSV généré");
  };
  const handleExportJSON = () => {
    exportJSON(`contrat-${contract.id}.json`, {
      contrat: toContractExportRows([contract as unknown as Record<string, unknown>])[0],
      parcours: timeline,
      agent: agent?.fullName,
      prospect: linkedProspect ? { nom: linkedProspect.lastName, prenom: linkedProspect.firstName, ville: linkedProspect.city } : null,
    });
    toast.success("Export JSON généré");
  };
  const handleStatusChange = (status: string) => {
    updateContractBilling(contract.id, status as typeof contract.billingStatus);
    toast.success("Statut mis à jour", { description: status });
  };

  return (
    <AppLayout skeleton="detail">
      <PageHeader
        title={`${contract.firstName} ${contract.lastName}`}
        description={`Fiche contrat ${contract.id}`}
        icon={<FileText className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/contracts" })}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Retour
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" />Exporter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Format</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>
                  <FileJson className="h-4 w-4 mr-2" />JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={printPage}>
                  <Printer className="h-4 w-4 mr-2" />Imprimer / PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!isAgent && (
              <Button asChild size="sm">
                <Link to="/contracts/$contractId/edit" params={{ contractId: contract.id }}>Modifier</Link>
              </Button>
            )}
            {(user?.role === "Administrateur" || user?.role === "Manager") && (
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  const ok = await confirmDialog({
                    title: "Supprimer le contrat",
                    description: <>Voulez-vous supprimer définitivement le contrat <b>{contract.id}</b> ?</>,
                    destructive: true,
                  });
                  if (!ok) return;
                  try {
                    const { api } = await import("@/lib/api");
                    await api(`/contracts.php?id=${encodeURIComponent(contract.id)}`, { method: "DELETE" });
                    toast.success("Contrat supprimé");
                    navigate({ to: "/contracts" });
                  } catch (e: any) {
                    toast.error(e?.message ?? "Échec de la suppression");
                  }
                }}
              >Supprimer</Button>
            )}
          </>
        }
      />

      {/* En-tête fiche */}
      <section className="mt-6 rounded-md border border-border bg-card">
        <header className="px-5 py-4 border-b border-border">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Fiche contrat</div>
              <h1 className="text-xl font-semibold tracking-tight mt-0.5">
                {contract.civility ?? ""} {contract.firstName} {contract.lastName}
              </h1>
            </div>
            <div className="font-mono text-xs text-muted-foreground">N° {contract.id}</div>
          </div>
        </header>
        <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          <Cell label="Cotisation annuelle">
            <span className="text-base font-semibold">{formatAmount(contract.premium, currency)}</span>
          </Cell>
          <Cell label="Statut facturation">
            <span className="inline-flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${getBillingDotClass(contract.billingStatus, billingOptions)}`} />
              {contract.billingStatus}
            </span>
          </Cell>
          <Cell label="Partenaire">{contract.partner}</Cell>
          <Cell label="Assigné à">
            {agent ? (
              <Link to="/users/$username/edit" params={{ username: agent.username }} className="hover:underline">{agent.fullName}</Link>
            ) : <span className="text-muted-foreground">—</span>}
          </Cell>
        </dl>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 mt-6">
        {/* Sommaire */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 rounded-md border border-border bg-card p-3 text-sm">
            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground px-2 pb-2">Sommaire</div>
            {[
              ["adherent", "Adhérent"],
              ["conjoint", "Conjoint"],
              ["adresse", "Adresse"],
              ["contrat", "Contrat & cotisation"],
              ["produit", "Produit proposé"],
              ["mutuelle", "Mutuelle actuelle"],
              ["sepa", "Coordonnées SEPA"],
              ["actions", "Actions facturation"],
              ["parcours", "Parcours client"],
              ["commentaires", "Commentaires"],
              ["documents", "Pièces jointes"],
              ["custom", "Champs personnalisés"],
              ["activite", "Journal d'activité"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`}
                 className="block px-2 py-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50">
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Contenu fiche */}
        <div className="space-y-6 min-w-0">
          <Section id="adherent" title="Adhérent" subtitle="Coordonnées de l'adhérent principal">
            {linkedProspect && (
              <Row
                label="Prospect d'origine"
                value={
                  <Link
                    to="/prospects/$prospectId"
                    params={{ prospectId: linkedProspect.id }}
                    className="text-primary hover:underline font-mono text-xs"
                  >
                    {linkedProspect.id}
                  </Link>
                }
              />
            )}
            <Row label="Civilité" value={contract.civility} />
            <Row label="Nom" value={contract.lastName} />
            <Row label="Prénom" value={contract.firstName} />
            <Row label="Date de naissance" value={formatDate(contract.birthDate)} />
            <Row label="Téléphone fixe" value={contract.phone ?? linkedProspect?.phone} />
            <Row label="Téléphone mobile" value={contract.mobile} />
            <Row label="Email" value={contract.email ?? linkedProspect?.email} />
            <Row label="N° Sécurité sociale" value={contract.ssn} />
          </Section>

          <Section id="conjoint" title="Conjoint" subtitle="Optionnel — renseigné si applicable">
            <Row label="Civilité" value={contract.spouseCivility} />
            <Row label="Nom" value={contract.spouseLastName} />
            <Row label="Prénom" value={contract.spouseFirstName} />
            <Row label="Date de naissance" value={formatDate(contract.spouseBirthDate)} />
          </Section>

          <Section id="adresse" title="Adresse" subtitle="Adresse postale">
            <Row label="Adresse" value={contract.address} full />
            <Row label="Code postal" value={contract.postalCode} />
            <Row label="Ville" value={contract.city} />
            <Row label="Cabinet" value={contract.cabinet} />
          </Section>

          <Section id="contrat" title="Contrat & cotisation" subtitle="Données contractuelles">
            <Row label="Cotisation annuelle" value={formatAmount(contract.premium, currency)} />
            <Row label="Partenaire" value={contract.partner} />
            <Row label="Cabinet" value={contract.cabinet} />
            <Row label="Source" value={contract.source} />
            <Row label="Date de signature" value={formatDate(contract.signatureDate)} />
            <Row label="Date d'effet" value={formatDate(contract.effectiveDate)} />
            <Row label="Date de validation" value={formatDate(contract.validationDate)} />
            <Row label="Type de résiliation" value={contract.terminationType} />
            <Row label="Régime" value={contract.regime} />
            <Row label="Nombre d'enfants" value={contract.childrenCount != null ? String(contract.childrenCount) : null} />
            <Row label="Âges des enfants" value={contract.childrenAges} full />
            <Row label="Assigné à" value={contract.assignedTo} />
          </Section>

          <Section id="produit" title="Produit proposé" subtitle="Garanties principales et complémentaires">
            <Row label="Produit" value={contract.product} />
            <Row label="Options" value={contract.productOptions} full />
            <Row label="Produit complémentaire" value={contract.complementaryProduct} />
            <Row label="Cotisation complémentaire" value={contract.complementaryPremium != null ? formatAmount(contract.complementaryPremium, currency) : null} />
            <Row label="Date d'effet complémentaire" value={formatDate(contract.complementaryEffectiveDate)} />
          </Section>

          <Section id="mutuelle" title="Mutuelle actuelle" subtitle="Couverture en cours du client">
            <Row label="Organisme" value={contract.currentMutuelle} />
            <Row label="N° d'adhésion" value={contract.adhesionNumber} />
            <Row label="Membre principal" value={contract.principalMember} />
            <Row label="Cotisation actuelle" value={contract.previousPremium != null ? formatAmount(contract.previousPremium, currency) : null} />
            <Row label="Date d'échéance" value={formatDate(contract.currentExpiryDate)} />
          </Section>

          <Section id="sepa" title="Coordonnées SEPA" subtitle="Mandat de prélèvement">
            <Row label="Titulaire — Nom" value={contract.bankHolderLastName} />
            <Row label="Titulaire — Prénom" value={contract.bankHolderFirstName} />
            <Row label="IBAN" value={contract.iban ? <span className="font-mono text-xs">{contract.iban}</span> : null} full />
            <Row label="BIC" value={contract.bic ? <span className="font-mono text-xs">{contract.bic}</span> : null} />
            <Row label="Date de prélèvement" value={formatDate(contract.debitDate)} />
            <Row label="Type de prélèvement" value={contract.debitType} />
          </Section>

          <Section id="actions" title="Actions facturation" subtitle="Statut et cotisation">
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Statut de facturation</Label>
                <Select value={contract.billingStatus} onValueChange={handleStatusChange} disabled={isAgent}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {billingOptions.map((option) => (
                      <SelectItem key={option.id} value={option.value}>{option.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cotisation annuelle</Label>
                <div className="flex items-center gap-2">
                  <Input value={formatAmount(contract.premium, currency)} readOnly className="bg-muted/30" />
                  {!isAgent && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/contracts/$contractId/edit" params={{ contractId: contract.id }}>Éditer</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {!isAgent && (
              <div className="col-span-full flex flex-wrap gap-2 pt-3 border-t border-border">
                <Button size="sm" variant="outline" onClick={() => handleStatusChange("Validé Confirmation")}>Valider</Button>
                <Button size="sm" variant="outline" onClick={() => handleStatusChange("En attente de validation")}>Mettre en attente</Button>
                <Button size="sm" variant="outline" onClick={() => handleStatusChange("Annuler la confirmation")}>Annuler la confirmation</Button>
              </div>
            )}
          </Section>

          <Section id="parcours" title="Parcours client" subtitle="RDV, rappels et signature" plain>
            <ol className="relative border-l border-border ml-2 space-y-4">
              {timeline.map((t) => (
                <li key={t.id} className="ml-5">
                  <span className={`absolute -left-[5px] mt-1.5 h-2 w-2 rounded-full ${t.done ? "bg-foreground" : "bg-muted-foreground/40"}`} />
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h4 className="text-sm font-medium">{t.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(t.date) ?? "—"}{t.time ? ` • ${t.time}` : ""}
                    </span>
                    {!t.done && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">à venir</span>}
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                </li>
              ))}
            </ol>
          </Section>

          <Section id="commentaires" title="Commentaires" subtitle="Notes internes liées au contrat" plain>
            {contract.commercialComment && (
              <div className="mb-4 rounded-md border border-border bg-muted/30 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Commentaire commercial — saisi à la création</div>
                <p className="text-sm whitespace-pre-wrap">{contract.commercialComment}</p>
              </div>
            )}
            <CommentsThread contract={contract} />
          </Section>

          <Section id="documents" title="Pièces jointes" subtitle="Documents associés au contrat" plain>
            <AttachmentsCard
              entity="contract"
              entityId={contract.id}
              onAdded={(a) => logActivity(contract.id, "attachment_added", "", `${a.filename} (${(a.sizeBytes/1024).toFixed(1)} Ko)`)}
              onRemoved={(a) => logActivity(contract.id, "attachment_removed", `${a.filename} (${(a.sizeBytes/1024).toFixed(1)} Ko)`, "")}
            />
          </Section>

          <Section id="custom" title="Champs personnalisés" subtitle="Définis dans la configuration" plain>
            <CustomFieldsCard entity="contract" entityId={contract.id} />
          </Section>

          <Section id="activite" title="Journal d'activité" subtitle="Historique des changements" plain>
            <ActivityLogList entries={getContractActivity(contract.id)} />
          </Section>
        </div>
      </div>
    </AppLayout>
  );
}

/* ---------- helpers (présentation type fiche) ---------- */

function Section({
  id, title, subtitle, children, plain,
}: { id?: string; title: string; subtitle?: string; children: React.ReactNode; plain?: boolean }) {
  return (
    <section id={id} className="rounded-md border border-border bg-card scroll-mt-24">
      <header className="px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </header>
      <div className={plain ? "p-5" : "p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3"}>
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
      <dt className="text-xs text-muted-foreground min-w-[160px] shrink-0">{label}</dt>
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

function CommentsThread({ contract }: { contract: import("@/lib/types").Contract }) {
  const STORAGE_KEY = `erp_comments_${contract.id}`;
  const [list, setList] = useState<{ id: string; user: string; text: string; ts: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [draft, setDraft] = useState("");
  const { user } = useAuth();
  const save = (next: typeof list) => {
    setList(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    save([{ id: `c-${Date.now()}`, user: user?.username ?? "—", text: t, ts: new Date().toISOString() }, ...list]);
    setDraft("");
    toast.success("Commentaire ajouté");
  };
  const remove = (id: string) => save(list.filter((c) => c.id !== id));
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="Ajouter un commentaire interne…" />
        <Button onClick={add} className="self-end" size="sm">Ajouter</Button>
      </div>
      {list.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">Aucun commentaire pour le moment.</div>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((c) => (
            <li key={c.id} className="py-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">@{c.user}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(c.ts) ?? "—"}</span>
                </div>
                <p className="text-sm mt-0.5 whitespace-pre-wrap">{c.text}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => remove(c.id)} aria-label="Supprimer">
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActivityLogList({ entries }: { entries: import("@/lib/erpStore").ActivityEntry[] }) {
  const [fieldFilter, setFieldFilter] = useState<"all" | "billingStatus" | "premium" | "attachment_added" | "attachment_removed">("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fieldLabel = (f: string) =>
    f === "billingStatus" ? "Statut facturation"
      : f === "premium" ? "Cotisation"
      : f === "attachment_added" ? "Pièce jointe ajoutée"
      : f === "attachment_removed" ? "Pièce jointe supprimée"
      : f;
  const formatTs = (iso: string) => formatDateTime(iso) ?? "—";

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (fieldFilter !== "all" && e.field !== fieldFilter) return false;
      if (from && e.timestamp.slice(0, 10) < from) return false;
      if (to && e.timestamp.slice(0, 10) > to) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${e.previousValue} ${e.newValue} ${e.user}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, fieldFilter, from, to, search]);

  const exportRows = () =>
    filtered.map((e) => ({
      Date: formatTs(e.timestamp), Utilisateur: e.user, Champ: fieldLabel(e.field),
      "Ancienne valeur": e.previousValue, "Nouvelle valeur": e.newValue,
    }));

  const handleExportCSV = () => {
    if (filtered.length === 0) { toast.error("Aucune entrée à exporter"); return; }
    exportCSV(`activite-${new Date().toISOString().slice(0, 10)}.csv`, exportRows());
    toast.success("Journal exporté en CSV");
  };
  const handleExportXLSX = async () => {
    if (filtered.length === 0) { toast.error("Aucune entrée à exporter"); return; }
    await exportXLSX(`activite-${new Date().toISOString().slice(0, 10)}.xlsx`, exportRows(), "Activité");
    toast.success("Journal exporté en Excel");
  };
  const reset = () => { setFieldFilter("all"); setSearch(""); setFrom(""); setTo(""); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="md:col-span-2">
          <Input placeholder="Rechercher (valeur, utilisateur)…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-xs" />
        </div>
        <Select value={fieldFilter} onValueChange={(v) => setFieldFilter(v as typeof fieldFilter)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les champs</SelectItem>
            <SelectItem value="billingStatus">Statut facturation</SelectItem>
            <SelectItem value="premium">Cotisation</SelectItem>
            <SelectItem value="attachment_added">Pièces jointes — ajout</SelectItem>
            <SelectItem value="attachment_removed">Pièces jointes — suppression</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker value={from} onChange={setFrom} placeholder="Du" size="sm" />
        <div className="flex gap-1">
          <DatePicker value={to} onChange={setTo} placeholder="Au" size="sm" />
          {(fieldFilter !== "all" || search || from || to) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={reset} aria-label="Réinitialiser">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} / {entries.length} entrée(s)</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={entries.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1.5" />Exporter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}><FileSpreadsheet className="h-4 w-4 mr-2" />CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportXLSX}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel (.xlsx)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {entries.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">Aucune activité enregistrée.</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">Aucune entrée ne correspond aux filtres.</div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((e) => {
            const isAttach = e.field === "attachment_added" || e.field === "attachment_removed";
            return (
              <li key={e.id} className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium">{fieldLabel(e.field)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{formatTs(e.timestamp)}</span>
                </div>
                {isAttach ? (
                  <div className="mt-1 text-xs">{e.newValue || e.previousValue}</div>
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-muted-foreground line-through">{e.previousValue || "∅"}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{e.newValue}</span>
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground mt-1">par @{e.user}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
