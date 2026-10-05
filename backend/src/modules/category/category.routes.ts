import { Router } from "express"
import { authenticate, authorize } from "../../middlewares/auth.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { validate } from "../../middlewares/validation.middleware.js"
import { Role } from "../../../prisma/generated/prisma/client.js"
import {
  categoryIdSchema,
  createCategorySchema,
  listCategorySchema,
  updateCategorySchema,
} from "./category.validation.js"
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategory,
  getPublicCategories,
  updateCategory,
} from "./category.controller.js"

const router = Router()

router.get("/list", validate(listCategorySchema, "query"), asyncHandler(getPublicCategories))

router.get(
  "/admin-list",
  authenticate,
  authorize(Role.ADMIN),
  validate(listCategorySchema, "query"),
  asyncHandler(getAdminCategories),
)

router.get("/:id", validate(categoryIdSchema, "params"), authenticate, authorize(Role.ADMIN), asyncHandler(getCategory))

router.post(
  "/",
  validate(createCategorySchema, "body"),
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(createCategory),
)

router.patch(
  "/:id",
  validate(categoryIdSchema, "params"),
  validate(updateCategorySchema, "body"),
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(updateCategory),
)

router.delete(
  "/:id",
  validate(categoryIdSchema, "params"),
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(deleteCategory),
)

export default router
