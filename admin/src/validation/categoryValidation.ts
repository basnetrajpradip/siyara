import { z } from "zod"

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentId: z
    .string()
    .nullable()
    .optional()
    .default(null),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>
