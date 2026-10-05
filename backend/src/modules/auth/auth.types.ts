import type z from "zod"
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  setPasswordSchema,
} from "./auth.validation.js"

export type RegisterPayload = z.infer<typeof registerSchema>
export type LoginPayload = z.infer<typeof loginSchema>
export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>
export type VerifyOtpPayload = z.infer<typeof verifyOtpSchema>
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>
export type SetPasswordPayload = z.infer<typeof setPasswordSchema>
