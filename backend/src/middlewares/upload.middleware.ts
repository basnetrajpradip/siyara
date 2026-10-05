import { randomUUID } from "node:crypto"
import path from "node:path"
import fs from "node:fs"
import type { Request, Response, NextFunction } from "express"
import multer from "multer"
import env from "../config/env.js"
import { BadRequestError } from "../errors/app.error.js"

const mediaDir = path.resolve(env.MEDIA_DIR)

// Ensure the media directory exists on startup
fs.mkdirSync(mediaDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, mediaDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${randomUUID()}${ext || ".bin"}`
    cb(null, uniqueName)
  },
})

const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
  // Documents
  "application/pdf",
]

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype === "application/pdf") {
    cb(null, true)
  } else if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MEDIA_MAX_FILE_SIZE,
  },
  fileFilter,
})

/**
 * Wraps multer's single-file upload handler to convert multer errors
 * into AppError instances that the global error handler can process.
 */
export const handleSingleUpload = (fieldName = "file") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const multerMiddleware = upload.single(fieldName)

    multerMiddleware(req, res, (err: unknown) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(
              new BadRequestError(`File too large. Maximum size is ${env.MEDIA_MAX_FILE_SIZE / (1024 * 1024)}MB`),
            )
          }
          return next(new BadRequestError(err.message))
        }
        const message = err instanceof Error ? err.message : "File upload rejected"
        return next(new BadRequestError(message))
      }
      next()
    })
  }
}
