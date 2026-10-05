import { prisma } from "../../db/prisma.js"
import { BadRequestError, NotFoundError } from "../../errors/app.error.js"
import { slugify } from "../../utils/slug.js"
import type { CreateProductPayload, UpdateProductPayload } from "./product.types.js"
import { getCategoryAndDescendantIds } from "../category/category.service.js"
import { toStringArray } from "../../utils/query.js"

function computeDiscountedPrice(
  price: { toString: () => string },
  discountAmount: { toString: () => string } | null,
): number | null {
  if (discountAmount === null) return null
  const discounted = Number(price) - Number(discountAmount)
  return discounted > 0 ? discounted : 0
}

function mapProduct<T extends { price: any; discountAmount: any }>(product: T) {
  return {
    ...product,
    discountedPrice: computeDiscountedPrice(product.price, product.discountAmount),
    price: Number(product.price),
    discountAmount: product.discountAmount ? Number(product.discountAmount) : null,
  }
}

const productInclude = {
  category: true,
  healthConcerns: {
    select: { id: true, name: true, slug: true },
  },
  media: {
    include: {
      media: true,
    },
    orderBy: { sortOrder: "asc" },
  },
} as const

const generateUniqueProductSlug = async (name: string, excludeId?: string) => {
  const baseSlug = slugify(name)
  let slug = baseSlug
  let suffix = 1

  while (
    await prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

const ensureCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })

  if (!category) {
    throw new BadRequestError("Category not found")
  }
}

const ensureHealthConcernsExist = async (healthConcernIds: string[]) => {
  if (healthConcernIds.length === 0) return

  const existing = await prisma.healthConcern.findMany({
    where: { id: { in: healthConcernIds } },
    select: { id: true },
  })

  const foundIds = new Set(existing.map((h) => h.id))
  const missing = healthConcernIds.filter((id) => !foundIds.has(id))

  if (missing.length > 0) {
    throw new BadRequestError(`Health concerns not found: ${missing.join(", ")}`)
  }
}

const publicProductCardSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  price: true,
  discountAmount: true,
  media: {
    select: {
      sortOrder: true,
      isPrimary: true,
      media: {
        select: { id: true, url: true, alt: true, type: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  },
} as const

type PublicProductCardRow = {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  price: { toString: () => string }
  discountAmount: { toString: () => string } | null
  media: {
    sortOrder: number
    isPrimary: boolean
    media: { id: string; url: string; alt: string | null; type: string }
  }[]
}

type ReviewStats = { reviewCount: number; ratingAvg: number }

const emptyReviewStats: ReviewStats = { reviewCount: 0, ratingAvg: 0 }

/** Batch-load review count + average rating for a page of products (single query). */
const getReviewStats = async (productIds: string[]): Promise<Map<string, ReviewStats>> => {
  if (productIds.length === 0) return new Map()

  const aggregates = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _count: { _all: true },
    _avg: { rating: true },
  })

  return new Map(
    aggregates.map((agg) => [
      agg.productId,
      {
        reviewCount: agg._count._all,
        ratingAvg: agg._avg.rating === null ? 0 : Math.round(agg._avg.rating * 10) / 10,
      },
    ]),
  )
}

/** Lean storefront card: identity, pricing, rating summary, primary image only. */
function mapPublicProductCard(row: PublicProductCardRow, stats: ReviewStats) {
  const primary = row.media.find((m) => m.isPrimary) ?? row.media[0] ?? null

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.shortDescription,
    price: Number(row.price),
    discountedPrice: computeDiscountedPrice(row.price, row.discountAmount),
    reviewCount: stats.reviewCount,
    rating: stats.ratingAvg,
    imageMedia: primary
      ? { id: primary.media.id, url: primary.media.url, alt: primary.media.alt, type: primary.media.type }
      : null,
  }
}

const ensureSkuIsAvailable = async (sku: string, excludeId?: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { sku },
    select: { id: true },
  })

  if (existingProduct && existingProduct.id !== excludeId) {
    throw new BadRequestError("SKU already in use")
  }
}

const normalizeSku = (sku: string | null | undefined): string | null | undefined => {
  if (typeof sku !== "string") return sku
  const trimmed = sku.trim()
  return trimmed === "" ? null : trimmed
}

