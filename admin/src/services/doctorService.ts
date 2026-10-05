import { queryBuilder } from "@/lib/query-utils"
import axiosInstance from "./axios"
import type { ApiResponse, PaginatedResponse } from "@/types/api"
import type { Doctor, DoctorFilters, DoctorUnavailableSlot } from "@/types/doctor"

export async function getDoctors(filters: DoctorFilters = {}): Promise<PaginatedResponse<Doctor>> {
  const { page = 1, limit = 50, search, active } = filters
  const queryString = queryBuilder({ page, limit, search, active })

  const res = await axiosInstance.get<PaginatedResponse<Doctor>>(`/doctor/list?${queryString}`)
  return res.data
}

export async function getDoctor(id: string): Promise<ApiResponse<Doctor>> {
  const res = await axiosInstance.get<ApiResponse<Doctor>>(`/doctor/${id}`)
  return res.data
}

export async function createDoctor(data: Record<string, unknown>): Promise<ApiResponse<Doctor>> {
  const res = await axiosInstance.post<ApiResponse<Doctor>>("/doctor", data)
  return res.data
}

export async function updateDoctor(id: string, data: Record<string, unknown>): Promise<ApiResponse<Doctor>> {
  const res = await axiosInstance.patch<ApiResponse<Doctor>>(`/doctor/${id}`, data)
  return res.data
}

export async function deactivateDoctor(id: string): Promise<ApiResponse<Doctor>> {
  const res = await axiosInstance.delete<ApiResponse<Doctor>>(`/doctor/${id}`)
  return res.data
}

export async function getDoctorUnavailableSlots(id: string): Promise<ApiResponse<DoctorUnavailableSlot[]>> {
  const res = await axiosInstance.get<ApiResponse<DoctorUnavailableSlot[]>>(`/doctor/${id}/unavailable-slots`)
  return res.data
}

export async function createDoctorUnavailableSlot(
  id: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<DoctorUnavailableSlot>> {
  const res = await axiosInstance.post<ApiResponse<DoctorUnavailableSlot>>(`/doctor/${id}/unavailable-slots`, data)
  return res.data
}

export async function updateDoctorUnavailableSlot(
  id: string,
  slotId: string,
  data: Record<string, unknown>,
): Promise<ApiResponse<DoctorUnavailableSlot>> {
  const res = await axiosInstance.patch<ApiResponse<DoctorUnavailableSlot>>(
    `/doctor/${id}/unavailable-slots/${slotId}`,
    data,
  )
  return res.data
}

export async function deleteDoctorUnavailableSlot(id: string, slotId: string): Promise<ApiResponse<DoctorUnavailableSlot>> {
  const res = await axiosInstance.delete<ApiResponse<DoctorUnavailableSlot>>(`/doctor/${id}/unavailable-slots/${slotId}`)
  return res.data
}
