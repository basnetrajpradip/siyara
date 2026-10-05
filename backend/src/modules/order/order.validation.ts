import { z } from "zod"
import { OrderStatus, PaymentStatus } from "../../../prisma/generated/prisma/enums.js"
import { singleOrArray } from "../../utils/query.js"

export const createOrderSchema = z.object({
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryNotes: z.string().optional(),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  paymentMethod: z.enum(["COD", "ONLINE", "BANK_TRANSFER"]).default("COD"),
  productId: z.string().optional(),
  quantity: z.coerce.number().int().positive().optional().default(1),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  note: z.string().optional(),
})

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]),
  transactionId: z.string().optional(),
})

export const updateDeliverySchema = z.object({
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
})

export const orderIdSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
})

export const listOrdersSchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().optional(),
  status: singleOrArray(z.nativeEnum(OrderStatus)),
  paymentStatus: singleOrArray(z.nativeEnum(PaymentStatus)),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
})

export const cancelOrderSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
})
