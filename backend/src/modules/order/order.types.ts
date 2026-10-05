import type z from "zod"
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  updateDeliverySchema,
  orderIdSchema,
  listOrdersSchema,
  cancelOrderSchema,
} from "./order.validation.js"

export type CreateOrderPayload = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusPayload = z.infer<typeof updateOrderStatusSchema>
export type UpdatePaymentStatusPayload = z.infer<typeof updatePaymentStatusSchema>
export type UpdateDeliveryPayload = z.infer<typeof updateDeliverySchema>
export type OrderIdParams = z.infer<typeof orderIdSchema>
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>
export type CancelOrderPayload = z.infer<typeof cancelOrderSchema>
