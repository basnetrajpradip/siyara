// The only file that knows where testimonials come from. Today: data.ts. Later: a reviews service.
import { testimonials } from "@/data/testimonials/data"
import type { Testimonial } from "@/data/testimonials/types"

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials
}
