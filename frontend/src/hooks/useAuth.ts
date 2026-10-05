import { useAuthStore } from "@/store/useAuthStore"

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  return { user, isAuthenticated, isHydrated, login, logout }
}
