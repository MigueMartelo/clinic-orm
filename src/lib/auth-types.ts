import type { Database } from "@/lib/supabase/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  receptionist: "Recepción",
  doctor: "Doctora",
  user: "Usuario",
};

export const userRoles: UserRole[] = [
  "receptionist",
  "doctor",
  "admin",
  "user",
];

/** Roles that staff admins can assign when creating users */
export const assignableRoles: UserRole[] = [
  "receptionist",
  "doctor",
  "user",
];
