// Placeholder until a reviews endpoint exists. Only lib/testimonials.ts may import this file.
import type { Testimonial } from "./types"

export const testimonials: Testimonial[] = [
  {
    id: "rev_prerana",
    rating: 5,
    comment:
      "The organza saree looked even better in person. Fabric quality is premium and delivery arrived in 2 days!",
    createdAt: "2026-10-14T08:30:00.000Z",
    user: { id: "usr_prerana", firstName: "Prerana", lastName: "Shrestha", city: "Kathmandu" },
    product: { id: "prod_soft-organza-saree", name: "Soft Organza Saree", slug: "soft-organza-saree" },
  },
  {
    id: "rev_aashika",
    rating: 5,
    comment: "Ordered a kurti for office wear. Perfect fitting, beautiful stitching. Exchange was hassle-free too.",
    createdAt: "2026-09-28T11:15:00.000Z",
    user: { id: "usr_aashika", firstName: "Aashika", lastName: "Gurung", city: "Pokhara" },
    product: { id: "prod_lavender-floral-kurti", name: "Lavender Floral Kurti", slug: "lavender-floral-kurti" },
  },
  {
    id: "rev_sneha",
    rating: 5,
    comment: "My bridal lehenga fitting was magical. The team helped me on WhatsApp with sizes. Highly trusted store.",
    createdAt: "2026-08-30T14:45:00.000Z",
    user: { id: "usr_sneha", firstName: "Sneha", lastName: "Maharjan", city: "Lalitpur" },
    product: { id: "prod_royal-bridal-lehenga", name: "Royal Red Bridal Lehenga", slug: "royal-bridal-lehenga" },
  },
]
