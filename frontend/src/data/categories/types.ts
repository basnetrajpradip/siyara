// Mirrors the backend `Category` model (backend/prisma/schema/category.prisma).
// This file outlives data.ts: keep it when the categories endpoint ships.

export type Category = {
  id: string
  name: string
  slug: string
  /** null for top-level categories (Sarees), set for children (Silk Sarees) */
  parentId: string | null

  // --- Not in the API yet (backend wish list) ---
  image?: string | null
  description?: string | null
}
