import type { Request, Response } from "express"
import { sendSuccessResponse } from "../../utils/response.js"
import {
  createProduct as createProductService,
  deleteProduct as deleteProductService,
  getProductById,
  listProducts,
  listProductsByAdmin,
  updateProduct as updateProductService,
  type ProductListStatus,
} from "./product.service.js"

export const createProduct = async (req: Request, res: Response) => {
  const product = await createProductService(req.body)

  sendSuccessResponse(res, product, "Product created successfully", 201)
}

export const getPublicProducts = async (req: Request, res: Response) => {
  const { categoryId, dosha, healthConcernId, featured, price, search, page, limit } = req.query as Record<
    string,
    string | string[] | undefined
  >

  const result = await listProducts({
    categoryId,
    dosha: dosha as "VATA" | "PITTA" | "KAPHA" | undefined,
    healthConcernId,
    featured: featured === undefined ? undefined : featured === "true",
    price: price as "lowToHigh" | "highToLow" | undefined,
    search: search as string | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  })

  sendSuccessResponse(res, result, "Products retrieved successfully", 200)
}

export const getAdminProducts = async (req: Request, res: Response) => {
  const { categoryId, dosha, healthConcernId, price, search, page, limit, status } = req.query as Record<
    string,
    string | string[] | undefined
  >

  const result = await listProductsByAdmin({
    categoryId,
    dosha: dosha as "VATA" | "PITTA" | "KAPHA" | undefined,
    healthConcernId,
    price: price as "lowToHigh" | "highToLow" | undefined,
    search: search as string | undefined,
    status: status as ProductListStatus | ProductListStatus[] | undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  })

  sendSuccessResponse(res, result, "Products retrieved successfully", 200)
}

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const product = await getProductById(id)

  sendSuccessResponse(res, product, "Product retrieved successfully", 200)
}

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const product = await updateProductService(id, req.body)

  sendSuccessResponse(res, product, "Product updated successfully", 200)
}

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const product = await deleteProductService(id)

  sendSuccessResponse(res, product, "Product deleted successfully", 200)
}
