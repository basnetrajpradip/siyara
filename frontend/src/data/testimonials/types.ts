// Mirrors the backend `Review` model (backend/prisma/schema/review.prisma) with the
// user and product relations included. Keep this file when the reviews endpoint ships.

export type Testimonial = {
  id: string
  /** 1 to 5 */
  rating: number
  comment: string | null
  /** ISO 8601 */
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    /** Not in the API yet (backend wish list). The mockup shows "Kathmandu", "Pokhara"… */
    city?: string | null
  }
  product: {
    id: string
    name: string
    slug: string
  }
}
