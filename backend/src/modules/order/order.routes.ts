import { Router } from "express"
import { validate } from "../../middlewares/validation.middleware.js"
import { authenticate, authorize } from "../../middlewares/auth.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { Role } from "../../../prisma/generated/prisma/client.js"
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  updateDeliverySchema,
  orderIdSchema,
  listOrdersSchema,
  cancelOrderSchema,
} from "./order.validation.js"
import {
  cancelOrder,
  createOrder,
  getAdminOrders,
  getOrder,
  getStatusHistory,
  getUserOrders,
  updateDeliveryInfo,
  updateOrderStatus,
  updatePaymentStatus,
} from "./order.controller.js"

const router = Router()

// All order routes require authentication
router.use(authenticate)

// Customer routes
router.post("/", validate(createOrderSchema, "body"), asyncHandler(createOrder))

router.get("/my-orders", validate(listOrdersSchema, "query"), asyncHandler(getUserOrders))

router.get("/:id/status-history", validate(orderIdSchema, "params"), asyncHandler(getStatusHistory))

router.get("/:id", validate(orderIdSchema, "params"), asyncHandler(getOrder))

router.post("/:id/cancel", validate(orderIdSchema, "params"), validate(cancelOrderSchema, "body"), asyncHandler(cancelOrder))

// Admin routes
router.get(
  "/",
  authorize(Role.ADMIN),
  validate(listOrdersSchema, "query"),
  asyncHandler(getAdminOrders),
)

router.patch(
  "/:id/status",
  authorize(Role.ADMIN),
  validate(orderIdSchema, "params"),
  validate(updateOrderStatusSchema, "body"),
  asyncHandler(updateOrderStatus),
)

router.patch(
  "/:id/payment",
  authorize(Role.ADMIN),
  validate(orderIdSchema, "params"),
  validate(updatePaymentStatusSchema, "body"),
  asyncHandler(updatePaymentStatus),
)

router.patch(
  "/:id/delivery",
  authorize(Role.ADMIN),
  validate(orderIdSchema, "params"),
  validate(updateDeliverySchema, "body"),
  asyncHandler(updateDeliveryInfo),
)

export default router
