import { useEffect, type ReactNode } from "react"
import { Navigate } from "react-router"
import { useAuthStore } from "@/store/useAuthStore"

export default function GuestRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    if (!isHydrated) hydrate()
  }, [isHydrated, hydrate])

  if (!isHydrated) {
    return <div className="flex h-screen items-center justify-center bg-background" />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
