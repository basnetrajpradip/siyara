import { prisma } from "../../db/prisma.js"
import { BadRequestError, NotFoundError } from "../../errors/app.error.js"
import { Prisma } from "../../../prisma/generated/prisma/client.js"
import { sendMail } from "../../utils/mail/index.js"
import env from "../../config/env.js"
import logger from "../../config/logger.js"
import type {
  CreateOrderPayload,
  CancelOrderPayload,
  ListOrdersQuery,
  UpdateDeliveryPayload,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "./order.types.js"
import { toStringArray } from "../../utils/query.js"

const orderInclude = {
  items: {
    orderBy: { createdAt: "asc" },
  },
  statusHistory: {
    orderBy: { createdAt: "desc" },
  },
  payments: {
    orderBy: { createdAt: "desc" },
  },
  user: {
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  },
} as const

function generateOrderNumber(): string {
  const date = new Date()
  const yymmdd = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, "0")
  return `AYD-${yymmdd}-${random}`
}

/**
 * Generate a unique order number with retry logic.
 * Catches Prisma unique constraint violations and retries up to 5 times.
 */
async function generateUniqueOrderNumber(): Promise<string> {
  const MAX_RETRIES = 5
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const orderNumber = generateOrderNumber()
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    })
    if (!existing) return orderNumber
    logger.warn(`Order number collision on attempt ${attempt + 1}, retrying...`)
  }
  throw new BadRequestError("Failed to generate a unique order number. Please try again.")
}

const orderStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
}

function validateProduct(
  product: { name: string; stock: number; isActive: boolean },
  quantity: number,
) {
  if (!product.isActive) {
    throw new BadRequestError(`Product "${product.name}" is no longer available`)
  }
  if (quantity > product.stock) {
    throw new BadRequestError(`Insufficient stock for "${product.name}". Available: ${product.stock}`)
  }
  if (quantity > env.MAX_ITEM_QUANTITY) {
    throw new BadRequestError(`Quantity for "${product.name}" exceeds the maximum allowed (${env.MAX_ITEM_QUANTITY})`)
  }
}

function calcFinancials(
  items: Array<{ price: number; discountAmount: number; quantity: number }>,
) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = items.reduce((sum, i) => sum + i.discountAmount * i.quantity, 0)
  const shippingCost =
    env.FREE_SHIPPING_THRESHOLD > 0 && subtotal >= env.FREE_SHIPPING_THRESHOLD
      ? new Prisma.Decimal(0)
      : new Prisma.Decimal(env.DEFAULT_SHIPPING_COST)
  const tax = new Prisma.Decimal(0)
  const total = new Prisma.Decimal(subtotal - discount + Number(shippingCost) + Number(tax))
  return { subtotal, discount, shippingCost, tax, total }
}

/**
 * Create an order — either from cart (default) or via Buy Now (when productId is provided).
 */
