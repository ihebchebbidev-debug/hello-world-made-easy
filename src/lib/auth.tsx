import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, API_ENABLED, getToken, setToken } from "./api";

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role:
    | "Administrateur"
    | "Manager"
    | "Superviseur"
    | "Agent"
    | "Vendeur"
    | "Qualificateur"
    | "Backoffice"
    | "Présentation";
  team: string;
  active: boolean;
  mustChangePassword?: boolean;
};

export type SignupInput = {
  username: string;
  fullName: string;
  email: string;
  password: string;
  team?: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  apiEnabled: boolean;
  permissions: Record<string, boolean>;
  hasPermission: (key: string) => boolean;
  refreshPermissions: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearMustChange: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

async function loadPermissionsForRole(role: string): Promise<Record<string, boolean>> {
  if (role === "Administrateur") {
    // Admin always has full access
    return new Proxy({} as Record<string, boolean>, { get: () => true }) as any;
  }
  try {
    const r = await api<{ permissions: Record<string, Record<string, boolean> | unknown[]> }>(
      "/roles.php",
    );
    const raw = r.permissions?.[role];
    if (!raw || Array.isArray(raw)) return {};
    return raw as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(API_ENABLED && !!getToken());
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const applyPermsForUser = useCallback(async (u: AuthUser | null) => {
    if (!u) { setPermissions({}); return; }
    const perms = await loadPermissionsForRole(u.role);
    setPermissions(perms);
  }, []);

  useEffect(() => {
    if (!API_ENABLED) { setLoading(false); return; }
    const t = getToken();
    if (!t) { setLoading(false); return; }
    api<{ user: AuthUser }>("/auth_me.php")
      .then(async (r) => {
        setUser(r.user);
        await applyPermsForUser(r.user);
      })
      .catch(() => { setToken(null); setUser(null); })
      .finally(() => setLoading(false));
  }, [applyPermsForUser]);

  const login = async (username: string, password: string) => {
    if (!API_ENABLED) {
      const u: AuthUser = {
        id: "U-DEMO", username: username || "demo", fullName: "Demo User",
        email: `${username || "demo"}@demo.local`, role: "Administrateur",
        team: "Direction", active: true,
      };
      setUser(u);
      await applyPermsForUser(u);
      return;
    }
    const r = await api<{ token: string; user: AuthUser }>("/auth_login.php", {
      method: "POST",
      body: { username, password },
    });
    setToken(r.token);
    setUser(r.user);
    await applyPermsForUser(r.user);
  };

  const signup = async (input: SignupInput) => {
    if (!API_ENABLED) {
      const u: AuthUser = {
        id: "U-DEMO", username: input.username, fullName: input.fullName,
        email: input.email, role: "Agent",
        team: input.team || "Lead-Actifs", active: true,
      };
      setUser(u);
      await applyPermsForUser(u);
      return;
    }
    const r = await api<{ token: string; user: AuthUser }>("/auth_signup.php", {
      method: "POST",
      body: input,
    });
    setToken(r.token);
    setUser(r.user);
    await applyPermsForUser(r.user);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
    }
    if (currentPassword === newPassword) {
      throw new Error("Le nouveau mot de passe doit être différent de l'actuel.");
    }
    if (!API_ENABLED) {
      // Demo mode: no real backend, just simulate success.
      return;
    }
    await api("/auth_change_password.php", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
    setUser((u) => (u ? { ...u, mustChangePassword: false } : u));
  };

  const clearMustChange = () => setUser((u) => (u ? { ...u, mustChangePassword: false } : u));

  const logout = () => {
    if (API_ENABLED) {
      api("/auth_logout.php", { method: "POST" }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    setPermissions({});
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  const hasPermission = useCallback(
    (key: string) => {
      if (!user) return false;
      if (user.role === "Administrateur") return true;
      // Présentation : mode affichage TV — dashboard accessible par défaut.
      if (user.role === "Présentation" && key === "dashboard") {
        return permissions[key] !== false;
      }
      // Defaults: every authenticated user has access to emails and to the
      // contracts module (contract list will server-side scope to the agent).
      if (key === "emails") return permissions[key] !== false;
      if (key === "contract") {
        if (permissions[key] !== undefined) return !!permissions[key];
        return (
          user.role === "Agent" ||
          user.role === "Vendeur" ||
          user.role === "Manager" ||
          user.role === "Superviseur" ||
          user.role === "Backoffice"
        );
      }
      return !!permissions[key];
    },
    [user, permissions],
  );

  const refreshPermissions = useCallback(async () => {
    await applyPermsForUser(user);
  }, [user, applyPermsForUser]);

  return (
    <AuthContext.Provider
      value={{
        user, loading, apiEnabled: API_ENABLED,
        permissions, hasPermission, refreshPermissions,
        login, signup, changePassword, clearMustChange, logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
