import { z } from "zod"
import { Dosha } from "../../../prisma/generated/prisma/client.js"
import { singleOrArray } from "../../utils/query.js"

const productMediaSchema = z.object({
  mediaId: z.string().min(1, "Media ID is required"),
  sortOrder: z.number().int().nonnegative().optional().default(0),
  isPrimary: z.boolean().optional().default(false),
})

const ingredientListSchema = z.array(z.string().trim().min(1).max(80)).max(50).optional().default([])

const skuSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1, "SKU must not be empty").optional(),
)

const updateSkuSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().min(1, "SKU must not be empty").nullable().optional(),
)

const productBaseSchema = {
  name: z.string().min(1, "Product name is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  sku: skuSchema,
  price: z.coerce.number().positive("Price must be a positive number"),
  discountAmount: z.coerce.number().positive("Discount amount must be a positive number").optional(),
  stock: z.coerce.number().int().nonnegative("Stock must be a non-negative integer"),
  featured: z.boolean(),
  categoryId: z.string().min(1, "Category is required"),
  dosha: z.nativeEnum(Dosha).optional(),
  healthConcernIds: z.array(z.string().min(1, "Health concern id is required")).optional().default([]),
  keyIngredients: ingredientListSchema,
  recommendedUse: ingredientListSchema,
  notRecommendedUse: ingredientListSchema,
  media: z.array(productMediaSchema).optional().default([]),
}

export const createProductSchema = z.object(productBaseSchema)

export const updateProductSchema = z.object({
  name: productBaseSchema.name.optional(),
  shortDescription: productBaseSchema.shortDescription.optional(),
  description: productBaseSchema.description.optional(),
  sku: updateSkuSchema,
  price: productBaseSchema.price.optional(),
  discountAmount: z.coerce.number().positive("Discount amount must be a positive number").nullable().optional(),
  stock: productBaseSchema.stock.optional(),
  featured: productBaseSchema.featured.optional(),
  categoryId: productBaseSchema.categoryId.optional(),
  dosha: z.nativeEnum(Dosha).nullable().optional(),
  healthConcernIds: z.array(z.string().min(1, "Health concern id is required")).optional(),
  keyIngredients: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  recommendedUse: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  notRecommendedUse: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  media: z.array(productMediaSchema).optional(),
  isActive: z.boolean().optional(),
})

export const productIdSchema = z.object({
  id: z.string().min(1, "Product id is required"),
})

export const listProductSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().optional(),
  categoryId: singleOrArray(),
  dosha: z.nativeEnum(Dosha).optional(),
  healthConcernId: singleOrArray(),
  featured: z.enum(["true", "false"]).optional(),
  price: z.enum(["lowToHigh", "highToLow"]).optional(),
  status: singleOrArray(z.enum(["active", "inactive", "out_of_stock"])),
})

export const publicListProductSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().optional(),
  categoryId: singleOrArray(),
  dosha: z.nativeEnum(Dosha).optional(),
  healthConcernId: singleOrArray(),
  featured: z.enum(["true", "false"]).optional(),
  price: z.enum(["lowToHigh", "highToLow"]).optional(),
})
