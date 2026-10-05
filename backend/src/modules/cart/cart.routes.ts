import { Router } from "express"
import { validate } from "../../middlewares/validation.middleware.js"
import { authenticate } from "../../middlewares/auth.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { addToCartSchema, updateCartItemSchema, cartItemIdSchema } from "./cart.validation.js"
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "./cart.controller.js"

const router = Router()

// All cart routes require authentication
router.use(authenticate)

router.get("/", asyncHandler(getCart))

router.post("/", validate(addToCartSchema, "body"), asyncHandler(addToCart))

router.patch("/:itemId", validate(cartItemIdSchema, "params"), validate(updateCartItemSchema, "body"), asyncHandler(updateCartItem))

router.delete("/:itemId", validate(cartItemIdSchema, "params"), asyncHandler(removeCartItem))

router.delete("/", asyncHandler(clearCart))

export default router
