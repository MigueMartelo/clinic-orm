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
    roles: ["admin", "receptionist", "doctor", "user"],
  },
  {
    title: "Pacientes",
    href: "/patients",
    icon: Users,
    roles: ["admin", "receptionist", "doctor", "user"],
  },
  {
    title: "Atenciones",
    href: "/attendances",
    icon: ClipboardList,
    roles: ["admin", "receptionist", "doctor", "user"],
  },
  {
    title: "Inventario",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "receptionist"],
  },
  {
    title: "Cartera",
    href: "/receivables",
    icon: Wallet,
    roles: ["admin", "receptionist", "doctor", "user"],
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
