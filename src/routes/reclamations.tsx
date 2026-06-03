import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { api, API_ENABLED } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useErp } from "@/lib/erpStore";
import { toast } from "sonner";
import {
  MessageSquareWarning, Plus, RefreshCw, Search, Eye, Trash2,
  Check, ChevronsUpDown, Link2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES = ["Technique", "Facturation", "Commercial", "Autre"] as const;
type Service = (typeof SERVICES)[number];

const AUDIT = ["en_cours", "resolu", "annule"] as const;
type Audit = (typeof AUDIT)[number];

const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
type Priority = (typeof PRIORITIES)[number];

const AUDIT_LABEL: Record<Audit, string> = {
  en_cours: "En cours",
  resolu: "Résolu",
  annule: "Annulé",
};
const AUDIT_CLASS: Record<Audit, string> = {
  en_cours: "bg-warning/15 text-warning-foreground border-warning/20",
  resolu: "bg-success/15 text-success border-success/20",
  annule: "bg-destructive/15 text-destructive border-destructive/20",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};
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

const ALL = "__all__";

export const Route = createFileRoute("/reclamations")({
  head: () => ({
    meta: [
      { title: "Réclamations — Protection ERP" },
      { name: "description", content: "Gestion des réclamations clients reliées aux prospects et contrats." },
    ],
  }),
  component: ReclamationsRoute,
});

function ReclamationsRoute() {
  const isListRoute = useRouterState({ select: (s) => s.location.pathname === "/reclamations" });
  return isListRoute ? <ReclamationsPage /> : <Outlet />;
}

function ReclamationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { prospects, contracts } = useErp();
  const canManage = user?.role === "Administrateur" || user?.role === "Manager";

  const [items, setItems] = useState<Reclamation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [service, setService] = useState<Service | typeof ALL>(ALL);
  const [audit, setAudit] = useState<Audit | typeof ALL>(ALL);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Reclamation | null>(null);

  const load = async () => {
    if (!API_ENABLED) return;
    setLoading(true);
    try {
      const r = await api<{ reclamations: Reclamation[]; total: number }>("/reclamations.php", {
        query: {
          q: q || undefined,
          service: service === ALL ? undefined : service,
          audit_status: audit === ALL ? undefined : audit,
          limit: 200,
        },
      });
      setItems(r.reclamations ?? []);
      setTotal(r.total ?? 0);
    } catch (e: any) {
      toast.error(e?.message || "Échec du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [service, audit]);

  const stats = useMemo(() => {
    const total = items.length;
    const enc = items.filter((r) => r.audit_status === "en_cours").length;
    const res = items.filter((r) => r.audit_status === "resolu").length;
    const urg = items.filter((r) => r.priority === "urgent" && r.audit_status !== "resolu").length;
    return { total, enc, res, urg };
  }, [items]);

  const prospectMap = useMemo(() => new Map(prospects.map((p) => [p.id, p])), [prospects]);
  const contractMap = useMemo(() => new Map(contracts.map((c) => [c.id, c])), [contracts]);

  return (
    <AppLayout skeleton="table">
      <PageHeader
        title="Réclamations"
        description="Suivez les réclamations clients, reliez-les à un prospect ou un contrat, et résolvez-les rapidement."
        icon={<MessageSquareWarning className="h-5 w-5" />}
        eyebrow="Service client"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              <span className="hidden sm:inline ml-2">Actualiser</span>
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">Nouvelle réclamation</span>
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <KPI label="Total" value={total || stats.total} tone="default" />
        <KPI label="En cours" value={stats.enc} tone="warning" />
        <KPI label="Résolus" value={stats.res} tone="success" />
        <KPI label="Urgentes ouvertes" value={stats.urg} tone="destructive" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      {/* Filters */}
      <Card className="mt-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Référence, client, téléphone, description…"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(); }}
            />
          </div>
          <Select value={service} onValueChange={(v) => setService(v as any)}>
            <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous services</SelectItem>
              {SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={audit} onValueChange={(v) => setAudit(v as any)}>
            <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tous statuts</SelectItem>
              {AUDIT.map((a) => <SelectItem key={a} value={a}>{AUDIT_LABEL[a]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load}>Filtrer</Button>
        </div>
      </Card>

      {/* List */}
      <Card className="mt-4 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Lien</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créée</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                  Aucune réclamation pour ces filtres.
                </TableCell>
              </TableRow>
            )}
            {items.map((r) => {
              const p = r.prospect_id ? prospectMap.get(r.prospect_id) : null;
              const c = r.contract_id ? contractMap.get(r.contract_id) : null;
              return (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate({ to: "/reclamations/$id", params: { id: String(r.id) } })}>
                  <TableCell className="font-mono text-xs">{r.reference}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.client_name || (p ? `${p.firstName} ${p.lastName}` : c ? `${c.firstName} ${c.lastName}` : "—")}</div>
                    <div className="text-xs text-muted-foreground">{r.gsm_client || r.tel_adsl || ""}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{r.service}</Badge></TableCell>
                  <TableCell className="text-xs">
                    {p && <div className="flex items-center gap-1 text-muted-foreground"><Link2 className="h-3 w-3" />Prospect: {p.firstName} {p.lastName}</div>}
                    {c && <div className="flex items-center gap-1 text-muted-foreground"><Link2 className="h-3 w-3" />Contrat: {c.firstName} {c.lastName}</div>}
                    {!p && !c && <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={PRIORITY_CLASS[r.priority]}>{PRIORITY_LABEL[r.priority]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={AUDIT_CLASS[r.audit_status]}>{AUDIT_LABEL[r.audit_status]}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(r.date_creation)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button asChild variant="ghost" size="icon"><Link to="/reclamations/$id" params={{ id: String(r.id) }}><Eye className="h-4 w-4" /></Link></Button>
                    {canManage && (
                      <Button variant="ghost" size="icon" onClick={async () => {
                        if (!confirm(`Supprimer ${r.reference} ?`)) return;
                        try {
                          await api(`/reclamations.php?id=${r.id}`, { method: "DELETE" });
                          toast.success("Réclamation supprimée");
                          load();
                        } catch (e: any) { toast.error(e?.message || "Échec"); }
                      }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <ReclamationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => { setCreateOpen(false); load(); }}
      />
      <ReclamationDetail
        rec={detail}
        onOpenChange={(v) => !v && setDetail(null)}
        onSaved={() => { setDetail(null); load(); }}
        canManage={canManage}
      />
    </AppLayout>
  );
}

function KPI({ label, value, tone, icon }: { label: string; value: number; tone: "default" | "warning" | "success" | "destructive"; icon?: React.ReactNode }) {
  const toneCls: Record<string, string> = {
    default: "from-primary/10 to-primary/5 text-primary border-primary/15",
    warning: "from-warning/10 to-warning/5 text-warning-foreground border-warning/20",
    success: "from-success/10 to-success/5 text-success border-success/20",
    destructive: "from-destructive/10 to-destructive/5 text-destructive border-destructive/20",
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br border", toneCls[tone])}>
          {icon ?? <MessageSquareWarning className="h-4 w-4" />}
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------------------------------- create / edit dialog */

function ReclamationDialog({
  open, onOpenChange, onSaved, initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  initial?: Partial<Reclamation>;
}) {
  const { prospects, contracts } = useErp();
  const [form, setForm] = useState<Partial<Reclamation>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ?? { service: "Technique", audit_status: "en_cours", priority: "normal" });
    }
  }, [open, initial]);

  const set = <K extends keyof Reclamation>(k: K, v: Reclamation[K] | null) =>
    setForm((f) => ({ ...f, [k]: v as any }));

  const submit = async () => {
    if (!form.client_name && !form.tel_adsl && !form.gsm_client && !form.prospect_id && !form.contract_id) {
      toast.error("Renseignez un client, un téléphone, ou liez à un prospect/contrat");
      return;
    }
    setSaving(true);
    try {
      await api("/reclamations.php", { method: "POST", body: form });
      toast.success("Réclamation créée");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Échec de la création");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvelle réclamation</DialogTitle>
          <DialogDescription>Reliez la réclamation à un prospect ou un contrat existant.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="md:col-span-2 grid md:grid-cols-2 gap-3">
            <EntityPicker
              label="Prospect lié"
              value={form.prospect_id ?? null}
              onChange={(id) => {
                set("prospect_id", id);
                const p = prospects.find((x) => x.id === id);
                if (p && !form.client_name) set("client_name", `${p.firstName} ${p.lastName}`);
                if (p && !form.gsm_client) set("gsm_client", p.phone);
              }}
              options={prospects.map((p) => ({ id: p.id, label: `${p.firstName} ${p.lastName}`, sub: p.phone || p.email }))}
              placeholder="Aucun prospect"
            />
            <EntityPicker
              label="Contrat lié"
              value={form.contract_id ?? null}
              onChange={(id) => {
                set("contract_id", id);
                const c = contracts.find((x) => x.id === id);
                if (c && !form.client_name) set("client_name", `${c.firstName} ${c.lastName}`);
              }}
              options={contracts.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}`, sub: c.partner }))}
              placeholder="Aucun contrat"
            />
          </div>

          <Field label="Nom du client">
            <Input value={form.client_name ?? ""} onChange={(e) => set("client_name", e.target.value)} />
          </Field>
          <Field label="Service">
            <Select value={form.service ?? "Technique"} onValueChange={(v) => set("service", v as Service)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="GSM client">
            <Input value={form.gsm_client ?? ""} onChange={(e) => set("gsm_client", e.target.value)} />
          </Field>
          <Field label="Tél. fixe / ADSL">
            <Input value={form.tel_adsl ?? ""} onChange={(e) => set("tel_adsl", e.target.value)} />
          </Field>
          <Field label="CIN client">
            <Input value={form.cin_client ?? ""} onChange={(e) => set("cin_client", e.target.value)} />
          </Field>
          <Field label="Référence demande">
            <Input value={form.ref_demand ?? ""} onChange={(e) => set("ref_demand", e.target.value)} />
          </Field>
          <Field label="Priorité">
            <Select value={form.priority ?? "normal"} onValueChange={(v) => set("priority", v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Statut">
            <Select value={form.audit_status ?? "en_cours"} onValueChange={(v) => set("audit_status", v as Audit)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AUDIT.map((a) => <SelectItem key={a} value={a}>{AUDIT_LABEL[a]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Localisation">
            <Input value={form.localisation ?? ""} onChange={(e) => set("localisation", e.target.value)} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea rows={3} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Remarques internes" className="md:col-span-2">
            <Textarea rows={2} value={form.remarques ?? ""} onChange={(e) => set("remarques", e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Création…" : "Créer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReclamationDetail({
  rec, onOpenChange, onSaved, canManage,
}: {
  rec: Reclamation | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  canManage: boolean;
}) {
  const { prospects, contracts } = useErp();
  const [audit, setAudit] = useState<Audit>("en_cours");
  const [priority, setPriority] = useState<Priority>("normal");
  const [remarques, setRemarques] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rec) {
      setAudit(rec.audit_status);
      setPriority(rec.priority);
      setRemarques(rec.remarques ?? "");
    }
  }, [rec]);

  if (!rec) return null;
  const p = rec.prospect_id ? prospects.find((x) => x.id === rec.prospect_id) : null;
  const c = rec.contract_id ? contracts.find((x) => x.id === rec.contract_id) : null;

  const save = async () => {
    setSaving(true);
    try {
      await api(`/reclamations.php?id=${rec.id}`, {
        method: "PATCH",
        body: { audit_status: audit, priority, remarques },
      });
      toast.success("Mise à jour enregistrée");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Échec de la mise à jour");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={!!rec} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{rec.reference}</span>
            <Badge variant="outline" className={AUDIT_CLASS[rec.audit_status]}>{AUDIT_LABEL[rec.audit_status]}</Badge>
            <Badge variant="outline" className={PRIORITY_CLASS[rec.priority]}>{PRIORITY_LABEL[rec.priority]}</Badge>
          </DialogTitle>
          <DialogDescription>{rec.service} · créée le {formatDate(rec.date_creation)} par {rec.created_by ?? "—"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Client" value={rec.client_name} />
            <Info label="GSM" value={rec.gsm_client} />
            <Info label="Tél. fixe" value={rec.tel_adsl} />
            <Info label="CIN" value={rec.cin_client} />
            <Info label="Réf. demande" value={rec.ref_demand} />
            <Info label="Localisation" value={rec.localisation} />
          </div>

          {(p || c) && (
            <Card className="p-3 bg-muted/30">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Liens</div>
              {p && <div className="text-sm flex items-center gap-2"><Link2 className="h-3 w-3" />Prospect — {p.firstName} {p.lastName} ({p.phone})</div>}
              {c && <div className="text-sm flex items-center gap-2"><Link2 className="h-3 w-3" />Contrat — {c.firstName} {c.lastName} · {c.partner}</div>}
            </Card>
          )}

          {rec.description && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap">{rec.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Statut">
              <Select value={audit} onValueChange={(v) => setAudit(v as Audit)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIT.map((a) => <SelectItem key={a} value={a}>{AUDIT_LABEL[a]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priorité">
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Remarques internes">
            <Textarea rows={3} value={remarques} onChange={(e) => setRemarques(e.target.value)} />
          </Field>

          {rec.date_resolution && (
            <div className="text-xs text-muted-foreground">Résolue le {formatDate(rec.date_resolution)}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fermer</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------- small helpers UI */

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function EntityPicker({
  label, value, onChange, options, placeholder,
}: {
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
  options: { id: string; label: string; sub?: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
            <span className="truncate">{selected ? selected.label : placeholder}</span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
          <Command>
            <CommandInput placeholder="Rechercher…" />
            <CommandList>
              <CommandEmpty>Aucun résultat</CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={() => { onChange(null); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", !value ? "opacity-100" : "opacity-0")} />
                  <span className="text-muted-foreground">{placeholder}</span>
                </CommandItem>
                {options.slice(0, 200).map((o) => (
                  <CommandItem key={o.id} value={`${o.label} ${o.sub ?? ""} ${o.id}`} onSelect={() => { onChange(o.id); setOpen(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", value === o.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                      <span>{o.label}</span>
                      {o.sub && <span className="text-xs text-muted-foreground">{o.sub}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
