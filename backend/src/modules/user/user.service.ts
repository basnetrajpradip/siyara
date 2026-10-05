import { prisma } from "../../db/prisma.js"
import { BadRequestError, NotFoundError } from "../../errors/app.error.js"
import type { UpdateProfilePayload, UpdateUserAvatarPayload } from "./user.types.js"

const userSelect = {
  id: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  address: true,
  createdAt: true,
  updatedAt: true,
} as const

export const listUsers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const { search, page = 1, limit = 10 } = params ?? {}

  const where: any = {}

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return {
    items: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  })

  if (!user) {
    throw new NotFoundError("User not found")
  }

  return user
}

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })

  if (!user) {
    throw new NotFoundError("User not found")
  }

  if (user.role === "ADMIN") {
    throw new BadRequestError("Admin users cannot be deleted")
  }

  const [orderCount, reviewCount] = await Promise.all([
    prisma.order.count({ where: { userId: id } }),
    prisma.review.count({ where: { userId: id } }),
  ])

  if (orderCount > 0 || reviewCount > 0) {
    throw new BadRequestError("Cannot delete a user with order or review history")
  }

  await prisma.user.delete({ where: { id } })

  return { id }
}

export const updateUserAvatar = async (id: string, payload: UpdateUserAvatarPayload) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!user) {
    throw new NotFoundError("User not found")
  }

  let avatar = payload.avatar
  if (payload.mediaId) {
    const media = await prisma.media.findUnique({
      where: { id: payload.mediaId },
      select: { url: true, type: true },
    })

    if (!media) {
      throw new BadRequestError("Avatar media not found")
    }

    if (media.type !== "IMAGE") {
      throw new BadRequestError("Avatar media must be an image")
    }

    avatar = media.url
  }

  return prisma.user.update({
    where: { id },
    data: { avatar },
    select: userSelect,
  })
}

export const updateUserProfile = async (userId: string, payload: UpdateProfilePayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new BadRequestError("User not found")
  }

  const data: Record<string, any> = {}

  if (payload.phone !== undefined) data.phone = payload.phone
  if (payload.firstName !== undefined) data.firstName = payload.firstName
  if (payload.lastName !== undefined) data.lastName = payload.lastName
  if (payload.dateOfBirth !== undefined) data.dateOfBirth = payload.dateOfBirth ? new Date(payload.dateOfBirth) : null
  if (payload.address !== undefined) data.address = payload.address

  if (payload.email && payload.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    })

    if (existingUser) {
      throw new BadRequestError("Email is already in use")
    }

    data.email = payload.email
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: data,
    select: userSelect,
  })

  return updatedUser
}
