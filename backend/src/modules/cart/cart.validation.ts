import { z } from "zod"

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1").default(1),
})

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
})

export const cartItemIdSchema = z.object({
  itemId: z.string().min(1, "Cart item ID is required"),
})
