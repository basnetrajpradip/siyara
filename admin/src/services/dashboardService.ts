import axiosInstance from "./axios"
import type { ApiResponse } from "@/types/api"
import type { DashboardAnalytics, DashboardOverview, DashboardRange } from "@/types/dashboard"

export async function getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
  const res = await axiosInstance.get<ApiResponse<DashboardOverview>>("/dashboard/overview")
  return res.data
}

export async function getDashboardAnalytics(
  range: DashboardRange,
): Promise<ApiResponse<DashboardAnalytics>> {
  const res = await axiosInstance.get<ApiResponse<DashboardAnalytics>>("/dashboard/analytics", {
    params: { range },
  })
  return res.data
}
