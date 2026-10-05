import { prisma } from "../../db/prisma.js"
import { BadRequestError, NotFoundError } from "../../errors/app.error.js"
import { slugify } from "../../utils/slug.js"
import type { CreateCategoryPayload, UpdateCategoryPayload } from "./category.types.js"

const categoryInclude = {
  parent: true,
  children: true,
} as const

const generateUniqueCategorySlug = async (name: string, excludeId?: string) => {
  const baseSlug = slugify(name)
  let slug = baseSlug
  let suffix = 1

  while (
    await prisma.category.findFirst({
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

const ensureParentExists = async (parentId: string) => {
  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { id: true },
  })

  if (!parent) {
    throw new BadRequestError("Parent category not found")
  }
}

export const listPublicCategories = async (params?: { search?: string; page?: number; limit?: number }) => {
  const { search, page = 1, limit = 10 } = params ?? {}

  const where: any = {}

  if (search) {
    where.name = { contains: search, mode: "insensitive" }
  }

  const skip = (page - 1) * limit

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
      select: { id: true, name: true },
    }),
    prisma.category.count({ where }),
  ])

  return {
    items: categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const listAdminCategories = async (params?: { search?: string; page?: number; limit?: number }) => {
  const { search, page = 1, limit = 10 } = params ?? {}

  const where: any = {}

  if (search) {
    where.name = { contains: search, mode: "insensitive" }
  }

  const skip = (page - 1) * limit

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: limit,
      include: categoryInclude,
    }),
    prisma.category.count({ where }),
  ])

  return {
    items: categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * Recursively collect all descendant category IDs for a given category.
 * Includes the original category ID itself.
 */
export const getCategoryAndDescendantIds = async (categoryId: string): Promise<string[]> => {
  const ids = [categoryId]

  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  })

  for (const child of children) {
    const descendantIds = await getCategoryAndDescendantIds(child.id)
    ids.push(...descendantIds)
  }

  return ids
}

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: categoryInclude,
  })

  if (!category) {
    throw new NotFoundError("Category not found")
  }

  return category
}

export const createCategory = async (payload: CreateCategoryPayload) => {
  if (payload.parentId) {
    await ensureParentExists(payload.parentId)
  }

  const slug = await generateUniqueCategorySlug(payload.name)

  return prisma.category.create({
    data: {
      name: payload.name,
      slug,
      parentId: payload.parentId ?? null,
    },
    include: categoryInclude,
  })
}

export const updateCategory = async (id: string, payload: UpdateCategoryPayload) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!category) {
    throw new NotFoundError("Category not found")
  }

  if (payload.parentId !== undefined) {
    if (payload.parentId === id) {
      throw new BadRequestError("Category cannot be its own parent")
    }

    if (payload.parentId) {
      await ensureParentExists(payload.parentId)
    }
  }

  const data = {
    ...(payload.name ? { name: payload.name, slug: await generateUniqueCategorySlug(payload.name, id) } : {}),
    ...(payload.parentId !== undefined ? { parentId: payload.parentId } : {}),
  }

  return prisma.category.update({
    where: { id },
    data,
    include: categoryInclude,
  })
}

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!category) {
    throw new NotFoundError("Category not found")
  }

  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ])

  if (childCount > 0) {
    throw new BadRequestError("Category has child categories")
  }

  if (productCount > 0) {
    throw new BadRequestError("Category has products")
  }

  return prisma.category.delete({
    where: { id },
    include: categoryInclude,
  })
}
