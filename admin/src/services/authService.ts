import axiosInstance from "./axios"
import type { ApiResponse } from "@/types/api"

export type LoginPayload = {
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  id: string
  email: string
  role: string
  avatar: string | null
  phone: string | null
  firstName: string
  lastName: string
  dateOfBirth: string | null
  address: string | null
}

export type UserData = {
  id: string
  email: string
  phone: string | null
  role: string
  avatar: string | null
  firstName: string
  lastName: string
  dateOfBirth: string | null
  address: string | null
}

export const loginUser = async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>("/auth/login", payload)
  return res.data
}

export const refreshToken = async (): Promise<ApiResponse<{ accessToken: string }>> => {
  const res = await axiosInstance.post<ApiResponse<{ accessToken: string }>>("/auth/refresh")
  return res.data
}

export const logoutUser = async (): Promise<ApiResponse<null>> => {
  const res = await axiosInstance.post<ApiResponse<null>>("/auth/logout")
  return res.data
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
  const res = await axiosInstance.post<ApiResponse<null>>("/auth/change-password", { currentPassword, newPassword })
  return res.data
}

export const forgotPassword = async (email: string): Promise<ApiResponse<null>> => {
  const res = await axiosInstance.post<ApiResponse<null>>("/auth/forgot-password", { email })
  return res.data
}

export type VerifyOtpResponse = {
  resetToken: string
}

export const verifyOtp = async (email: string, otp: string): Promise<ApiResponse<VerifyOtpResponse>> => {
  const res = await axiosInstance.post<ApiResponse<VerifyOtpResponse>>("/auth/verify-otp", { email, otp })
  return res.data
}

export const resetPassword = async (resetToken: string, newPassword: string): Promise<ApiResponse<null>> => {
  const res = await axiosInstance.post<ApiResponse<null>>("/auth/reset-password", { resetToken, newPassword })
  return res.data
}
