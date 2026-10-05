import { z } from "zod"

const categoryBaseSchema = {
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().min(1, "Parent category id must not be empty").nullable().optional(),
}

export const createCategorySchema = z.object(categoryBaseSchema)

export const updateCategorySchema = z
  .object({
    name: categoryBaseSchema.name.optional(),
    parentId: categoryBaseSchema.parentId,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export const categoryIdSchema = z.object({
  id: z.string().min(1, "Category id is required"),
})

export const listCategorySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
})
