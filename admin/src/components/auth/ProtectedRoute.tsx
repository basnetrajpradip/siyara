import { useEffect, type ReactNode } from "react"
import { Navigate } from "react-router"
import { useAuthStore } from "@/store/useAuthStore"

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const user = useAuthStore((s) => s.user)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    if (!isHydrated) hydrate()
  }, [isHydrated, hydrate])

  if (!isHydrated) {
    return <div className="flex h-screen items-center justify-center bg-background"></div>
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
