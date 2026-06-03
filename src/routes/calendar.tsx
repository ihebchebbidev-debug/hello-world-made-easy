import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, Trash2, Check, ChevronsUpDown, X, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { CalEvent, Prospect } from "@/lib/types";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendrier — Protection ERP" },
      { name: "description", content: "Calendrier des rendez-vous, rappels et signatures." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    prospectId: typeof s.prospectId === "string" ? s.prospectId : undefined,
    newEvent: s.newEvent === "1" || s.newEvent === 1 || s.newEvent === true ? "1" : undefined,
    date: typeof s.date === "string" ? s.date : undefined,
  }),
  component: CalendarPage,
});

function ProspectPicker({
  prospects,
  value,
  onChange,
}: {
  prospects: Prospect[];
  value: Prospect | null;
  onChange: (p: Prospect | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? prospects.filter((p) =>
          `${p.firstName} ${p.lastName} ${p.phone ?? ""} ${p.mobile ?? ""} ${p.city ?? ""}`
            .toLowerCase()
            .includes(q),
        )
      : prospects;
    return base.slice(0, 50);
  }, [prospects, query]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("flex-1 justify-between font-normal", !value && "text-muted-foreground")}
          >
            <span className="inline-flex items-center gap-2 truncate">
              <User className="h-3.5 w-3.5 opacity-60" />
              {value
                ? `${value.firstName} ${value.lastName}${value.city ? ` — ${value.city}` : ""}`
                : "Aucun prospect lié"}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Rechercher un prospect…"
            />
            <CommandList>
              <CommandEmpty>Aucun prospect trouvé</CommandEmpty>
              <CommandGroup>
                {filtered.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.id}
                    onSelect={() => {
                      onChange(p);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === p.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{p.firstName} {p.lastName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {p.id}{p.city ? ` • ${p.city}` : ""}{p.phone ? ` • ${p.phone}` : ""}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          title="Délier le prospect"
          onClick={() => onChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

const monthName = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const dayShort = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const dayLong = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];

const typeColor: Record<string, string> = {
  rdv: "bg-info/15 text-info border-l-2 border-info",
  rappel: "bg-warning/15 text-warning-foreground border-l-2 border-warning",
  signature: "bg-success/15 text-success border-l-2 border-success",
};
const typeLabel: Record<string, string> = { rdv: "Rendez-vous", rappel: "Rappel", signature: "Signature" };

type ViewMode = "mois" | "semaine" | "jour";

function pad(n: number) { return String(n).padStart(2, "0"); }
function ymd(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function startOfWeek(d: Date) {
  const x = new Date(d);
  const offset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - offset);
  x.setHours(0, 0, 0, 0);
  return x;
}
function frDate(d: Date) { return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`; }

function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState<ViewMode>("mois");
  const search = Route.useSearch();
  const initialCursor = search.date
    ? (() => { const [y, m, d] = search.date!.split("-").map(Number); return new Date(y, (m ?? 1) - 1, d ?? 1); })()
    : new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [cursor, setCursor] = useState(initialCursor);
  const { events, saveEvent, deleteEvent, prospects } = useErp();
  const navigate = useNavigate();
  const openProspect = (id: string) => navigate({ to: "/prospects/$prospectId", params: { prospectId: id } });

  // Deep-link: open the New Event dialog prefilled from ?prospectId=&newEvent=1
  const prefillProspect = useMemo(
    () => (search.prospectId ? prospects.find((p) => p.id === search.prospectId) ?? null : null),
    [prospects, search.prospectId],
  );
  const [autoOpenKey, setAutoOpenKey] = useState(0);
  const consumedRef = useRef<string | null>(null);
  useEffect(() => {
    if (search.newEvent === "1" && consumedRef.current !== search.prospectId) {
      consumedRef.current = search.prospectId ?? "__noprospect__";
      setAutoOpenKey((k) => k + 1);
    }
  }, [search.newEvent, search.prospectId]);

  // Strip the deep-link query so a refresh / back-nav doesn't re-open the dialog.
  const clearDeepLink = () => {
    if (search.newEvent || search.prospectId || search.date) {
      navigate({ to: "/calendar", search: {}, replace: true });
    }
  };

  // Normalize: lowercase, strip accents, collapse whitespace, drop punctuation.
  const norm = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const tokenSet = (s: string) => new Set(norm(s).split(" ").filter(Boolean));

  // Index prospects by normalized name (both orders) AND by token-set key
  // so order-insensitive matches work too.
  const prospectIndex = useMemo(() => {
    const exact = new Map<string, string>();
    const tokens: { id: string; tokens: Set<string> }[] = [];
    for (const p of prospects) {
      const fn = (p.firstName ?? "").trim();
      const ln = (p.lastName ?? "").trim();
      const full = norm(`${fn} ${ln}`);
      const rev = norm(`${ln} ${fn}`);
      if (full && !exact.has(full)) exact.set(full, p.id);
      if (rev && !exact.has(rev)) exact.set(rev, p.id);
      const sorted = [...new Set([...full.split(" "), ...rev.split(" ")].filter(Boolean))].sort().join(" ");
      if (sorted && !exact.has(sorted)) exact.set(sorted, p.id);
      tokens.push({ id: p.id, tokens: new Set([fn, ln].map(norm).filter(Boolean)) });
    }
    return { exact, tokens };
  }, [prospects]);

  const resolveEventProspect = (e: CalEvent): string | null => {
    if (e.prospectId) return e.prospectId;
    const t = (e.title || "").trim();
    if (!t) return null;

    // Build candidate substrings: whole title and the tail after the first
    // common separator (em-dash, en-dash, hyphen, colon, pipe).
    const candidates = new Set<string>([t]);
    for (const sep of [" — ", " – ", " - ", " : ", " | ", "—", "–", ":", "|"]) {
      const idx = t.indexOf(sep);
      if (idx >= 0) candidates.add(t.slice(idx + sep.length));
    }

    // 1) Exact normalized match (handles accents, spacing, order).
    for (const c of candidates) {
      const hit = prospectIndex.exact.get(norm(c));
      if (hit) return hit;
    }

    // 2) Token-set match: a prospect's first+last tokens must all appear in
    //    the candidate's tokens. Pick the match with the most tokens covered;
    //    a single isolated common token (e.g. only the first name) doesn't win.
    let best: { id: string; score: number } | null = null;
    for (const c of candidates) {
      const cTokens = tokenSet(c);
      if (!cTokens.size) continue;
      for (const { id, tokens } of prospectIndex.tokens) {
        if (!tokens.size) continue;
        let covered = 0;
        for (const t of tokens) if (cTokens.has(t)) covered++;
        // Require all prospect tokens to be present AND at least 2 tokens
        // (avoid matching a lone common first name like "Marie").
        if (covered === tokens.size && covered >= 2) {
          if (!best || covered > best.score) best = { id, score: covered };
        }
      }
    }
    return best?.id ?? null;
  };
  const openEventProspect = (e: CalEvent) => {
    const id = resolveEventProspect(e);
    if (id) openProspect(id);
    else toast.info("Aucun prospect lié à cet événement");
  };

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.time.localeCompare(b.time));
    return map;
  }, [events]);
  const eventsFor = (d: Date) => eventsByDay.get(ymd(d)) ?? [];

  function navigateCal(direction: -1 | 1) {
    const d = new Date(cursor);
    if (view === "mois") d.setMonth(d.getMonth() + direction);
    else if (view === "semaine") d.setDate(d.getDate() + direction * 7);
    else d.setDate(d.getDate() + direction);
    setCursor(d);
  }

  const headerLabel = useMemo(() => {
    if (view === "mois") return `${monthName[cursor.getMonth()]} ${cursor.getFullYear()}`;
    if (view === "semaine") {
      const s = startOfWeek(cursor);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return `Semaine du ${frDate(s)} au ${frDate(e)}`;
    }
    return `${dayLong[(cursor.getDay() + 6) % 7]} ${frDate(cursor)}`;
  }, [view, cursor]);

  const navLabel = view === "mois" ? "mois" : view === "semaine" ? "semaine" : "jour";

  return (
    <AppLayout skeleton="list">
      <PageHeader
        title="Calendrier"
        description={`${events.length} événement(s) — Rendez-vous, rappels et signatures`}
        icon={<CalendarDays className="h-5 w-5" />}
        actions={
          <NewEventDialog
            defaultDate={ymd(cursor)}
            onSave={saveEvent}
            autoOpenKey={autoOpenKey}
            prefillProspect={prefillProspect}
            onClosed={clearDeepLink}
          />
        }
      />

      <Card className="mt-6 shadow-elegant overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateCal(-1)} aria-label={`${navLabel} précédent`}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), today.getDate()))}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateCal(1)} aria-label={`${navLabel} suivant`}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-base sm:text-lg font-semibold capitalize">{headerLabel}</h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden md:flex gap-1 text-xs">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" />RDV</span>
              <span className="inline-flex items-center gap-1.5 ml-2"><span className="h-2 w-2 rounded-full bg-warning" />Rappel</span>
              <span className="inline-flex items-center gap-1.5 ml-2"><span className="h-2 w-2 rounded-full bg-success" />Signature</span>
            </div>
            <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
              {(["mois","semaine","jour"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${
                    view === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "mois" && <MonthView cursor={cursor} today={today} eventsFor={eventsFor} onDelete={deleteEvent} onPickDay={(d) => { setCursor(d); setView("jour"); }} onOpenProspect={openEventProspect} />}
        {view === "semaine" && <WeekView cursor={cursor} today={today} eventsFor={eventsFor} onDelete={deleteEvent} onPickDay={(d) => { setCursor(d); setView("jour"); }} onOpenProspect={openEventProspect} />}
        {view === "jour" && <DayView cursor={cursor} eventsFor={eventsFor} onDelete={deleteEvent} onSave={saveEvent} onOpenProspect={openEventProspect} />}
      </Card>
    </AppLayout>
  );
}

function NewEventDialog({
  defaultDate,
  onSave,
  autoOpenKey,
  prefillProspect,
  onClosed,
}: {
  defaultDate: string;
  onSave: (e: Partial<CalEvent>) => Promise<void> | void;
  autoOpenKey?: number;
  prefillProspect?: Prospect | null;
  onClosed?: () => void;
}) {
  const auth = useAuth();
  const me = auth.user?.username ?? "";
  const { prospects } = useErp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState<CalEvent["type"]>("rdv");
  const [agent, setAgent] = useState(me);
  const [linkedProspectId, setLinkedProspectId] = useState<string | undefined>(undefined);

  const linkedProspect = useMemo(
    () => (linkedProspectId ? prospects.find((p) => p.id === linkedProspectId) ?? null : null),
    [prospects, linkedProspectId],
  );

  const applyProspect = (p: Prospect | null) => {
    if (p) {
      setLinkedProspectId(p.id);
      setTitle(`${type === "rappel" ? "Rappel" : type === "signature" ? "Signature" : "RDV"} — ${p.firstName} ${p.lastName}`);
      if (p.assignedTo) setAgent(p.assignedTo);
    } else {
      setLinkedProspectId(undefined);
    }
  };

  // Open prefilled from a deep link (e.g. from the prospects list/detail page).
  useEffect(() => {
    if (!autoOpenKey) return;
    if (prefillProspect) {
      setTitle(`RDV — ${prefillProspect.firstName} ${prefillProspect.lastName}`);
      setLinkedProspectId(prefillProspect.id);
      if (prefillProspect.assignedTo) setAgent(prefillProspect.assignedTo);
    }
    setType("rdv");
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenKey]);

  const submit = async () => {
    if (!title.trim()) { toast.error("Titre requis"); return; }
    try {
      await onSave({ title: title.trim(), date, time, type, agent, prospectId: linkedProspectId });
      toast.success("Événement ajouté");
      setOpen(false);
      setTitle(""); setTime("09:00"); setType("rdv"); setLinkedProspectId(undefined);
      onClosed?.();
    } catch (e) {
      toast.error("Échec", { description: e instanceof Error ? e.message : "" });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) onClosed?.();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-1.5" />Nouvel événement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel événement</DialogTitle>
          <DialogDescription>Planifiez un RDV, rappel ou signature.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Prospect lié <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
            <ProspectPicker
              prospects={prospects}
              value={linkedProspect}
              onChange={applyProspect}
            />
          </div>
          <div className="space-y-1.5"><Label>Titre</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: RDV M. Dupont" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Date</Label><DatePicker value={date} onChange={setDate} /></div>
            <div className="space-y-1.5"><Label>Heure</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CalEvent["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rdv">Rendez-vous</SelectItem>
                  <SelectItem value="rappel">Rappel</SelectItem>
                  <SelectItem value="signature">Signature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Agent</Label><Input value={agent} onChange={(e) => setAgent(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MonthView({ cursor, today, eventsFor, onDelete, onPickDay, onOpenProspect }: { cursor: Date; today: Date; eventsFor: (d: Date) => CalEvent[]; onDelete: (id: string) => void | Promise<void>; onPickDay: (d: Date) => void; onOpenProspect: (e: CalEvent) => void }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  return (
    <>
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {dayShort.map((d) => (
          <div key={d} className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const isToday = d && ymd(d) === ymd(today);
          const events = d ? eventsFor(d) : [];
          const visible = events.slice(0, 3);
          const overflow = events.length - visible.length;
          return (
            <div
              key={i}
              onClick={() => d && onPickDay(d)}
              role={d ? "button" : undefined}
              tabIndex={d ? 0 : -1}
              onKeyDown={(ev) => { if (d && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); onPickDay(d); } }}
              className={`min-h-[110px] border-r border-b border-border p-1.5 transition-colors ${d ? "cursor-pointer hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40" : "bg-muted/20"} ${isToday ? "bg-primary/5" : ""}`}
            >
              {d && (
                <>
                  <div className={`text-xs font-medium mb-1 ${isToday ? "inline-flex h-6 w-6 rounded-full bg-primary text-primary-foreground items-center justify-center" : "text-muted-foreground"}`}>
                    {d.getDate()}
                  </div>
                  <div className="space-y-1">
                    {visible.map((e) => (
                      <div
                        key={e.id}
                        onClick={(ev) => { ev.stopPropagation(); onOpenProspect(e); }}
                        title="Ouvrir le prospect"
                        className={`text-[10px] px-1.5 py-1 rounded truncate ${typeColor[e.type]} group flex items-center justify-between gap-1 cursor-pointer hover:brightness-110`}
                      >
                        <span><span className="font-semibold">{e.time}</span> {e.title}</span>
                        <button onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }} className="opacity-0 group-hover:opacity-70 hover:opacity-100" aria-label="Supprimer"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                    {overflow > 0 && <span onClick={(ev) => ev.stopPropagation()}><OverflowPopover date={d} events={events} hiddenCount={overflow} onDelete={onDelete} /></span>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function WeekView({ cursor, today, eventsFor, onDelete, onPickDay, onOpenProspect }: { cursor: Date; today: Date; eventsFor: (d: Date) => CalEvent[]; onDelete: (id: string) => void | Promise<void>; onPickDay: (d: Date) => void; onOpenProspect: (e: CalEvent) => void }) {
  const start = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
  return (
    <div className="grid grid-cols-7">
      {days.map((d, i) => {
        const isToday = ymd(d) === ymd(today);
        const events = eventsFor(d);
        const visible = events.slice(0, 6);
        const overflow = events.length - visible.length;
        return (
          <div
            key={i}
            onClick={() => onPickDay(d)}
            role="button"
            tabIndex={0}
            onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onPickDay(d); } }}
            className={`min-h-[420px] border-r border-border p-2 cursor-pointer transition-colors hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-primary/40 ${isToday ? "bg-primary/5" : ""}`}
          >
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{dayShort[i]}</div>
              <div className={`text-sm font-semibold ${isToday ? "inline-flex h-7 w-7 rounded-full bg-primary text-primary-foreground items-center justify-center" : ""}`}>
                {d.getDate()}
              </div>
            </div>
            <div className="space-y-1">
              {visible.map((e) => (
                <div
                  key={e.id}
                  onClick={(ev) => { ev.stopPropagation(); onOpenProspect(e); }}
                  title="Ouvrir le prospect"
                  className={`text-[11px] px-2 py-1.5 rounded ${typeColor[e.type]} group cursor-pointer hover:brightness-110`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{e.time}</div>
                    <button onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }} className="opacity-0 group-hover:opacity-70 hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  <div className="truncate">{e.title}</div>
                </div>
              ))}
              {overflow > 0 && <span onClick={(ev) => ev.stopPropagation()}><OverflowPopover date={d} events={events} hiddenCount={overflow} onDelete={onDelete} /></span>}
              {events.length === 0 && <div className="text-[11px] text-muted-foreground italic mt-2">Aucun événement</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ cursor, eventsFor, onDelete, onSave, onOpenProspect }: { cursor: Date; eventsFor: (d: Date) => CalEvent[]; onDelete: (id: string) => void | Promise<void>; onSave: (e: Partial<CalEvent>) => void | Promise<void>; onOpenProspect: (e: CalEvent) => void }) {
  const auth = useAuth();
  const me = auth.user?.username ?? "";
  const role = auth.user?.role ?? "";
  const canEdit = (e: CalEvent) =>
    ["Administrateur","Manager","Backoffice"].includes(role) || e.agent === me;

  const STATUS_LABEL: Record<NonNullable<CalEvent["rdvStatus"]>, string> = {
    pending: "À traiter",
    nrp: "Ne répond pas",
    lost: "Pas gagné",
    won: "Gagné (contrat)",
  };
  const STATUS_CLASS: Record<NonNullable<CalEvent["rdvStatus"]>, string> = {
    pending: "bg-muted text-muted-foreground border-border",
    nrp:     "bg-warning/20 text-warning-foreground border-warning/40",
    lost:    "bg-destructive/15 text-destructive border-destructive/40",
    won:     "bg-success/15 text-success border-success/40",
  };

  const events = eventsFor(cursor);
  const grouped = new Map<number, CalEvent[]>();
  for (const e of events) {
    const h = parseInt(e.time.split(":")[0], 10);
    const list = grouped.get(h) ?? [];
    list.push(e);
    grouped.set(h, list);
  }
  // Always show 8h–19h, plus any extra hours where events actually exist.
  const baseHours = Array.from({ length: 12 }, (_, i) => 8 + i);
  const extraHours = Array.from(grouped.keys()).filter((h) => h < 8 || h > 19);
  const hours = Array.from(new Set([...baseHours, ...extraHours])).sort((a, b) => a - b);

  const changeStatus = async (e: CalEvent, next: NonNullable<CalEvent["rdvStatus"]>) => {
    try {
      await onSave({ id: e.id, rdvStatus: next });
      toast.success(`Statut: ${STATUS_LABEL[next]}`);
    } catch (err) {
      toast.error("Échec", { description: err instanceof Error ? err.message : "" });
    }
  };

  return (
    <div>
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold capitalize">{dayLong[(cursor.getDay() + 6) % 7]} {frDate(cursor)}</span>
          <span className="text-muted-foreground ml-2">— {events.length} événement{events.length > 1 ? "s" : ""}</span>
        </div>
      </div>
      <div className="divide-y divide-border">
      {hours.map((h) => {
        const list = grouped.get(h) ?? [];
        return (
          <div key={h} className="grid grid-cols-[80px_1fr] gap-3 px-4 py-3 hover:bg-muted/20">
            <div className="text-xs text-muted-foreground font-medium flex items-start gap-1.5 pt-1">
              <Clock className="h-3 w-3 mt-0.5" />{pad(h)}:00
            </div>
            <div className="space-y-1.5">
              {list.length === 0 ? (
                <div className="text-xs text-muted-foreground/60 italic">—</div>
              ) : list.map((e) => {
                const status = e.rdvStatus ?? "pending";
                const editable = e.type === "rdv" && canEdit(e) && status !== "won";
                return (
                  <div
                    key={e.id}
                    title="Ouvrir le prospect"
                    className={`text-sm px-3 py-2 rounded ${typeColor[e.type]} group hover:brightness-110`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        onClick={() => onOpenProspect(e)}
                        className="font-semibold cursor-pointer"
                      >{e.time} — {e.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider opacity-70">{typeLabel[e.type]}</span>
                        <button onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }} className="opacity-50 hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-between gap-2 flex-wrap">
                      <span>Avec @{e.agent}</span>
                      {e.type === "rdv" && (
                        editable ? (
                          <Select value={status} onValueChange={(v) => changeStatus(e, v as NonNullable<CalEvent["rdvStatus"]>)}>
                            <SelectTrigger className={`h-7 w-[160px] text-[11px] font-semibold border ${STATUS_CLASS[status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">À traiter</SelectItem>
                              <SelectItem value="nrp">Ne répond pas</SelectItem>
                              <SelectItem value="lost">Pas gagné</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function OverflowPopover({ date, events, hiddenCount, onDelete }: { date: Date; events: CalEvent[]; hiddenCount: number; onDelete: (id: string) => void | Promise<void> }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-[10px] font-medium text-primary hover:underline px-1.5 py-0.5">
          +{hiddenCount} en plus
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="px-3 py-2 border-b border-border">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{dayLong[(date.getDay() + 6) % 7]}</div>
          <div className="text-sm font-semibold">{frDate(date)}</div>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {events.map((e) => (
            <div key={e.id} className={`text-[11px] px-2 py-1.5 rounded ${typeColor[e.type]} group`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{e.time}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase opacity-70">{typeLabel[e.type]}</span>
                  <button onClick={() => onDelete(e.id)} className="opacity-50 hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="truncate">{e.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">@{e.agent}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
