import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Loader2, History, RefreshCw, User2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export type ProspectActivityEntry = {
  id: string;
  entityType: string;
  entityId: string;
  field: string;
  previousValue: string;
  newValue: string;
  user: string;
  timestamp: string;
};

const FIELD_LABELS: Record<string, string> = {
  created: "Création",
  claim: "Réclamation du lead",
  assignedTo: "Agent assigné",
  status: "Statut d'appel",
  outcome: "Résultat",
  lostReason: "Motif de perte",
  mark_won: "Marqué Vente",
  comment: "Commentaire",
  checkValeur: "Check valeur",
  city: "Ville",
  phone: "Téléphone",
  mobile: "Mobile",
  email: "Email",
  source: "Source",
  civility: "Civilité",
  lastName: "Nom",
  firstName: "Prénom",
  age: "Âge",
  spouseAge: "Âge conjoint",
  currentMutuelle: "Mutuelle actuelle",
  cotisation: "Cotisation",
  address: "Adresse",
  postalCode: "Code postal",
  demande: "Demande",
  delete: "Suppression",
  rdv_created: "RDV / Rappel créé",
  rdv_cancelled: "RDV / Rappel annulé",
  rdv_date: "Date du RDV",
  rdv_time: "Heure du RDV",
  rdv_agent: "Agent du RDV",
  rdv_type: "Type d'événement",
  rdv_title: "Titre du RDV",
};

function fieldLabel(f: string) {
  return FIELD_LABELS[f] ?? f;
}

function fieldTone(f: string): string {
  if (f === "created" || f === "mark_won" || f === "claim" || f === "rdv_created") return "bg-success";
  if (f === "delete" || f === "lostReason" || f === "outcome" || f === "rdv_cancelled") return "bg-destructive";
  if (f === "assignedTo" || f === "status" || f.startsWith("rdv_")) return "bg-info";
  return "bg-primary/70";
}

export function ProspectActivityCard({ prospectId }: { prospectId: string }) {
  const [entries, setEntries] = useState<ProspectActivityEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api<{ activity: ProspectActivityEntry[] }>("/activity.php", {
        query: { entity: "prospect", entity_id: prospectId, limit: "500" },
      });
      setEntries(r.activity ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectId]);

  const fieldsPresent = useMemo(() => {
    const set = new Set<string>();
    (entries ?? []).forEach((e) => set.add(e.field));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return (entries ?? []).filter((e) => {
      if (fieldFilter !== "all" && e.field !== fieldFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${e.previousValue} ${e.newValue} ${e.user} ${fieldLabel(e.field)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, fieldFilter, search]);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Historique complet</h3>
          {entries && (
            <span className="text-xs text-muted-foreground">
              · {filtered.length}/{entries.length} entrée(s)
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="h-7">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4 py-3 border-b bg-muted/30">
        <div className="md:col-span-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (utilisateur, valeur, champ)…"
            className="h-8 text-xs"
          />
        </div>
        <Select value={fieldFilter} onValueChange={setFieldFilter}>
          <SelectTrigger className="h-8 text-xs">
            <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les champs</SelectItem>
            {fieldsPresent.map((f) => (
              <SelectItem key={f} value={f}>{fieldLabel(f)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-4">
        {loading && !entries ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement de l'historique…
          </div>
        ) : error ? (
          <div className="text-sm text-destructive py-4 text-center">{error}</div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Aucune activité enregistrée pour cette fiche.
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Aucune entrée ne correspond à ces filtres.
          </div>
        ) : (
          <ol className="relative border-s border-border ms-2 space-y-4">
            {filtered.map((e) => (
              <li key={e.id} className="ms-4">
                <span
                  className={`absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full ring-4 ring-background ${fieldTone(e.field)}`}
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium">{fieldLabel(e.field)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(e.timestamp) ?? e.timestamp}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <User2 className="h-3 w-3" />
                  <span className="font-mono">{e.user || "—"}</span>
                </div>
                {(e.previousValue || e.newValue) && (
                  <div className="mt-1.5 text-xs">
                    {e.previousValue ? (
                      <span className="line-through text-muted-foreground/80">
                        {e.previousValue}
                      </span>
                    ) : null}
                    {e.previousValue && e.newValue ? (
                      <span className="mx-1.5 text-muted-foreground">→</span>
                    ) : null}
                    {e.newValue ? (
                      <span className="font-medium text-foreground">{e.newValue}</span>
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
