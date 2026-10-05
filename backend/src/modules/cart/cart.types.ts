import type z from "zod"
import { addToCartSchema, updateCartItemSchema, cartItemIdSchema } from "./cart.validation.js"

export type AddToCartPayload = z.infer<typeof addToCartSchema>
export type UpdateCartItemPayload = z.infer<typeof updateCartItemSchema>
export type CartItemIdParams = z.infer<typeof cartItemIdSchema>
