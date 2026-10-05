import type { Role } from "../../prisma/generated/prisma/enums.ts"

export {}

declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      role: Role
    }
  }
}
