import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

type FieldDef = {
  id: string;
  entity: string;
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "boolean" | "select";
  options: string[];
  required: boolean;
  position: number;
};

type Entity = "prospect" | "contract" | "user";

export function CustomFieldsCard({ entity, entityId }: { entity: Entity; entityId: string }) {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [defs, vals] = await Promise.all([
          api<{ fields: FieldDef[] }>("/custom_fields.php", { query: { entity } }),
          api<{ values: Record<string, string> }>("/custom_field_values.php", { query: { entity, entity_id: entityId } }),
        ]);
        if (cancel) return;
        setFields((defs.fields ?? []).slice().sort((a, b) => a.position - b.position));
        setValues(vals.values ?? {});
      } catch (e: any) {
        if (!cancel) toast.error(e?.message ?? "Impossible de charger les champs personnalisés");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [entity, entityId]);

  const setValue = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    // required-field guard
    for (const f of fields) {
      if (f.required && !String(values[f.key] ?? "").trim()) {
        toast.error(`${f.label} est requis`);
        return;
      }
    }
    setSaving(true);
    try {
      await api("/custom_field_values.php", {
        method: "POST",
        body: { entity, entity_id: entityId, values },
      });
      toast.success("Champs enregistrés");
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" /> Champs personnalisés
        </CardTitle>
        <CardDescription>Champs configurés pour cette entité.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : fields.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            Aucun champ personnalisé n'a été configuré pour cette entité. Un administrateur peut en ajouter depuis la configuration.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map((f) => {
                const v = values[f.key] ?? "";
                return (
                  <div key={f.id} className={f.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
                    <Label>
                      {f.label}
                      {f.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {f.type === "textarea" ? (
                      <Textarea value={v} onChange={(e) => setValue(f.key, e.target.value)} rows={3} />
                    ) : f.type === "number" ? (
                      <Input type="number" value={v} onChange={(e) => setValue(f.key, e.target.value)} />
                    ) : f.type === "date" ? (
                      <DatePicker value={v} onChange={(val) => setValue(f.key, val)} />
                    ) : f.type === "boolean" ? (
                      <div className="flex items-center h-10">
                        <Switch checked={v === "1" || v === "true"} onCheckedChange={(c) => setValue(f.key, c ? "1" : "0")} />
                      </div>
                    ) : f.type === "select" ? (
                      <Select value={v} onValueChange={(val) => setValue(f.key, val)}>
                        <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                        <SelectContent>
                          {(f.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={v} onChange={(e) => setValue(f.key, e.target.value)} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-1">
              <Button size="sm" onClick={save} disabled={saving}>
                <Save className="h-4 w-4 mr-1.5" /> {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}