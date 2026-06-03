import { useState } from "react";
import { AgentSalesMatrix } from "@/components/AgentSalesMatrix";
import { VendeurConversionMatrix } from "@/components/VendeurConversionMatrix";
import { RdvAgentsMatrix } from "@/components/RdvAgentsMatrix";
import { QualifierMatrix } from "@/components/QualifierMatrix";
import { QualifierCreationsChart } from "@/components/QualifierCreationsChart";
import { RdvAgentsChart } from "@/components/RdvAgentsChart";
import { TrendingUp, CalendarCheck, ClipboardCheck } from "lucide-react";

const VENDEUR_ROLES = new Set(["Vendeur", "Commercial", "Sales"]);

type View = "vendeurs" | "agents" | "qualificateurs";

const AGENT_ROLES = new Set(["Agent"]);
const QUALIF_ROLES = new Set(["Qualificateur"]);

const TABS: { id: View; label: string; icon: React.ComponentType<{ className?: string }>; subtitle: string }[] = [
  { id: "vendeurs",       label: "Vendeurs",       icon: TrendingUp,     subtitle: "RDV transformés en vente par vendeur" },
  { id: "agents",         label: "Agents",         icon: CalendarCheck,  subtitle: "Activité RDV des agents" },
  { id: "qualificateurs", label: "Qualificateurs", icon: ClipboardCheck, subtitle: "Fiches qualifiées par qualificateur" },
];

export function AgentsPerformanceSwitch() {
  const [view, setView] = useState<View>("vendeurs");
  const current = TABS.find((t) => t.id === view)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Performance commerciale
          </div>
          <div className="text-sm xl:text-base text-muted-foreground mt-0.5">
            {current.subtitle}
          </div>
        </div>

        {/* 3-way pill toggle */}
        <div
          role="tablist"
          aria-label="Type d'équipe"
          className="relative inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm"
        >
          {/* Sliding indicator */}
          <span
            aria-hidden
            className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-md transition-transform duration-300 ease-out"
            style={{
              width: "calc((100% - 0.5rem) / 3)",
              transform: `translateX(${TABS.findIndex((t) => t.id === view) * 100}%)`,
            }}
          />
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(t.id)}
                className={`relative z-10 inline-flex items-center gap-1.5 rounded-full px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-semibold transition-colors ${
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div key={view} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {view === "vendeurs" && (
          <div className="space-y-6">
            <AgentSalesMatrix roleFilter={VENDEUR_ROLES} title="Performance des vendeurs" />
            <VendeurConversionMatrix title="Conversion RDV → Vente par vendeur" />
            <RdvAgentsChart title="RDV pris par agent — Gagnés vs Échecs" />
            <QualifierCreationsChart title="Comportement de création — Qualificateurs" />
          </div>
        )}
        {view === "agents" && (
          <div className="space-y-6">
            <RdvAgentsChart title="RDV pris par agent" />
            <RdvAgentsMatrix roleFilter={AGENT_ROLES} title="Performance des agents RDV" />
          </div>
        )}
        {view === "qualificateurs" && (
          <QualifierMatrix roleFilter={QUALIF_ROLES} title="Fiches qualifiées par qualificateur" />
        )}
      </div>
    </div>
  );
}
