import { queryBuilder } from "@/lib/query-utils"
import axiosInstance from "./axios"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { Order, OrderFilters } from "@/types/order"

export async function getAdminOrders(filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> {
  const { page = 1, limit = 50, search, status, paymentStatus, startDate, endDate, sort } = filters

  const queryString = queryBuilder({ page, limit, search, status, paymentStatus, startDate, endDate, sort })

  const res = await axiosInstance.get<PaginatedResponse<Order>>(`/order?${queryString}`)
  return res.data
}

export async function getOrder(id: string): Promise<ApiResponse<Order>> {
  const res = await axiosInstance.get<ApiResponse<Order>>(`/order/${id}`)
  return res.data
}

export async function updateOrderStatus(
  id: string,
  data: { status: string; note?: string },
): Promise<ApiResponse<Order>> {
  const res = await axiosInstance.patch<ApiResponse<Order>>(`/order/${id}/status`, data)
  return res.data
}

export async function updatePaymentStatus(
  id: string,
  data: { paymentStatus: string; transactionId?: string },
): Promise<ApiResponse<Order>> {
  const res = await axiosInstance.patch<ApiResponse<Order>>(`/order/${id}/payment`, data)
  return res.data
}

export async function updateDeliveryInfo(
  id: string,
  data: { trackingNumber?: string; carrier?: string; estimatedDelivery?: string },
): Promise<ApiResponse<Order>> {
  const res = await axiosInstance.patch<ApiResponse<Order>>(`/order/${id}/delivery`, data)
  return res.data
}

export async function getOrderStatusHistory(id: string): Promise<ApiResponse<Array<Record<string, unknown>>>> {
  const res = await axiosInstance.get<ApiResponse<Array<Record<string, unknown>>>>(`/order/${id}/status-history`)
  return res.data
}
