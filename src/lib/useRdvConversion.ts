import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type RdvConversionRow = {
  vendor: string;
  rdv_taken: number;
  sales_from_rdv: number;
  revenue_from_rdv: number;
  conversion_rate: number;
  by_partner: Record<string, { count: number; revenue: number }>;
  cancelled: { count: number; revenue: number };
};

export type RdvConversionPayload = {
  month: string;
  rows: RdvConversionRow[];
  totals: {
    rdv_taken: number;
    sales_from_rdv: number;
    revenue_from_rdv: number;
    conversion_rate: number;
    by_partner: Record<string, { count: number; revenue: number }>;
    cancelled: { count: number; revenue: number };
  };
};

export function useRdvConversion(ym: string) {
  const [data, setData] = useState<RdvConversionPayload | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = () => {
      setIsLoading(true);
      setError(null);
      return api<RdvConversionPayload>(`/rdv_conversion.php`, { query: { ym } })
        .then((d) => { if (!cancelled) setData(d); })
        .catch((e) => { if (!cancelled) setError(e as Error); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    };
    fetchOnce();
    const id = window.setInterval(fetchOnce, 10 * 60 * 1000);
    const onFocus = () => fetchOnce();
    const onVis = () => { if (document.visibilityState === "visible") fetchOnce(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ym]);

  return { data, error, isLoading };
}