const ensureMediaExist = async (mediaIds: string[]) => {
  if (mediaIds.length === 0) return

  const existing = await prisma.media.findMany({
    where: { id: { in: mediaIds } },
    select: { id: true },
  })

  const foundIds = new Set(existing.map((m) => m.id))
  const missing = mediaIds.filter((id) => !foundIds.has(id))

  if (missing.length > 0) {
    throw new BadRequestError(`Media not found: ${missing.join(", ")}`)
  }
}

export type ProductListStatus = "active" | "inactive" | "out_of_stock"

type ListProductsParams = {
  categoryId?: string | string[]
  dosha?: "VATA" | "PITTA" | "KAPHA"
  healthConcernId?: string | string[]
  featured?: boolean
  search?: string
  price?: "lowToHigh" | "highToLow"
  status?: ProductListStatus | ProductListStatus[]
  page?: number
  limit?: number
}

/** Expand selected categories to include all descendants (for filtering). */
const resolveCategoryFilter = async (categoryId?: string | string[]): Promise<string[] | undefined> => {
  const ids = toStringArray(categoryId)
  if (!ids) return undefined
  const allIds = await Promise.all(ids.map((id) => getCategoryAndDescendantIds(id)))
  return [...new Set(allIds.flat())]
}

/**
 * Public product listing — only returns active products.
 */
export const listProducts = async (params: ListProductsParams = {}) => {
  const { categoryId, dosha, healthConcernId, featured, search, price, page = 1, limit = 10 } = params

  const categoryFilter = await resolveCategoryFilter(categoryId)

  const where: any = { isActive: true }

  if (categoryFilter) {
    where.categoryId = { in: categoryFilter }
  }

  if (dosha) {
    where.dosha = dosha
  }

  const concernIds = toStringArray(healthConcernId)
  if (concernIds) {
    where.healthConcerns = { some: { id: { in: concernIds } } }
  }

  if (featured !== undefined) {
    where.featured = featured
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const orderBy: any =
    price === "lowToHigh" ? { price: "asc" } : price === "highToLow" ? { price: "desc" } : { createdAt: "desc" }

  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: publicProductCardSelect,
    }),
    prisma.product.count({ where }),
  ])

  const stats = await getReviewStats(products.map((p) => p.id))
  const items = products.map((p) => mapPublicProductCard(p, stats.get(p.id) ?? emptyReviewStats))

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Admin product listing — returns all products (active and inactive).
 */
export const listProductsByAdmin = async (params: ListProductsParams = {}) => {
  const { categoryId, dosha, healthConcernId, search, price, status, page = 1, limit = 10 } = params

  const categoryFilter = await resolveCategoryFilter(categoryId)

  const where: any = {}

  if (categoryFilter) {
    where.categoryId = { in: categoryFilter }
  }

  if (dosha) {
    where.dosha = dosha
  }

  const concernIds = toStringArray(healthConcernId)
  if (concernIds) {
    where.healthConcerns = { some: { id: { in: concernIds } } }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  // Partial status selection narrows results; empty or full selection means no filter
  const statusList = toStringArray(status) as ProductListStatus[] | undefined

  if (statusList && statusList.length > 0 && statusList.length < 3) {
    const conditions: any[] = []

    const hasActive = statusList.includes("active")
    const hasInactive = statusList.includes("inactive")
    const hasOOS = statusList.includes("out_of_stock")

    if (hasActive && hasOOS) {
      conditions.push({ isActive: true })
    } else {
      if (hasActive) conditions.push({ isActive: true, stock: { gt: 0 } })
      if (hasOOS) conditions.push({ isActive: true, stock: 0 })
    }
    if (hasInactive) conditions.push({ isActive: false })

    if (conditions.length === 1) {
      Object.assign(where, conditions[0])
    } else if (conditions.length > 1) {
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: conditions }]
        delete where.OR
      } else {
        where.OR = conditions
      }
    }
  }

  const orderBy: any =
    price === "lowToHigh" ? { price: "asc" } : price === "highToLow" ? { price: "desc" } : { createdAt: "desc" }

  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ])

  const items = products.map(mapProduct)

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  })

  if (!product) {
    throw new NotFoundError("Product not found")
  }

  return mapProduct(product)
}

type MediaInput = { mediaId: string; sortOrder?: number; isPrimary?: boolean }

