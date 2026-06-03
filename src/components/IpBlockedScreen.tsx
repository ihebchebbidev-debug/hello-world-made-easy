import { useEffect, useState } from "react";
import { ShieldX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setToken } from "@/lib/api";

type Detail = { message: string; ip?: string };

/**
 * Full-screen takeover shown when the backend rejects a request with
 * code=IP_NOT_ALLOWED. Mounted once at the app root; listens to the
 * `erp:ip-blocked` window event dispatched from src/lib/api.ts.
 */
export function IpBlockedScreen() {
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    const onBlocked = (e: Event) => {
      const d = (e as CustomEvent<Detail>).detail;
      setDetail({ message: d?.message ?? "Accès refusé.", ip: d?.ip });
      // Clear token so the user can't keep retrying authenticated calls in loop.
      try { setToken(null); } catch { /* ignore */ }
    };
    window.addEventListener("erp:ip-blocked", onBlocked as EventListener);
    return () => window.removeEventListener("erp:ip-blocked", onBlocked as EventListener);
  }, []);

  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-destructive/30 bg-card p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-5 ring-1 ring-destructive/20">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Accès non autorisé
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {detail.message}
        </p>
        {detail.ip && (
          <p className="mt-3 inline-block rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
            IP détectée : {detail.ip}
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur
          pour qu'il ajoute votre adresse IP à la liste des accès autorisés.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            size="sm"
            onClick={() => { setDetail(null); window.location.href = "/login"; }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  );
}
