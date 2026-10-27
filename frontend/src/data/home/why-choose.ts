// "Why choose Siyara?" pillars. Never comes from the API.
// Overlaps with trust.ts (quality, delivery, payments); Day 5 merges the two.
import { BadgeCheck, Gift, Headset, ShieldCheck, Truck, type LucideIcon } from "lucide-react"

export type WhyChooseItem = { icon: LucideIcon; title: string; subtitle: string }

export const whyChoose = {
  eyebrow: "The Siyara promise",
  title: "Why Choose Siyara?",
  subtitle: "Women across Nepal trust us for quality, fit and service.",
}

export const whyChooseItems: WhyChooseItem[] = [
  { icon: BadgeCheck, title: "Premium Quality", subtitle: "Carefully selected fabrics" },
  { icon: Truck, title: "Fast Delivery", subtitle: "Delivery all over Nepal" },
  { icon: ShieldCheck, title: "Secure Payment", subtitle: "100% safe & secure payments" },
  { icon: Headset, title: "Customer Support", subtitle: "We're here to help you" },
  { icon: Gift, title: "Exciting Offers", subtitle: "Best deals & discounts for you" },
]
