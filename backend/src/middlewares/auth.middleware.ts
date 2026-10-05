import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import env from "../config/env.js"
import { ForbiddenError, UnauthorizedError } from "../errors/app.error.js"
import type { IAuthPayload } from "../types/index.js"
import { Role } from "../../prisma/generated/prisma/client.js"
import { assertRoleMatchesClientType, getClientTypeFromHeader } from "../modules/auth/auth.client.js"

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const [scheme, token] = authHeader?.split(" ") ?? []

  if (!scheme || scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Invalid authorization header")
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)

    req.user = payload as IAuthPayload
  } catch {
    throw new UnauthorizedError("Invalid or expired token")
  }

  assertRoleMatchesClientType(req.user.role, getClientTypeFromHeader(req))
  next()
}

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as IAuthPayload

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError("Access denied")
    }

    next()
  }
}
