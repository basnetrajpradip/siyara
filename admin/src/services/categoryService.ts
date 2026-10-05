import { queryBuilder } from "@/lib/query-utils"
import axiosInstance from "./axios"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { AdminCategory, ProductCategory } from "@/types/product"

export async function getAdminCategories(
  filters: {
    page?: number
    limit?: number
    search?: string
  } = {},
): Promise<PaginatedResponse<AdminCategory>> {
  const { page = 1, limit = 50, search } = filters
  const query = queryBuilder({ page, limit, search })
  const res = await axiosInstance.get<PaginatedResponse<AdminCategory>>(`/category/admin-list?${query}`)
  return res.data
}

/** Fetch categories for dropdown select (lightweight, no pagination) */
export async function getCategoryOptions(limit = 100): Promise<ProductCategory[]> {
  const query = queryBuilder({ limit })
  const res = await axiosInstance.get<PaginatedResponse<ProductCategory>>(`/category/admin-list?${query}`)
  return res.data.data.items
}

export async function getCategory(id: string): Promise<ApiResponse<AdminCategory>> {
  const res = await axiosInstance.get<ApiResponse<AdminCategory>>(`/category/${id}`)
  return res.data
}

export async function createCategory(data: Record<string, unknown>): Promise<ApiResponse<AdminCategory>> {
  const res = await axiosInstance.post<ApiResponse<AdminCategory>>("/category", data)
  return res.data
}

export async function updateCategory(id: string, data: Record<string, unknown>): Promise<ApiResponse<AdminCategory>> {
  const res = await axiosInstance.patch<ApiResponse<AdminCategory>>(`/category/${id}`, data)
  return res.data
}

export async function deleteCategory(id: string): Promise<ApiResponse<void>> {
  const res = await axiosInstance.delete<ApiResponse<void>>(`/category/${id}`)
  return res.data
}
