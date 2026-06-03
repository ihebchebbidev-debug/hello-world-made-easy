import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { ShieldCheck, Search, Crown, UserCog, Headphones, Wrench, Eye, Briefcase, UserCheck, Tv } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, API_ENABLED } from "@/lib/api";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Rôles — Protection ERP" },
      { name: "description", content: "Gestion fine des permissions par rôle." },
    ],
  }),
  component: RolesPage,
});

const sections = [
  {
    title: "Modules",
    perms: [
      { key: "dashboard", label: "Tableau de bord" },
      { key: "backoffice", label: "Backoffice" },
      { key: "users", label: "Utilisateur" },
      { key: "calendar", label: "Calendrier" },
      { key: "prospect", label: "Prospect" },
      { key: "contract", label: "Contrat" },
      { key: "role", label: "Rôle" },
      { key: "dispatch", label: "Dispatch" },
      { key: "tasks", label: "Tâches" },
      { key: "notifications", label: "Notifications" },
      { key: "emails", label: "Emails" },
      { key: "stages", label: "Étapes" },
      { key: "objectives", label: "Objectifs" },
      { key: "reports", label: "Rapports" },
      { key: "reconciliation", label: "Rapprochement" },
      { key: "configuration", label: "Configuration" },
      { key: "documentation", label: "Documentation" },
    ],
  },
  {
    title: "Options Prospects",
    perms: [
      { key: "prospect.edit", label: "Editer Prospect" },
      { key: "prospect.source", label: "Modifier Source Prospect" },
      { key: "prospect.status", label: "Modifier Statut Appel" },
      { key: "prospect.assign", label: "Modifier Assigné À Prospect" },
      { key: "prospect.add", label: "Ajouter Prospect" },
      { key: "prospect.delete", label: "Supprimer Prospect" },
    ],
  },
  {
    title: "Options Contrats",
    perms: [
      { key: "contract.edit", label: "Editer Contrat" },
      { key: "contract.validate", label: "Valider Contrat" },
      { key: "contract.cancel", label: "Annuler Contrat" },
      { key: "contract.export", label: "Exporter Contrats" },
    ],
  },
];

const roles = [
  { name: "Administrateur", icon: Crown, color: "from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)]", desc: "Accès complet" },
  { name: "Manager", icon: UserCog, color: "from-[oklch(0.78_0.15_70)] to-[oklch(0.72_0.16_180)]", desc: "Pilotage d'équipe" },
  { name: "Superviseur", icon: Eye, color: "from-[oklch(0.72_0.16_180)] to-[oklch(0.68_0.16_220)]", desc: "Supervision & lecture" },
  { name: "Agent", icon: Headphones, color: "from-[oklch(0.72_0.16_180)] to-[oklch(0.78_0.16_140)]", desc: "Gestion des leads" },
  { name: "Vendeur", icon: Briefcase, color: "from-[oklch(0.78_0.16_140)] to-[oklch(0.74_0.17_100)]", desc: "Closing & contrats" },
  { name: "Qualificateur", icon: UserCheck, color: "from-[oklch(0.74_0.17_100)] to-[oklch(0.78_0.15_70)]", desc: "Qualification leads" },
  { name: "Backoffice", icon: Wrench, color: "from-[oklch(0.78_0.13_70)] to-[oklch(0.72_0.16_30)]", desc: "Validation contrats" },
  { name: "Présentation", icon: Tv, color: "from-[oklch(0.55_0.16_265)] to-[oklch(0.65_0.18_295)]", desc: "Affichage TV — dashboard" },
];

const ALL_PERMS = sections.flatMap((s) => s.perms.map((p) => p.key));

