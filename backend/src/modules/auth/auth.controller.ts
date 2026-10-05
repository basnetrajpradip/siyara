import type { Request, Response } from "express"
import {
  loginUser,
  registerUser,
  updateUserPassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "./auth.service.js"
import { sendSuccessResponse } from "../../utils/response.js"
import { UnauthorizedError } from "../../errors/app.error.js"
import env from "../../config/env.js"
import jwt from "jsonwebtoken"
import { generateAccessToken } from "../../utils/jwt.js"
import { getUserById } from "../user/user.service.js"
import { sendMail } from "../../utils/mail/index.js"
import {
  REFRESH_COOKIE_MAP,
  assertRoleMatchesClientType,
  getClearRefreshCookieOptions,
  getClientTypeFromHeader,
  getRefreshCookieOptions,
} from "./auth.client.js"

export const register = async (req: Request, res: Response) => {
  const user = await registerUser(req.body)

  sendSuccessResponse(res, null, "Registration successful", 201)
  sendMail({ template: "welcome", to: user.email, data: { name: `${user.firstName} ${user.lastName}`.trim() } })
}

export const login = async (req: Request, res: Response) => {
  const clientType = getClientTypeFromHeader(req)
  const result = await loginUser(req.body, clientType)

  const cookieName = REFRESH_COOKIE_MAP[clientType]

  res.cookie(cookieName, result.refreshToken, getRefreshCookieOptions())

  sendSuccessResponse(res, result, "Logged in successfully", 200)
}

export const logout = async (req: Request, res: Response) => {
  const clientType = getClientTypeFromHeader(req)

  res.clearCookie(REFRESH_COOKIE_MAP[clientType], getClearRefreshCookieOptions())

  sendSuccessResponse(res, null, "Logged out successfully", 200)
}

export const refreshToken = async (req: Request, res: Response) => {
  const clientType = getClientTypeFromHeader(req)
  const token = req.cookies?.[REFRESH_COOKIE_MAP[clientType]]

  if (!token) {
    throw new UnauthorizedError("No refresh token")
  }

  let payload: any

  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET)
  } catch {
    throw new UnauthorizedError("Invalid refresh token")
  }

  if (payload.clientType !== clientType) {
    throw new UnauthorizedError("Invalid refresh token")
  }

  const user = await getUserById(payload.id)

  assertRoleMatchesClientType(user.role, clientType)

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  sendSuccessResponse(res, { accessToken: newAccessToken }, "Token refreshed successfully", 200)
}

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user!.id

  await updateUserPassword(userId, { currentPassword, newPassword })

  sendSuccessResponse(res, null, "Password changed successfully", 200)
}

export const handleForgotPassword = async (req: Request, res: Response) => {
  const result = await forgotPassword(req.body, getClientTypeFromHeader(req))

  sendSuccessResponse(res, null, result.message, 200)
}

export const handleVerifyOtp = async (req: Request, res: Response) => {
  const result = await verifyOtp(req.body, getClientTypeFromHeader(req))

  sendSuccessResponse(res, result, "OTP verified successfully", 200)
}

export const handleResetPassword = async (req: Request, res: Response) => {
  const result = await resetPassword(req.body, getClientTypeFromHeader(req))

  sendSuccessResponse(res, null, result.message, 200)
}
