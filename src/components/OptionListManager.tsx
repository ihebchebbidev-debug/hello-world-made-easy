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
  useOptionList, refreshOptionList,
  type OptionEntity, type OptionItem,
} from "@/lib/useOptionList";

/**
 * Generic admin manager for a single option list (entity, field).
 * Used inside the /options admin page; mirrors StatusManagerSimple.
 */
export function OptionListManager({
  entity,
  field,
  readOnly = false,
  canDelete = false,
}: {
  entity: OptionEntity;
  field: string;
  readOnly?: boolean;
  canDelete?: boolean;
}) {
  const confirmDialog = useConfirm();
  const { options, refresh } = useOptionList(entity, field);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const v = value.trim();
    if (!v) { toast.error("Valeur requise"); return; }
    setBusy(true);
    try {
      await api("/option_lists.php", {
        method: "POST",
        body: { entity, field, value: v, position: options.length + 1 },
      });
      setValue("");
      await refresh();
      toast.success("Option ajoutée");
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
    finally { setBusy(false); }
  };

  const rename = async (opt: OptionItem, next: string) => {
    const v = next.trim();
    if (!v || v === opt.value) return;
    try {
      await api("/option_lists.php", { method: "PATCH", body: { id: opt.id, value: v } });
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); refresh(); }
  };

  const remove = async (opt: OptionItem) => {
    const ok = await confirmDialog({
      title: `Supprimer "${opt.value}" ?`,
      description: "Si cette option est utilisée, la suppression sera bloquée.",
      destructive: true,
    });
    if (!ok) return;
    try {
      await api(`/option_lists.php?id=${encodeURIComponent(opt.id)}`, { method: "DELETE" });
      await refresh();
      await refreshOptionList(entity, field);
      toast.success("Option supprimée");
    } catch (e: any) { toast.error(e?.message ?? "Suppression impossible"); }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const swap = idx + dir;
    if (swap < 0 || swap >= options.length) return;
    const arr = options.slice();
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    try {
      await Promise.all(arr.map((o, i) =>
        api("/option_lists.php", { method: "PATCH", body: { id: o.id, position: i + 1 } }),
      ));
      await refresh();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); refresh(); }
  };

  return (
    <div className="space-y-3">
      {!readOnly && <Card>
        <CardContent className="py-4 grid sm:grid-cols-[1fr_auto] gap-2 items-end">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nouvelle option…"
            onKeyDown={(e) => { if (e.key === "Enter") create(); }}
          />
          <Button onClick={create} disabled={busy}>
            <Plus className="h-4 w-4 mr-1.5" /> Ajouter
          </Button>
        </CardContent>
      </Card>}

      <div className="space-y-1.5">
        {options.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucune option configurée
          </CardContent></Card>
        ) : options.map((o, i) => (
          <Card key={o.id}>
            <CardContent className="py-2.5 flex items-center gap-2">
              <Badge variant="outline" className="w-8 justify-center text-xs">{i + 1}</Badge>
              <Input
                defaultValue={o.value}
                className="h-9 flex-1"
                readOnly={readOnly}
                onBlur={(e) => rename(o, e.target.value)}
              />
              {!readOnly && <div className="flex gap-0.5">
                <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === options.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>}
              {canDelete && (
                <Button size="sm" variant="ghost" onClick={() => remove(o)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
