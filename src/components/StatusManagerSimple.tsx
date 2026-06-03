import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import {
  useStatusOptions,
  refreshStatusOptions,
  type StatusEntity,
  type StatusOption,
} from "@/lib/useStatusOptions";

/**
 * Simple status manager — add / rename / reorder / delete.
 * No color picker: every new status gets a neutral color server-side.
 * Used dynamically in every status Select across the app via useStatusOptions.
 */
export function StatusManagerSimple({ entity }: { entity: StatusEntity }) {
  const confirmDialog = useConfirm();
  const { options, refresh } = useStatusOptions(entity);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const v = value.trim();
    if (!v) { toast.error("Nom requis"); return; }
    setBusy(true);
    try {
      await api("/status_options.php", {
        method: "POST",
        body: { entity, value: v, color: "muted", position: options.length + 1 },
      });
      setValue("");
      await refresh();
      toast.success("Statut ajouté");
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
    finally { setBusy(false); }
  };

  const rename = async (opt: StatusOption, next: string) => {
    const v = next.trim();
    if (!v || v === opt.value) return;
    try {
      await api("/status_options.php", { method: "PATCH", body: { id: opt.id, value: v } });
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); refresh(); }
  };

  const remove = async (opt: StatusOption) => {
    const ok = await confirmDialog({
      title: `Supprimer "${opt.value}" ?`,
      description: "Si ce statut est utilisé, la suppression sera bloquée. Renommez les enregistrements concernés d'abord.",
      destructive: true,
    });
    if (!ok) return;
    try {
      await api(`/status_options.php?id=${encodeURIComponent(opt.id)}`, { method: "DELETE" });
      await refresh();
      await refreshStatusOptions();
      toast.success("Statut supprimé");
    } catch (e: any) { toast.error(e?.message ?? "Suppression impossible"); }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= options.length) return;
    const arr = options.slice();
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    try {
      await Promise.all(arr.map((o, i) =>
        api("/status_options.php", { method: "PATCH", body: { id: o.id, position: i + 1 } }),
      ));
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); refresh(); }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="py-4 grid sm:grid-cols-[1fr_auto] gap-2 items-end">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nouveau statut — ex: En négociation"
            onKeyDown={(e) => { if (e.key === "Enter") create(); }}
          />
          <Button onClick={create} disabled={busy}>
            <Plus className="h-4 w-4 mr-1.5" /> Ajouter
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        {options.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aucun statut configuré
          </CardContent></Card>
        ) : options.map((o, i) => (
          <Card key={o.id}>
            <CardContent className="py-2.5 flex items-center gap-2">
              <Badge variant="outline" className="w-8 justify-center text-xs">{i + 1}</Badge>
              <Input
                defaultValue={o.value}
                className="h-9 flex-1"
                onBlur={(e) => rename(o, e.target.value)}
              />
              <div className="flex gap-0.5">
                <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === options.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(o)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
