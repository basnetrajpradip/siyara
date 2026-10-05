import { prisma } from "../../db/prisma.js"
import { comparePassword, hashPassword } from "../../utils/hash.js"
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js"
import { BadRequestError, UnauthorizedError } from "../../errors/app.error.js"
import type {
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
} from "./auth.types.js"
import { sendMail } from "../../utils/mail/index.js"
import crypto from "node:crypto"
import jwt from "jsonwebtoken"
import env from "../../config/env.js"
import { OtpType } from "../../../prisma/generated/prisma/client.js"
import { assertRoleMatchesClientType } from "./auth.client.js"

export const registerUser = async ({ firstName, lastName, email, password }: RegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new BadRequestError("Email already in use")
  }

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  })

  return user
}

export const loginUser = async ({ email, password }: LoginPayload, clientType: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new UnauthorizedError("Invalid credentials")
  }

  assertRoleMatchesClientType(user.role, clientType)

  if (!user.password) {
    throw new UnauthorizedError("This account uses social login. Please sign in with Google or Facebook.")
  }

  const isPasswordValid = await comparePassword(password, user.password)

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials")
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  const accessToken = generateAccessToken(payload)

  const refreshToken = generateRefreshToken({ ...payload, clientType })

  return {
    accessToken,
    refreshToken,
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
  }
}

export const updateUserPassword = async (userId: string, { currentPassword, newPassword }: ChangePasswordPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new BadRequestError("User not found")
  }

  if (!user.password) {
    throw new BadRequestError(
      "This account uses social login. Please set a password first using the set-password endpoint.",
    )
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password)

  if (!isPasswordValid) {
    throw new BadRequestError("Current password is incorrect")
  }

  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { message: "Password changed successfully" }
}

export const forgotPassword = async ({ email }: ForgotPasswordPayload, clientType: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  })

  if (!user) {
    throw new BadRequestError("No account found with this email address")
  }

  assertRoleMatchesClientType(user.role, clientType)

  // Clean up expired OTPs and delete any existing ones for this email
  await prisma.otp.deleteMany({ where: { email, type: OtpType.PASSWORD_RESET } })

  // Generate 6-digit OTP and hash it before storing
  const otp = crypto.randomInt(100000, 999999).toString()
  const hashedOtp = await hashPassword(otp)
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000)

  await prisma.otp.create({
    data: { email, otp: hashedOtp, type: OtpType.PASSWORD_RESET, expiresAt },
  })

  // Send plain OTP via email (user never sees the hashed version)
  await sendMail({
    to: email,
    template: "passwordResetOtp",
    data: { name: `${user.firstName} ${user.lastName}`.trim(), otp, expiresInMinutes: env.OTP_EXPIRY_MINUTES },
  })

  return { message: "OTP sent successfully to your email" }
}

export const verifyOtp = async ({ email, otp }: VerifyOtpPayload, clientType: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  })

  if (user) {
    assertRoleMatchesClientType(user.role, clientType)
  }

  // Fetch all valid (non-expired) OTP records for this email
  const records = await prisma.otp.findMany({
    where: { email, type: OtpType.PASSWORD_RESET, expiresAt: { gte: new Date() } },
  })

  if (records.length === 0) {
    throw new BadRequestError("Invalid or expired OTP")
  }

  // Compare provided OTP against each hashed record
  let matchedId: string | null = null

  for (const record of records) {
    const isValid = await comparePassword(otp, record.otp)
    if (isValid) {
      matchedId = record.id
      break
    }
  }

  if (!matchedId) {
    throw new BadRequestError("Invalid or expired OTP")
  }

  // Delete the used OTP
  await prisma.otp.delete({ where: { id: matchedId } })

  // Clean up any other expired OTPs for this email
  await prisma.otp.deleteMany({ where: { email, type: OtpType.PASSWORD_RESET, expiresAt: { lt: new Date() } } })

  // Issue a short-lived reset token with the OtpType as purpose
  const resetToken = jwt.sign({ email, purpose: OtpType.PASSWORD_RESET }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.RESET_TOKEN_EXPIRY as any,
  })

  return { resetToken }
}

export const resetPassword = async ({ resetToken, newPassword }: ResetPasswordPayload, clientType: string) => {
  let payload: { email: string; purpose: string }

  try {
    payload = jwt.verify(resetToken, env.JWT_ACCESS_SECRET) as { email: string; purpose: string }
  } catch {
    throw new BadRequestError("Invalid or expired reset token")
  }

  if (payload.purpose !== OtpType.PASSWORD_RESET) {
    throw new BadRequestError("Invalid reset token")
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true, role: true },
  })

  if (!user) {
    throw new BadRequestError("User not found")
  }

  assertRoleMatchesClientType(user.role, clientType)

  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  // Delete any remaining OTPs for this email
  await prisma.otp.deleteMany({ where: { email: payload.email, type: OtpType.PASSWORD_RESET } })

  return { message: "Password reset successfully" }
}
