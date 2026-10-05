import type { Doctor } from "./doctor"
import type { MediaItem } from "./media"
import type { User } from "./user"

export type ConsultationStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
export type ConsultationType = "IN_CLINIC" | "ONLINE"

export interface ConsultationAttachment {
  id: string
  consultationId: string
  mediaId: string
  media: MediaItem
  createdAt: string
}

export interface ConsultationAppointment {
  id: string
  doctorId: string
  doctor: Doctor
  userId: string | null
  user: User | null
  consultationType: ConsultationType
  patientName: string
  patientEmail: string
  patientPhone: string | null
  patientAge: number | null
  startsAtUtc: string
  endsAtUtc: string
  status: ConsultationStatus
  primaryConcern: string | null
  additionalNotes: string | null
  internalNotes: string | null
  cancellationReason: string | null
  cancelledAt: string | null
  attachments: ConsultationAttachment[]
  createdAt: string
  updatedAt: string
}

export interface ConsultationFilters {
  page?: number
  limit?: number
  search?: string
  doctorId?: string
  status?: string[]
  startDate?: string
  endDate?: string
  sort?: "newest" | "oldest"
}

export function getConsultationStatusLabel(status: ConsultationStatus): string {
  const labels: Record<ConsultationStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  }
  return labels[status]
}

export function getConsultationTypeLabel(type: ConsultationType): string {
  const labels: Record<ConsultationType, string> = {
    IN_CLINIC: "In-Clinic Visit",
    ONLINE: "Online Consultation",
  }
  return labels[type]
}
