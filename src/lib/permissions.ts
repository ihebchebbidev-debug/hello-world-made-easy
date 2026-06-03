// Mapping between sidebar/route paths and permission keys defined in roles.php.
// Keep in sync with `sections` in src/routes/roles.tsx.
export const ROUTE_PERMISSION: Record<string, string> = {
  "/": "dashboard",
  "/prospects": "prospect",
  "/contracts": "contract",
  "/calendar": "calendar",
  "/dispatch": "dispatch",
  "/users": "users",
  "/groups": "users",
  "/roles": "role",
  "/backoffice": "backoffice",
  "/tasks": "tasks",
  "/notifications": "notifications",
  "/emails": "emails",
  "/stages": "stages",
  "/objectives": "objectives",
  "/reports": "reports",
  "/reconciliation": "reconciliation",
  "/configuration": "configuration",
  "/documentation": "documentation",
};

// Routes always available to authenticated users (no permission required).
export const PUBLIC_AUTH_ROUTES = new Set<string>([
  "/profile",
  "/messaging",
  "/reclamations",
]);

export function permissionForPath(path: string): string | null {
  // Match the longest known prefix
  const segments = path.split("/").filter(Boolean);
  const top = "/" + (segments[0] ?? "");
  if (path === "/") return ROUTE_PERMISSION["/"] ?? null;
  return ROUTE_PERMISSION[top] ?? null;
}

// ----- Role helpers ---------------------------------------------------------
// Centralised so adding a new role (Vendeur, Qualificateur, Superviseur, …)
// only requires editing these sets.

/** "Field" roles: their scope is limited to entities assigned to them. */
export const FIELD_ROLES = new Set(["Agent", "Vendeur", "Qualificateur"]);

/** Roles that can OWN a prospect / contract (appear in assignee pickers). */
export const ASSIGNABLE_ROLES = new Set([
  "Agent",
  "Vendeur",
  "Qualificateur",
  "Manager",
  "Superviseur",
]);

export const isFieldRole = (role?: string | null) => !!role && FIELD_ROLES.has(role);
export const isAssignableRole = (role?: string | null) =>
  !!role && ASSIGNABLE_ROLES.has(role);
