import { z } from "zod"
import { MediaType } from "../../../prisma/generated/prisma/enums.js"

const mediaBaseSchema = {
  url: z.string().refine((value) => value.startsWith("/") || z.url().safeParse(value).success, {
    message: "Media URL must be an absolute URL or local path",
  }),
  alt: z.string().optional(),
  type: z.nativeEnum(MediaType),
}

export const createMediaSchema = z.object(mediaBaseSchema)

export const updateMediaSchema = z.object({
  url: mediaBaseSchema.url.optional(),
  alt: mediaBaseSchema.alt.optional(),
  type: mediaBaseSchema.type.optional(),
})

export const mediaIdSchema = z.object({
  id: z.string().min(1, "Media id is required"),
})

export const uploadMediaSchema = z.object({
  alt: z.string().optional(),
})

export const listMediaSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
})
