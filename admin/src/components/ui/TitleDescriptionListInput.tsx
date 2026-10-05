import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TitleDescriptionItem {
  title: string
  description: string
}

export interface TitleDescriptionRowErrors {
  title?: string
  description?: string
}

interface TitleDescriptionListInputProps {
  value: TitleDescriptionItem[]
  onChange: (value: TitleDescriptionItem[]) => void
  titlePlaceholder?: string
  descriptionPlaceholder?: string
  addLabel?: string
  maxItems?: number
  disabled?: boolean
  rowErrors?: (TitleDescriptionRowErrors | undefined)[]
}

/**
 * Reusable dynamic list of title + description entries (e.g. treatment
 * approach steps, professional experience). Entries can be added, edited
 * inline, and removed. Pair with a zod array-of-objects schema; pass
 * per-row validation messages via `rowErrors`.
 */
export default function TitleDescriptionListInput({
  value,
  onChange,
  titlePlaceholder = "Title",
  descriptionPlaceholder = "Description",
  addLabel = "Add item",
  maxItems = 20,
  disabled = false,
  rowErrors,
}: TitleDescriptionListInputProps) {
  const updateItem = (index: number, patch: Partial<TitleDescriptionItem>) => {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const addItem = () => {
    if (value.length >= maxItems) return
    onChange([...value, { title: "", description: "" }])
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 && (
        <p className="font-syne text-xs text-muted-foreground">No entries yet. Use the button below to add one.</p>
      )}
      {value.map((item, index) => {
        const errors = rowErrors?.[index]
        return (
          <div key={index} className="relative flex flex-col gap-2 rounded-lg border border-border bg-white p-3">
            <button
              type="button"
              aria-label={`Remove entry ${index + 1}`}
              disabled={disabled}
              onClick={() => removeItem(index)}
              className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
            <div className="pr-8">
              <Input
                value={item.title}
                disabled={disabled}
                maxLength={120}
                placeholder={titlePlaceholder}
                aria-label={`Entry ${index + 1} title`}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                className={cn(errors?.title && "border-destructive")}
              />
              {errors?.title && <p className="mt-1 font-syne text-xs text-error-500">{errors.title}</p>}
            </div>
            <div>
              <Textarea
                value={item.description}
                disabled={disabled}
                rows={2}
                maxLength={1000}
                placeholder={descriptionPlaceholder}
                aria-label={`Entry ${index + 1} description`}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                className={cn(errors?.description && "border-destructive")}
              />
              {errors?.description && <p className="mt-1 font-syne text-xs text-error-500">{errors.description}</p>}
            </div>
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || value.length >= maxItems}
        onClick={addItem}
        className="self-start"
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}
