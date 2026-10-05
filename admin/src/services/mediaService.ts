import axiosInstance from "./axios"
import type { ApiResponse } from "@/types/api"
import type { MediaItem } from "@/types/media"

export type { MediaItem }

export async function uploadMedia(file: File, alt?: string): Promise<MediaItem> {
  const formData = new FormData()
  formData.append("file", file)
  if (alt) formData.append("alt", alt)
  const res = await axiosInstance.post<ApiResponse<MediaItem>>("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data.data
}

export async function updateMedia(
  id: string,
  payload: { alt?: string; url?: string; type?: string },
): Promise<MediaItem> {
  const res = await axiosInstance.patch<ApiResponse<MediaItem>>(`/media/${id}`, payload)
  return res.data.data
}
