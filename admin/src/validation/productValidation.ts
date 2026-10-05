import { z } from "zod"

const tagListSchema = z.array(z.string().trim().min(1).max(80)).max(50).default([])

export const productFormSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    sku: z.string().optional(),
    price: z.coerce.number({ message: "Must be a number" }).positive("Must be a positive number"),
    discountAmount: z.coerce
      .number({ message: "Must be a number" })
      .positive("Must be a positive number")
      .optional()
      .or(z.literal("").transform(() => undefined))
      .or(z.nan().transform(() => undefined))
      .or(z.literal(0).transform(() => undefined)),
    stock: z.coerce
      .number({ message: "Must be a number" })
      .int("Must be a whole number")
      .nonnegative("Must be non-negative"),
    featured: z.boolean().default(false),
    categoryId: z.string().min(1, "Category is required"),
    dosha: z.enum(["VATA", "PITTA", "KAPHA"]).optional(),
    healthConcernIds: z.array(z.string().min(1)).default([]),
    keyIngredients: tagListSchema,
    recommendedUse: tagListSchema,
    notRecommendedUse: tagListSchema,
    media: z
      .array(
        z.object({
          mediaId: z.string().min(1),
          sortOrder: z.number().int().nonnegative(),
          isPrimary: z.boolean(),
        }),
      )
      .default([]),
  })
  .refine(
    (data) => {
      if (data.discountAmount !== undefined && data.price !== undefined) {
        return data.discountAmount < data.price
      }
      return true
    },
    {
      message: "Discount amount must be less than price",
      path: ["discountAmount"],
    },
  )

export type ProductFormData = z.infer<typeof productFormSchema>
