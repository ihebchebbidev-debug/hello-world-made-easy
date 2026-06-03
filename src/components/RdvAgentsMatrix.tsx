import { memo, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { CalendarCheck, BarChart3, AlertCircle } from "lucide-react";
import { useRdvAgents } from "@/lib/useRdvAgents";

type RdvKey = "RDV" | "TRAITÉS" | "GAGNÉS" | "NRP" | "REFUS" | "EN ATTENTE";

const RDV_COLORS: Record<RdvKey, string> = {
  "RDV":        "oklch(0.7 0.25 330)",   // magenta (total RDV taken)
  "TRAITÉS":    "oklch(0.55 0.22 265)",  // blue (won+lost+nrp)
  "GAGNÉS":     "oklch(0.72 0.19 145)",  // green
  "NRP":        "oklch(0.82 0.16 95)",   // yellow
  "REFUS":      "oklch(0.62 0.22 25)",   // red
  "EN ATTENTE": "oklch(0.65 0.04 250)",  // gray
};

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

export const RdvAgentsMatrix = memo(function RdvAgentsMatrix({
  roleFilter: _roleFilter,
  title = "Performance des agents RDV",
}: { roleFilter?: ReadonlySet<string>; title?: string } = {}) {
  const now = new Date();
  const [ym, setYm] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [year, monthIdx] = ym.split("-").map(Number);
  const monthLabel = `${MONTHS_FR[(monthIdx ?? 1) - 1]} ${year}`;

  const { data, error, isLoading } = useRdvAgents(ym);
  const series = data?.series ?? [];

  // Use unique-prospect denominators so the rates match the deduped counters
  // returned by the backend (won/lost/nrp/pending are deduped per prospect).
  const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

  const grand = useMemo(() => {
    let total = 0, unique = 0, won = 0, lost = 0, nrp = 0, pending = 0;
    series.forEach((s) => {
      total += s.total;
      unique += s.unique;
      won += s.won;
      lost += s.lost;
      nrp += s.nrp;
      pending += s.pending;
    });
    const treated = won + lost + nrp;
    return { total, unique, won, lost, nrp, pending, treated };
  }, [series]);

  const chartData = useMemo(
    () => series.map((s) => ({
      agent: s.name,
      RDV: s.total,
      "TRAITÉS": s.won + s.lost + s.nrp,
      "GAGNÉS": s.won,
      NRP: s.nrp,
      REFUS: s.lost,
      "EN ATTENTE": s.pending,
    })),
    [series],
  );

  const monthOptions = useMemo(() => {
    const out: { value: string; label: string }[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const y = d.getFullYear(), m = d.getMonth();
      out.push({
        value: `${y}-${String(m + 1).padStart(2, "0")}`,
        label: `${MONTHS_FR[m]} ${y}`,
      });
      d.setMonth(d.getMonth() - 1);
    }
    return out;
  }, []);

  type RowDef = {
    key: RdvKey;
    type: "count" | "percent";
    valueFor: (s: typeof series[number]) => number;
    countFor: (s: typeof series[number]) => number;
    total: number;
    totalCount: number;
  };
  // Denominator for percentages = unique prospects with RDV in month
  // (matches the deduped won/lost/nrp/pending counters)
  const rows: RowDef[] = [
    { key: "RDV",        type: "count",   valueFor: (s) => s.total,                                  countFor: (s) => s.total,                  total: grand.total,                                           totalCount: grand.total },
    { key: "TRAITÉS",    type: "percent", valueFor: (s) => pct(s.won + s.lost + s.nrp, s.unique),    countFor: (s) => s.won + s.lost + s.nrp,   total: pct(grand.treated, grand.unique),                      totalCount: grand.treated },
    { key: "GAGNÉS",     type: "percent", valueFor: (s) => pct(s.won, s.unique),                     countFor: (s) => s.won,                    total: pct(grand.won, grand.unique),                          totalCount: grand.won },
    { key: "NRP",        type: "percent", valueFor: (s) => pct(s.nrp, s.unique),                     countFor: (s) => s.nrp,                    total: pct(grand.nrp, grand.unique),                          totalCount: grand.nrp },
    { key: "REFUS",      type: "percent", valueFor: (s) => pct(s.lost, s.unique),                    countFor: (s) => s.lost,                   total: pct(grand.lost, grand.unique),                         totalCount: grand.lost },
    { key: "EN ATTENTE", type: "percent", valueFor: (s) => pct(s.pending, s.unique),                 countFor: (s) => s.pending,                total: pct(grand.pending, grand.unique),                      totalCount: grand.pending },
  ];

  return (
    <Card className="shadow-elegant overflow-hidden">
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle className="text-base xl:text-lg flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />
            {title}

          </CardTitle>
          <CardDescription className="xl:text-sm">
            {monthLabel} · {grand.total} RDV pris · {grand.unique} prospects uniques · {grand.won} gagnés
          </CardDescription>
        </div>
        <select
          value={ym}
          onChange={(e) => setYm(e.target.value)}
          className="text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5"
        >
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Impossible de charger les données ({(error as Error).message}).
          </div>
        )}
        {isLoading && !data && (
          <div className="text-xs text-muted-foreground">Chargement…</div>
        )}
        {/* Matrix */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs xl:text-sm tabular-nums">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground">
                <th className="text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60">Indicateur</th>
                {series.map((s) => (
                  <th key={s.username} className="text-right font-semibold px-3 py-2.5 whitespace-nowrap">
                    <div className="flex flex-col items-end leading-tight">
                      <span>{s.full_name || s.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">@{s.username}</span>
                    </div>
                  </th>
                ))}
                <th className="text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const dot = RDV_COLORS[row.key];
                return (
                  <tr key={row.key} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
                        {row.key}
                      </span>
                    </td>
                    {series.map((s) => {
                      const v = row.valueFor(s);
                      const c = row.countFor(s);
                      const empty = s.total === 0;
                      return (
                        <td key={s.username} className={`px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`}>
                          {empty ? "—" : (
                            <div className="flex flex-col items-end leading-tight">
                              <span className="font-medium">
                                {row.type === "percent" ? `${v.toFixed(2)}%` : String(v)}
                              </span>
                              {row.type === "percent" && (
                                <span className="text-[10px] xl:text-[11px] text-muted-foreground">{c} / {s.unique}</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-right font-bold bg-primary/5">
                      <div className="flex flex-col items-end leading-tight">
                        <span>{row.type === "percent" ? `${row.total.toFixed(2)}%` : String(row.total)}</span>
                        {row.type === "percent" && (
                          <span className="text-[10px] xl:text-[11px] font-medium text-muted-foreground">{row.totalCount} / {grand.unique}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Stacked bar chart */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            Volumes par agent
          </div>
          <div className="h-72 xl:h-80 rounded-xl border border-border bg-gradient-to-br from-muted/40 to-background p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 240)" vertical={false} />
                <XAxis dataKey="agent" stroke="oklch(0.52 0.02 250)" fontSize={12} />
                <YAxis stroke="oklch(0.52 0.02 250)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 240)", fontSize: 12 }}
                  cursor={{ fill: "oklch(0.95 0.01 240 / 0.5)" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="RDV"        fill={RDV_COLORS["RDV"]}        radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="TRAITÉS"    fill={RDV_COLORS["TRAITÉS"]}    radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="GAGNÉS"     fill={RDV_COLORS["GAGNÉS"]}     radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="NRP"        fill={RDV_COLORS["NRP"]}        radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="REFUS"      fill={RDV_COLORS["REFUS"]}      radius={[4,4,0,0]} isAnimationActive={false} />
                <Bar dataKey="EN ATTENTE" fill={RDV_COLORS["EN ATTENTE"]} radius={[4,4,0,0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
