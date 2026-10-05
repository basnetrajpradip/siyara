import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  HeartPulse,
  ShoppingCart,
  BookOpen,
  Calendar,
  Users,
  User,
  Stethoscope,
} from "lucide-react"

/** A single clickable nav entry */
export interface NavLink {
  kind: "link"
  href: string
  label: string
  icon: LucideIcon
}

/** A collapsible group of nav entries rendered under one section header */
export interface NavGroup {
  kind: "group"
  label: string
  icon: LucideIcon
  children: NavLink[]
}

export type NavItem = NavLink | NavGroup

export const navItems: NavItem[] = [
  { kind: "link", href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    kind: "group",
    label: "Product",
    icon: Package,
    children: [
      { kind: "link", href: "/products", label: "Products", icon: Package },
      { kind: "link", href: "/categories", label: "Categories", icon: FolderTree },
    ],
  },
  { kind: "link", href: "/orders", label: "Orders", icon: ShoppingCart },
  { kind: "link", href: "/users", label: "Users", icon: Users },
  { kind: "link", href: "/profile", label: "Profile", icon: User },
]
