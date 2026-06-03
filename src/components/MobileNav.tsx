import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  FileText,
  ShieldCheck,
  Shuffle,
  Wrench,
  Settings,
  LogOut,
  Search,
  Plus,
} from "lucide-react";
import logo from "@/assets/logo-protection.png";
import { permissionForPath, PUBLIC_AUTH_ROUTES } from "@/lib/permissions";

const groups = [
  {
    label: "Pilotage",
    items: [
      { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
      { title: "Prospects", url: "/prospects", icon: ClipboardList },
      { title: "Contrats", url: "/contracts", icon: FileText },
      { title: "Calendrier", url: "/calendar", icon: CalendarDays },
      { title: "Dispatch", url: "/dispatch", icon: Shuffle },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Utilisateurs", url: "/users", icon: Users },
      { title: "Rôles", url: "/roles", icon: ShieldCheck },
      { title: "Backoffice", url: "/backoffice", icon: Wrench },
      { title: "Configuration", url: "/configuration", icon: Settings },
    ],
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => (p === "/" ? currentPath === "/" : currentPath.startsWith(p));
  const { user, logout, hasPermission } = useAuth();
  const displayName = user?.fullName ?? user?.username ?? "Utilisateur";
  const displayRole = user?.role ?? "—";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  type NavItem = { title: string; url: string; icon: typeof Menu };
  const isFieldRole = user?.role === "Agent" || user?.role === "Vendeur" || user?.role === "Qualificateur";
  const FIELD_HIDDEN = new Set(["/reconciliation", "/objectives", "/reports", "/stages"]);
  const filterItems = (items: NavItem[]): NavItem[] =>
    items.filter((it) => {
      if (it.url === "/configuration" || it.url === "/documentation")
        return user?.role === "Administrateur";
      if (isFieldRole && FIELD_HIDDEN.has(it.url)) return false;
      if (PUBLIC_AUTH_ROUTES.has(it.url)) return true;
      const perm = permissionForPath(it.url);
      if (!perm) return true;
      return hasPermission(perm);
    });
  const visibleGroups = groups
    .map((g) => ({ ...g, items: filterItems(g.items as NavItem[]) }))
    .filter((g) => g.items.length > 0);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base text-foreground"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 100 }}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />

        {/* Drawer */}
        <aside
          style={{
            backgroundColor: "oklch(0.18 0.06 250)",
            color: "oklch(0.95 0.01 240)",
            zIndex: 101,
          }}
          className={`absolute left-0 top-0 bottom-0 h-[100dvh] w-[86%] max-w-xs shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-label="Navigation"
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-3 bg-white/95">
            <img src={logo} alt="Protection" className="h-9 w-auto flex-1 object-contain" />
            <button
              onClick={() => setOpen(false)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted text-foreground/70 hover:text-foreground transition-base"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search — opens unified ⌘K palette */}
          <div className="px-4 pt-4">
            <button
              type="button"
              onClick={() => { setOpen(false); (window as any).__openCommandPalette?.(); }}
              className="w-full flex items-center gap-2 h-10 px-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-base"
            >
              <Search className="h-4 w-4" />
              <span className="truncate">Rechercher prospects, contrats…</span>
            </button>
          </div>

          {/* Quick action */}
          <div className="px-4 pt-3">
            <button className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-gradient-to-r from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] text-white text-sm font-medium shadow-md hover:opacity-95 transition-base">
              <Plus className="h-4 w-4" /> Créer
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 mt-1">
            {visibleGroups.map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50 px-3 mb-1.5">
                  {group.label}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <li key={item.url}>
                        <Link
                          to={item.url}
                          onClick={() => setOpen(false)}
                          className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-base ${
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground active:bg-sidebar-accent/60"
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-sidebar-primary" />
                          )}
                          <item.icon
                            className={`h-4 w-4 ${
                              active
                                ? "text-sidebar-primary"
                                : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground"
                            }`}
                          />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer / user */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-2.5">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] text-white flex items-center justify-center text-xs font-semibold ring-2 ring-sidebar/50">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-[11px] text-sidebar-foreground/60 truncate">{displayRole}</div>
              </div>
              <button
                onClick={logout}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-base"
                aria-label="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
