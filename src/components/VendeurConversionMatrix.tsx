import { memo, useMemo, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { LayoutGrid, AlertCircle } from "lucide-react";
import { useErp } from "@/lib/erpStore";
import { formatAmount, useCurrency } from "@/lib/currency";
import { useRdvConversion } from "@/lib/useRdvConversion";

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

export const VendeurConversionMatrix = memo(function VendeurConversionMatrix({
  title = "Conversion RDV → Vente par vendeur",
}: { title?: string } = {}) {
  const { users } = useErp();
  const currency = useCurrency();

  const now = new Date();
  const [ym, setYm] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );
  const [year, monthIdx] = ym.split("-").map(Number);
  const monthLabel = `${MONTHS_FR[(monthIdx ?? 1) - 1]} ${year}`;

  const { data, isLoading, error } = useRdvConversion(ym);

  // Map vendor (username) -> display name (fullName fallback to username).
  const displayOf = useMemo(() => {
    const m = new Map<string, string>();
    users.forEach((u) => {
      m.set(u.username.toLowerCase(), u.fullName?.trim() || u.username);
    });
    return (vendor: string) => m.get(vendor.toLowerCase()) ?? vendor;
  }, [users]);

  const rows = data?.rows ?? [];
  const totals = data?.totals;

  // Stable column order: by RDV taken desc, then alpha.
  const vendors = useMemo(
    () => [...rows].sort((a, b) => b.rdv_taken - a.rdv_taken || a.vendor.localeCompare(b.vendor)),
    [rows],
  );



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
            {monthLabel}
            {totals && (
              <> · {totals.rdv_taken} RDV pris · {totals.sales_from_rdv} ventes
              {" "}({totals.conversion_rate}%) · {formatAmount(totals.revenue_from_rdv, currency)}</>
            )}
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

        {/* Summary strip — RDV / Ventes RDV / Taux per vendor */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-xs xl:text-sm tabular-nums">
            <thead>
              <tr className="bg-muted/60 text-muted-foreground">
                <th className="text-left font-semibold px-3 py-2.5 sticky left-0 bg-muted/60">Indicateur</th>
                {vendors.map((v) => (
                  <th key={v.vendor} className="text-right font-semibold px-3 py-2.5 whitespace-nowrap">
                    {displayOf(v.vendor)}
                  </th>
                ))}
                <th className="text-right font-bold px-3 py-2.5 bg-primary/10 text-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">RDV pris</td>
                {vendors.map((v) => (
                  <td key={v.vendor} className="px-3 py-2.5 text-right">{v.rdv_taken || "—"}</td>
                ))}
                <td className="px-3 py-2.5 text-right font-bold bg-primary/5">{totals?.rdv_taken ?? 0}</td>
              </tr>
              <tr className="border-t border-border bg-accent/20">
                <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">Ventes issues RDV</td>
                {vendors.map((v) => (
                  <td key={v.vendor} className="px-3 py-2.5 text-right">{v.sales_from_rdv || "—"}</td>
                ))}
                <td className="px-3 py-2.5 text-right font-bold bg-primary/5">{totals?.sales_from_rdv ?? 0}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2.5 font-semibold sticky left-0 bg-card">Taux conversion</td>
                {vendors.map((v) => {
                  const good = v.conversion_rate >= 50;
                  return (
                    <td key={v.vendor} className={`px-3 py-2.5 text-right font-medium ${good ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                      {v.rdv_taken > 0 ? `${v.conversion_rate}%` : "—"}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-bold bg-primary/5">
                  {totals && totals.rdv_taken > 0 ? `${totals.conversion_rate}%` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>



        {isLoading && !data && (
          <div className="text-xs text-muted-foreground">Chargement…</div>
        )}
      </CardContent>
    </Card>
  );
});

type RdvVendor = {
  vendor: string;
  rdv_taken: number;
  sales_from_rdv: number;
  revenue_from_rdv: number;
  conversion_rate: number;
};
