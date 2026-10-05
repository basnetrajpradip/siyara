export type AuthTab = "signin" | "signup"

export type SignInValues = {
  email: string
  password: string
}

export type SignUpValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}
export type SignUpErrors = Partial<Record<keyof SignUpValues, string>>
export type SignInErrors = Partial<Record<keyof SignInValues, string>>
