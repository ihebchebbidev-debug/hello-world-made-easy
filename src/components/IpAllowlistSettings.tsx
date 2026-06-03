import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Globe, Loader2, ShieldCheck, Info, Copy } from "lucide-react";
import { api } from "@/lib/api";

type IpConfig = {
  enabled: boolean;
  ranges: string[];
  bypassUsers: string[];
  bypassRoles: string[];
};

const EMPTY: IpConfig = { enabled: false, ranges: [], bypassUsers: [], bypassRoles: [] };
const ALL_ROLES = ["Manager", "Superviseur", "Backoffice", "Agent", "Vendeur", "Qualificateur"] as const; // Administrateur toujours exempté

/** Basic CIDR / IP validator (IPv4 + IPv6). */
function isValidRule(rule: string): boolean {
  const r = rule.trim();
  if (!r) return false;
  const [addr, bitsStr] = r.includes("/") ? r.split("/") : [r, null];
  if (bitsStr !== null) {
    const bits = Number(bitsStr);
    if (!Number.isInteger(bits) || bits < 0) return false;
    if (addr.includes(":") && bits > 128) return false;
    if (!addr.includes(":") && bits > 32) return false;
  }
  // crude shape check; backend does the real validation via inet_pton
  const v4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(addr);
  const v6 = /^[0-9a-fA-F:]+$/.test(addr) && addr.includes(":");
  return v4 || v6;
}

