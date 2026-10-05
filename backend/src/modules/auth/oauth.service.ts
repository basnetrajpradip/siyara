import { prisma } from "../../db/prisma.js"
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js"
import { BadRequestError } from "../../errors/app.error.js"
import type { OAuthProfile } from "../../config/passport.js"
import { hashPassword } from "../../utils/hash.js"
import { sendMail } from "../../utils/mail/index.js"

export const findOrCreateOAuthUser = async (profile: OAuthProfile) => {
  const { id, email, firstName, lastName, avatar, provider } = profile

  //Check if user already exists with this OAuth provider + providerId
  const existingOAuthUser = await prisma.user.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId: id,
      },
    },
  })

  if (existingOAuthUser) {
    return generateTokens(existingOAuthUser)
  }

  // Check if user exists with same email (account linking)
  const existingEmailUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingEmailUser) {
    // Link OAuth account to existing user
    const updatedUser = await prisma.user.update({
      where: { id: existingEmailUser.id },
      data: {
        provider,
        providerId: id,
        avatar: existingEmailUser.avatar || avatar,
      },
    })
    return generateTokens(updatedUser)
  }

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      avatar,
      provider,
      providerId: id,
      password: null,
    },
  })

  // Send welcome email
  sendMail({
    template: "welcome",
    to: newUser.email,
    data: { name: `${newUser.firstName} ${newUser.lastName}`.trim() },
  })

  return generateTokens(newUser)
}

const generateTokens = async (user: {
  id: string
  email: string
  role: any
  phone: string | null
  avatar: string | null
  firstName: string
  lastName: string
  dateOfBirth: Date | null
  address: string | null
}) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  const accessToken = generateAccessToken(payload)
  // OAuth is storefront-only (callbacks redirect to FRONTEND_URL),
  // so bind these refresh tokens to the frontend client.
  const refreshToken = generateRefreshToken({ ...payload, clientType: "frontend" })

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

export const setPasswordForOAuthUser = async (userId: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true, provider: true },
  })

  if (!user) {
    throw new BadRequestError("User not found")
  }

  if (user.password) {
    throw new BadRequestError("User already has a password. Use change password instead.")
  }

  if (!user.provider) {
    throw new BadRequestError("User is not an OAuth user")
  }

  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { message: "Password set successfully" }
}
