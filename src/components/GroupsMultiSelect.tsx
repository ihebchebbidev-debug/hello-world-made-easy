import { useState } from "react";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function GroupsMultiSelect({
  value, onChange, options, placeholder = "Choisir un ou plusieurs groupes…", disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = (g: string) => {
    if (value.includes(g)) onChange(value.filter((x) => x !== g));
    else onChange([...value, g]);
  };
  const remove = (g: string) => onChange(value.filter((x) => x !== g));
  const addCustom = () => {
    const n = query.trim();
    if (!n || value.includes(n)) return;
    onChange([...value, n]);
    setQuery("");
  };

  const canAddCustom = query.trim() !== "" &&
    !options.some((o) => o.toLowerCase() === query.trim().toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className={cn("truncate text-left", value.length === 0 && "text-muted-foreground")}>
              {value.length === 0
                ? placeholder
                : value.length === 1
                  ? value[0]
                  : `${value.length} groupes sélectionnés`}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Rechercher ou créer…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {canAddCustom ? (
                  <button
                    type="button"
                    onClick={addCustom}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Créer « {query.trim()} »
                  </button>
                ) : (
                  <p className="px-2 py-3 text-sm text-muted-foreground text-center">Aucun groupe</p>
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((g) => {
                  const selected = value.includes(g);
                  return (
                    <CommandItem key={g} value={g} onSelect={() => toggle(g)}>
                      <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                      {g}
                    </CommandItem>
                  );
                })}
                {canAddCustom && (
                  <CommandItem value={`__create__${query}`} onSelect={addCustom}>
                    <Plus className="mr-2 h-4 w-4" /> Créer « {query.trim()} »
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((g, i) => (
            <Badge key={g} variant={i === 0 ? "default" : "secondary"} className="gap-1 pr-1">
              {i === 0 && <span className="text-[10px] uppercase opacity-75">Principal</span>}
              {g}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(g)}
                  className="hover:bg-background/30 rounded-sm p-0.5"
                  aria-label={`Retirer ${g}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        Le premier groupe est le groupe <strong>principal</strong> (utilisé comme équipe par défaut).
      </p>
    </div>
  );
}
