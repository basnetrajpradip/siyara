import { z } from "zod"

export const updateUserAvatarSchema = z.object({
  avatar: z.string().trim().min(1, "Avatar is required").optional(),
  mediaId: z.string().trim().min(1, "Media id is required").optional(),
}).refine((value) => value.avatar || value.mediaId, {
  message: "Avatar or media id is required",
})

export const userIdSchema = z.object({
  id: z.string().min(1, "User id is required"),
})

export const updateProfileSchema = z.object({
  phone: z.string().nullable().optional(),
  email: z.email("Invalid email"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
})
