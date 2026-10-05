export interface ProductCategory {
  id: string
  name: string
  slug: string
  parentId: string | null
}

/** Full category returned from admin endpoints (includes relations) */
export interface AdminCategory extends ProductCategory {
  parent: ProductCategory | null
  children: ProductCategory[]
  createdAt: string
  updatedAt: string
}

export interface ProductMediaItem {
  id: string
  url: string
  alt: string | null
  type: string
}

export interface ProductMedia {
  id: string
  sortOrder: number
  isPrimary: boolean
  mediaId: string
  productId: string
  media: ProductMediaItem
}

export type Dosha = "VATA" | "PITTA" | "KAPHA"

export const DOSHA_OPTIONS: { value: Dosha; label: string }[] = [
  { value: "VATA", label: "Vata" },
  { value: "PITTA", label: "Pitta" },
  { value: "KAPHA", label: "Kapha" },
]

export interface HealthConcern {
  id: string
  name: string
  slug: string
}

/** Full health concern returned from admin endpoints (includes usage counts) */
export interface AdminHealthConcern extends HealthConcern {
  createdAt: string
  updatedAt: string
  _count: { products: number }
}

export interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  sku: string | null
  price: number
  discountAmount: number | null
  /** Computed: price - discountAmount */
  discountedPrice: number | null
  stock: number
  featured: boolean
  isActive: boolean
  categoryId: string
  category: ProductCategory
  dosha: Dosha | null
  keyIngredients: string[]
  recommendedUse: string[]
  notRecommendedUse: string[]
  healthConcerns: HealthConcern[]
  media: ProductMedia[]
  createdAt: string
  updatedAt: string
}

export type ProductStatus = "active" | "inactive" | "out_of_stock"

export function deriveProductStatus(product: Pick<Product, "isActive" | "stock">): ProductStatus {
  if (!product.isActive) return "inactive"
  if (product.stock <= 0) return "out_of_stock"
  return "active"
}

export interface ProductFilters {
  search?: string
  categoryIds?: string[]
  dosha?: Dosha
  healthConcernIds?: string[]
  price?: "lowToHigh" | "highToLow"
  statuses?: string[]
  page?: number
  limit?: number
}
