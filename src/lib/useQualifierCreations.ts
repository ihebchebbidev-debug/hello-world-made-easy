import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type QualifierCreationsPoint = { date: string; value: number };
export type QualifierCreationsSeries = {
  username: string;
  name: string;
  total: number;
  points: QualifierCreationsPoint[];
};
export type QualifierCreationsCoverage = {
  totalProspectsInMonth: number;
  fromActivityLog: number;
  fromAssigneeFallback: number;
  unattributed: number;
};
export type QualifierCreationsPayload = {
  month: string;
  axis: string[];
  series: QualifierCreationsSeries[];
  daily: QualifierCreationsPoint[];
  grandTotal: number;
  coverage?: QualifierCreationsCoverage;
};

export function useQualifierCreations(ym: string) {
  const [data, setData] = useState<QualifierCreationsPayload | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = () => {
      setIsLoading(true);
      setError(null);
      return api<QualifierCreationsPayload>(`/qualifier_creations.php`, { query: { ym } })
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
