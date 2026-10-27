// The four promises in the strip under the hero. Never comes from the API.
// Values come from lib/config, so changing the threshold changes this copy too.
// Day 5 merges this with why-choose.ts so each promise appears once.
import { Award, RotateCcw, ShieldCheck, Truck, type LucideIcon } from "lucide-react"
import { FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/config"
import { formatRs } from "@/lib/format"

export type TrustItem = { icon: LucideIcon; title: string; subtitle: string }

export const trustItems: TrustItem[] = [
  { icon: Truck, title: "Free Delivery", subtitle: `On orders above ${formatRs(FREE_SHIPPING_THRESHOLD)}` },
  { icon: Award, title: "Premium Quality", subtitle: "Best fabric promise" },
  { icon: RotateCcw, title: "Easy Returns", subtitle: `${RETURN_WINDOW_DAYS}-day easy returns` },
  { icon: ShieldCheck, title: "Secure Payments", subtitle: "eSewa, Khalti & COD" },
]
