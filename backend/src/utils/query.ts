import { z } from "zod"

export const toStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) return undefined

  const parts = Array.isArray(value) ? value : [value]
  const items: string[] = []

  for (const part of parts) {
    if (typeof part !== "string") continue
    const trimmed = part.trim()
    if (trimmed) items.push(trimmed)
  }

  return items.length > 0 ? items : undefined
}

export const singleOrArray = (itemSchema: z.ZodTypeAny = z.string()) =>
  z.union([itemSchema, z.array(itemSchema)]).optional()
