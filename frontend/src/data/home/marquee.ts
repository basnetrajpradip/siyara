// Scrolling ribbon messages. Never comes from the API.
import { socialProof } from "@/data/home/hero"
import { FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS } from "@/lib/config"
import { formatRs } from "@/lib/format"

export const marqueeItems: string[] = [
  `Free delivery above ${formatRs(FREE_SHIPPING_THRESHOLD)}`,
  "Festive Edit 2026 just landed",
  `${RETURN_WINDOW_DAYS}-day easy returns`,
  "Cash on Delivery available",
  "New styles every Friday",
  `Loved by ${socialProof.customers} women`,
]
