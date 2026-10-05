import axiosInstance from "./axios"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { User } from "@/types/user"

export async function getUsers(
  filters: { page?: number; limit?: number; search?: string } = {},
): Promise<PaginatedResponse<User>> {
  const { page = 1, limit = 50, search } = filters

  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (search) params.set("search", search)

  const res = await axiosInstance.get<PaginatedResponse<User>>(`/user?${params.toString()}`)
  return res.data
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  const res = await axiosInstance.get<ApiResponse<User>>(`/user/${id}`)
  return res.data
}

export const getMe = async (): Promise<ApiResponse<User>> => {
  const res = await axiosInstance.get<ApiResponse<User>>("/user/me")
  return res.data
}

export const updateProfile = async (payload: {
  phone: string | null
  email?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  address?: string
}): Promise<ApiResponse<User>> => {
  const res = await axiosInstance.patch<ApiResponse<User>>("/user/me", payload)
  return res.data
}

export const updateAvatar = async (payload: { mediaId?: string; avatar?: string }): Promise<ApiResponse<User>> => {
  const res = await axiosInstance.patch<ApiResponse<User>>("/user/avatar", payload)
  return res.data
}

/**
 * BACKEND TODO: no media-upload endpoint exists yet. Once one does (e.g. `POST /media` returning
 * `{ id }`), replace the body below with a real multipart upload and return its `mediaId`, then
 * pass that straight into `updateAvatar({ mediaId })`. Until then this simulates the upload so the
 * Edit Profile avatar picker is fully clickable.
 */
export const uploadAvatarFile = async (file: File): Promise<{ mediaId: string }> => {
  console.info("[userService] uploadAvatarFile (mocked):", file.name)
  await new Promise((resolve) => setTimeout(resolve, 700))
  return { mediaId: `DEMO-MEDIA-${Date.now()}` }
}
