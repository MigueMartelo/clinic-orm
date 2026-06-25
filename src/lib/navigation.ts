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
    href: "/pacientes",
    icon: Users,
    roles: ["admin", "recepcion", "doctora"],
  },
  {
    title: "Atenciones",
    href: "/atenciones",
    icon: ClipboardList,
    roles: ["admin", "recepcion", "doctora"],
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Package,
    roles: ["admin", "recepcion"],
  },
  {
    title: "Cartera",
    href: "/cartera",
    icon: Wallet,
    roles: ["admin", "recepcion", "doctora"],
  },
  {
    title: "Usuarios",
    href: "/usuarios",
    icon: UserCog,
    roles: ["admin"],
  },
];

export function filterNavByRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}
