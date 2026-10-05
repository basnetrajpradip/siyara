import axios from "axios"
import { useAuthStore } from "@/store/useAuthStore"
import env from "@/configs/env-config"

const axiosInstance = axios.create({
  baseURL: `${env.BACKEND_BASE_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json", "X-Client-Type": "frontend" },
})

// Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, attempt token refresh, then retry
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const resp = await axios.post(
          `${env.BACKEND_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true, headers: { "X-Client-Type": "frontend" } },
        )
        const newToken = resp.data.data.accessToken
        useAuthStore.getState().setToken(newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
