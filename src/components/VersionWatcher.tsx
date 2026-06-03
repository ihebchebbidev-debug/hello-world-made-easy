import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Polls /version.json (regenerated on every build by scripts/gen-version.mjs)
 * and prompts users to reload when a new deploy is live.
 *
 * Behavior:
 * - Captures the version on mount as the "current" version.
 * - Re-checks every 60s, plus on tab focus / coming back online.
 * - On change, shows a sticky toast with a "Recharger" action. After 30s
 *   without interaction the page reloads automatically so all sessions
 *   converge on the new version.
 */
const POLL_MS = 60_000;
const AUTO_RELOAD_MS = 30_000;

async function fetchVersion(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data?.version ?? null;
  } catch {
    return null;
  }
}

function hardReload() {
  // Bust the SW/HTTP cache for the document on next load.
  const url = new URL(window.location.href);
  url.searchParams.set("_v", String(Date.now()));
  window.location.replace(url.toString());
}

export function VersionWatcher() {
  const currentRef = useRef<string | null>(null);
  const promptedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const check = async () => {
      const v = await fetchVersion();
      if (cancelled || !v) return;
      if (currentRef.current === null) {
        currentRef.current = v;
        return;
      }
      if (v !== currentRef.current && !promptedRef.current) {
        promptedRef.current = true;
        const autoReload = window.setTimeout(hardReload, AUTO_RELOAD_MS);
        toast("Nouvelle version disponible", {
          description:
            "Une mise à jour de l'application est en ligne. Rechargement automatique dans 30 s.",
          duration: AUTO_RELOAD_MS,
          action: {
            label: "Recharger",
            onClick: () => {
              window.clearTimeout(autoReload);
              hardReload();
            },
          },
        });
      }
    };

    void check();
    const interval = window.setInterval(check, POLL_MS);
    const onFocus = () => void check();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, []);

  return null;
}