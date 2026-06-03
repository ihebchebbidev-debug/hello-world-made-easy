import { isAssignableRole } from "@/lib/permissions";
import { memo, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { ClipboardCheck, BarChart3 } from "lucide-react";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

const COLORS = {
  qualified: "oklch(0.7 0.2 165)",
  total:     "oklch(0.55 0.22 265)",
};

// Normalise to detect "Qualifié" with or without accents / casing.
const isQualified = (status: string | null | undefined): boolean => {
  const s = (status || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return s === "qualifie" || s.startsWith("qualifie");
};

/**
 * Matrix of qualified prospects per qualificateur per month.
 * Scope: only users with the Qualificateur role appear as columns.
 * Privileged users (Admin/Manager) see everyone; others see only themselves.
 */
export const QualifierMatrix = memo(function QualifierMatrix({
  roleFilter,
  title = "Fiches qualifiées par qualificateur",
}: { roleFilter?: ReadonlySet<string>; title?: string } = {}) {
  const { prospects, users } = useErp();
  const { user } = useAuth();

  const now = new Date();
  const [ym, setYm] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [year, monthIdx] = ym.split("-").map(Number);
  const monthLabel = `${MONTHS_FR[(monthIdx ?? 1) - 1]} ${year}`;

  const isPriv = user?.role === "Administrateur" || user?.role === "Manager" || user?.role === "Présentation";

  const { agentNames, resolveAgent } = useMemo(() => {
    const staff = users.filter(
      (u) => isAssignableRole(u.role) && (!roleFilter || roleFilter.has(u.role)),
    );
    const displayOf = (u: typeof staff[number]) => u.fullName?.trim() || u.username;
    const lookup = new Map<string, string>();
    staff.forEach((u) => {
      const display = displayOf(u);
      if (u.username) lookup.set(u.username.toLowerCase(), display);
      if (u.fullName) lookup.set(u.fullName.trim().toLowerCase(), display);
      lookup.set(display.toLowerCase(), display);
    });
    const allNames = staff.map(displayOf);
    const visible = isPriv
      ? allNames
      : (() => {
          const me = user?.fullName?.trim() || user?.username || "";
          return me && staff.some((u) => displayOf(u).toLowerCase() === me.toLowerCase()) ? [me] : [];
        })();
    const visibleSet = new Set(visible.map((n) => n.toLowerCase()));
    const resolve = (raw: string | null | undefined): string | null => {
      const key = (raw || "").trim().toLowerCase();
      if (!key) return null;
      const display = lookup.get(key);
      if (!display) return null;
      return visibleSet.has(display.toLowerCase()) ? display : null;
    };
    return { agentNames: visible, resolveAgent: resolve };
  }, [users, isPriv, user, roleFilter]);

  const monthProspects = useMemo(
    () => prospects.filter((p) => (p.createdAt || "").startsWith(ym)),
    [prospects, ym],
  );

  // counts[agent] = { total: all fiches assigned, qualified: status = Qualifié }
  const counts = useMemo(() => {
    const out: Record<string, { total: number; qualified: number }> = {};
    agentNames.forEach((a) => { out[a] = { total: 0, qualified: 0 }; });
    monthProspects.forEach((p) => {
      const a = resolveAgent(p.assignedTo);
      if (!a) return;
      out[a].total += 1;
      if (isQualified(p.status)) out[a].qualified += 1;
    });
    return out;
  }, [monthProspects, agentNames, resolveAgent]);

  const grand = useMemo(() => {
    let total = 0, qualified = 0;
    agentNames.forEach((a) => { total += counts[a].total; qualified += counts[a].qualified; });
    return { total, qualified };
  }, [counts, agentNames]);

  const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

  const chartData = useMemo(
    () => agentNames.map((a) => ({
      agent: a,
      Qualifiées: counts[a].qualified,
      "Non qualifiées": Math.max(0, counts[a].total - counts[a].qualified),
    })),
    [counts, agentNames],
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

  return (
    <Card className="shadow-elegant overflow-hidden">
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle className="text-base xl:text-lg flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="xl:text-sm">
            {monthLabel} · {grand.qualified} fiches qualifiées · {grand.total} fiches reçues
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
        {/* Matrix */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs xl:text-sm tabular-nums">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground">
                <th className="text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60">Indicateur</th>
                {agentNames.map((a) => (
                  <th key={a} className="text-right font-semibold px-3 py-2.5 whitespace-nowrap">{a}</th>
                ))}
                <th className="text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: total fiches received */}
              <tr className="border-t border-border hover:bg-accent/30 transition-colors">
                <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS.total }} />
                    Fiches reçues
                  </span>
                </td>
                {agentNames.map((a) => {
                  const v = counts[a].total;
                  return (
                    <td key={a} className={`px-3 py-2.5 text-right ${v === 0 ? "text-muted-foreground/50" : ""}`}>
                      {v === 0 ? "—" : v}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-bold bg-primary/5">{grand.total}</td>
              </tr>
              {/* Row 2: qualified count */}
              <tr className="border-t border-border hover:bg-accent/30 transition-colors">
                <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS.qualified }} />
                    Fiches qualifiées
                  </span>
                </td>
                {agentNames.map((a) => {
                  const v = counts[a].qualified;
                  return (
                    <td key={a} className={`px-3 py-2.5 text-right ${v === 0 ? "text-muted-foreground/50" : ""}`}>
                      {v === 0 ? "—" : v}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-bold bg-primary/5">{grand.qualified}</td>
              </tr>
              {/* Row 3: qualification rate */}
              <tr className="border-t border-border hover:bg-accent/30 transition-colors">
                <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
                    Taux de qualification
                  </span>
                </td>
                {agentNames.map((a) => {
                  const c = counts[a];
                  const empty = c.total === 0;
                  return (
                    <td key={a} className={`px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`}>
                      {empty ? "—" : `${pct(c.qualified, c.total).toFixed(1)}%`}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-bold bg-primary/5">
                  {grand.total > 0 ? `${pct(grand.qualified, grand.total).toFixed(1)}%` : "—"}
                </td>
              </tr>
              {/* Total row */}
              <tr className="border-t-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
                <td className="px-3 py-3 font-bold sticky left-0 bg-primary/10">Total qualifiées</td>
                {agentNames.map((a) => (
                  <td key={a} className="px-3 py-3 text-right font-bold">{counts[a].qualified}</td>
                ))}
                <td className="px-3 py-3 text-right font-extrabold bg-primary/15">{grand.qualified}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Stacked bar chart */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] xl:text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5" />
            Volume par qualificateur
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
                <Bar dataKey="Qualifiées"     stackId="s" fill={COLORS.qualified} radius={[0,0,0,0]} isAnimationActive={false} />
                <Bar dataKey="Non qualifiées" stackId="s" fill="oklch(0.85 0.04 250)" radius={[6,6,0,0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
