import type { CookieOptions, Request } from "express"
import { BadRequestError, UnauthorizedError } from "../../errors/app.error.js"
import env from "../../config/env.js"
import { clientTypeSchema } from "./auth.validation.js"
import { Role } from "../../../prisma/generated/prisma/client.js"

export const CLIENT_TYPE_HEADER = "x-client-type"

export type ClientType = "frontend" | "admin"

const CLIENT_TYPE_ROLE_MAP: Record<string, Role> = {
  frontend: Role.USER,
  admin: Role.ADMIN,
}

export const assertRoleMatchesClientType = (userRole: Role, clientType: string) => {
  const expectedRole = CLIENT_TYPE_ROLE_MAP[clientType]
  if (!expectedRole) {
    throw new BadRequestError("Invalid client type")
  }
  if (userRole !== expectedRole) {
    throw new UnauthorizedError("Unauthorized access for this application")
  }
}

/**
 * Separate refresh-token cookies per client so admin and storefront
 * sessions never overwrite each other when they share a domain
 * (localhost ports share cookies; same-site prod deployments share the API cookie jar).
 */
export const REFRESH_COOKIE_MAP: Record<ClientType, string> = {
  frontend: "frontend_refreshToken",
  admin: "admin_refreshToken",
}

export const getClientTypeFromHeader = (req: Request): ClientType => {
  const raw = req.headers[CLIENT_TYPE_HEADER]
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = clientTypeSchema.safeParse(value)

  if (!parsed.success) {
    throw new BadRequestError("Invalid or missing X-Client-Type header")
  }

  return parsed.data
}

/**
 * Parse a jsonwebtoken-style expiry ("7d", "10m", "1h", "30s", "500ms",
 * or a bare number = seconds) into milliseconds for cookie maxAge.
 */
const parseExpiryToMs = (value: string, fallbackMs: number): number => {
  const match = value.trim().match(/^(\d+)\s*(ms|s|m|h|d)?$/i)

  if (!match) {
    return fallbackMs
  }

  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return Number(match[1]) * (multipliers[(match[2] ?? "s").toLowerCase()] ?? 1000)
}

export const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: parseExpiryToMs(env.REFRESH_TOKEN_EXPIRY, 7 * 24 * 60 * 60 * 1000),
})

/** Options for clearCookie — must match path/domain/sameSite/secure used when setting. */
export const getClearRefreshCookieOptions = (): CookieOptions => {
  const options = getRefreshCookieOptions()
  delete options.maxAge
  return options
}