export const createProduct = async (payload: CreateProductPayload) => {
  await ensureCategoryExists(payload.categoryId)

  const sku = normalizeSku(payload.sku)
  if (sku) {
    await ensureSkuIsAvailable(sku)
  }

  if (payload.discountAmount !== undefined) {
    if (payload.discountAmount >= payload.price) {
      throw new BadRequestError("Discount amount must be less than the price")
    }
  }

  const mediaInputs = (payload.media ?? []) as MediaInput[]
  if (mediaInputs.length > 0) {
    await ensureMediaExist(mediaInputs.map((m) => m.mediaId))
  }

  const healthConcernIds = payload.healthConcernIds ?? []
  await ensureHealthConcernsExist(healthConcernIds)

  const slug = await generateUniqueProductSlug(payload.name)
  const created = await prisma.product.create({
    data: {
      name: payload.name,
      slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      sku: sku ?? null,
      price: payload.price,
      discountAmount: payload.discountAmount ?? null,
      stock: payload.stock,
      featured: payload.featured,
      categoryId: payload.categoryId,
      dosha: payload.dosha ?? null,
      keyIngredients: payload.keyIngredients ?? [],
      recommendedUse: payload.recommendedUse ?? [],
      notRecommendedUse: payload.notRecommendedUse ?? [],
      healthConcerns: {
        connect: healthConcernIds.map((id) => ({ id })),
      },
      media: {
        create: mediaInputs.map((m, index) => ({
          mediaId: m.mediaId,
          sortOrder: m.sortOrder ?? index,
          isPrimary: m.isPrimary ?? index === 0,
        })),
      },
    },
    include: productInclude,
  })

  return mapProduct(created)
}

export const updateProduct = async (id: string, payload: UpdateProductPayload) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!product) {
    throw new NotFoundError("Product not found")
  }

  if (payload.categoryId) {
    await ensureCategoryExists(payload.categoryId)
  }

  const normalizedSku = payload.sku === undefined ? undefined : normalizeSku(payload.sku)
  if (normalizedSku) {
    await ensureSkuIsAvailable(normalizedSku, id)
  }

  if (typeof payload.discountAmount === "number" && payload.price !== undefined) {
    if (payload.discountAmount >= payload.price) {
      throw new BadRequestError("Discount amount must be less than the price")
    }
  }

  const data: Record<string, any> = {
    ...(payload.name ? { name: payload.name, slug: await generateUniqueProductSlug(payload.name, id) } : {}),
    ...(payload.shortDescription !== undefined ? { shortDescription: payload.shortDescription } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(normalizedSku !== undefined ? { sku: normalizedSku } : {}),
    ...(payload.price !== undefined ? { price: payload.price } : {}),
    ...(payload.discountAmount !== undefined ? { discountAmount: payload.discountAmount } : {}),
    ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
    ...(payload.featured !== undefined ? { featured: payload.featured } : {}),
    ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
    ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    ...(payload.dosha !== undefined ? { dosha: payload.dosha } : {}),
    ...(payload.keyIngredients !== undefined ? { keyIngredients: payload.keyIngredients } : {}),
    ...(payload.recommendedUse !== undefined ? { recommendedUse: payload.recommendedUse } : {}),
    ...(payload.notRecommendedUse !== undefined ? { notRecommendedUse: payload.notRecommendedUse } : {}),
  }

  // Replace the assigned health concerns when the field is provided (empty array clears all)
  if (payload.healthConcernIds !== undefined) {
    await ensureHealthConcernsExist(payload.healthConcernIds)
    data.healthConcerns = {
      set: payload.healthConcernIds.map((concernId) => ({ id: concernId })),
    }
  }

  // Handle media updates: replace all existing media with the new set
  if (payload.media !== undefined) {
    const mediaInputs = payload.media as MediaInput[]
    if (mediaInputs.length > 0) {
      await ensureMediaExist(mediaInputs.map((m) => m.mediaId))
    }

    // Delete existing ProductMedia records and create new ones in a transaction
    data.media = {
      deleteMany: {},
      create: mediaInputs.map((m, index) => ({
        mediaId: m.mediaId,
        sortOrder: m.sortOrder ?? index,
        isPrimary: m.isPrimary ?? index === 0,
      })),
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  })

  return mapProduct(updated)
}

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!product) {
    throw new NotFoundError("Product not found")
  }

  const deleted = await prisma.product.delete({
    where: { id },
    include: productInclude,
  })

  return mapProduct(deleted)
}
