import type { MediaItem } from "./media"

export interface DoctorTitleDescriptionItem {
  title: string
  description: string
}

export interface Doctor {
  id: string
  name: string
  slug: string
  title: string | null
  badge: string | null
  specialization: string[]
  bio: string | null
  qualifications: string[]
  treatmentApproach: DoctorTitleDescriptionItem[]
  professionalExperience: DoctorTitleDescriptionItem[]
  officeAddress: string | null
  experienceYears: number | null
  languages: string[]
  consultationFee: number | null
  email: string | null
  phone: string | null
  imageMediaId: string | null
  imageMedia: MediaItem | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    appointments: number
    unavailableSlots: number
  }
}

export interface DoctorUnavailableSlot {
  id: string
  doctorId: string
  startsAtUtc: string
  endsAtUtc: string
  type: "FULL_DAY" | "DATE_RANGE" | "TIME_RANGE"
  reason: string | null
  createdAt: string
  updatedAt: string
}

export interface DoctorFilters {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}
