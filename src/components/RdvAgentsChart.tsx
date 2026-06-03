import { memo, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { CalendarCheck, AlertCircle, Trophy, XCircle } from "lucide-react";
import { useRdvAgents } from "@/lib/useRdvAgents";

type ChartMode = "combined" | "grouped" | "stacked" | "line";
type Scope = "month" | "today";

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const PALETTE = [
  "oklch(0.65 0.22 265)", "oklch(0.70 0.20 145)", "oklch(0.68 0.22 30)",
  "oklch(0.70 0.18 200)", "oklch(0.65 0.22 320)", "oklch(0.72 0.18 60)",
  "oklch(0.62 0.22 10)",  "oklch(0.70 0.18 170)", "oklch(0.65 0.22 280)",
  "oklch(0.72 0.17 120)",
];

export const RdvAgentsChart = memo(function RdvAgentsChart({
  title = "RDV pris par agent",
}: { title?: string } = {}) {
  const now = new Date();
  const [ym, setYm] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<ChartMode>("combined");
  const [scope, setScope] = useState<Scope>("month");
  const [year, monthIdx] = ym.split("-").map(Number);
  const monthLabel = `${MONTHS_FR[(monthIdx ?? 1) - 1]} ${year}`;
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // If user picks "Aujourd'hui" but is browsing a past month, snap to current month.
  const effectiveYm = scope === "today"
    ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    : ym;

  const { data, error, isLoading } = useRdvAgents(effectiveYm);

  const todayIdx = useMemo(
    () => (data ? data.axis.findIndex((d) => d === todayIso) : -1),
    [data, todayIso],
  );

  const chartData = useMemo(() => {
    if (!data) return [];
    const rows = data.axis.map((d, i) => {
      const row: Record<string, string | number> = {
        date: d,
        label: String(i + 1).padStart(2, "0"),
      };
      let total = 0;
      data.series.forEach((s) => {
        const v = s.points[i]?.value ?? 0;
        row[s.name] = v;
        total += v;
      });
      row["Total"] = total;
      return row;
    });
    if (scope === "today") {
      return todayIdx >= 0 ? [rows[todayIdx]] : [];
    }
    return rows;
  }, [data, scope, todayIdx]);

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

  // Chips and KPI summary always reflect the monthly totals, regardless of scope.
  const series = data?.series ?? [];

  const visibleSeries = useMemo(
    () => series.filter((s) => !hidden.has(s.username)),
    [series, hidden],
  );
  const toggleAgent = (u: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u); else next.add(u);
      return next;
    });
  const allHidden = series.length > 0 && visibleSeries.length === 0;
  const grandTotal = data?.grandTotal ?? 0;
  const grandWon = data?.grandWon ?? 0;
  const grandFailed = data?.grandFailed ?? 0;
  const winRate = grandTotal > 0 ? ((grandWon / grandTotal) * 100).toFixed(1) : "0.0";
  const todayTotal = scope === "today" && todayIdx >= 0
    ? series.reduce((acc, s) => acc + (s.points[todayIdx]?.value ?? 0), 0)
    : 0;
  const scopeLabel = scope === "today"
    ? `${monthLabel} · Aujourd'hui ${String(now.getDate()).padStart(2, "0")} ${MONTHS_FR[now.getMonth()]}: ${todayTotal} RDV`
    : monthLabel;

  return (
    <Card className="shadow-elegant overflow-hidden">
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle className="text-base xl:text-lg flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="xl:text-sm">
            {scopeLabel} · {grandTotal} RDV pris · {grandWon} gagné{grandWon > 1 ? "s" : ""}
            {" "}· {grandFailed} échec{grandFailed > 1 ? "s" : ""} · {winRate}% conversion
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-md border border-border bg-card p-0.5 text-xs">
            {([
              { v: "month", label: "Mois" },
              { v: "today", label: "Aujourd'hui" },
            ] as { v: Scope; label: string }[]).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setScope(o.v)}
                className={`px-2.5 py-1 rounded-sm transition-colors ${scope === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-md border border-border bg-card p-0.5 text-xs">
            {([
              { v: "combined", label: "Combiné" },
              { v: "stacked", label: "Empilées" },
              { v: "grouped", label: "Barres" },
              { v: "line", label: "Lignes" },
            ] as { v: ChartMode; label: string }[]).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setMode(o.v)}
                className={`px-2.5 py-1 rounded-sm transition-colors ${mode === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <select
            value={ym}
            onChange={(e) => setYm(e.target.value)}
            disabled={scope === "today"}
            className="text-xs xl:text-sm rounded-md border border-border bg-background px-2.5 py-1.5 disabled:opacity-50"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Impossible de charger les données ({(error as Error).message}).
          </div>
        )}

        {/* Per-agent summary chips */}
        {series.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHidden(new Set())}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Tout
            </button>
            <button
              type="button"
              onClick={() => setHidden(new Set(series.map((s) => s.username)))}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Aucun
            </button>
            {series.map((s, idx) => {
              const isHidden = hidden.has(s.username);
              return (
              <button
                key={s.username}
                type="button"
                onClick={() => toggleAgent(s.username)}
                className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs xl:text-sm transition-opacity hover:bg-muted ${isHidden ? "opacity-40 line-through" : ""}`}
                aria-pressed={!isHidden}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: PALETTE[idx % PALETTE.length] }}
                />
                <span className="flex flex-col items-start leading-tight">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">@{s.username}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  · {s.total} pris
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <Trophy className="h-3 w-3" />{s.won}
                </span>
                <span className="inline-flex items-center gap-1 text-destructive tabular-nums">
                  <XCircle className="h-3 w-3" />{s.failed}
                </span>
                <span className="tabular-nums text-muted-foreground">· {s.conversion}%</span>
              </button>
              );
            })}
          </div>
        )}

        <div className="h-[28rem] xl:h-[34rem] rounded-xl border border-border bg-gradient-to-br from-muted/40 to-background p-3">
          {series.length === 0 && !isLoading ? (
            <div className="flex h-full items-center justify-center text-xs xl:text-sm text-muted-foreground">
              {scope === "today" ? "Aucun RDV pris aujourd'hui." : "Aucun RDV pris ce mois-ci."}
            </div>
          ) : allHidden ? (
            <div className="flex h-full items-center justify-center text-xs xl:text-sm text-muted-foreground">
              Sélectionnez au moins un agent.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {mode === "line" ? (
                <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 240)" vertical={false} />
                  <XAxis dataKey="label" stroke="oklch(0.52 0.02 250)" fontSize={11} />
                  <YAxis stroke="oklch(0.52 0.02 250)" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 240)", fontSize: 12 }}
                    cursor={{ stroke: "oklch(0.85 0.02 240)" }}
                    labelFormatter={(l) => `Jour ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {visibleSeries.map((s) => {
                    const idx = series.findIndex((x) => x.username === s.username);
                    return (
                      <Line
                        key={s.username}
                        type="monotone"
                        dataKey={s.name}
                        stroke={PALETTE[idx % PALETTE.length]}
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              ) : mode === "combined" ? (
                <ComposedChart data={chartData} margin={{ top: 16, right: 12, bottom: 4, left: -6 }} barCategoryGap="20%">
                  <defs>
                    {visibleSeries.map((s) => {
                      const idx = series.findIndex((x) => x.username === s.username);
                      const c = PALETTE[idx % PALETTE.length];
                      return (
                        <linearGradient key={s.username} id={`grad-${s.username}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                          <stop offset="100%" stopColor={c} stopOpacity={0.55} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 240)" vertical={false} />
                  <XAxis dataKey="label" stroke="oklch(0.35 0.02 250)" fontSize={12} tickMargin={6} />
                  <YAxis stroke="oklch(0.35 0.02 250)" fontSize={12} allowDecimals={false} width={32} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 240)", fontSize: 13 }}
                    cursor={{ fill: "oklch(0.95 0.01 240 / 0.5)" }}
                    labelFormatter={(l) => `Jour ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} iconSize={14} />
                  {visibleSeries.map((s) => (
                    <Bar
                      key={s.username}
                      dataKey={s.name}
                      stackId="all"
                      fill={`url(#grad-${s.username})`}
                      isAnimationActive={false}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="Total"
                    stroke="oklch(0.45 0.15 265)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "oklch(0.45 0.15 265)" }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 16, right: 12, bottom: 4, left: -6 }} barCategoryGap="18%" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.008 240)" vertical={false} />
                  <XAxis dataKey="label" stroke="oklch(0.35 0.02 250)" fontSize={12} tickMargin={6} />
                  <YAxis stroke="oklch(0.35 0.02 250)" fontSize={12} allowDecimals={false} width={32} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 240)", fontSize: 13 }}
                    cursor={{ fill: "oklch(0.95 0.01 240 / 0.5)" }}
                    labelFormatter={(l) => `Jour ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} iconSize={14} />
                  {visibleSeries.map((s) => {
                    const idx = series.findIndex((x) => x.username === s.username);
                    return (
                      <Bar
                        key={s.username}
                        dataKey={s.name}
                        stackId={mode === "stacked" ? "all" : undefined}
                        fill={PALETTE[idx % PALETTE.length]}
                        radius={mode === "stacked" ? 0 : [4, 4, 0, 0]}
                        minPointSize={3}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {isLoading && !data && (
          <div className="text-xs text-muted-foreground">Chargement…</div>
        )}
      </CardContent>
    </Card>
  );
});
