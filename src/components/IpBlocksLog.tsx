import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RefreshCw, Trash2, Loader2, ShieldX } from "lucide-react";
import { api } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";

type Block = {
  id: number;
  ip: string;
  username: string | null;
  role: string | null;
  path: string | null;
  userAgent: string | null;
  attemptedAt: string;
};

type Stats = { total: number; last24h: number; uniqueIps7d: number };

function relTime(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + (iso.endsWith("Z") ? "" : "Z"));
  const diff = Math.max(0, Date.now() - d.getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  return `il y a ${j} j`;
}

export function IpBlocksLog() {
  const confirm = useConfirm();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [list, st] = await Promise.all([
        api<{ blocks: Block[] }>("/ip_blocks.php", { query: { limit: 200 } }),
        api<Stats>("/ip_blocks.php", { query: { stats: 1 } }),
      ]);
      setBlocks(list.blocks ?? []);
      setStats({ total: st.total ?? 0, last24h: st.last24h ?? 0, uniqueIps7d: st.uniqueIps7d ?? 0 });
    } catch (e: any) {
      toast.error("Journal indisponible", { description: e?.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const purgeAll = async () => {
    const ok = await confirm({
      title: "Vider le journal ?",
      description: `Supprimer ${blocks.length} entrée(s) de tentatives bloquées. Cette action est irréversible.`,
      confirmLabel: "Vider", destructive: true,
    });
    if (!ok) return;
    try {
      await api("/ip_blocks.php", { method: "DELETE", query: { all: 1 } });
      toast.success("Journal vidé");
      load();
    } catch (e: any) {
      toast.error("Suppression impossible", { description: e?.message });
    }
  };

  const removeOne = async (id: number) => {
    try {
      await api("/ip_blocks.php", { method: "DELETE", query: { id } });
      setBlocks((bs) => bs.filter((b) => b.id !== id));
    } catch (e: any) {
      toast.error("Suppression impossible", { description: e?.message });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
          <History className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold">Tentatives d'accès bloquées</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Journal des requêtes refusées par la restriction IP (30 derniers jours, max 200 lignes).
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button size="sm" variant="outline" onClick={purgeAll} disabled={blocks.length === 0}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Vider
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="24 dernières heures" value={stats.last24h} accent />
          <StatCard label="IPs uniques (7 j)" value={stats.uniqueIps7d} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement du journal…
        </div>
      ) : blocks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          <ShieldX className="h-6 w-6 mx-auto mb-2 text-muted-foreground/60" />
          Aucune tentative bloquée enregistrée.
        </div>
      ) : (
        <ScrollArea className="h-[420px] rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/60 backdrop-blur text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Date</th>
                <th className="text-left px-3 py-2 font-medium">IP</th>
                <th className="text-left px-3 py-2 font-medium">Utilisateur</th>
                <th className="text-left px-3 py-2 font-medium">Endpoint</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="font-medium">{relTime(b.attemptedAt)}</div>
                    <div className="text-[11px] text-muted-foreground">{b.attemptedAt}</div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{b.ip}</td>
                  <td className="px-3 py-2">
                    {b.username ? (
                      <>
                        <div>{b.username}</div>
                        {b.role && <Badge variant="outline" className="mt-0.5 text-[10px]">{b.role}</Badge>}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">non authentifié</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground truncate max-w-[200px]" title={b.path ?? ""}>
                    {b.path ?? "—"}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOne(b.id)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
    </Card>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${accent ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-0.5 ${accent ? "text-destructive" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
