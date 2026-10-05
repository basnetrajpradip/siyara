import { Router } from "express"
import { validate } from "../../middlewares/validation.middleware.js"
import { authenticate, authorize } from "../../middlewares/auth.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { Role } from "../../../prisma/generated/prisma/client.js"
import { analyticsQuerySchema } from "./dashboard.validation.js"
import { getAnalytics, getOverview } from "./dashboard.controller.js"

const router = Router()

router.use(authenticate)

router.get("/overview", authorize(Role.ADMIN), asyncHandler(getOverview))

router.get(
  "/analytics",
  authorize(Role.ADMIN),
  validate(analyticsQuerySchema, "query"),
  asyncHandler(getAnalytics),
)

export default router
