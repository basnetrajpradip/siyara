// The only file that knows where products come from. Today: data.ts. Later: services/productService.ts.
// The getters are async already, so pages `await` them today and won't change when they start fetching.
import { products } from "@/data/products/data"
import type { Product } from "@/data/products/types"

export async function getProducts(): Promise<Product[]> {
  return products.filter((p) => p.isActive)
}

/** Returns null (not undefined, not a throw) so a page can call notFound(). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug && p.isActive) ?? null
}
