import type { Request, Response } from "express"
import { sendSuccessResponse } from "../../utils/response.js"
import {
  deleteUser as deleteUserService,
  getUserById,
  listUsers as listUsersService,
  updateUserAvatar as updateUserAvatarService,
  updateUserProfile,
} from "./user.service.js"

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const user = await getUserById(id)

  sendSuccessResponse(res, user, "User retrieved successfully")
}

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const user = await getUserById(userId)

  sendSuccessResponse(res, user, "Profile retrieved successfully")
}

export const updateUserAvatar = async (req: Request, res: Response) => {
  const user = await updateUserAvatarService(req.user!.id, req.body)

  sendSuccessResponse(res, user, "Avatar updated successfully")
}

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const updatedUser = await updateUserProfile(userId, req.body)

  sendSuccessResponse(res, updatedUser, "Profile updated successfully", 200)
}

export const listUsers = async (req: Request, res: Response) => {
  const { page, limit, search } = req.query as Record<string, string | undefined>

  const result = await listUsersService({
    search,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  })

  sendSuccessResponse(res, result, "Users retrieved successfully")
}

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const result = await deleteUserService(id)

  sendSuccessResponse(res, result, "User deleted successfully")
}
