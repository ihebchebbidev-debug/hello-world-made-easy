import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import logo from "@/assets/logo-protection.png";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  FileText,
  ShieldCheck,
  Shuffle,
  Wrench,
  Settings,
  
  BarChart3,
  CheckSquare,
  Target,
  Bell,
  Layers,
  GitMerge,
  BookOpen,
  Mail,
  MessageSquare,
  MessageSquareWarning,
  Sliders,
  Users2,
} from "lucide-react";

import { permissionForPath, PUBLIC_AUTH_ROUTES } from "@/lib/permissions";

const items = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Prospects", url: "/prospects", icon: ClipboardList },
  { title: "Contrats", url: "/contracts", icon: FileText },
  { title: "Emails", url: "/emails", icon: Mail },
  { title: "Calendrier", url: "/calendar", icon: CalendarDays },
  { title: "Messagerie", url: "/messaging", icon: MessageSquare },
  { title: "Réclamations", url: "/reclamations", icon: MessageSquareWarning },
  { title: "Tâches", url: "/tasks", icon: CheckSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Étapes", url: "/stages", icon: Layers },
  { title: "Statuts prospects", url: "/statuses/prospects", icon: ClipboardList },
  { title: "Statuts contrats", url: "/statuses/contracts", icon: FileText },
  { title: "Options des listes", url: "/options", icon: Sliders },
  { title: "Objectifs", url: "/objectives", icon: Target },
  { title: "Rapports", url: "/reports", icon: BarChart3 },
  { title: "Réconciliation", url: "/reconciliation", icon: GitMerge },
  { title: "Dispatch", url: "/dispatch", icon: Shuffle },
  { title: "Utilisateurs", url: "/users", icon: Users },
  { title: "Groupes", url: "/groups", icon: Users2 },
  { title: "Rôles", url: "/roles", icon: ShieldCheck },
  { title: "Backoffice", url: "/backoffice", icon: Wrench },
  { title: "Configuration", url: "/configuration", icon: Settings },
  { title: "Documentation", url: "/documentation", icon: BookOpen },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);
  const { user, hasPermission } = useAuth();
  const [unreadEmails, setUnreadEmails] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const r = await api<{ folders: Array<{ name: string; unseen: number }> }>(
          "/emails.php?action=folders",
        );
        if (cancelled) return;
        const inbox = r.folders?.find((f) => /^inbox$/i.test(f.name));
        setUnreadEmails(inbox?.unseen ?? 0);
      } catch {
        if (!cancelled) setUnreadEmails(0);
      }
    };
    fetchUnread();
    const id = window.setInterval(fetchUnread, 60_000);
    const onFocus = () => fetchUnread();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  const displayName = user?.fullName ?? user?.username ?? "Utilisateur";
  const displayRole = user?.role ?? "—";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isFieldRole = user?.role === "Agent" || user?.role === "Vendeur" || user?.role === "Qualificateur";
  const isAdmin = user?.role === "Administrateur";
  // Pages cachées par défaut aux rôles "terrain" (Agent / Vendeur / Qualificateur).
  const FIELD_HIDDEN = new Set(["/reconciliation", "/objectives", "/reports", "/stages"]);
  // Pages réservées à l'Administrateur.
  const ADMIN_ONLY = new Set(["/stages", "/statuses/prospects", "/statuses/contracts", "/documentation", "/configuration"]);
  const visibleItems = items.filter((it) => {
    if (ADMIN_ONLY.has(it.url)) return isAdmin;
    if (isFieldRole && FIELD_HIDDEN.has(it.url)) return false;
    if (PUBLIC_AUTH_ROUTES.has(it.url)) return true;
    const perm = permissionForPath(it.url);
    if (!perm) return true;
    return hasPermission(perm);
  });

  return (
    <aside
      style={{
        backgroundColor: "var(--sidebar)",
        color: "var(--sidebar-foreground)",
      }}
      className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border"
      data-tour="sidebar"
    >
      <div className="px-5 py-5 border-b border-sidebar-border bg-white/95">
        <img src={logo} alt="Protection" className="h-10 w-auto mx-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50 px-3 mb-2">
          Pilotage
        </div>
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = isActive(item.url);
            return (
              <li key={item.url}>
                <Link
                  to={item.url}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-base ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-sidebar-primary" />
                  )}
                  <item.icon
                    className={`h-4 w-4 ${
                      active ? "text-sidebar-primary" : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground"
                    }`}
                  />
                  <span className="font-medium flex-1">{item.title}</span>
                  {item.url === "/emails" && unreadEmails > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                      {unreadEmails > 99 ? "99+" : unreadEmails}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-base p-2.5 cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] text-white flex items-center justify-center text-xs font-semibold ring-2 ring-sidebar/50">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-[11px] text-sidebar-foreground/60 truncate">{displayRole}</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-success" />
        </div>
      </div>
    </aside>
  );
}
