import { prisma } from "../../db/prisma.js"
import { BadRequestError, NotFoundError } from "../../errors/app.error.js"
import env from "../../config/env.js"
import type { AddToCartPayload, UpdateCartItemPayload } from "./cart.types.js"

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountAmount: true,
          stock: true,
          media: {
            where: { isPrimary: true },
            select: {
              media: { select: { id: true, url: true, alt: true } },
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} as const

function computeDiscountedPrice(
  price: { toString: () => string },
  discountAmount: { toString: () => string } | null,
): number | null {
  if (discountAmount === null) return null
  const discounted = Number(price) - Number(discountAmount)
  return discounted > 0 ? discounted : 0
}

function mapCartItem(item: any) {
  const productPrice = Number(item.product.price)
  const productDiscount = item.product.discountAmount ? Number(item.product.discountAmount) : null
  return {
    ...item,
    product: {
      ...item.product,
      price: productPrice,
      discountAmount: productDiscount,
      discountedPrice: computeDiscountedPrice(item.product.price, item.product.discountAmount),
      primaryMedia: item.product.media[0]?.media ?? null,
    },
  }
}

function mapCart(cart: any) {
  const originalSubtotal = cart.items.reduce(
    (sum: number, item: any) => sum + Number(item.product.price) * item.quantity,
    0,
  )
  const discount = cart.items.reduce(
    (sum: number, item: any) => sum + Number(item.product.discountAmount ?? 0) * item.quantity,
    0,
  )

  return {
    ...cart,
    items: cart.items.map(mapCartItem),
    totalItems: cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    originalSubtotal,
    discount,
    subtotal: Math.max(originalSubtotal - discount, 0),
  }
}

/**
 * Ensure a cart exists for the user. Creates one if it doesn't.
 */
async function ensureCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: cartInclude,
    })
  }

  return cart
}

/**
 * Get the current user's cart (auto-creates if missing).
 */
export const getCart = async (userId: string) => {
  const cart = await ensureCart(userId)
  return mapCart(cart)
}

/**
 * Add a product to the cart.
 * If the product already exists in the cart, increment the quantity.
 */
export const addToCart = async (userId: string, payload: AddToCartPayload) => {
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
    select: { id: true, stock: true, isActive: true },
  })

  if (!product) {
    throw new NotFoundError("Product not found")
  }

  if (!product.isActive) {
    throw new BadRequestError("Product is not available")
  }

  if (product.stock < 1) {
    throw new BadRequestError("Product is out of stock")
  }

  // Ensure cart exists
  let cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } })
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: payload.productId } },
  })

  if (existingItem) {
    const newQuantity = existingItem.quantity + payload.quantity

    if (newQuantity > env.MAX_ITEM_QUANTITY) {
      throw new BadRequestError(`Cannot add more than ${env.MAX_ITEM_QUANTITY} of this item`)
    }

    if (newQuantity > product.stock) {
      throw new BadRequestError(`Only ${product.stock} items available in stock`)
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    })
  } else {
    if (payload.quantity > env.MAX_ITEM_QUANTITY) {
      throw new BadRequestError(`Cannot add more than ${env.MAX_ITEM_QUANTITY} of this item`)
    }

    if (payload.quantity > product.stock) {
      throw new BadRequestError(`Only ${product.stock} items available in stock`)
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: payload.productId,
        quantity: payload.quantity,
      },
    })
  }

  // Return updated cart
  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  })

  if (!updatedCart) {
    throw new NotFoundError("Cart not found")
  }

  return mapCart(updatedCart)
}

/**
 * Update the quantity of a cart item.
 */
export const updateCartItem = async (userId: string, itemId: string, payload: UpdateCartItemPayload) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!cart) {
    throw new NotFoundError("Cart not found")
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: { select: { stock: true, id: true } } },
  })

  if (!item) {
    throw new NotFoundError("Cart item not found")
  }

  if (payload.quantity > item.product.stock) {
    throw new BadRequestError(`Only ${item.product.stock} items available in stock`)
  }

  if (payload.quantity > env.MAX_ITEM_QUANTITY) {
    throw new BadRequestError(`Cannot add more than ${env.MAX_ITEM_QUANTITY} of this item`)
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: payload.quantity },
  })

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  })

  if (!updatedCart) {
    throw new NotFoundError("Cart not found")
  }

  return mapCart(updatedCart)
}

/**
 * Remove an item from the cart.
 */
export const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!cart) {
    throw new NotFoundError("Cart not found")
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    select: { id: true },
  })

  if (!item) {
    throw new NotFoundError("Cart item not found")
  }

  await prisma.cartItem.delete({ where: { id: itemId } })

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  })

  if (!updatedCart) {
    throw new NotFoundError("Cart not found")
  }

  return mapCart(updatedCart)
}

/**
 * Clear all items from the cart.
 */
export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!cart) {
    throw new NotFoundError("Cart not found")
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  })

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  })

  if (!updatedCart) {
    throw new NotFoundError("Cart not found")
  }

  return mapCart(updatedCart)
}
