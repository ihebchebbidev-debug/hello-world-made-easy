import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type RdvAgentsPoint = { date: string; value: number };
export type RdvAgentsSeries = {
  username: string;
  name: string;
  full_name?: string;
  first_name: string;
  total: number;
  unique: number;
  won: number;
  lost: number;
  nrp: number;
  failed: number;
  pending: number;
  conversion: number;
  points: RdvAgentsPoint[];
};
export type RdvAgentsPayload = {
  month: string;
  axis: string[];
  series: RdvAgentsSeries[];
  daily: RdvAgentsPoint[];
  grandTotal: number;
  grandWon: number;
  grandFailed: number;
};

export function useRdvAgents(ym: string) {
  const [data, setData] = useState<RdvAgentsPayload | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = () => {
      setIsLoading(true);
      setError(null);
      return api<RdvAgentsPayload>(`/rdv_agents.php`, { query: { ym } })
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
