import type z from "zod"
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from "./category.validation.js"

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>
export type CategoryIdParams = z.infer<typeof categoryIdSchema>
