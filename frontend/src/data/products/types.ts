// Mirrors what the backend product module returns (backend/prisma/schema/product.prisma +
// mapProduct() in product.service.ts). This file outlives data.ts: keep it when the endpoint ships.
//
// Pricing follows the API, not the mockup:
//   price           original price          (mockup: compareAt, or price when not on sale)
//   discountAmount  rupees off, or null
//   discountedPrice price - discountAmount, or null when there is no discount
// What the customer pays: discountedPrice ?? price.
import type { Category } from "@/data/categories/types"

export type MediaType = "IMAGE" | "VIDEO" | "FILE"

export type Media = {
  id: string
  url: string
  alt: string | null
  type: MediaType
}

/** Join row between a product and a media item; the API sorts these by sortOrder. */
export type ProductMedia = {
  id: string
  sortOrder: number
  isPrimary: boolean
  media: Media
}

/** One buyable combination. Not in the API yet (backend wish list). */
export type ProductVariant = {
  id: string
  /** null for one-size items (jhumkas, bangles) */
  size: string | null
  color: string
  /** swatch color for the UI; product data, not a design token */
  colorHex: string
  sku: string
  stock: number
}

/** Merchandising label. The sale percentage isn't a badge: derive it from discountAmount. */
export type ProductBadge = "new" | "bestseller" | "limited"

export type Product = {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  sku: string | null

  price: number
  discountAmount: number | null
  discountedPrice: number | null

  stock: number
  featured: boolean
  isActive: boolean

  categoryId: string
  category: Category
  media: ProductMedia[]

  /** ISO 8601 */
  createdAt: string
  updatedAt: string

  // --- Not in the API yet (backend wish list) ---
  variants?: ProductVariant[]
  badge?: ProductBadge | null
  avgRating?: number
  reviewCount?: number
  fabric?: string | null
  careInstructions?: string | null
}
