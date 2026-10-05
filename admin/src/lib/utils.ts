import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
    currencyDisplay: "symbol",
  })
    .format(amount)
    .replace("NPR", "Rs.")
}

export function getInitials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.[0] ?? ""
  const last = lastName?.[0] ?? ""
  return (first + last).toUpperCase() || "?"
}
