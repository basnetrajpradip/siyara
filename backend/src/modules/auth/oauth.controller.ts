import type { Request, Response } from "express"
import { findOrCreateOAuthUser, setPasswordForOAuthUser } from "./oauth.service.js"
import { sendSuccessResponse } from "../../utils/response.js"
import { UnauthorizedError, BadRequestError } from "../../errors/app.error.js"
import env from "../../config/env.js"
import { REFRESH_COOKIE_MAP, getRefreshCookieOptions } from "./auth.client.js"

const setFrontendRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE_MAP.frontend, refreshToken, getRefreshCookieOptions())
}

export const googleCallback = async (req: Request, res: Response) => {
  const profile = req.user as any

  if (!profile) {
    throw new UnauthorizedError("Google authentication failed")
  }

  const result = await findOrCreateOAuthUser(profile)

  setFrontendRefreshCookie(res, result.refreshToken)

  const frontendUrl = env.FRONTEND_URL || "http://localhost:3000"
  const redirectUrl = `${frontendUrl}/login?access_token=${result.accessToken}`
  res.redirect(redirectUrl)
}

export const facebookCallback = async (req: Request, res: Response) => {
  const profile = req.user as any

  if (!profile) {
    throw new UnauthorizedError("Facebook authentication failed")
  }

  const result = await findOrCreateOAuthUser(profile)

  setFrontendRefreshCookie(res, result.refreshToken)

  const frontendUrl = env.FRONTEND_URL || "http://localhost:3000"
  const redirectUrl = `${frontendUrl}/login?access_token=${result.accessToken}`
  res.redirect(redirectUrl)
}

export const handleSetPassword = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { newPassword } = req.body

  if (!newPassword || newPassword.length < 6) {
    throw new BadRequestError("Password must be at least 6 characters long")
  }

  await setPasswordForOAuthUser(userId, newPassword)

  sendSuccessResponse(res, null, "Password set successfully", 200)
}