// Defaults par rôle. Tout le monde voit le dashboard ; l'Agent voit en plus
// Prospects + Contrats + Calendrier + Notifications + Tâches en lecture, mais
// SANS les sous-permissions d'édition (contract.edit, contract.validate, etc.).
const AGENT_DEFAULT_MODULES = new Set([
  "dashboard", "prospect", "contract", "calendar", "notifications", "tasks", "emails",
]);
const AGENT_DEFAULT_OPTIONS = new Set([
  // Un Agent peut désormais créer, éditer et faire évoluer ses prospects de bout en bout.
  "prospect.add",
  "prospect.edit",
  "prospect.status",
  "prospect.source",
  "prospect.assign",
]);
const MANAGER_DEFAULT_OFF = new Set(["configuration", "documentation"]);
const BACKOFFICE_DEFAULT_ON = new Set([
  "dashboard", "contract", "contract.edit", "contract.validate", "contract.cancel",
  "contract.export", "reconciliation", "notifications", "tasks",
]);

// Superviseur : lecture étendue, pas d'admin (users / role / configuration).
const SUPERVISEUR_DEFAULT_OFF = new Set([
  "users", "role", "configuration", "documentation", "backoffice",
  "contract.validate", "contract.cancel", "prospect.delete",
]);

// Vendeur : prospects + contrats complets (sans validation/annulation), pas d'admin.
const VENDEUR_DEFAULT_ON = new Set([
  "dashboard", "prospect", "contract", "calendar", "notifications",
  "tasks", "emails",
  "prospect.add", "prospect.edit", "prospect.status", "prospect.source", "prospect.assign",
  "contract.edit", "contract.export",
]);

// Qualificateur : qualifie les leads — prospects uniquement, pas de contrats.
const QUALIFICATEUR_DEFAULT_ON = new Set([
  "dashboard", "prospect", "calendar", "notifications", "tasks", "emails",
  "prospect.add", "prospect.edit", "prospect.status", "prospect.source", "prospect.assign",
]);

// Présentation : strictement le dashboard, rien d'autre (mode affichage TV).
const PRESENTATION_DEFAULT_ON = new Set(["dashboard"]);

function defaultFor(roleName: string, key: string): boolean {
  if (roleName === "Administrateur") return true;
  if (roleName === "Manager") return !MANAGER_DEFAULT_OFF.has(key);
  if (roleName === "Superviseur") return !SUPERVISEUR_DEFAULT_OFF.has(key);
  if (roleName === "Agent") return AGENT_DEFAULT_MODULES.has(key) || AGENT_DEFAULT_OPTIONS.has(key);
  if (roleName === "Vendeur") return VENDEUR_DEFAULT_ON.has(key);
  if (roleName === "Qualificateur") return QUALIFICATEUR_DEFAULT_ON.has(key);
  if (roleName === "Backoffice") return BACKOFFICE_DEFAULT_ON.has(key);
  if (roleName === "Présentation") return PRESENTATION_DEFAULT_ON.has(key);
  return false;
}

