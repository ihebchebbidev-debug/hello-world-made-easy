import { isAssignableRole } from "@/lib/permissions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import {
  TrendingUp, Users, FileCheck, ArrowUpRight, ArrowDownRight, XCircle,
  Activity, Trophy, Clock, CheckCircle2,
  Sparkles, Inbox, Target, Building2, Ban, Maximize2, Minimize2, RefreshCw,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { useErp, useDashboardStats } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { formatAmount, formatCompact, useCurrency } from "@/lib/currency";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { api, API_ENABLED } from "@/lib/api";
import { AgentsPerformanceSwitch } from "@/components/AgentsPerformanceSwitch";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Protection ERP" },
      { name: "description", content: "Vue d'ensemble: leads, conversion, contrats et performance des agents." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["oklch(0.68 0.17 55)", "oklch(0.8 0.14 75)", "oklch(0.65 0.16 155)", "oklch(0.78 0.15 75)", "oklch(0.6 0.22 320)"];

const normalizeSource = (value?: string | null) => {
  const source = (value ?? "").trim().replace(/\s+/g, " ");
  return source ? source.toUpperCase() : "AUTRE";
};

type StatTone = "indigo" | "emerald" | "amber" | "rose";

const STAT_TONES: Record<StatTone, { gradient: string; ring: string; sparkStroke: string; sparkFill: string }> = {
  indigo: {
    gradient: "from-[oklch(0.68_0.17_55)] via-[oklch(0.72_0.16_60)] to-[oklch(0.78_0.15_70)]",
    ring: "ring-[oklch(0.68_0.17_55_/_0.25)]",
    sparkStroke: "oklch(0.95 0.02 250)",
    sparkFill: "oklch(0.95 0.02 250 / 0.25)",
  },
  emerald: {
    gradient: "from-[oklch(0.55_0.16_165)] via-[oklch(0.62_0.16_155)] to-[oklch(0.75_0.14_140)]",
    ring: "ring-[oklch(0.55_0.16_165_/_0.25)]",
    sparkStroke: "oklch(0.96 0.02 150)",
    sparkFill: "oklch(0.96 0.02 150 / 0.25)",
  },
  amber: {
    gradient: "from-[oklch(0.62_0.18_45)] via-[oklch(0.7_0.17_60)] to-[oklch(0.82_0.14_85)]",
    ring: "ring-[oklch(0.7_0.17_60_/_0.25)]",
    sparkStroke: "oklch(0.97 0.02 80)",
    sparkFill: "oklch(0.97 0.02 80 / 0.25)",
  },
  rose: {
    gradient: "from-[oklch(0.55_0.2_15)] via-[oklch(0.62_0.21_5)] to-[oklch(0.7_0.18_345)]",
    ring: "ring-[oklch(0.6_0.21_10_/_0.25)]",
    sparkStroke: "oklch(0.97 0.02 350)",
    sparkFill: "oklch(0.97 0.02 350 / 0.25)",
  },
};

const Sparkline = memo(function Sparkline({ data, stroke, fill }: { data: number[]; stroke: string; fill: string }) {
  const series = useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={series} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${stroke}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.9} />
            <stop offset="100%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.75} fill={`url(#sg-${stroke})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
});

