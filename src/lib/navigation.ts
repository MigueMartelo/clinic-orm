import {
  ClipboardList,
  LayoutDashboard,
  Package,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/lib/auth-types";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const navItems: NavItem[] = [
  {
    title: "Tablero",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "recepcion", "doctora"],
  },
  {
    title: "Pacientes",
    href: "/patients",
    icon: Users,
    roles: ["admin", "recepcion", "doctora"],
  },
  {
    title: "Atenciones",
    href: "/attendances",
    icon: ClipboardList,
    roles: ["admin", "recepcion", "doctora"],
  },
  {
    title: "Inventario",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "recepcion"],
  },
  {
    title: "Cartera",
    href: "/receivables",
    icon: Wallet,
    roles: ["admin", "recepcion", "doctora"],
  },
  {
    title: "Usuarios",
    href: "/users",
    icon: UserCog,
    roles: ["admin"],
  },
];

export function filterNavByRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}
