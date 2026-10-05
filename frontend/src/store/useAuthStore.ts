import { create } from "zustand"
import type { AuthResponse, UserData } from "@/services/authService"
import { loginUser, logoutUser, refreshToken } from "@/services/authService"
import type { ApiResponse } from "@/types/api"
import { getMe } from "@/services/userService"
import { isProtectedRoute } from "@/configs/routes"

type AuthState = {
  user: UserData | null
  token: string | null
  isHydrated: boolean
  isAuthenticated: boolean
}

type AuthActions = {
  setToken: (token: string) => void
  login: (email: string, password: string) => Promise<ApiResponse<AuthResponse>>
  hydrate: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: UserData) => void
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  isAuthenticated: false,

  setToken: (token: string) => {
    set({ token, isAuthenticated: true })
  },

  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await loginUser({ email, password })
    if (!res.success) {
      throw new Error(res.message || "Login failed")
    }
    set({
      user: {
        id: res.data.id,
        email: res.data.email,
        phone: res.data.phone,
        role: res.data.role,
        avatar: res.data.avatar,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        dateOfBirth: res.data.dateOfBirth ?? null,
        address: res.data.address ?? null,
      },
      token: res.data.accessToken,
      isAuthenticated: true,
      isHydrated: true,
    })
    return res
  },

  hydrate: async () => {
    try {
      const refreshRes = await refreshToken()
      const accessToken = refreshRes.data.accessToken
      set({ token: accessToken })

      const meRes = await getMe()
      set({ user: meRes.data, isHydrated: true, isAuthenticated: true })
    } catch {
      set({ user: null, token: null, isHydrated: true, isAuthenticated: false })
    }
  },

  updateUser: (user: UserData) => {
    set({ user })
  },

  logout: async () => {
    try {
      await logoutUser()
    } catch {
      // ignore
    }
    set({ user: null, token: null, isAuthenticated: false })
    if (typeof window !== "undefined" && isProtectedRoute(window.location.pathname)) {
      window.location.href = "/login"
    }
  },
}))
