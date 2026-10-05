import { queryBuilder } from "@/lib/query-utils"
import axiosInstance from "./axios"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { User } from "@/types/user"

export async function getUsers(
  filters: { page?: number; limit?: number; search?: string } = {},
): Promise<PaginatedResponse<User>> {
  const { page = 1, limit = 50, search } = filters

  const queryString = queryBuilder({ page, limit, search })

  const res = await axiosInstance.get<PaginatedResponse<User>>(`/user?${queryString}`)
  return res.data
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  const res = await axiosInstance.get<ApiResponse<User>>(`/user/${id}`)
  return res.data
}

export async function deleteUser(id: string): Promise<ApiResponse<{ id: string }>> {
  const res = await axiosInstance.delete<ApiResponse<{ id: string }>>(`/user/${id}`)
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
