export const appRoles = ["solo_user", "support_worker", "team_leader", "company_admin"] as const;

export type AppRole = (typeof appRoles)[number];

export type AuthProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  company_id: string | null;
  company?: {
    id: string;
    name: string;
    plan: string | null;
  } | null;
};

export function getRoleLabel(role?: string | null) {
  switch (role) {
    case "company_admin":
      return "Company Admin";
    case "team_leader":
      return "Team Leader";
    case "support_worker":
      return "Worker";
    case "solo_user":
      return "Solo User";
    default:
      return "Demo User";
  }
}

export function canOpenAdmin(role?: string | null) {
  return role === "company_admin" || role === "team_leader";
}

export function canManageTeam(role?: string | null) {
  return role === "company_admin";
}
