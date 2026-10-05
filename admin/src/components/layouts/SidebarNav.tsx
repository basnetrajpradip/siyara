"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router"
import { ChevronDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { navItems, type NavGroup, type NavLink } from "@/config/navigation"
import { cn } from "@/lib/utils"

function isHrefActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

const rowClass = (active: boolean) =>
  `relative flex items-center gap-3 px-6 py-3 text-sm font-semibold font-syne transition-all duration-200
    ${active ? "bg-primary-500 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`

function RowIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return <Icon className={`size-5 shrink-0 ${active ? "text-white" : "text-white/60"}`} />
}

interface SidebarNavLinkProps {
  item: NavLink
  active: boolean
  onNavigate?: () => void
  className?: string
}

function SidebarNavLink({ item, active, onNavigate, className }: SidebarNavLinkProps) {
  return (
    <li>
      <Link to={item.href} onClick={onNavigate} className={cn(rowClass(active), className)}>
        {/* 4px orange left indicator for active */}
        {active && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-secondary-600" />
        )}
        <RowIcon icon={item.icon} active={active} />
        {item.label}
      </Link>
    </li>
  )
}

interface SidebarNavGroupProps {
  group: NavGroup
  pathname: string
  onNavigate?: () => void
}

function SidebarNavGroup({ group, pathname, onNavigate }: SidebarNavGroupProps) {
  const containsActive = group.children.some((child) => isHrefActive(pathname, child.href))
  const [open, setOpen] = useState(containsActive)
  const [wasActive, setWasActive] = useState(containsActive)

  // Auto-expand when navigating into the group; manual toggles are preserved otherwise.
  if (containsActive !== wasActive) {
    setWasActive(containsActive)
    if (containsActive) setOpen(true)
  }

  const GroupIcon = group.icon

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(rowClass(containsActive), "w-full text-left")}
      >
        <RowIcon icon={GroupIcon} active={containsActive} />
        {group.label}
        <ChevronDown
          className={`ml-auto size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${
            containsActive ? "text-white" : "text-white/60"
          }`}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <ul className="overflow-hidden">
          {group.children.map((child) => (
            <SidebarNavLink
              key={child.href}
              item={child}
              active={isHrefActive(pathname, child.href)}
              onNavigate={onNavigate}
              className="py-2.5 pl-14"
            />
          ))}
        </ul>
      </div>
    </li>
  )
}

interface SidebarNavProps {
  onNavigate?: () => void
}

/**
 * Sidebar navigation section. Renders both single links and collapsible
 * groups from the navItems config.
 */
export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { pathname } = useLocation()

  return (
    <nav className="flex-1 overflow-y-auto py-6">
      <ul className="flex flex-col gap-1">
        {navItems.map((item) =>
          item.kind === "group" ? (
            <SidebarNavGroup key={item.label} group={item} pathname={pathname} onNavigate={onNavigate} />
          ) : (
            <SidebarNavLink
              key={item.href}
              item={item}
              active={isHrefActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ),
        )}
      </ul>
    </nav>
  )
}
