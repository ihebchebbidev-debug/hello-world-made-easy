import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Loader2, ShieldAlert, Home, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  permissionForPath,
  PUBLIC_AUTH_ROUTES,
  ROUTE_PERMISSION,
} from "@/lib/permissions";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Tableau de bord",
  "/prospects": "Prospects",
  "/contracts": "Contrats",
  "/calendar": "Calendrier",
  "/dispatch": "Dispatch",
  "/users": "Utilisateurs",
  "/roles": "Rôles",
  "/backoffice": "Backoffice",
  "/tasks": "Tâches",
  "/notifications": "Notifications",
  "/stages": "Étapes",
  "/objectives": "Objectifs",
  "/reports": "Rapports",
  "/configuration": "Configuration",
};

/**
 * Wraps protected pages. If no user is logged in, redirects to /login.
 * Also enforces per-route role permissions, and shows a friendly
 * Access-Denied page with a smart fallback to the first allowed route.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user && path !== "/login") {
      navigate({ to: "/login" });
    }
  }, [user, loading, path, navigate]);

  const requiredPerm = useMemo(
    () => (PUBLIC_AUTH_ROUTES.has(path) ? null : permissionForPath(path)),
    [path],
  );

  // Find the first route the user IS allowed to access (fallback target).
  const firstAllowed = useMemo(() => {
    if (!user) return "/";
    const order = [
      "/",
      "/prospects",
      "/contracts",
      "/calendar",
      "/dispatch",
      "/users",
      "/roles",
      "/backoffice",
    ];
    for (const r of order) {
      const p = ROUTE_PERMISSION[r];
      if (!p || hasPermission(p)) return r;
    }
    // Fallback to a public auth route
    return "/tasks";
  }, [user, hasPermission]);

  const lastToastKey = useRef<string>("");
  useEffect(() => {
    if (!user || !requiredPerm || hasPermission(requiredPerm)) return;
    const key = `${path}:${user.role}`;
    if (lastToastKey.current === key) return;
    lastToastKey.current = key;
    const pageLabel = ROUTE_LABELS[path] ?? path;
    toast.error("Accès refusé", {
      description: `${pageLabel} n'est pas autorisée pour le rôle ${user.role}.`,
      duration: 4000,
    });
  }, [user, requiredPerm, hasPermission, path]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requiredPerm && !hasPermission(requiredPerm)) {
    const pageLabel = ROUTE_LABELS[path] ?? path;
    const fallbackLabel = ROUTE_LABELS[firstAllowed] ?? "Accueil";

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-5 ring-1 ring-destructive/20">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Accès refusé
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            La page <span className="font-medium text-foreground">{pageLabel}</span>{" "}
            n'est pas autorisée pour votre rôle&nbsp;
            <span className="font-medium text-foreground">{user.role}</span>.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur
            pour ajuster vos permissions.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button asChild size="sm">
              <Link to={firstAllowed}>
                <Home className="h-4 w-4 mr-2" />
                Aller à {fallbackLabel}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
