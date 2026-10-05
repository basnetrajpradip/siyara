import type { Role } from "../../prisma/generated/prisma/enums.js"

export interface IUser {
  id: string
  email: string
  password: string
  phone?: string
  avatar?: string
  role: Role
  createdAt: Date
}

export interface IAuthPayload {
  id: string
  email: string
  role: Role
}
