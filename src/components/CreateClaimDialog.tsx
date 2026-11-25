import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MessageSquareWarning } from "lucide-react";
import { normalizePhone } from "@/lib/usePhoneInput";

const SERVICES = ["Technique", "Facturation", "Commercial", "Autre"] as const;
type Service = (typeof SERVICES)[number];

const PRIORITIES = [
  { value: "low", label: "Basse" },
  { value: "normal", label: "Normale" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
] as const;

export type CreateClaimDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId?: string | null;
  prospectId?: string | null;
  defaultClientName?: string | null;
  defaultPhone?: string | null;
  onSuccess?: () => void;
};

export function CreateClaimDialog({
  open,
  onOpenChange,
  contractId,
  prospectId,
  defaultClientName,
  defaultPhone,
  onSuccess,
}: CreateClaimDialogProps) {
  const [service, setService] = useState<Service>("Technique");
  const [priority, setPriority] = useState<string>("normal");
  const [clientName, setClientName] = useState(defaultClientName ?? "");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [description, setDescription] = useState("");
  const [remarques, setRemarques] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync defaults when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setClientName(defaultClientName ?? "");
      setPhone(defaultPhone ?? "");
      setDescription("");
      setRemarques("");
      setService("Technique");
      setPriority("normal");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !clientName.trim() && !contractId && !prospectId) {
      toast.error("Veuillez renseigner les détails de la réclamation");
      return;
    }

    setSaving(true);
    try {
      await api("/reclamations.php", {
        method: "POST",
        body: {
          contract_id: contractId || null,
          prospect_id: prospectId || null,
          client_name: clientName.trim() || null,
          gsm_client: phone.trim() || null,
          service,
          priority,
          audit_status: "en_cours",
          description: description.trim() || null,
          remarques: remarques.trim() || null,
        },
      });

      toast.success("Réclamation créée et enregistrée dans l'historique");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Échec de la création de la réclamation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-600">
                <MessageSquareWarning className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Nouvelle réclamation (Claim)</DialogTitle>
                <DialogDescription>
                  {contractId
                    ? `Associée au contrat ${contractId}`
                    : prospectId
                    ? `Associée au prospect ${prospectId}`
                    : "Créer un ticket de réclamation client"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-3 py-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Service</Label>
                <Select value={service} onValueChange={(v) => setService(v as Service)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Priorité</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Client</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nom du client"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Téléphone / Mobile</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  placeholder="9 chiffres sans 0 (ex: 612345678)"
                  className="h-9"
                  inputMode="numeric"
                  maxLength={9}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Objet / Description de la réclamation *</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails du problème, motif de réclamation…"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Remarques internes (optionnel)</Label>
              <Textarea
                rows={2}
                value={remarques}
                onChange={(e) => setRemarques(e.target.value)}
                placeholder="Consignes internes pour le traitement…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Créer la réclamation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
