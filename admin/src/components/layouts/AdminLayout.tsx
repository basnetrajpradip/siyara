"use client"

import { useState, useEffect, useRef } from "react"
import { Outlet, Link, useNavigate } from "react-router"

import ayurLogo from "/logo.png"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useAuthStore } from "@/store/useAuthStore"
import env from "@/config/env-config"
import { getInitials } from "@/lib/utils"
import { Button } from "../ui/button"
import { LogOutIcon } from "lucide-react"
import SidebarNav from "./SidebarNav"

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const closeSidebar = () => setSidebarOpen(false)

  // close sidebar on outside click (mobile)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [sidebarOpen])

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" />}

      {/* Sidebar — solid teal background */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-primary-600 shadow-lg transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:shadow-none lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo / Brand — 97px, #F5F5F5 bg, no border */}
        <div className="flex h-[97px] shrink-0 items-center bg-white px-6">
          <Link to="/" onClick={closeSidebar} className="flex items-center">
            <img src={ayurLogo} alt="Ayur Darpan" className="h-12 w-[177px]" />
          </Link>
        </div>

        {/* Navigation */}
        <SidebarNav onNavigate={closeSidebar} />

        {/* User section */}
        <div className="flex flex-col py-4 shrink-0 justify-center border-t px-2 border-primary-400 cursor-pointer gap-4">
          <div
            className="flex items-center gap-3 hover:bg-primary-500 p-2 rounded-xl"
            onClick={() => {
              navigate("/profile")
              closeSidebar()
            }}
          >
            <Avatar className="size-[50px] border-none">
              <AvatarImage className="rounded-[4px]" src={`${env.BACKEND_BASE_URL}${user?.avatar}`} />
              <AvatarFallback className="uppercase">{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/90 font-syne">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-white/60 font-syne">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            className="h-10 gap-2 rounded-xl bg-primary-500 px-5 text-sm font-semibold text-white hover:bg-secondary-700 disabled:opacity-60"
          >
            <LogOutIcon />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header bar (mobile) */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex size-10 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
            aria-label="Open sidebar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src={ayurLogo} alt="Ayur Darpan" className="h-8 w-auto" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
