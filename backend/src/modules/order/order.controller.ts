import type { Request, Response } from "express"
import { sendSuccessResponse } from "../../utils/response.js"
import {
  createOrder as createOrderService,
  getOrderById,
  listUserOrders,
  listAllOrders,
  updateOrderStatus as updateOrderStatusService,
  updatePaymentStatus as updatePaymentStatusService,
  updateDeliveryInfo as updateDeliveryInfoService,
  cancelOrder as cancelOrderService,
  getOrderStatusHistory,
} from "./order.service.js"
import { Role } from "../../../prisma/generated/prisma/client.js"

/**
 * Customer: Create a new order from cart.
 */
export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const order = await createOrderService(userId, req.body)

  sendSuccessResponse(res, order, "Order placed successfully", 201)
}

/**
 * Customer: Get their order by ID.
 */
export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const userId = req.user!.role !== Role.ADMIN ? req.user!.id : undefined
  const order = await getOrderById(id, userId)

  sendSuccessResponse(res, order, "Order retrieved successfully")
}

/**
 * Customer: List their own orders.
 */
export const getUserOrders = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { page, limit, sort } = req.query as Record<string, string | undefined>

  const result = await listUserOrders(userId, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    sort: (sort as "newest" | "oldest") ?? "newest",
  })

  sendSuccessResponse(res, result, "Orders retrieved successfully")
}

/**
 * Admin: List all orders with filters.
 */
export const getAdminOrders = async (req: Request, res: Response) => {
  const { page, limit, search, status, paymentStatus, userId, startDate, endDate, sort } = req.query as Record<
    string,
    string | undefined
  >

  const result = await listAllOrders({
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    sort: (sort as "newest" | "oldest") ?? "newest",
    search,
    status,
    paymentStatus,
    userId: userId,
    startDate,
    endDate,
  })

  sendSuccessResponse(res, result, "Orders retrieved successfully")
}

/**
 * Admin: Update order status.
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const adminId = req.user!.id
  const order = await updateOrderStatusService(id, adminId, req.body)

  sendSuccessResponse(res, order, "Order status updated successfully")
}

/**
 * Admin: Update payment status.
 */
export const updatePaymentStatus = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const order = await updatePaymentStatusService(id, req.body)

  sendSuccessResponse(res, order, "Payment status updated successfully")
}

/**
 * Admin: Update delivery tracking info.
 */
export const updateDeliveryInfo = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const order = await updateDeliveryInfoService(id, req.body)

  sendSuccessResponse(res, order, "Delivery info updated successfully")
}

/**
 * Customer: Cancel their own order.
 */
export const cancelOrder = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { id } = req.params as { id: string }
  const order = await cancelOrderService(id, userId, req.body)

  sendSuccessResponse(res, order, "Order cancelled successfully")
}

/**
 * Get order status history.
 */
export const getStatusHistory = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const userId = req.user!.role !== Role.ADMIN ? req.user!.id : undefined
  const history = await getOrderStatusHistory(id, userId)

  sendSuccessResponse(res, history, "Status history retrieved successfully")
}
