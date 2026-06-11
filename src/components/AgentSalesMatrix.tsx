import { isAssignableRole } from "@/lib/permissions";
import { memo, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { LayoutGrid, BarChart3 } from "lucide-react";
import { useErp } from "@/lib/erpStore";
import { useAuth } from "@/lib/auth";
import { useStatusOptions, type StatusOption } from "@/lib/useStatusOptions";
import { useOptionList } from "@/lib/useOptionList";
import { formatAmount, useCurrency } from "@/lib/currency";
import { useAllUserGroups } from "@/lib/userGroups";

const STATUS_DOT_COLOR: Record<string, string> = {
  success: "oklch(0.45 0.64 140)",
  warning: "oklch(0.85 0.6 80)",
  destructive: "oklch(0.65 0.75 25)",
  info: "oklch(0.62 0.65 260)",
  primary: "oklch(0.6 0.7 190)",
  accent: "oklch(0.72 0.62 320)",
  muted: "oklch(0.62 0.05 240)",
};

const colorFor = (status: string, options: Map<string, StatusOption>) => {
  const option = options.get(status);
  return option ? STATUS_DOT_COLOR[option.color] ?? STATUS_DOT_COLOR.muted : STATUS_DOT_COLOR.muted;
};

const EXCLUDED_BILLING_STATUSES = new Set(["annuler la confirmation", "rétractation", "résiliation"]);
const isExcludedBillingStatus = (status: string) => EXCLUDED_BILLING_STATUSES.has((status || "").trim().toLowerCase());

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

export const AgentSalesMatrix = memo(function AgentSalesMatrix({
  roleFilter,
  groupFilter,
  title = "Ventes par agent & compagnie",
}: { roleFilter?: ReadonlySet<string>; groupFilter?: string | ReadonlyArray<string>; title?: string } = {}) {
  const { contracts, users } = useErp();
  const { user } = useAuth();
  const currency = useCurrency();
  const { options: billingStatusOptions } = useStatusOptions("contract");
  const { values: PARTNERS } = useOptionList("contract", "partner");
  const allUserGroups = useAllUserGroups();

  const billingStatusByValue = useMemo(
    () => new Map<string, StatusOption>(billingStatusOptions.map((o) => [o.value, o])),
    [billingStatusOptions],
  );

  const now = new Date();
  const [ym, setYm] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [year, monthIdx] = ym.split("-").map(Number);
  const monthLabel = `${MONTHS_FR[(monthIdx ?? 1) - 1]} ${year}`;

  const isPriv = user?.role === "Administrateur" || user?.role === "Manager" || user?.role === "Présentation";

  // Build agent display list + resolver that maps any assignedTo value
  // (username OR full name, any case) to a canonical display name.
  const { agentNames, resolveAgent } = useMemo(() => {
    const wantedGroups = groupFilter
      ? new Set(
          (Array.isArray(groupFilter) ? groupFilter : [groupFilter]).map((g) =>
            g.trim().toLowerCase(),
          ),
        )
      : null;
    const staff = users.filter((u) => {
      if (!isAssignableRole(u.role)) return false;
      const roleOk = roleFilter ? roleFilter.has(u.role) : false;
      const groupOk = wantedGroups
        ? (allUserGroups[u.id] || []).some((g) => wantedGroups.has(g.toLowerCase()))
        : false;
      // If no filter at all, accept everyone assignable. Otherwise accept if EITHER matches.
      if (!roleFilter && !wantedGroups) return true;
      return roleOk || groupOk;
    });

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
          return me ? [me] : [];
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
  }, [users, isPriv, user, roleFilter, groupFilter, allUserGroups]);

  const monthContracts = useMemo(() => {
    return contracts.filter((c) => {
      const d = c.signatureDate || "";
      return d.startsWith(ym);
    });
  }, [contracts, ym]);

  const statusRows = useMemo(() => {
    const rows = billingStatusOptions.map((o) => o.value);
    const extraStatuses = Array.from(
      new Set(monthContracts
        .map((c) => (c.billingStatus ?? "").trim())
        .filter((status) => status && !billingStatusByValue.has(status))),
    );
    return [...rows, ...extraStatuses];
  }, [billingStatusOptions, billingStatusByValue, monthContracts]);

  const partnerRows = useMemo(() => {
    const rows = PARTNERS.length ? PARTNERS : ["Autre"];
    const extraPartners = Array.from(
      new Set(monthContracts
        .map((c) => (c.partner ?? "").trim())
        .filter((partner) => partner && !rows.includes(partner))),
    );
    return [...rows, ...extraPartners];
  }, [PARTNERS, monthContracts]);

  // Build matrix: rows (billing statuses) × cols (agents) → revenue + count
  type Cell = { revenue: number; count: number };
  const matrix = useMemo(() => {
    const rows = statusRows.length ? statusRows : ["Autre"];
    const data: Record<string, Record<string, Cell>> = {};
    rows.forEach((r) => {
      data[r] = {};
      agentNames.forEach((a) => { data[r][a] = { revenue: 0, count: 0 }; });
    });
    monthContracts.forEach((c) => {
      const agent = resolveAgent(c.assignedTo);
      if (!agent) return;
      const status = (c.billingStatus ?? "").trim() || "Autre";
      const row = rows.includes(status) ? status : "Autre";
      if (!data[row]) return;
      const cell = data[row][agent];
      if (!cell) return;
      cell.revenue += Number(c.premium) || 0;
      cell.count += 1;
    });
    return { rows, data };
  }, [monthContracts, agentNames, resolveAgent, statusRows]);

  const partnerMatrix = useMemo(() => {
    const rows = partnerRows.length ? partnerRows : ["Autre"];
    const data: Record<string, Record<string, Cell>> = {};
    rows.forEach((r) => {
      data[r] = {};
      agentNames.forEach((a) => { data[r][a] = { revenue: 0, count: 0 }; });
    });
    monthContracts.forEach((c) => {
      if (isExcludedBillingStatus(c.billingStatus ?? "")) return;
      const agent = resolveAgent(c.assignedTo);
      if (!agent) return;
      const partner = (c.partner ?? "").trim() || "Autre";
      const row = rows.includes(partner) ? partner : "Autre";
      if (!data[row]) return;
      const cell = data[row][agent];
      if (!cell) return;
      cell.revenue += Number(c.premium) || 0;
      cell.count += 1;
    });
    return { rows, data };
  }, [monthContracts, agentNames, resolveAgent, partnerRows]);

  const activeColTotals = useMemo(() => {
    const out: Record<string, Cell> = {};
    agentNames.forEach((a) => {
      let revenue = 0, count = 0;
      matrix.rows.forEach((r) => {
        if (isExcludedBillingStatus(r)) return;
        revenue += matrix.data[r][a].revenue;
        count += matrix.data[r][a].count;
      });
      out[a] = { revenue, count };
    });
    return out;
  }, [matrix, agentNames]);

  const rowTotals = useMemo(() => {
    const out: Record<string, Cell> = {};
    matrix.rows.forEach((r) => {
      let revenue = 0, count = 0;
      agentNames.forEach((a) => {
        revenue += matrix.data[r][a].revenue;
        count += matrix.data[r][a].count;
      });
      out[r] = { revenue, count };
    });
    return out;
  }, [matrix, agentNames]);

  const partnerRowTotals = useMemo(() => {
    const out: Record<string, Cell> = {};
    partnerMatrix.rows.forEach((r) => {
      let revenue = 0, count = 0;
      agentNames.forEach((a) => {
        revenue += partnerMatrix.data[r][a].revenue;
        count += partnerMatrix.data[r][a].count;
      });
      out[r] = { revenue, count };
    });
    return out;
  }, [partnerMatrix, agentNames]);

  const partnerColTotals = useMemo(() => {
    const out: Record<string, Cell> = {};
    agentNames.forEach((a) => {
      let revenue = 0, count = 0;
      partnerMatrix.rows.forEach((r) => {
        revenue += partnerMatrix.data[r][a].revenue;
        count += partnerMatrix.data[r][a].count;
      });
      out[a] = { revenue, count };
    });
    return out;
  }, [partnerMatrix, agentNames]);

  const grandTotal = useMemo(() => {
    let revenue = 0, count = 0;
    agentNames.forEach((a) => { revenue += activeColTotals[a].revenue; count += activeColTotals[a].count; });
    return { revenue, count };
  }, [activeColTotals, agentNames]);

  const partnerGrandTotal = useMemo(() => {
    let revenue = 0, count = 0;
    agentNames.forEach((a) => { revenue += partnerColTotals[a].revenue; count += partnerColTotals[a].count; });
    return { revenue, count };
  }, [partnerColTotals, agentNames]);

  // Stacked chart data — one bar per agent, segments per partner (count-based)
  const chartData = useMemo(() => {
    return agentNames.map((a) => {
      const row: Record<string, string | number> = { agent: a };
      matrix.rows.forEach((r) => { row[r] = matrix.data[r][a].count; });
      return row;
    });
  }, [matrix, agentNames]);

  // Month options: last 12 months
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
            <LayoutGrid className="h-4 w-4 xl:h-5 xl:w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="xl:text-sm">
            {monthLabel} · {grandTotal.count} ventes · {formatAmount(grandTotal.revenue, currency)}
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
        {/* Matrix table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs xl:text-sm tabular-nums">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground">
                <th className="text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60">Statut facturation</th>
                {agentNames.map((a) => (
                  <th key={a} className="text-right font-semibold px-3 py-2.5 whitespace-nowrap">{a}</th>
                ))}
                <th className="text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground">C.A</th>
                <th className="text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground">Nbr Ventes</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((r) => {
                const dot = colorFor(r, billingStatusByValue);
                return (
                  <tr key={r} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
                        {r}
                      </span>
                    </td>
                    {agentNames.map((a) => {
                      const cell = matrix.data[r][a];
                      const empty = cell.revenue === 0 && cell.count === 0;
                      return (
                        <td key={a} className={`px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`}>
                          {empty ? "—" : (
                            <div className="flex flex-col items-end leading-tight">
                              <span className="font-medium">{formatAmount(cell.revenue, currency)}</span>
                              <span className="text-[10px] xl:text-[11px] text-muted-foreground">{cell.count} vente{cell.count > 1 ? "s" : ""}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-right font-bold bg-primary/5">
                      {formatAmount(rowTotals[r].revenue, currency)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold bg-primary/5">
                      {rowTotals[r].count}
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="border-t-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
                <td className="px-3 py-3 font-bold sticky left-0 bg-primary/10">Total</td>
                {agentNames.map((a) => (
                  <td key={a} className="px-3 py-3 text-right font-bold">
                    <div className="flex flex-col items-end leading-tight">
                      <span>{formatAmount(activeColTotals[a].revenue, currency)}</span>
                      <span className="text-[10px] xl:text-[11px] font-medium text-muted-foreground">{activeColTotals[a].count} vente{activeColTotals[a].count > 1 ? "s" : ""}</span>
                    </div>
                  </td>
                ))}
                <td className="px-3 py-3 text-right font-extrabold bg-primary/15">
                  {formatAmount(grandTotal.revenue, currency)}
                </td>
                <td className="px-3 py-3 text-right font-extrabold bg-primary/15">
                  {grandTotal.count}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Partner matrix table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <div className="px-4 py-3 border-b border-border bg-muted/50 text-sm font-semibold">Par défaut par compagnie</div>
          <table className="w-full text-xs xl:text-sm tabular-nums">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground">
                <th className="text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60">Compagnie</th>
                {agentNames.map((a) => (
                  <th key={a} className="text-right font-semibold px-3 py-2.5 whitespace-nowrap">{a}</th>
                ))}
                <th className="text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground">C.A</th>
                <th className="text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground">Nbr Ventes</th>
              </tr>
            </thead>
            <tbody>
              {partnerMatrix.rows.map((r) => (
                <tr key={r} className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">{r}</td>
                  {agentNames.map((a) => {
                    const cell = partnerMatrix.data[r][a];
                    const empty = cell.revenue === 0 && cell.count === 0;
                    return (
                      <td key={a} className={`px-3 py-2.5 text-right ${empty ? "text-muted-foreground/50" : ""}`}>
                        {empty ? "—" : (
                          <div className="flex flex-col items-end leading-tight">
                            <span className="font-medium">{formatAmount(cell.revenue, currency)}</span>
                            <span className="text-[10px] xl:text-[11px] text-muted-foreground">{cell.count} vente{cell.count > 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-right font-bold bg-primary/5">{formatAmount(partnerRowTotals[r].revenue, currency)}</td>
                  <td className="px-3 py-2.5 text-right font-bold bg-primary/5">{partnerRowTotals[r].count}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
                <td className="px-3 py-3 font-bold sticky left-0 bg-primary/10">Total</td>
                {agentNames.map((a) => (
                  <td key={a} className="px-3 py-3 text-right font-bold">
                    <div className="flex flex-col items-end leading-tight">
                      <span>{formatAmount(partnerColTotals[a].revenue, currency)}</span>
                      <span className="text-[10px] xl:text-[11px] font-medium text-muted-foreground">{partnerColTotals[a].count} vente{partnerColTotals[a].count > 1 ? "s" : ""}</span>
                    </div>
                  </td>
                ))}
                <td className="px-3 py-3 text-right font-extrabold bg-primary/15">{formatAmount(partnerGrandTotal.revenue, currency)}</td>
                <td className="px-3 py-3 text-right font-extrabold bg-primary/15">{partnerGrandTotal.count}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
