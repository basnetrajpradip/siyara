import type { Request, Response } from "express"
import { sendSuccessResponse } from "../../utils/response.js"
import {
  addToCart as addToCartService,
  clearCart as clearCartService,
  getCart as getCartService,
  removeCartItem as removeCartItemService,
  updateCartItem as updateCartItemService,
} from "./cart.service.js"

export const getCart = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const cart = await getCartService(userId)

  sendSuccessResponse(res, cart, "Cart retrieved successfully")
}

export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const cart = await addToCartService(userId, req.body)

  sendSuccessResponse(res, cart, "Item added to cart successfully")
}

export const updateCartItem = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { itemId } = req.params as { itemId: string }
  const cart = await updateCartItemService(userId, itemId, req.body)

  sendSuccessResponse(res, cart, "Cart updated successfully")
}

export const removeCartItem = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { itemId } = req.params as { itemId: string }
  const cart = await removeCartItemService(userId, itemId)

  sendSuccessResponse(res, cart, "Item removed from cart")
}

export const clearCart = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const cart = await clearCartService(userId)

  sendSuccessResponse(res, cart, "Cart cleared successfully")
}
