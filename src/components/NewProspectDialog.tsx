import { isAssignableRole } from "@/lib/permissions";
import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { useOptionList } from "@/lib/useOptionList";
import { useStatusOptions } from "@/lib/useStatusOptions";
import { toast } from "sonner";
import { CustomFieldsInline, validateRequiredCustomValues } from "./CustomFieldsInline";

export function NewProspectDialog() {
  const { importProspects, users, saveEvent } = useErp();
  const { user } = useAuth();
  const SOURCES = useOptionList("prospect", "source").values;
  const STATUSES = useStatusOptions("prospect").values;
  const role = user?.role;
  const canDispatch = role === "Administrateur" || role === "Manager";
  const isQualifier = role === "Qualificateur";
  const QUALIFIER_STATUSES = ["RDV planifié", "RDV à chaud"];
  const effectiveStatuses = isQualifier ? QUALIFIER_STATUSES : STATUSES;
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [civility, setCivility] = useState<"M" | "Mme">("M");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [status, setStatus] = useState(effectiveStatuses[0]);
  const [assignedTo, setAssignedTo] = useState<string>(user?.username ?? "__none__");
  const [sendToDispatch, setSendToDispatch] = useState<boolean>(false);
  const [comment, setComment] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  // Reminder / RDV fields — only used when status is RDV or "A recontacter"
  const [reminderDate, setReminderDate] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("09:00");

  const agents = users.filter((u) => isAssignableRole(u.role));
  const needsSchedule = status.startsWith("RDV") || status.startsWith("A recontacter");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !needsSchedule) return;
    if (!reminderDate) setReminderDate(new Date().toISOString().slice(0, 10));
    const t = setTimeout(() => {
      const el = dateInputRef.current;
      if (!el) return;
      el.focus();
      const anyEl = el as HTMLInputElement & { showPicker?: () => void };
      try { anyEl.showPicker?.(); } catch { /* unsupported */ }
    }, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSchedule, open]);

  const reset = () => {
    setLastName(""); setFirstName(""); setPhone(""); setEmail("");
    setCity(""); setComment("");
    setAssignedTo(user?.username ?? "__none__");
    setSendToDispatch(false);
    setCivility("M"); setSource(SOURCES[0]); setStatus(effectiveStatuses[0]);
    setCustomValues({});
    setReminderDate(""); setReminderTime("09:00");
  };

  const submit = async () => {
    if (!lastName.trim() || !firstName.trim()) {
      toast.error("Nom et prénom obligatoires");
      return;
    }
    const missing = await validateRequiredCustomValues("prospect", customValues);
    if (missing) { toast.error(`${missing} est requis`); return; }
    setSaving(true);
    try {
      // Default behavior: keep the lead in the creator's portfolio.
      // Manager/Admin can opt-in to send it to the dispatch queue, or pick another agent.
      const finalAssignee =
        sendToDispatch
          ? null
          : assignedTo === "__none__"
            ? (user?.username ?? null)
            : assignedTo;

      const newProspectId = `P-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const r = await importProspects([{
        id: newProspectId,
        civility, lastName: lastName.trim(), firstName: firstName.trim(),
        phone: phone.trim(), email: email.trim(),
        city: city.trim().toUpperCase(), source, status,
        assignedTo: finalAssignee,
        createdAt: new Date().toISOString().slice(0, 10),
        comment: comment.trim() || undefined,
        customValues,
      } as any]);

      if (r.added + r.updated > 0) {
        // If the user picked RDV/Rappel and a date, create the calendar event in one go.
        if (needsSchedule && reminderDate) {
          try {
            await saveEvent({
              title: `${status.startsWith("RDV") ? "RDV" : "Rappel"} — ${firstName.trim()} ${lastName.trim()}`,
              date: reminderDate,
              time: reminderTime || "09:00",
              type: status.startsWith("RDV") ? "rdv" : "rappel",
              agent: finalAssignee ?? user?.username ?? "system",
              prospectId: newProspectId,
            });
          } catch (e) {
            // Non-fatal: the prospect was still created.
            console.warn("Failed to create reminder event", e);
          }
        }
        toast.success(
          sendToDispatch
            ? "Prospect envoyé en file de dispatch"
            : "Prospect créé dans votre portefeuille",
        );
        reset();
        setOpen(false);
      } else {
        toast.error("Création impossible");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Nouveau prospect</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Nouveau prospect</DialogTitle>
          <DialogDescription>Renseignez les informations du lead.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-6 py-2 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <Label>Civilité</Label>
            <Select value={civility} onValueChange={(v) => setCivility(v as "M" | "Mme")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="Mme">Mme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ville</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="PARIS" />
          </div>
          <div className="space-y-1.5">
            <Label>Nom *</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="DUPONT" />
          </div>
          <div className="space-y-1.5">
            <Label>Prénom *</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marie" />
          </div>
          <div className="space-y-1.5">
            <Label>Téléphone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0601020304" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marie@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Statut</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{effectiveStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {needsSchedule && (
            <div className="col-span-2 grid grid-cols-2 gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="col-span-2 text-xs font-medium text-primary">
                {status.startsWith("RDV") ? "Planifier le rendez-vous" : "Planifier le rappel"} (ajouté au calendrier)
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input ref={dateInputRef} type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Heure</Label>
                <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
              </div>
            </div>
          )}

          {canDispatch && (
            <div className="col-span-2 space-y-2 rounded-lg border bg-muted/30 p-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={sendToDispatch} onCheckedChange={(v) => setSendToDispatch(!!v)} />
                <span>Envoyer en file de dispatch (au lieu de l'attribuer maintenant)</span>
              </label>
              {!sendToDispatch && (
                <div className="space-y-1.5">
                  <Label>Assigné à</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {user?.username && (
                        <SelectItem value={user.username}>Moi (@{user.username})</SelectItem>
                      )}
                      {agents
                        .filter((a) => a.username !== user?.username)
                        .map((a) => (
                          <SelectItem key={a.username} value={a.username}>
                            {a.fullName} (@{a.username})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 col-span-2">
            <Label>Commentaire</Label>
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Notes…" />
          </div>
          <CustomFieldsInline entity="prospect" values={customValues} onChange={setCustomValues} />
        </div>
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Création…" : "Créer le prospect"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
