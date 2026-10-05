import { z } from "zod"

export const clientTypeSchema = z.enum(["frontend", "admin"])

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
})

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
})

export const verifyOtpSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
})

export const setPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
})
