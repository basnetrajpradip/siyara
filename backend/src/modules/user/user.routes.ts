import { Router } from "express"
import { authenticate, authorize } from "../../middlewares/auth.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { validate } from "../../middlewares/validation.middleware.js"
import { Role } from "../../../prisma/generated/prisma/client.js"
import { updateProfileSchema, updateUserAvatarSchema, userIdSchema } from "./user.validation.js"
import { getMe, getUser, listUsers, updateProfile, updateUserAvatar, deleteUser } from "./user.controller.js"

const router = Router()

// Authenticated user routes
router.get("/me", authenticate, asyncHandler(getMe))

router.patch("/avatar", authenticate, validate(updateUserAvatarSchema, "body"), asyncHandler(updateUserAvatar))

router.patch("/me", authenticate, validate(updateProfileSchema, "body"), asyncHandler(updateProfile))

// Admin routes
router.get("/", authenticate, authorize(Role.ADMIN), asyncHandler(listUsers))

router.get("/:id", authenticate, authorize(Role.ADMIN), validate(userIdSchema, "params"), asyncHandler(getUser))

router.delete("/:id", authenticate, authorize(Role.ADMIN), validate(userIdSchema, "params"), asyncHandler(deleteUser))
export default router
