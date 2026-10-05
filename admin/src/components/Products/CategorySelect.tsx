import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCategoryOptions } from "@/services/categoryService"
import type { ProductCategory } from "@/types/product"
import { FormField } from "../common/FormComponents"

interface CategorySelectProps {
  value: string | null
  onChange: (value: string | null) => void
  error?: string
  label?: string
  required?: boolean
  placeholder?: string
  /** Show a "None" option at the top of the dropdown */
  includeNoneOption?: boolean
  /** Label for the "None" option */
  noneLabel?: string
  /** Optional category ID to exclude from the list (e.g. prevent self-reference) */
  excludeId?: string
  /** Helper text displayed below the select */
  helperText?: string
}

export default function CategorySelect({
  value,
  onChange,
  error,
  label = "Category",
  required = true,
  placeholder = "Select a category",
  includeNoneOption = false,
  noneLabel = "None",
  excludeId,
  helperText,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getCategoryOptions(100)
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load categories")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredCategories = excludeId ? categories.filter((c) => c.id !== excludeId) : categories

  const selectedName = value ? categories.find((c) => c.id === value)?.name : undefined

  const internalValue = includeNoneOption ? (value ?? "null") : value

  return (
    <FormField label={label} required={required} error={error}>
      <Select value={internalValue} onValueChange={(v) => onChange(v === "null" ? null : v)}>
        <SelectTrigger className="w-full" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder}>
            {includeNoneOption && !value ? noneLabel : (selectedName ?? placeholder)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          {includeNoneOption && <SelectItem value="null">{noneLabel}</SelectItem>}
          {filteredCategories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
          {!loading && filteredCategories.length === 0 && (
            <div className="px-2 py-4 text-center font-syne text-sm text-muted-foreground">
              {includeNoneOption ? "No categories available" : "No categories found"}
            </div>
          )}
          {loading && <div className="px-2 py-4 text-center font-syne text-sm text-muted-foreground">Loading...</div>}
        </SelectContent>
      </Select>
      {helperText && <p className="font-syne text-xs text-muted-foreground">{helperText}</p>}
    </FormField>
  )
}