export const createOrder = async (userId: string, payload: CreateOrderPayload) => {
  const isBuyNow = !!payload.productId

  let rawLines: Array<{ productId: string; name: string; sku: string | null; imageUrl: string | null; price: number; discountAmount: number; quantity: number }>

  if (isBuyNow) {
    const product = await prisma.product.findUnique({
      where: { id: payload.productId },
      select: {
        id: true, name: true, sku: true, price: true, discountAmount: true,
        stock: true, isActive: true,
        media: { where: { isPrimary: true }, select: { media: { select: { url: true } } }, take: 1 },
      },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    const qty = payload.quantity ?? 1
    validateProduct(product, qty)

    rawLines = [{
      productId: product.id,
      name: product.name,
      sku: product.sku,
      imageUrl: product.media[0]?.media?.url ?? null,
      price: Number(product.price),
      discountAmount: Number(product.discountAmount ?? 0),
      quantity: qty,
    }]
  } else {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, sku: true, price: true, discountAmount: true,
                stock: true, isActive: true,
                media: { where: { isPrimary: true }, select: { media: { select: { url: true } } }, take: 1 },
              },
            },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError("Cart is empty")
    }

    for (const item of cart.items) {
      validateProduct(item.product, item.quantity)
    }

    rawLines = cart.items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      imageUrl: item.product.media[0]?.media?.url ?? null,
      price: Number(item.product.price),
      discountAmount: Number(item.product.discountAmount ?? 0),
      quantity: item.quantity,
    }))
  }

  const financials = calcFinancials(rawLines)

  const orderNumber = await generateUniqueOrderNumber()

  const order = await prisma.$transaction(async (tx) => {
    for (const line of rawLines) {
      const result = await tx.product.updateMany({
        where: { id: line.productId, isActive: true, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      })
      if (result.count !== 1) {
        throw new BadRequestError(`Insufficient stock for "${line.name}"`)
      }
    }

    const effectiveUnitPrice = (p: number, d: number) => Math.max(p - d, 0)

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        paymentMethod: payload.paymentMethod,
        subtotal: new Prisma.Decimal(financials.subtotal),
        discount: new Prisma.Decimal(financials.discount),
        shippingCost: financials.shippingCost,
        tax: financials.tax,
        total: financials.total,
        deliveryAddress: payload.deliveryAddress,
        deliveryNotes: payload.deliveryNotes,
        contactName: payload.contactName,
        contactEmail: payload.contactEmail,
        contactPhone: payload.contactPhone,
        items: {
          create: rawLines.map((line) => {
            const unitPrice = effectiveUnitPrice(line.price, line.discountAmount)
            return {
              productId: line.productId,
              productName: line.name,
              productSku: line.sku,
              productImageUrl: line.imageUrl,
              unitPrice: new Prisma.Decimal(unitPrice),
              totalPrice: new Prisma.Decimal(unitPrice * line.quantity),
              quantity: line.quantity,
            }
          }),
        },
        statusHistory: {
          create: { status: "PENDING", changedBy: userId, note: isBuyNow ? "Buy Now" : "Order placed" },
        },
      },
      include: orderInclude,
    })

    if (!isBuyNow) {
      const cart = await tx.cart.findUnique({ where: { userId }, select: { id: true } })
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      }
    }

    return newOrder
  })

  if (order.user?.email) {
    sendMail({
      to: order.user.email,
      template: "orderConfirmation",
      data: {
        name: `${order.user.firstName} ${order.user.lastName}`.trim() || "Valued Customer",
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.productName,
          sku: item.productSku,
          quantity: item.quantity,
          total: Number(item.totalPrice),
        })),
        total: Number(order.total),
      },
    }).catch(() => {})
  }

  return order
}

/**
 * Get a single order by ID (scoped to user for customers, all for admin).
 */
export const getOrderById = async (id: string, userId?: string) => {
  const where: any = { id }
  if (userId) {
    where.userId = userId
  }

  const order = await prisma.order.findFirst({
    where,
    include: orderInclude,
  })

  if (!order) {
    throw new NotFoundError("Order not found")
  }

  return order
}

/**
 * List orders for a specific user (customer).
 */
export const listUserOrders = async (userId: string, params: ListOrdersQuery) => {
  const { page = 1, limit = 10, sort = "newest" } = params

  const where = { userId }

  const orderBy: any = sort === "newest" ? { createdAt: "desc" } : { createdAt: "asc" }
  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        items: true,
        statusHistory: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  return {
    items: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

/**
 * Admin: list all orders with filters.
 */
export const listAllOrders = async (params: ListOrdersQuery) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    paymentStatus,
    userId: filterUserId,
    startDate,
    endDate,
    sort = "newest",
  } = params

  const where: any = {}

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { firstName: { contains: search, mode: "insensitive" } } },
      { user: { lastName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ]
  }

  if (status) {
    const statuses = toStringArray(status)
    if (statuses) {
      where.status = { in: statuses }
    }
  }

  if (paymentStatus) {
    const paymentStatuses = toStringArray(paymentStatus)
    if (paymentStatuses) {
      where.paymentStatus = { in: paymentStatuses }
    }
  }

  if (filterUserId) {
    where.userId = filterUserId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  const orderBy: any = sort === "newest" ? { createdAt: "desc" } : { createdAt: "asc" }
  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: true,
        statusHistory: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  return {
    items: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

/**
 * Update order status with history tracking.
 */
export const updateOrderStatus = async (id: string, userId: string, payload: UpdateOrderStatusPayload) => {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  })

  if (!order) {
    throw new NotFoundError("Order not found")
  }

  const fromStatus = order.status
  const toStatus = payload.status

  const additionalData: any = {}

  if (toStatus === "CANCELLED") {
    additionalData.cancelledAt = new Date()
    additionalData.cancelReason = payload.note || null
  } else if (fromStatus === "CANCELLED") {
    additionalData.cancelledAt = null
    additionalData.cancelReason = null
  }

  if (toStatus === "DELIVERED") {
    additionalData.deliveredAt = new Date()
  } else if (fromStatus === "DELIVERED") {
    additionalData.deliveredAt = null
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (toStatus === "CANCELLED" && fromStatus !== "CANCELLED") {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, quantity: true },
      })

      for (const item of orderItems) {
        if (item.productId) {
          try {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          } catch {
            logger.warn(`Could not restore stock for deleted product ${item.productId} on order ${id}`)
          }
        }
      }
    }

    if (fromStatus === "CANCELLED" && toStatus !== "CANCELLED") {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { productId: true, quantity: true },
      })

      for (const item of orderItems) {
        if (item.productId) {
          const result = await tx.product.updateMany({
            where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          })
          if (result.count !== 1) {
            throw new BadRequestError(`Insufficient stock to restore order "${item.productId}" — product may be out of stock or inactive. Re-cancel the order and adjust inventory manually.`)
          }
        }
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        status: toStatus,
        ...additionalData,
        statusHistory: {
          create: {
            status: toStatus,
            changedBy: userId,
            note: payload.note || null,
          },
        },
      },
      include: orderInclude,
    })

    return updatedOrder
  })

  if (updated.user?.email) {
    sendMail({
      to: updated.user.email,
      template: "orderStatusUpdate",
      data: {
        name: `${updated.user.firstName} ${updated.user.lastName}`.trim() || "Valued Customer",
        orderNumber: updated.orderNumber,
        status: orderStatusLabels[updated.status] ?? updated.status,
        note: payload.note,
        trackingNumber: updated.trackingNumber,
        carrier: updated.carrier,
        estimatedDelivery: updated.estimatedDelivery?.toLocaleDateString("en-IN") ?? null,
      },
    }).catch(() => {})
  }

  return updated
}

