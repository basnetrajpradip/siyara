import { queryBuilder } from "@/lib/query-utils"
import axiosInstance from "./axios"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { Product, ProductFilters } from "@/types/product"

export async function getAdminProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const { page = 1, limit = 50, search, categoryIds, dosha, healthConcernIds, price, statuses } = filters

  const queryString = queryBuilder({
    page,
    limit,
    search,
    categoryId: categoryIds,
    dosha,
    healthConcernId: healthConcernIds,
    price,
    status: statuses,
  })

  const res = await axiosInstance.get<PaginatedResponse<Product>>(`/product/admin-list?${queryString}`)
  return res.data
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  const res = await axiosInstance.get<ApiResponse<Product>>(`/product/${id}`)
  return res.data
}

export async function createProduct(data: Record<string, unknown>): Promise<ApiResponse<Product>> {
  const res = await axiosInstance.post<ApiResponse<Product>>("/product", data)
  return res.data
}

export async function updateProduct(id: string, data: Record<string, unknown>): Promise<ApiResponse<Product>> {
  const res = await axiosInstance.patch<ApiResponse<Product>>(`/product/${id}`, data)
  return res.data
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  const res = await axiosInstance.delete<ApiResponse<void>>(`/product/${id}`)
  return res.data
}
