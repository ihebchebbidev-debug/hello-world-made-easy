import { ReactNode, useEffect, useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { RequireAuth } from "./RequireAuth";
import { PageSkeleton } from "./PageSkeleton";
import { ErpErrorState } from "./ErpErrorState";
import { CommandPalette } from "./CommandPalette";
import { OnboardingTour } from "./OnboardingTour";
import { ForceChangePasswordDialog } from "./ForceChangePasswordDialog";
import { useAuth } from "@/lib/auth";
import { useErp } from "@/lib/erpStore";
import { Bell, Search, Settings, LogOut, UserCircle2, HelpCircle, Plus, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouterState, Link } from "@tanstack/react-router";
import { formatAmount, useCurrency } from "@/lib/currency";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Tableau de bord",
  "/prospects": "Prospects",
  "/contracts": "Contrats",
  "/calendar": "Calendrier",
  "/tasks": "Tâches",
  "/reports": "Rapports",
  "/objectives": "Objectifs",
  "/dispatch": "Dispatch",
  "/users": "Utilisateurs",
  "/roles": "Rôles",
  "/backoffice": "Backoffice",
  "/configuration": "Configuration",
};

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  return `il y a ${days} j`;
}

export function AppLayout({ children, skeleton = "dashboard" }: { children: ReactNode; skeleton?: "dashboard" | "table" | "detail" | "list" | "form" }) {
  const { loading, error, hydrated } = useErp();
  const isHydrating = loading && !hydrated && !error;
  const showError = !!error && !hydrated;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const segments = path.split("/").filter(Boolean);
  const currentLabel =
    ROUTE_LABELS[`/${segments[0] ?? ""}`] ?? ROUTE_LABELS["/"] ?? "Tableau de bord";
  const currency = useCurrency();
  const erp = useErp();
  const NOTIFICATIONS = useMemo(() => {
    const items: { id: string; title: string; desc: string; time: string; unread: boolean }[] = [];
    erp.contracts.slice(0, 3).forEach((c) => items.push({
      id: `c-${c.id}`,
      title: "Contrat signé",
      desc: `${c.firstName} ${c.lastName} · ${formatAmount(c.premium, currency)}`,
      time: timeAgo(c.signatureDate),
      unread: true,
    }));
    erp.prospects.filter((p) => p.assignedTo === null).slice(0, 2).forEach((p) => items.push({
      id: `p-${p.id}`,
      title: "Nouveau lead à dispatcher",
      desc: `${p.firstName} ${p.lastName} — ${p.source}`,
      time: timeAgo(p.createdAt),
      unread: true,
    }));
    return items.slice(0, 5);
  }, [erp.contracts, erp.prospects, currency]);
  const [unread, setUnread] = useState(0);
  useEffect(() => { setUnread(NOTIFICATIONS.filter((n) => n.unread).length); }, [NOTIFICATIONS]);
  const { user, logout } = useAuth();
  const displayUsername = user?.username ?? "Utilisateur";
  const displayFullName = user?.fullName ?? displayUsername;
  const displayRole = user?.role ?? "—";
  const displayEmail = user?.email ?? "";
  const initials = displayUsername.split(/[.\s_-]+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Mode TV : rôle "Présentation" → on retire toute la chrome (sidebar/header)
  // pour un affichage plein écran adapté à un écran de réunion.
  const isPresentation = user?.role === "Présentation";
  if (isPresentation) {
    return (
      <RequireAuth>
        <div className="min-h-screen w-full bg-background" data-tv-mode="true">
          <main className="min-h-screen">
            {showError ? <ErpErrorState message={error!} />
              : isHydrating ? <PageSkeleton variant={skeleton} />
              : children}
          </main>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="h-full pl-3 pr-3 md:pl-6 md:pr-5 flex items-center gap-3">
            <MobileNav />

            {/* Breadcrumb / page label */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Protection</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-medium text-foreground">{currentLabel}</span>
            </div>

            {/* Search */}
            <button
              type="button"
              onClick={() => (window as any).__openCommandPalette?.()}
              data-tour="search"
              className="flex-1 max-w-xl mx-auto hidden sm:flex items-center gap-2 h-10 px-3.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-base text-sm text-muted-foreground cursor-pointer text-left"
            >
              <Search className="h-4 w-4" />
              <span className="truncate">Rechercher prospects, contrats, utilisateurs…</span>
              <kbd className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Mobile search trigger — opens the same ⌘K palette */}
            <button
              type="button"
              onClick={() => (window as any).__openCommandPalette?.()}
              className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base text-muted-foreground hover:text-foreground"
              aria-label="Rechercher"
              title="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Right cluster — pinned to right border */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                data-tour="create"
                className="hidden md:inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-base shadow-sm"
                title="Créer"
              >
                <Plus className="h-4 w-4" /> Créer
              </button>

              <button
                onClick={() => (window as any).__startOnboardingTour?.()}
                data-tour="help"
                className="hidden md:inline-flex h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base items-center justify-center text-muted-foreground hover:text-foreground"
                title="Relancer la visite guidée"
              >
                <HelpCircle className="h-4 w-4" />
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => setUnread(0)}
                    data-tour="notifications"
                    className="relative h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/60 transition-base inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background">
                        {unread}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="text-sm font-semibold">Notifications</div>
                    <button className="text-xs text-primary hover:underline">Tout marquer lu</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-base"
                      >
                        <div className="flex items-start gap-2.5">
                          {n.unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                          <div className={`flex-1 min-w-0 ${!n.unread && "pl-4"}`}>
                            <div className="text-sm font-medium truncate">{n.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{n.desc}</div>
                            <div className="text-[11px] text-muted-foreground/70 mt-0.5">{n.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-border text-center">
                    <button className="text-xs text-primary hover:underline">Voir toutes les notifications</button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="hidden sm:block h-6 w-px bg-border mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button data-tour="user-menu" className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-muted/60 transition-base">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[oklch(0.68_0.17_55)] to-[oklch(0.78_0.15_70)] flex items-center justify-center text-xs font-semibold text-white ring-2 ring-background">
                        {initials}
                      </div>
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-success ring-2 ring-background" />
                    </div>
                    <div className="hidden lg:block text-left leading-tight">
                      <div className="text-sm font-medium">@{displayUsername}</div>
                      <div className="text-[11px] text-muted-foreground">{displayFullName !== displayUsername ? `${displayFullName} • ${displayRole}` : displayRole}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">@{displayUsername}</div>
                    <div className="text-xs text-muted-foreground font-normal">{displayFullName !== displayUsername ? displayFullName : ""}{displayEmail ? ` • ${displayEmail}` : ""}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserCircle2 className="h-4 w-4 mr-2" /> Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          {showError ? <ErpErrorState message={error!} />
            : isHydrating ? <PageSkeleton variant={skeleton} />
            : children}
        </main>
      </div>
      <CommandPalette />
      <OnboardingTour />
      <ForceChangePasswordDialog />
    </div>
    </RequireAuth>
  );
}
