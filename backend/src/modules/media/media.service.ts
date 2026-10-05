import fs from "node:fs/promises"
import { prisma } from "../../db/prisma.js"
import { NotFoundError } from "../../errors/app.error.js"
import type { CreateMediaPayload, UpdateMediaPayload } from "./media.types.js"
import { MediaType } from "../../../prisma/generated/prisma/enums.js"
import env from "../../config/env.js"

/** Shape of an uploaded file as received from multer */
export interface UploadedFile {
  filename: string
  path: string
  size: number
  mimetype: string
}

const mediaInclude = {
  productMedias: true,
  consultationAttachments: true,
} as const

/** Determine MediaType from a MIME type string */
export const mimeToMediaType = (mimeType: string): MediaType => {
  if (mimeType.startsWith("image/")) return MediaType.IMAGE
  if (mimeType.startsWith("video/")) return MediaType.VIDEO
  return MediaType.FILE
}

export const listMedia = async (params?: { search?: string; page?: number; limit?: number }) => {
  const { search, page = 1, limit = 10 } = params ?? {}

  const where: any = {}

  if (search) {
    where.OR = [
      { alt: { contains: search, mode: "insensitive" } },
      { url: { contains: search, mode: "insensitive" } },
      { mimeType: { contains: search, mode: "insensitive" } },
    ]
  }

  const skip = (page - 1) * limit

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: mediaInclude,
    }),
    prisma.media.count({ where }),
  ])

  return {
    items: media,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getMediaById = async (id: string) => {
  const media = await prisma.media.findUnique({
    where: { id },
    include: mediaInclude,
  })

  if (!media) {
    throw new NotFoundError("Media not found")
  }

  return media
}

/**
 * Create a media record from an uploaded file.
 * The file is already saved to disk by multer; this creates the DB record.
 */
export const createMediaFromUpload = async (file: UploadedFile, alt?: string) => {
  const mediaType = mimeToMediaType(file.mimetype)
  const url = `/${env.MEDIA_DIR}/${file.filename}`

  return prisma.media.create({
    data: {
      url,
      alt: alt ?? null,
      type: mediaType,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
    },
    include: mediaInclude,
  })
}

export const createMedia = async (payload: CreateMediaPayload) => {
  return prisma.media.create({
    data: {
      url: payload.url,
      alt: payload.alt,
      type: payload.type,
    },
    include: mediaInclude,
  })
}

export const updateMedia = async (id: string, payload: UpdateMediaPayload) => {
  const media = await prisma.media.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!media) {
    throw new NotFoundError("Media not found")
  }

  return prisma.media.update({
    where: { id },
    data: {
      ...(payload.url !== undefined ? { url: payload.url } : {}),
      ...(payload.alt !== undefined ? { alt: payload.alt } : {}),
      ...(payload.type !== undefined ? { type: payload.type } : {}),
    },
    include: mediaInclude,
  })
}

/**
 * Delete a media record and its associated file from disk.
 * If the file is missing from disk, the DB record is still removed.
 */
export const deleteMedia = async (id: string) => {
  const media = await prisma.media.findUnique({
    where: { id },
    select: { id: true, filePath: true },
  })

  if (!media) {
    throw new NotFoundError("Media not found")
  }

  // Remove the physical file if it exists
  if (media.filePath) {
    await fs.unlink(media.filePath).catch(() => {
      // File may have already been deleted — that's fine
    })
  }

  return prisma.media.delete({
    where: { id },
    include: mediaInclude,
  })
}

/**
 * Find and delete orphaned media records that:
 * - Have a filePath (i.e., were uploaded, not just URL-referenced)
 * - Are not associated with any ProductMedia
 * - Are not referenced as a user avatar
 * - Are not referenced by doctors, knowledge articles, or consultation attachments
 * - Are not referenced by any OrderItem's productImageUrl (historical order snapshot)
 * - Were created more than `hoursOld` hours ago
 */
export const deleteOrphanedMedia = async (hoursOld = 24) => {
  const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000)

  const orphans = await prisma.media.findMany({
    where: {
      filePath: { not: null },
      createdAt: { lt: cutoff },
      productMedias: { none: {} },
      doctorImages: { none: {} },
      knowledgeCovers: { none: {} },
      consultationAttachments: { none: {} },
    },
    select: { id: true, filePath: true, url: true },
  })

  // Further filter out media used as user avatars
  const users = await prisma.user.findMany({
    where: { avatar: { not: null } },
    select: { avatar: true },
  })
  const avatarUrls = new Set(users.map((u) => u.avatar))

  // Further filter out media referenced by order item snapshots
  const orderImageUrls = await prisma.orderItem.findMany({
    where: { productImageUrl: { not: null } },
    select: { productImageUrl: true },
  })
  const protectedUrls = new Set([...avatarUrls, ...orderImageUrls.map((o) => o.productImageUrl)])

  const toDelete = orphans.filter((m) => !protectedUrls.has(m.url))

  let deletedCount = 0
  for (const media of toDelete) {
    if (media.filePath) {
      await fs.unlink(media.filePath).catch(() => {})
    }
    await prisma.media.delete({ where: { id: media.id } }).catch(() => {})
    deletedCount++
  }

  return deletedCount
}