export function IpAllowlistSettings() {
  const [cfg, setCfg] = useState<IpConfig>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [myIp, setMyIp] = useState<string>("");
  const [newRange, setNewRange] = useState("");
  const [newBypass, setNewBypass] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ value: IpConfig | null }>("/settings.php", {
          query: { scope: "global", key: "ip_allowlist" },
        });
        if (r.value && typeof r.value === "object") {
          setCfg({
            enabled: !!r.value.enabled,
            ranges: Array.isArray(r.value.ranges) ? r.value.ranges : [],
            bypassUsers: Array.isArray(r.value.bypassUsers) ? r.value.bypassUsers : [],
            bypassRoles: Array.isArray((r.value as any).bypassRoles) ? (r.value as any).bypassRoles : [],
          });
        }
      } catch (e: any) {
        toast.error("Chargement de la liste IP impossible", { description: e?.message });
      } finally {
        setLoading(false);
      }
      // Best-effort detection of the admin's own public IP
      try {
        const r = await fetch("https://api.ipify.org?format=json");
        const j = await r.json();
        if (j?.ip) setMyIp(j.ip);
      } catch { /* ignore */ }
    })();
  }, []);

  const addRange = () => {
    const v = newRange.trim();
    if (!v) return;
    if (!isValidRule(v)) {
      toast.error("Format invalide", { description: "Utilisez une IP (1.2.3.4) ou un CIDR (1.2.3.0/24)." });
      return;
    }
    if (cfg.ranges.includes(v)) {
      toast.warning("Cette plage est déjà dans la liste");
      return;
    }
    setCfg({ ...cfg, ranges: [...cfg.ranges, v] });
    setNewRange("");
  };

  const removeRange = (r: string) => setCfg({ ...cfg, ranges: cfg.ranges.filter((x) => x !== r) });

  const addBypass = () => {
    const v = newBypass.trim();
    if (!v) return;
    if (cfg.bypassUsers.includes(v)) {
      toast.warning("Cet utilisateur est déjà exempté");
      return;
    }
    setCfg({ ...cfg, bypassUsers: [...cfg.bypassUsers, v] });
    setNewBypass("");
  };

  const removeBypass = (u: string) => setCfg({ ...cfg, bypassUsers: cfg.bypassUsers.filter((x) => x !== u) });

  const save = async () => {
    if (cfg.enabled && cfg.ranges.length === 0) {
      toast.error("Liste vide", { description: "Ajoutez au moins une plage avant d'activer la restriction." });
      return;
    }
    setSaving(true);
    try {
      await api("/settings.php", {
        method: "PUT",
        body: { scope: "global", key: "ip_allowlist", value: cfg },
      });
      toast.success("Restriction IP enregistrée", {
        description: cfg.enabled
          ? `${cfg.ranges.length} plage(s) autorisée(s). Les Administrateurs restent toujours autorisés.`
          : "La restriction est désactivée — accès libre.",
      });
    } catch (e: any) {
      toast.error("Enregistrement impossible", { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la configuration IP…
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Globe className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold">Restriction par adresse IP</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Limitez l'accès à l'application aux adresses IP ou plages CIDR autorisées.
            Les <strong>Administrateurs</strong> restent toujours autorisés (anti-blocage).
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4 mb-5">
        <div>
          <Label className="text-sm font-medium">Activer la restriction IP</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lorsqu'elle est active, toute requête venant d'une IP non listée est rejetée.
          </p>
        </div>
        <Switch checked={cfg.enabled} onCheckedChange={(v) => setCfg({ ...cfg, enabled: v })} />
      </div>

      {myIp && (
        <p className="mb-4 text-xs text-muted-foreground">
          Votre adresse IP publique actuelle :{" "}
          <button
            type="button"
            className="font-mono font-semibold text-foreground hover:underline"
            onClick={() => setNewRange(myIp)}
          >
            {myIp}
          </button>{" "}
          (cliquez pour la pré-remplir).
        </p>
      )}

      <div className="mb-5 rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Comment écrire une plage IP ou CIDR ?</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Une <strong>IP unique</strong> autorise une seule machine. Un <strong>bloc CIDR</strong>{" "}
          (<code className="font-mono">adresse/bits</code>) autorise une plage entière. Plus le
          nombre de bits est <strong>petit</strong>, plus la plage est <strong>large</strong>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1.5 pr-3 font-medium">Exemple</th>
                <th className="py-1.5 pr-3 font-medium">Couvre</th>
                <th className="py-1.5 font-medium">Quand l'utiliser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {[
                { ex: "41.226.10.5", cov: "1 adresse", use: "Un poste fixe ou un VPN avec IP dédiée" },
                { ex: "41.226.10.0/24", cov: "256 adresses (41.226.10.0 → .255)", use: "Un sous-réseau de bureau standard" },
                { ex: "197.0.0.0/16", cov: "65 536 adresses (197.0.x.x)", use: "Une large plage opérateur / pays" },
                { ex: "10.0.0.0/8", cov: "16,7 M d'adresses (10.x.x.x)", use: "Tout le réseau privé interne" },
                { ex: "2001:db8::/32", cov: "Plage IPv6", use: "Réseau IPv6 (rare)" },
              ].map((row) => (
                <tr key={row.ex} className="group">
                  <td className="py-1.5 pr-3">
                    <button
                      type="button"
                      onClick={() => { setNewRange(row.ex); toast.success("Exemple copié dans le champ"); }}
                      className="inline-flex items-center gap-1 rounded bg-background px-2 py-0.5 font-mono text-foreground border border-border hover:border-primary hover:text-primary transition-colors"
                      title="Cliquer pour pré-remplir"
                    >
                      {row.ex}
                      <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    </button>
                  </td>
                  <td className="py-1.5 pr-3 text-muted-foreground">{row.cov}</td>
                  <td className="py-1.5 text-muted-foreground">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground list-disc list-inside">
          <li>Le format est <code className="font-mono">a.b.c.d</code> ou <code className="font-mono">a.b.c.d/bits</code> (bits entre 0 et 32 pour IPv4).</li>
          <li>Évitez <code className="font-mono">0.0.0.0/0</code> qui autoriserait <strong>tout Internet</strong>.</li>
          <li>En cas de doute, ajoutez votre IP actuelle (bouton ci-dessus) avant d'activer la restriction.</li>
        </ul>
      </div>

      <div className="space-y-3 mb-6">
        <Label>Plages autorisées (IP ou CIDR)</Label>
        <div className="flex gap-2">
          <Input
            value={newRange}
            onChange={(e) => setNewRange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRange(); } }}
            placeholder="Ex : 41.226.10.5 ou 197.0.0.0/16"
          />
          <Button type="button" onClick={addRange}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
        </div>
        {cfg.ranges.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Aucune plage configurée.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cfg.ranges.map((r) => (
              <Badge key={r} variant="secondary" className="font-mono pr-1">
                {r}
                <button
                  type="button"
                  onClick={() => removeRange(r)}
                  className="ml-1.5 rounded p-0.5 hover:bg-destructive/20 hover:text-destructive"
                  aria-label={`Supprimer ${r}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <Label>Rôles exemptés (en plus des Administrateurs)</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Cochez les rôles qui pourront accéder à l'application depuis n'importe quelle IP.
          Le rôle <strong>Administrateur</strong> est toujours exempté.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_ROLES.map((r) => {
            const active = cfg.bypassRoles.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setCfg({
                    ...cfg,
                    bypassRoles: active
                      ? cfg.bypassRoles.filter((x) => x !== r)
                      : [...cfg.bypassRoles, r],
                  })
                }
                className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <Label>Utilisateurs exemptés (cas par cas)</Label>
        </div>
        <div className="flex gap-2">
          <Input
            value={newBypass}
            onChange={(e) => setNewBypass(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBypass(); } }}
            placeholder="nom.utilisateur"
          />
          <Button type="button" variant="outline" onClick={addBypass}><Plus className="h-4 w-4 mr-1" />Exempter</Button>
        </div>
        {cfg.bypassUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cfg.bypassUsers.map((u) => (
              <Badge key={u} variant="outline" className="pr-1">
                {u}
                <button
                  type="button"
                  onClick={() => removeBypass(u)}
                  className="ml-1.5 rounded p-0.5 hover:bg-destructive/20 hover:text-destructive"
                  aria-label={`Retirer ${u}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </Card>
  );
}
