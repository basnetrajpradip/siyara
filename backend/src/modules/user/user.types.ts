import type z from "zod"
import { updateUserAvatarSchema, userIdSchema, updateProfileSchema } from "./user.validation.js"

export type UpdateUserAvatarPayload = z.infer<typeof updateUserAvatarSchema>
export type UserIdParams = z.infer<typeof userIdSchema>
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>
