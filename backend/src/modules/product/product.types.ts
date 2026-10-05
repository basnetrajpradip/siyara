import type z from "zod"
import { createProductSchema, productIdSchema, updateProductSchema } from "./product.validation.js"

export type CreateProductPayload = z.infer<typeof createProductSchema>
export type UpdateProductPayload = z.infer<typeof updateProductSchema>
export type ProductIdParams = z.infer<typeof productIdSchema>
