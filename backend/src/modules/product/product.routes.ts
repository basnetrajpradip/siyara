import { Router } from "express"
import { validate } from "../../middlewares/validation.middleware.js"
import { authenticate, authorize } from "../../middlewares/auth.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { Role } from "../../../prisma/generated/prisma/client.js"
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
  listProductSchema,
  publicListProductSchema,
} from "./product.validation.js"
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProduct,
  getPublicProducts,
  updateProduct,
} from "./product.controller.js"

const router = Router()

router.get("/list", validate(publicListProductSchema, "query"), asyncHandler(getPublicProducts))

// Admin
router.get(
  "/admin-list",
  authenticate,
  authorize(Role.ADMIN),
  validate(listProductSchema, "query"),
  asyncHandler(getAdminProducts),
)

router.get("/:id", authenticate, authorize(Role.ADMIN), validate(productIdSchema, "params"), asyncHandler(getProduct))

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createProductSchema, "body"),
  asyncHandler(createProduct),
)

router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(productIdSchema, "params"),
  validate(updateProductSchema, "body"),
  asyncHandler(updateProduct),
)

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(productIdSchema, "params"),
  asyncHandler(deleteProduct),
)

export default router
