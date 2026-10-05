import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
    confirmNewPassword: z.string().min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must be 6 digits" }),
})

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
