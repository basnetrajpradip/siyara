import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.[0] ?? ""
  const last = lastName?.[0] ?? ""
  return (first + last).toUpperCase() || "?"
}

export function formatDate(date: string | null | undefined, options: Intl.DateTimeFormatOptions) {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat("en-US", options).format(parsed)
}
