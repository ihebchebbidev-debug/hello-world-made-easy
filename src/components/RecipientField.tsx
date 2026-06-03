import { useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { X, Users } from "lucide-react";

export type Contact = {
  email: string;
  name?: string;
  source?: string; // "Prospect" | "Contrat"
};

/** RFC-5322-ish email validator + length cap + CR/LF guard (header injection). */
const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email({ message: "Adresse invalide" })
  .refine((v) => !/[\r\n]/.test(v), { message: "Caractères interdits" });

export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

type Props = {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  contacts: Contact[];
  placeholder?: string;
  /** Hard cap on number of recipients (anti-DoS / accidental bulk send). */
  max?: number;
};

export function RecipientField({ label, values, onChange, contacts, placeholder, max = 50 }: Props) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const lowerSet = useMemo(() => new Set(values.map((v) => v.toLowerCase())), [values]);

  const addOne = (raw: string): string | null => {
    const v = raw.trim().replace(/[,;]+$/, "");
    if (!v) return null;
    const parsed = emailSchema.safeParse(v);
    if (!parsed.success) return parsed.error.issues[0]?.message ?? "Adresse invalide";
    const lower = parsed.data.toLowerCase();
    if (lowerSet.has(lower)) return null; // silently dedupe
    if (values.length >= max) return `Maximum ${max} destinataires`;
    onChange([...values, parsed.data]);
    return null;
  };

  const flushDraft = () => {
    if (!draft.trim()) return;
    // Allow comma/semicolon/space-separated paste of multiple addresses
    const parts = draft.split(/[\s,;]+/).filter(Boolean);
    let firstError: string | null = null;
    for (const p of parts) {
      const err = addOne(p);
      if (err && !firstError) firstError = err;
    }
    setDraft("");
    return firstError;
  };

  const remove = (email: string) =>
    onChange(values.filter((v) => v.toLowerCase() !== email.toLowerCase()));

  const filteredContacts = useMemo(() => {
    const seen = new Set<string>();
    return contacts
      .filter((c) => isValidEmail(c.email))
      .filter((c) => {
        const k = c.email.toLowerCase();
        if (seen.has(k) || lowerSet.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 200);
  }, [contacts, lowerSet]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1">
              <Users className="h-3.5 w-3.5" /> Carnet
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Rechercher un contact…" />
              <CommandList>
                <CommandEmpty>Aucun contact</CommandEmpty>
                <CommandGroup heading={`${filteredContacts.length} contacts`}>
                  {filteredContacts.map((c) => (
                    <CommandItem
                      key={`${c.source}:${c.email}`}
                      value={`${c.name ?? ""} ${c.email}`}
                      onSelect={() => {
                        addOne(c.email);
                        setOpen(false);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate">{c.name || c.email}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {c.email}{c.source ? ` · ${c.source}` : ""}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div
        className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 min-h-9 focus-within:ring-2 focus-within:ring-ring"
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 pr-1">
            <span className="text-xs">{v}</span>
            <button
              type="button"
              aria-label={`Retirer ${v}`}
              onClick={(e) => { e.stopPropagation(); remove(v); }}
              className="rounded hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "," || e.key === ";" || e.key === "Tab") {
              if (draft.trim()) {
                e.preventDefault();
                flushDraft();
              }
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => flushDraft()}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (/[\s,;]/.test(text)) {
              e.preventDefault();
              setDraft(text);
              setTimeout(() => flushDraft(), 0);
            }
          }}
          placeholder={values.length === 0 ? (placeholder ?? "email@exemple.com") : ""}
          className="flex-1 min-w-[160px] border-0 shadow-none focus-visible:ring-0 px-1 h-7"
        />
      </div>
      {values.length >= max && (
        <p className="text-xs text-destructive">Maximum {max} destinataires atteint.</p>
      )}
    </div>
  );
}