const Stat = memo(function Stat({ label, value, sub, icon, trend, trendDir, tone, spark }: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  trend?: string; trendDir?: "up" | "down" | "flat"; tone: StatTone; spark: number[];
}) {
  const t = STAT_TONES[tone];
  const TrendIcon = trendDir === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <Card className={`relative overflow-hidden border-0 ring-1 ${t.ring} shadow-lg transition-transform hover:-translate-y-0.5`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient}`} />
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full blur-2xl bg-white/20" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
      <CardContent className="relative p-5 xl:p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] xl:text-[12px] font-semibold text-white/90 uppercase tracking-[0.18em]">{label}</div>
            <div className="mt-2 text-3xl xl:text-4xl 2xl:text-5xl font-bold tracking-tight tabular-nums leading-none">{value}</div>
            {sub && <div className="mt-2 text-xs xl:text-sm text-white/85 truncate">{sub}</div>}
          </div>
          <div className="h-10 w-10 xl:h-12 xl:w-12 rounded-lg bg-white/15 text-white backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/25">
            {icon}
          </div>
        </div>
        <div className="mt-3 -mx-1 h-[42px] xl:h-[56px]">
          <Sparkline data={spark} stroke={t.sparkStroke} fill={t.sparkFill} />
        </div>
        {trend && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] xl:text-xs font-medium text-white ring-1 ring-white/20">
            <TrendIcon className="h-3 w-3" /> {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

function Dashboard() {
  const { contracts, users, prospects, refresh } = useErp();
  const { user } = useAuth();
  const dashboardStats = useDashboardStats();
  const currency = useCurrency();

  const firstName = user?.fullName?.split(" ")[0] ?? user?.username ?? "Agent";
  const today = new Date();
  const dateLabel = today.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const todayStr = today.toISOString().slice(0, 10);

  // Hourly leads vs contracts for today (8h-19h), derived from real data.
  // Note: signatureDate is date-only (YYYY-MM-DD) — without a timestamp we cannot
  // bucket contracts per hour, so we attribute today's contracts to the current hour.
  const hourlyContracts = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
    const nowH = today.getHours();
    const todaysContracts = contracts.filter((c) => (c.signatureDate ?? "").startsWith(todayStr));
    return hours.map((h) => {
      const hh = String(h).padStart(2, "0");
      const leads = prospects.filter((p) => {
        const ts = p.createdAt ?? "";
        return ts.startsWith(todayStr) && ts.length >= 13 && ts.slice(11, 13) === hh;
      }).length;
      const contrats = todaysContracts.filter((c) => {
        const ts = c.signatureDate ?? "";
        // If contract has a timestamp, bucket by hour. Otherwise, attribute to current hour.
        if (ts.length >= 13) return ts.slice(11, 13) === hh;
        return h === nowH;
      }).length;
      return { hour: `${hh}h`, leads, contrats };
    });
  }, [prospects, contracts, todayStr, today]);

  // Month selector state for chart widgets (defaults to current month).
  const [chartMonth, setChartMonth] = useState<string>(todayStr.slice(0, 7));

  // Current-month window (YYYY-MM) used by all top KPIs.
  const monthPrefix = todayStr.slice(0, 7);
  const monthStart = `${monthPrefix}-01`;

  const [monthlyProspectStats, setMonthlyProspectStats] = useState<{
    total: number;
    won: number;
    lost: number;
    pending: number;
  } | null>(null);

  // Global 10-minute auto-refresh tick — keeps the whole dashboard fresh.
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setRefreshTick((t) => t + 1);
      void refresh();
    }, 10 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    const countProspects = (outcome?: string) =>
      api<{ total: number }>("/prospects.php", {
        query: { count: 1, from: monthStart, to: todayStr, outcome },
      }).then((r) => r.total ?? 0);

    Promise.all([
      countProspects(),
      countProspects("won"),
      countProspects("lost"),
      countProspects("pending"),
    ]).then(([total, won, lost, pending]) => {
      if (!cancelled) setMonthlyProspectStats({ total, won, lost, pending });
    }).catch(() => {
      if (!cancelled) setMonthlyProspectStats(null);
    });

    return () => { cancelled = true; };
  }, [monthStart, todayStr, refreshTick]);

  // Per-month derived metrics (top KPIs).
  const monthly = useMemo(() => {
    const monthProspects = prospects.filter((p) => (p.createdAt ?? "").startsWith(monthPrefix));
    const monthContractsAll = contracts.filter((c) => (c.signatureDate ?? "").startsWith(monthPrefix));
    // Exclude cancelled contracts so KPIs match the per-company breakdown
    // (`/dashboard.php?breakdown=admin`) which filters out 'Annuler la confirmation'.
    const monthContracts = monthContractsAll.filter((c) => c.billingStatus !== "Annuler la confirmation");
    const wonMonth = monthProspects.filter((p) => p.outcome === "won").length;
    const lostMonth = monthProspects.filter((p) => p.outcome === "lost").length;
    const pendingMonth = monthProspects.filter((p) => p.outcome === "pending").length;
    const totalMonth = monthProspects.length;
    const revenueMonth = monthContracts.reduce((s, c) => s + (c.premium ?? 0), 0);
    const avg = monthContracts.length ? revenueMonth / monthContracts.length : 0;
    const exactTotal = monthlyProspectStats?.total ?? totalMonth;
    const exactWon = monthlyProspectStats?.won ?? wonMonth;
    const exactLost = monthlyProspectStats?.lost ?? lostMonth;
    const exactPending = monthlyProspectStats?.pending ?? pendingMonth;
    const exactConv = exactTotal ? (exactWon / exactTotal) * 100 : 0;
    return {
      leadsMonth: exactTotal,
      wonMonth: exactWon,
      lostMonth: exactLost,
      pendingMonth: exactPending,
      contractsMonth: monthContracts.length,
      revenueMonth,
      avgDealMonth: avg,
      conversionMonth: Number(exactConv.toFixed(1)),
    };
  }, [prospects, contracts, monthPrefix, monthlyProspectStats]);


  // Sources breakdown — driven by the month selector in the chart widget.
  // Fetch the exact signed contracts for the month, then fetch each linked
  // prospect by id. This mirrors the fully-hydrated month-switch result on
  // first dashboard open and avoids the partial global dashboard cache.
  type SourceBreakdownRow = { source: string; contrats: number };
  type SourceChartContract = { prospectId?: string | null; source?: string | null; billingStatus?: string | null };
  type SourceChartProspect = { id: string; source?: string | null };
  const [monthSourceBreakdown, setMonthSourceBreakdown] = useState<SourceBreakdownRow[] | null>(null);
  const [sourceBreakdownLoading, setSourceBreakdownLoading] = useState(API_ENABLED);
  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    const from = `${chartMonth}-01`;
    // Last day of chartMonth
    const [y, m] = chartMonth.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    const to = `${chartMonth}-${String(last).padStart(2, "0")}`;
    setSourceBreakdownLoading(true);
    setMonthSourceBreakdown(null);
    const loadSourceBreakdown = async (): Promise<SourceBreakdownRow[]> => {
      const pageSize = 5000;
      const monthContracts: SourceChartContract[] = [];
      for (let page = 1, total = Number.POSITIVE_INFINITY; (page - 1) * pageSize < total && page <= 20; page += 1) {
        const batch = await api<{ contracts: SourceChartContract[]; total?: number }>("/contracts.php", {
          query: { page, pageSize, sigFrom: from, sigTo: to },
        });
        monthContracts.push(...(batch.contracts ?? []));
        total = batch.total ?? monthContracts.length;
        if ((batch.contracts ?? []).length < pageSize) break;
      }

      const prospectIds = Array.from(new Set(
        monthContracts.map((contract) => contract.prospectId).filter((id): id is string => Boolean(id)),
      ));
      const prospectById = new Map<string, SourceChartProspect>();
      for (let i = 0; i < prospectIds.length; i += 12) {
        const chunk = prospectIds.slice(i, i + 12);
        const rows = await Promise.all(
          chunk.map((id) => api<{ prospect: SourceChartProspect }>("/prospects.php", { query: { id } })
            .then((response) => response.prospect)
            .catch(() => null)),
        );
        rows.forEach((prospect) => { if (prospect) prospectById.set(prospect.id, prospect); });
      }

      const counts = new Map<string, number>();
      monthContracts
        .filter((contract) => contract.billingStatus !== "Annuler la confirmation")
        .forEach((contract) => {
          const linkedProspect = contract.prospectId ? prospectById.get(contract.prospectId) : undefined;
          const source = normalizeSource(linkedProspect?.source || contract.source);
          counts.set(source, (counts.get(source) ?? 0) + 1);
        });

      return Array.from(counts.entries())
        .map(([source, contrats]) => ({ source, contrats }))
        .sort((a, b) => b.contrats - a.contrats);
    };

    loadSourceBreakdown()
      .then((rows) => { if (!cancelled) setMonthSourceBreakdown(rows); })
      .catch(() => { if (!cancelled) setMonthSourceBreakdown(null); })
      .finally(() => { if (!cancelled) setSourceBreakdownLoading(false); });
    return () => { cancelled = true; };
  }, [chartMonth, refreshTick]);

  const sourceBreakdownPending = sourceBreakdownLoading || monthSourceBreakdown === null;
  const sourceBreakdown = monthSourceBreakdown ?? [];
  const sourceBreakdownKey = `${chartMonth}:${sourceBreakdown.map((row) => `${row.source}-${row.contrats}`).join("|")}`;



  // 7-day sparklines from the backend (real historical series).
  const [sparks, setSparks] = useState<{ leads: number[]; won: number[]; conv: number[]; lost: number[] }>(
    { leads: [], won: [], conv: [], lost: [] },
  );
  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    type Pt = { points: { date: string; value: number }[] };
    const fetchSeries = (s: string) =>
      api<Pt>("/dashboard.php", { query: { series: s, days: 7 } })
        .then((r) => r.points.map((p) => p.value))
        .catch(() => [] as number[]);
    Promise.all([
      fetchSeries("leads"),
      fetchSeries("won"),
      fetchSeries("conversion"),
      fetchSeries("lost"),
    ]).then(([leads, won, conv, lost]) => {
      if (!cancelled) setSparks({ leads, won, conv, lost });
    });
    return () => { cancelled = true; };
  }, [dashboardStats.totalLeads, dashboardStats.wonLeads, refreshTick]);

  // Recent activity feed: combine latest contracts + latest claimed/won/lost prospects
  const recentActivity = useMemo(() => {
    type Item = { id: string; kind: "contract" | "won" | "lost" | "lead"; title: string; subtitle: string; ts: string };
    const items: Item[] = [];
    contracts.slice(0, 6).forEach((c) =>
      items.push({
        id: `c-${c.id}`,
        kind: "contract",
        title: `Contrat signé — ${c.firstName} ${c.lastName}`,
        subtitle: `${c.partner} • ${c.assignedTo} • ${formatAmount(c.premium, currency)}`,
        ts: c.signatureDate,
      }),
    );
    prospects.filter((p) => p.outcome === "won").slice(0, 4).forEach((p) =>
      items.push({
        id: `w-${p.id}`,
        kind: "won",
        title: `Lead gagné — ${p.firstName} ${p.lastName}`,
        subtitle: `${p.source} • ${p.assignedTo ?? "Non assigné"}`,
        ts: p.createdAt,
      }),
    );
    prospects.filter((p) => p.outcome === "lost").slice(0, 3).forEach((p) =>
      items.push({
        id: `l-${p.id}`,
        kind: "lost",
        title: `Lead perdu — ${p.firstName} ${p.lastName}`,
        subtitle: p.lostReason ?? "Sans motif",
        ts: p.createdAt,
      }),
    );
    return items.sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 8);
  }, [contracts, prospects, currency]);

  // Admin-only: per-company + cancelled breakdown for current month
  type AdminBreakdown = {
    period: { from: string; to: string };
    totals: { contracts: number; revenue: number };
    cancelled: { contracts: number; revenue: number };
    companies: { company: string; contracts: number; revenue: number }[];
    companiesCancelled: { company: string; contracts: number; revenue: number }[];
  };
  const [adminData, setAdminData] = useState<AdminBreakdown | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());
  const [presentation, setPresentation] = useState(false);

  // Live clock for presentation/big-screen display.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Per-company breakdown + auto-refresh every 60s for big-screen sharing.
  useEffect(() => {
    if (!API_ENABLED) return;
    let cancelled = false;
    const fetchAdmin = () =>
      api<AdminBreakdown>("/dashboard.php", { query: { breakdown: "admin" } })
        .then((r) => { if (!cancelled) { setAdminData(r); setLastRefresh(new Date()); } })
        .catch(() => {});
    fetchAdmin();
    const id = window.setInterval(fetchAdmin, 10 * 60 * 1000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  // Presentation mode: request fullscreen and add a body class for compact chrome.
  const togglePresentation = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        setPresentation(true);
      } else {
        await document.exitFullscreen?.();
        setPresentation(false);
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    const onFsChange = () => setPresentation(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);
  // Toggle a body-level class so AppLayout chrome (sidebar + header) can
  // hide via CSS, and clean up if we navigate away mid-presentation.
  useEffect(() => {
    document.body.classList.toggle("presentation-mode", presentation);
    return () => { document.body.classList.remove("presentation-mode"); };
  }, [presentation]);

  const totalRevenue = monthly.revenueMonth;
  const avgDeal = monthly.avgDealMonth;



  return (
    <AppLayout>
      {presentation && (
        <button
          type="button"
          onClick={togglePresentation}
          className="fixed top-3 right-3 z-50 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 text-xs font-medium shadow-lg"
        >
          <Minimize2 className="h-3.5 w-3.5" /> Quitter
        </button>
      )}
      <div className="space-y-6 xl:space-y-8">
        {/* Header */}
        <div data-presentation-hide className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-6 xl:p-8">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Tableau de bord · Live
              </div>
              <h1 className="mt-1 text-2xl md:text-[30px] xl:text-[40px] 2xl:text-[52px] font-semibold tracking-tight leading-tight">
                Bonjour, <span className="text-primary">{firstName}</span>
              </h1>
              <p className="mt-1 text-sm xl:text-base text-muted-foreground">
                Voici votre aperçu commercial pour aujourd'hui.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm">
                  <Inbox className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
                  <span className="font-semibold tabular-nums">{dashboardStats.newLeadsToday}</span>
                  <span className="text-muted-foreground">en file</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm">
                  <FileCheck className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-emerald-600" />
                  <span className="font-semibold tabular-nums">{dashboardStats.contractsToday}</span>
                  <span className="text-muted-foreground">signé(s) aujourd'hui</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm">
                  <Target className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-amber-600" />
                  <span className="font-semibold tabular-nums">{dashboardStats.conversionRate}%</span>
                  <span className="text-muted-foreground">conversion</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-2.5 py-1 text-xs xl:text-sm">
                  <RefreshCw className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">MAJ {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
              </div>
            </div>
            <div className="text-xs xl:text-sm text-muted-foreground sm:text-right space-y-2">
              <div className="text-4xl xl:text-6xl 2xl:text-7xl font-bold text-foreground tabular-nums leading-none">
                {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {dateLabel}
              </div>
              <div>
                <button
                  type="button"
                  onClick={togglePresentation}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 px-3 py-1.5 text-xs xl:text-sm font-medium transition-opacity"
                >
                  {presentation ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  {presentation ? "Quitter plein écran" : "Mode présentation"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI cards w/ sparklines */}
        <div>
          <div className="mb-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground">Indicateurs clés</div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-5">
            <Stat tone="indigo" label="Leads du mois" value={String(monthly.leadsMonth)} sub={`${monthly.pendingMonth} en cours`} icon={<Users className="h-5 w-5" />} trend={`${dashboardStats.newLeadsToday} en file`} trendDir="up" spark={sparks.leads} />
            <Stat tone="emerald" label="Contrats du mois" value={String(monthly.contractsMonth)} sub={`${dashboardStats.contractsToday} aujourd'hui`} icon={<FileCheck className="h-5 w-5" />} trend={`${monthly.wonMonth} leads gagnés`} trendDir="up" spark={sparks.won} />
            <Stat tone="emerald" label="CA du mois" value={formatCompact(totalRevenue, currency)} sub="Mois en cours" icon={<TrendingUp className="h-5 w-5" />} trend={`Panier moy. ${formatAmount(avgDeal, currency)}`} trendDir="up" spark={sparks.won} />
            <Stat tone="amber" label="Conversion du mois" value={`${monthly.conversionMonth}%`} sub="Leads → contrats" icon={<TrendingUp className="h-5 w-5" />} trend="Mois en cours" trendDir="up" spark={sparks.conv} />
            <Stat tone="rose" label="Annulés du mois" value={String(adminData?.cancelled.contracts ?? 0)} sub={`CA annulé: ${formatCompact(adminData?.cancelled.revenue ?? 0, currency)}`} icon={<Ban className="h-5 w-5" />} trend="Mois en cours" trendDir="down" spark={sparks.lost} />
            <Stat tone="rose" label="Leads perdus du mois" value={String(monthly.lostMonth)} sub="Mois en cours" icon={<XCircle className="h-5 w-5" />} trend="—" trendDir="down" spark={sparks.lost} />
          </div>
        </div>

        {/* Agent × Partner sales matrix (modern reinterpretation of the spreadsheet) */}
        <AgentsPerformanceSwitch />


        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5">
          <Card className="lg:col-span-3 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base xl:text-lg">Sources des contrats</CardTitle>
                <CardDescription className="xl:text-sm">Répartition du mois</CardDescription>
              </div>
              <select
                value={chartMonth}
                onChange={(e) => setChartMonth(e.target.value)}
                className="h-8 rounded-md border border-border bg-card px-2 py-1 text-xs xl:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {(() => {
                  const opts: { value: string; label: string }[] = [];
                  const now = new Date();
                  for (let i = 0; i < 12; i++) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const value = d.toISOString().slice(0, 7);
                    const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                    opts.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
                  }
                  return opts;
                })().map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="h-72 xl:h-96">
              {sourceBreakdownPending && sourceBreakdown.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Chargement des sources…
                </div>
              ) : (
                <ResponsiveContainer key={sourceBreakdownKey} width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceBreakdown} dataKey="contrats" nameKey="source" innerRadius={50} outerRadius={85} paddingAngle={2} isAnimationActive={false}>
                      {sourceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 240)" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity */}
        <div className="grid grid-cols-1 gap-4 xl:gap-5">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-base xl:text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 xl:h-5 xl:w-5 text-primary" /> Activité récente
              </CardTitle>
              <CardDescription className="xl:text-sm">Derniers événements du CRM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentActivity.map((it) => {
                const conf = it.kind === "contract"
                  ? { icon: <FileCheck className="h-3.5 w-3.5" />, bg: "bg-[oklch(0.68_0.17_55_/_0.12)]", fg: "text-[oklch(0.58_0.17_50)]" }
                  : it.kind === "won"
                  ? { icon: <CheckCircle2 className="h-3.5 w-3.5" />, bg: "bg-[oklch(0.65_0.16_155_/_0.15)]", fg: "text-[oklch(0.5_0.16_155)]" }
                  : it.kind === "lost"
                  ? { icon: <XCircle className="h-3.5 w-3.5" />, bg: "bg-[oklch(0.65_0.2_15_/_0.12)]", fg: "text-[oklch(0.55_0.2_15)]" }
                  : { icon: <Clock className="h-3.5 w-3.5" />, bg: "bg-muted", fg: "text-muted-foreground" };
                return (
                  <div key={it.id} className="flex items-start gap-2.5 py-2 border-b border-border/60 last:border-0">
                    <div className={`mt-0.5 h-7 w-7 rounded-full ${conf.bg} ${conf.fg} flex items-center justify-center shrink-0`}>
                      {conf.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium leading-tight truncate">{it.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{it.subtitle}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                      {new Date(it.ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </div>
                  </div>
                );
              })}
              {recentActivity.length === 0 && (
                <div className="text-xs text-muted-foreground py-4 text-center">Aucune activité récente</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cancelled contracts breakdown (current month) */}
        {adminData && (
          <div className="grid grid-cols-1 gap-4 xl:gap-5">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-base xl:text-lg flex items-center gap-2">
                  <Ban className="h-4 w-4 xl:h-5 xl:w-5 text-[oklch(0.6_0.21_10)]" /> Contrats annulés
                </CardTitle>
                <CardDescription className="xl:text-sm">
                  Mois en cours · {adminData.cancelled.contracts} annulés · {formatAmount(adminData.cancelled.revenue, currency)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adminData.companiesCancelled.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-6 text-center">Aucune annulation ce mois.</div>
                ) : (
                  <div className="space-y-1.5 xl:space-y-2">
                    {adminData.companiesCancelled.map((c) => (
                      <div key={c.company} className="flex items-center justify-between gap-2 py-1.5 xl:py-2 border-b border-border/60 last:border-0">
                        <div className="text-xs xl:text-sm font-medium truncate">{c.company}</div>
                        <div className="flex items-center gap-2 text-[11px] xl:text-sm tabular-nums shrink-0">
                          <span className="text-muted-foreground">{c.contracts}</span>
                          <span className="font-bold text-[oklch(0.55_0.2_15)]">{formatAmount(c.revenue, currency)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}



      </div>
    </AppLayout>
  );
}
