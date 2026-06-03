import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api, API_ENABLED } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useErp } from "@/lib/erpStore";
import { toast } from "sonner";
import {
  ArrowLeft, MessageSquareWarning, Save, Trash2, Link2, User, FileText,
  Phone, Calendar, MapPin, AlertTriangle, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES = ["Technique", "Facturation", "Commercial", "Autre"] as const;
type Service = (typeof SERVICES)[number];
const AUDIT = ["en_cours", "resolu", "annule"] as const;
type Audit = (typeof AUDIT)[number];
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
type Priority = (typeof PRIORITIES)[number];

const AUDIT_LABEL: Record<Audit, string> = { en_cours: "En cours", resolu: "Résolu", annule: "Annulé" };
const AUDIT_CLASS: Record<Audit, string> = {
  en_cours: "bg-warning/15 text-warning-foreground border-warning/20",
  resolu: "bg-success/15 text-success border-success/20",
  annule: "bg-destructive/15 text-destructive border-destructive/20",
};
const PRIORITY_LABEL: Record<Priority, string> = { low: "Basse", normal: "Normale", high: "Haute", urgent: "Urgente" };
const PRIORITY_CLASS: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-info/15 text-info border-info/20",
  high: "bg-warning/15 text-warning-foreground border-warning/20",
  urgent: "bg-destructive/15 text-destructive border-destructive/20",
};

type Reclamation = {
  id: number;
  reference: string;
  prospect_id: string | null;
  contract_id: string | null;
  tel_adsl: string | null;
  ref_demand: string | null;
  cin_client: string | null;
  gsm_client: string | null;
  client_name: string | null;
  service: Service;
  description: string | null;
  statut_crm: string | null;
  statut_tt: string | null;
  audit_status: Audit;
  priority: Priority;
  localisation: string | null;
  etat: string | null;
  remarques: string | null;
  date_creation: string;
  date_resolution: string | null;
  assigned_to: string | null;
  created_by: string | null;
};

export const Route = createFileRoute("/reclamations/$id")({
  head: () => ({
    meta: [
      { title: "Détail réclamation — Protection ERP" },
      { name: "description", content: "Détail et suivi d'une réclamation client." },
    ],
  }),
  component: ReclamationDetailPage,
});

function ReclamationDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { prospects, contracts } = useErp();
  const canManage = user?.role === "Administrateur" || user?.role === "Manager";

  const [rec, setRec] = useState<Reclamation | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Reclamation>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!API_ENABLED) { setLoading(false); return; }
    setLoading(true);
    try {
      const r = await api<{ reclamation: Reclamation }>(`/reclamations.php?id=${id}`);
      setRec(r.reclamation);
      setForm(r.reclamation);
    } catch (e: any) {
      toast.error(e?.message || "Réclamation introuvable");
      navigate({ to: "/reclamations" });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const set = <K extends keyof Reclamation>(k: K, v: Reclamation[K] | null) =>
    setForm((f) => ({ ...f, [k]: v as any }));

  const save = async () => {
    if (!rec) return;
    setSaving(true);
    try {
      await api(`/reclamations.php?id=${rec.id}`, {
        method: "PATCH",
        body: {
          audit_status: form.audit_status,
          priority: form.priority,
          service: form.service,
          client_name: form.client_name,
          gsm_client: form.gsm_client,
          tel_adsl: form.tel_adsl,
          cin_client: form.cin_client,
          ref_demand: form.ref_demand,
          localisation: form.localisation,
          etat: form.etat,
          statut_crm: form.statut_crm,
          statut_tt: form.statut_tt,
          description: form.description,
          remarques: form.remarques,
          assigned_to: form.assigned_to,
        },
      });
      toast.success("Réclamation mise à jour");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Échec de la mise à jour");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!rec) return;
    if (!confirm(`Supprimer définitivement ${rec.reference} ?`)) return;
    try {
      await api(`/reclamations.php?id=${rec.id}`, { method: "DELETE" });
      toast.success("Réclamation supprimée");
      navigate({ to: "/reclamations" });
    } catch (e: any) { toast.error(e?.message || "Échec"); }
  };

  if (loading) {
    return (
      <AppLayout skeleton="form">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Chargement…
        </div>
      </AppLayout>
    );
  }
  if (!rec) return null;

  const linkedProspect = rec.prospect_id ? prospects.find((p) => p.id === rec.prospect_id) : null;
  const linkedContract = rec.contract_id ? contracts.find((c) => c.id === rec.contract_id) : null;

  return (
    <AppLayout>
      <PageHeader
        title={rec.reference}
        description={rec.client_name || "Réclamation client"}
        icon={<MessageSquareWarning className="h-5 w-5" />}
        eyebrow="Réclamations"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            {canManage && (
              <Button variant="ghost" size="sm" onClick={remove}>
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="ml-2 hidden sm:inline">Supprimer</span>
              </Button>
            )}
            <Button size="sm" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" />
              <span className="ml-2">{saving ? "Enregistrement…" : "Enregistrer"}</span>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge variant="outline" className={AUDIT_CLASS[rec.audit_status]}>{AUDIT_LABEL[rec.audit_status]}</Badge>
        <Badge variant="outline" className={PRIORITY_CLASS[rec.priority]}>{PRIORITY_LABEL[rec.priority]}</Badge>
        <Badge variant="outline">{rec.service}</Badge>
        {rec.priority === "urgent" && rec.audit_status !== "resolu" && (
          <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/20">
            <AlertTriangle className="h-3 w-3 mr-1" /> À traiter
          </Badge>
        )}
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-3">
        {/* Suivi */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Suivi</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Statut">
              <Select value={form.audit_status ?? "en_cours"} onValueChange={(v) => set("audit_status", v as Audit)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIT.map((a) => <SelectItem key={a} value={a}>{AUDIT_LABEL[a]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priorité">
              <Select value={form.priority ?? "normal"} onValueChange={(v) => set("priority", v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Service">
              <Select value={form.service ?? "Technique"} onValueChange={(v) => set("service", v as Service)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Statut CRM">
              <Input value={form.statut_crm ?? ""} onChange={(e) => set("statut_crm", e.target.value)} />
            </Field>
            <Field label="Statut TT">
              <Input value={form.statut_tt ?? ""} onChange={(e) => set("statut_tt", e.target.value)} />
            </Field>
            <Field label="État">
              <Input value={form.etat ?? ""} onChange={(e) => set("etat", e.target.value)} />
            </Field>
            <Field label="Assigné à">
              <Input value={form.assigned_to ?? ""} onChange={(e) => set("assigned_to", e.target.value)} placeholder="username" />
            </Field>
            <Field label="Localisation">
              <Input value={form.localisation ?? ""} onChange={(e) => set("localisation", e.target.value)} />
            </Field>
            <Field label="Réf. demande">
              <Input value={form.ref_demand ?? ""} onChange={(e) => set("ref_demand", e.target.value)} />
            </Field>
          </div>

          <Field label="Description">
            <Textarea rows={4} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Remarques internes">
            <Textarea rows={3} value={form.remarques ?? ""} onChange={(e) => set("remarques", e.target.value)} />
          </Field>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Client</h3>
            <Field label="Nom">
              <Input value={form.client_name ?? ""} onChange={(e) => set("client_name", e.target.value)} />
            </Field>
            <Field label="GSM">
              <Input value={form.gsm_client ?? ""} onChange={(e) => set("gsm_client", e.target.value)} />
            </Field>
            <Field label="Tél. fixe / ADSL">
              <Input value={form.tel_adsl ?? ""} onChange={(e) => set("tel_adsl", e.target.value)} />
            </Field>
            <Field label="CIN">
              <Input value={form.cin_client ?? ""} onChange={(e) => set("cin_client", e.target.value)} />
            </Field>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Liens</h3>
            {linkedProspect ? (
              <Link
                to="/prospects/$prospectId"
                params={{ prospectId: linkedProspect.id }}
                className="flex items-center gap-2 text-sm hover:text-primary transition-base"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Prospect : {linkedProspect.firstName} {linkedProspect.lastName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" /> Aucun prospect lié
              </div>
            )}
            {linkedContract ? (
              <Link
                to="/contracts/$contractId"
                params={{ contractId: linkedContract.id }}
                className="flex items-center gap-2 text-sm hover:text-primary transition-base"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Contrat : {linkedContract.firstName} {linkedContract.lastName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" /> Aucun contrat lié
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-2 text-sm">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Métadonnées</h3>
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Créée le" value={fmt(rec.date_creation)} />
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Résolue le" value={fmt(rec.date_resolution)} />
            <Row icon={<User className="h-3.5 w-3.5" />} label="Créée par" value={rec.created_by ?? "—"} />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground">{icon}{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function fmt(d: string | null): string {
  if (!d) return "—";
  try { return new Date(d.replace(" ", "T")).toLocaleString("fr-FR"); } catch { return d; }
}
