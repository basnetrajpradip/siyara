import type z from "zod"
import { createMediaSchema, mediaIdSchema, updateMediaSchema } from "./media.validation.js"

export type CreateMediaPayload = z.infer<typeof createMediaSchema>
export type UpdateMediaPayload = z.infer<typeof updateMediaSchema>
export type MediaIdParams = z.infer<typeof mediaIdSchema>