/**
 * Update payment status.
 */
export const updatePaymentStatus = async (id: string, payload: UpdatePaymentStatusPayload) => {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, paymentStatus: true },
  })

  if (!order) {
    throw new NotFoundError("Order not found")
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: payload.paymentStatus,
    },
    include: orderInclude,
  })

  await prisma.payment.updateMany({
    where: { orderId: id },
    data: { status: payload.paymentStatus },
  })

  // Also create a payment record when marking a payment as paid with transaction evidence.
  if (payload.paymentStatus === "PAID" && payload.transactionId) {
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: id, transactionId: payload.transactionId },
      select: { id: true },
    })

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          orderId: id,
          amount: updated.total,
          method: updated.paymentMethod,
          status: "PAID",
          transactionId: payload.transactionId,
          paidAt: new Date(),
        },
      })
    }
  }

  if (payload.paymentStatus === "PAID" && !payload.transactionId) {
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: id, status: "PAID" },
      select: { id: true },
    })

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          orderId: id,
          amount: updated.total,
          method: updated.paymentMethod,
          status: "PAID",
          paidAt: new Date(),
        },
      })
    }
  }

  return updated
}

/**
 * Update delivery tracking info.
 */
export const updateDeliveryInfo = async (id: string, payload: UpdateDeliveryPayload) => {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!order) {
    throw new NotFoundError("Order not found")
  }

  return prisma.order.update({
    where: { id },
    data: {
      ...(payload.trackingNumber !== undefined ? { trackingNumber: payload.trackingNumber } : {}),
      ...(payload.carrier !== undefined ? { carrier: payload.carrier } : {}),
      ...(payload.estimatedDelivery !== undefined ? { estimatedDelivery: new Date(payload.estimatedDelivery) } : {}),
    },
    include: orderInclude,
  })
}

/**
 * Cancel an order (by the customer).
 */
export const cancelOrder = async (id: string, userId: string, payload: CancelOrderPayload) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    select: { id: true, status: true },
  })

  if (!order) {
    throw new NotFoundError("Order not found")
  }

  const cancellableStatuses = ["PENDING", "CONFIRMED"]

  if (!cancellableStatuses.includes(order.status)) {
    throw new BadRequestError(
      `Order cannot be cancelled in "${order.status}" status. Only ${cancellableStatuses.join(" or ")} orders can be cancelled.`,
    )
  }

  return updateOrderStatus(id, userId, { status: "CANCELLED", note: `Cancelled by customer: ${payload.reason}` })
}

/**
 * Get order status history.
 */
export const getOrderStatusHistory = async (id: string, userId?: string) => {
  const where: any = { id }
  if (userId) {
    where.userId = userId
  }

  const order = await prisma.order.findFirst({
    where,
    select: { id: true },
  })

  if (!order) {
    throw new NotFoundError("Order not found")
  }

  return prisma.orderStatusHistory.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "desc" },
  })
}
