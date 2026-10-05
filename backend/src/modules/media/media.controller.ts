import type { Request, Response } from "express"
import { sendSuccessResponse } from "../../utils/response.js"
import {
  createMedia as createMediaService,
  createMediaFromUpload,
  deleteMedia as deleteMediaService,
  getMediaById,
  listMedia,
  updateMedia as updateMediaService,
} from "./media.service.js"
import type { UploadedFile } from "./media.service.js"

export const createMedia = async (req: Request, res: Response) => {
  const media = await createMediaService(req.body)

  sendSuccessResponse(res, media, "Media created successfully", 201)
}

export const uploadMedia = async (req: Request, res: Response) => {
  const file = (req as any).file as UploadedFile | undefined

  if (!file) {
    sendSuccessResponse(res, null, "No file provided", 400)
    return
  }

  const alt = req.body.alt as string | undefined
  const media = await createMediaFromUpload(file, alt)

  sendSuccessResponse(res, media, "Media uploaded successfully", 201)
}

export const getMedias = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query as Record<string, string | undefined>

  const result = await listMedia({
    search,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  })

  sendSuccessResponse(res, result, "Media retrieved successfully", 200)
}

export const getMedia = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const media = await getMediaById(id)

  sendSuccessResponse(res, media, "Media retrieved successfully", 200)
}

export const updateMedia = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const media = await updateMediaService(id, req.body)

  sendSuccessResponse(res, media, "Media updated successfully", 200)
}

export const deleteMedia = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const media = await deleteMediaService(id)

  sendSuccessResponse(res, media, "Media deleted successfully", 200)
}