function RolesPage() {
  const [role, setRole] = useState("Administrateur");
  const [search, setSearch] = useState("");
  const [permsByRole, setPermsByRole] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {};
    roles.forEach((r) => {
      init[r.name] = {};
      ALL_PERMS.forEach((k) => (init[r.name][k] = defaultFor(r.name, k)));
    });
    return init;
  });
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    setLoading(true);
    api<{ permissions: Record<string, Record<string, boolean>> }>("/roles.php")
      .then((res) => {
        if (cancelled) return;
        setPermsByRole((prev) => {
          const next = { ...prev };
          for (const r of roles) {
            const incoming = res.permissions?.[r.name] ?? {};
            next[r.name] = Object.fromEntries(
              ALL_PERMS.map((k) => [k, incoming[k] ?? defaultFor(r.name, k)]),
            );
          }
          return next;
        });
        setDirty({});
      })
      .catch((e: any) => toast.error(e?.message ?? "Échec du chargement des permissions"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const perms = permsByRole[role];
  const markDirty = () => setDirty((d) => ({ ...d, [role]: true }));

  const toggle = (k: string) => {
    setPermsByRole((prev) => ({
      ...prev,
      [role]: { ...prev[role], [k]: !prev[role][k] },
    }));
    markDirty();
  };

  const setSection = (sectionPerms: string[], value: boolean) => {
    setPermsByRole((prev) => {
      const next = { ...prev[role] };
      sectionPerms.forEach((k) => (next[k] = value));
      return { ...prev, [role]: next };
    });
    markDirty();
    toast.success(value ? "Section activée" : "Section désactivée");
  };

  const save = async () => {
    if (!API_ENABLED) { toast.error("API non configurée"); return; }
    setSaving(true);
    try {
      await api("/roles.php", { method: "PUT", body: { role, permissions: perms } });
      setDirty((d) => ({ ...d, [role]: false }));
      toast.success(`Permissions enregistrées pour ${role}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setPermsByRole((prev) => ({
      ...prev,
      [role]: Object.fromEntries(ALL_PERMS.map((k) => [k, defaultFor(role, k)])),
    }));
    markDirty();
    toast.success(`Permissions de ${role} réinitialisées`);
  };

  const totalActive = useMemo(
    () => Object.values(perms).filter(Boolean).length,
    [perms],
  );

  return (
    <AppLayout skeleton="form">
      <PageHeader
        title="Rôles & Permissions"
        description={`${totalActive} / ${ALL_PERMS.length} permissions actives pour ${role}${loading ? " (chargement…)" : ""}`}
        icon={<ShieldCheck className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={resetDefaults} disabled={loading || saving}>
              Réinitialiser
            </Button>
            <Button size="sm" onClick={save} disabled={saving || loading || !dirty[role]}>
              {saving ? "Enregistrement…" : dirty[role] ? "Enregistrer" : "Enregistré"}
            </Button>
          </>
        }
      />

      {/* Role picker as cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {roles.map((r) => {
          const active = role === r.name;
          const count = Object.values(permsByRole[r.name]).filter(Boolean).length;
          return (
            <button
              key={r.name}
              onClick={() => setRole(r.name)}
              className={`text-left rounded-xl border p-4 transition-base ${
                active
                  ? "border-primary bg-primary/5 shadow-elegant ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${r.color} text-white flex items-center justify-center shadow-sm`}>
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{r.desc}</div>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{count}</span> / {ALL_PERMS.length} permissions
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <Card className="mt-4 p-3 shadow-elegant flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une permission…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPermsByRole((prev) => ({ ...prev, [role]: Object.fromEntries(ALL_PERMS.map((k) => [k, true])) }));
              markDirty();
              toast.success("Toutes les permissions activées");
            }}
          >
            Tout activer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPermsByRole((prev) => ({ ...prev, [role]: Object.fromEntries(ALL_PERMS.map((k) => [k, false])) }));
              markDirty();
              toast.success("Toutes les permissions désactivées");
            }}
          >
            Tout désactiver
          </Button>
        </div>
      </Card>

      {/* Sections */}
      <div className="space-y-4 mt-4">
        {sections.map((s) => {
          const visible = s.perms.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()));
          if (visible.length === 0) return null;
          const sectionKeys = s.perms.map((p) => p.key);
          const allOn = sectionKeys.every((k) => perms[k]);
          const noneOn = sectionKeys.every((k) => !perms[k]);
          const activeInSection = sectionKeys.filter((k) => perms[k]).length;
          return (
            <Card key={s.title} className="shadow-elegant overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {activeInSection} / {sectionKeys.length} actives
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setSection(sectionKeys, !allOn)}
                    disabled={allOn ? false : noneOn ? false : false}
                  >
                    {allOn ? "Tout désactiver" : "Tout activer"}
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {visible.map((p) => (
                  <label
                    key={p.key}
                    className="px-4 py-3 flex items-center justify-between hover:bg-muted/20 cursor-pointer"
                  >
                    <span className="text-sm font-medium">{p.label}</span>
                    <Switch checked={perms[p.key] ?? false} onCheckedChange={() => toggle(p.key)} />
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
