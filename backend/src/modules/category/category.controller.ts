import type { Request, Response } from "express"
import { sendSuccessResponse } from "../../utils/response.js"
import {
  createCategory as createCategoryService,
  deleteCategory as deleteCategoryService,
  getCategoryById,
  listAdminCategories,
  listPublicCategories,
  updateCategory as updateCategoryService,
} from "./category.service.js"

export const createCategory = async (req: Request, res: Response) => {
  const category = await createCategoryService(req.body)

  sendSuccessResponse(res, category, "Category created successfully", 201)
}

export const getPublicCategories = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query as Record<string, string | undefined>

  const result = await listPublicCategories({
    search,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  })

  sendSuccessResponse(res, result, "Categories retrieved successfully", 200)
}

export const getAdminCategories = async (req: Request, res: Response) => {
  const { search, page, limit } = req.query as Record<string, string | undefined>

  const result = await listAdminCategories({
    search,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  })

  sendSuccessResponse(res, result, "Categories retrieved successfully", 200)
}

export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const category = await getCategoryById(id)

  sendSuccessResponse(res, category, "Category retrieved successfully", 200)
}

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const category = await updateCategoryService(id, req.body)

  sendSuccessResponse(res, category, "Category updated successfully", 200)
}

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const category = await deleteCategoryService(id)

  sendSuccessResponse(res, category, "Category deleted successfully", 200)
}
