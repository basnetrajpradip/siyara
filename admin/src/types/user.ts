export interface User {
  id: string
  email: string
  phone: string | null
  avatar: string | null
  role: "USER" | "ADMIN"
  firstName: string
  lastName: string
  dateOfBirth: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  search?: string
  page?: number
  limit?: number
}
