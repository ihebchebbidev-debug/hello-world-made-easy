"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  /** ISO date string (yyyy-MM-dd) or empty */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  fromYear?: number;
  toYear?: number;
  align?: "start" | "center" | "end";
  size?: "sm" | "default";
};

/**
 * Unified, accessible date picker used across the app.
 * Wraps shadcn Calendar in a Popover with French locale,
 * dropdown month/year navigation and a clear button.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
  className,
  disabled,
  clearable = true,
  fromYear = 1950,
  toYear = new Date().getFullYear() + 5,
  align = "start",
  size = "default",
}: Props) {
  const date = React.useMemo(() => {
    if (!value) return undefined;
    const d = parse(value, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  }, [value]);

  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            size === "sm" && "h-8 text-xs",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className={cn("mr-2 h-4 w-4 shrink-0", size === "sm" && "h-3.5 w-3.5")} />
          <span className="flex-1 truncate">
            {date ? format(date, "d MMM yyyy", { locale: fr }) : placeholder}
          </span>
          {clearable && date && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Effacer la date"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }
              }}
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-sm opacity-60 hover:bg-muted hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
          <div className="text-xs font-medium text-muted-foreground">
            {date ? format(date, "EEEE d MMMM yyyy", { locale: fr }) : "Sélectionner"}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => {
              onChange(format(new Date(), "yyyy-MM-dd"));
              setOpen(false);
            }}
          >
            Aujourd'hui
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            } else {
              onChange("");
            }
          }}
          captionLayout="dropdown"
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(toYear, 11)}
          defaultMonth={date ?? new Date()}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;