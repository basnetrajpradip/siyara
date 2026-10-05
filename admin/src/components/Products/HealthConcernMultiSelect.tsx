import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { getHealthConcernOptions } from "@/services/healthConcernService"
import type { HealthConcern } from "@/types/product"
import { FormField } from "../common/FormComponents"
import { cn } from "@/lib/utils"

interface HealthConcernMultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  label?: string
  required?: boolean
  helperText?: string
}

/**
 * Checkbox list for assigning multiple health concerns to a product.
 * Selections are tracked by concern id.
 */
export default function HealthConcernMultiSelect({
  value,
  onChange,
  error,
  label = "Health Concerns",
  required = false,
  helperText,
}: HealthConcernMultiSelectProps) {
  const [concerns, setConcerns] = useState<HealthConcern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getHealthConcernOptions()
      .then((data) => {
        if (!cancelled) setConcerns(data)
      })
      // No error toast: an empty list is a valid state, not a failure.
      // The inline empty message below covers it.
      .catch(() => {
        if (!cancelled) setConcerns([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <FormField label={label} required={required} error={error}>
      <div
        aria-invalid={!!error}
        className={cn(
          "max-h-56 overflow-y-auto rounded-lg border border-input bg-transparent px-3 py-2",
          error && "border-destructive",
        )}
      >
        {loading && <p className="py-2 text-center font-syne text-sm text-muted-foreground">Loading...</p>}
        {!loading && concerns.length === 0 && (
          <p className="py-2 text-center font-syne text-sm text-muted-foreground">
            No health concerns found. Create one under Health Concerns first.
          </p>
        )}
        {!loading &&
          concerns.map((concern) => (
            <label
              key={concern.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-2 transition-colors hover:bg-muted/60"
            >
              <Checkbox checked={value.includes(concern.id)} onCheckedChange={() => toggle(concern.id)} />
              <span className="font-syne text-sm text-[#364153]">{concern.name}</span>
            </label>
          ))}
      </div>
      {value.length > 0 && (
        <p className="font-syne text-xs text-muted-foreground">
          {value.length} selected
        </p>
      )}
      {helperText && <p className="font-syne text-xs text-muted-foreground">{helperText}</p>}
    </FormField>
  )
}
