import type { Database } from "@/lib/supabase/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
};

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  recepcion: "Recepción",
  doctora: "Doctora",
};

export const userRoles: UserRole[] = ["recepcion", "doctora", "admin"];
