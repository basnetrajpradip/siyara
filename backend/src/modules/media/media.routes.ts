import { Router } from "express"
import { authenticate, authorize } from "../../middlewares/auth.middleware.js"
import { asyncHandler } from "../../middlewares/async.middleware.js"
import { validate } from "../../middlewares/validation.middleware.js"
import { handleSingleUpload } from "../../middlewares/upload.middleware.js"
import { Role } from "../../../prisma/generated/prisma/client.js"
import { createMediaSchema, listMediaSchema, mediaIdSchema, updateMediaSchema } from "./media.validation.js"
import { createMedia, deleteMedia, getMedia, getMedias, updateMedia, uploadMedia } from "./media.controller.js"

const router = Router()

router.get("/list", authenticate, authorize(Role.ADMIN), validate(listMediaSchema, "query"), asyncHandler(getMedias))
router.get("/:id", authenticate, authorize(Role.ADMIN), validate(mediaIdSchema, "params"), asyncHandler(getMedia))
router.post("/upload", authenticate, authorize(Role.ADMIN), handleSingleUpload("file"), asyncHandler(uploadMedia))
router.post("/", authenticate, authorize(Role.ADMIN), validate(createMediaSchema, "body"), asyncHandler(createMedia))
router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(mediaIdSchema, "params"),
  validate(updateMediaSchema, "body"),
  asyncHandler(updateMedia),
)
router.delete("/:id", authenticate, authorize(Role.ADMIN), validate(mediaIdSchema, "params"), asyncHandler(deleteMedia))

export default router
