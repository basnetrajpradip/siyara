// The only file that knows where categories come from. Today: data.ts. Later: a categories service.
import { categories } from "@/data/categories/data"
import type { Category } from "@/data/categories/types"

/** Top-level categories (Sarees, Kurtis…), in display order. */
export async function getCategories(): Promise<Category[]> {
  return categories.filter((c) => c.parentId === null)
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categories.find((c) => c.slug === slug) ?? null
}
