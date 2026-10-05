import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCategoryOptions } from "@/services/categoryService"
import { getHealthConcernOptions } from "@/services/healthConcernService"
import type { HealthConcern, ProductCategory, ProductStatus } from "@/types/product"
import { toast } from "sonner"

interface ProductFilterProps {
  selectedCategoryIds: string[]
  onCategoryIdsChange: (ids: string[]) => void
  selectedHealthConcernIds: string[]
  onHealthConcernIdsChange: (ids: string[]) => void
  selectedPrices: string[]
  onPricesChange: (prices: string[]) => void
  selectedStatuses: string[]
  onStatusesChange: (statuses: string[]) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

const PRICE_OPTIONS = [
  { value: "lowToHigh", label: "Low to High" },
  { value: "highToLow", label: "High to Low" },
] as const

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of Stock" },
]

export default function ProductFilter({
  selectedCategoryIds,
  onCategoryIdsChange,
  selectedHealthConcernIds,
  onHealthConcernIdsChange,
  selectedPrices,
  onPricesChange,
  selectedStatuses,
  onStatusesChange,
  onClearAll,
  hasActiveFilters,
}: ProductFilterProps) {
  const [categoryOptions, setCategoryOptions] = useState<ProductCategory[]>([])
  const [healthConcernOptions, setHealthConcernOptions] = useState<HealthConcern[]>([])

  useEffect(() => {
    getCategoryOptions(100)
      .then(setCategoryOptions)
      .catch(() => toast.error("Failed to load categories"))
  }, [])

  useEffect(() => {
    // No error toast: an empty list is a valid state, not a failure.
    getHealthConcernOptions()
      .then(setHealthConcernOptions)
      .catch(() => setHealthConcernOptions([]))
  }, [])

  const toggleCategory = (id: string) => {
    if (selectedCategoryIds.includes(id)) {
      onCategoryIdsChange(selectedCategoryIds.filter((c) => c !== id))
    } else {
      onCategoryIdsChange([...selectedCategoryIds, id])
    }
  }

  const toggleHealthConcern = (id: string) => {
    if (selectedHealthConcernIds.includes(id)) {
      onHealthConcernIdsChange(selectedHealthConcernIds.filter((c) => c !== id))
    } else {
      onHealthConcernIdsChange([...selectedHealthConcernIds, id])
    }
  }

  const togglePrice = (value: string) => {
    if (selectedPrices.includes(value)) {
      onPricesChange([])
    } else {
      onPricesChange([value])
    }
  }

  const toggleStatus = (value: ProductStatus) => {
    if (selectedStatuses.includes(value)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== value))
    } else {
      onStatusesChange([...selectedStatuses, value])
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-syne text-base font-semibold text-[#033333]">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-auto px-2 text-xs text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-2">
        <Accordion className="w-full">
          {/* Categories */}
          <AccordionItem value="categories">
            <AccordionTrigger>Categories</AccordionTrigger>
            <AccordionContent>
              {categoryOptions.length === 0 ? (
                <p className="py-2 text-xs text-muted-foreground">No categories available</p>
              ) : (
                <div className="flex flex-col gap-1.5 py-1">
                  {categoryOptions.map((cat) => (
                    <Label
                      key={cat.id}
                      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-normal text-[#4A5565] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                    >
                      <Checkbox
                        checked={selectedCategoryIds.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      {cat.name}
                    </Label>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Health Concerns */}
          <AccordionItem value="health-concerns">
            <AccordionTrigger>Health Concerns</AccordionTrigger>
            <AccordionContent>
              {healthConcernOptions.length === 0 ? (
                <p className="py-2 text-xs text-muted-foreground">No health concerns available</p>
              ) : (
                <div className="flex flex-col gap-1.5 py-1">
                  {healthConcernOptions.map((concern) => (
                    <Label
                      key={concern.id}
                      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-normal text-[#4A5565] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                    >
                      <Checkbox
                        checked={selectedHealthConcernIds.includes(concern.id)}
                        onCheckedChange={() => toggleHealthConcern(concern.id)}
                      />
                      {concern.name}
                    </Label>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Price */}
          <AccordionItem value="price">
            <AccordionTrigger>Price</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-1.5 py-1">
                {PRICE_OPTIONS.map((opt) => (
                  <Label
                    key={opt.value}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-normal text-[#4A5565] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Checkbox
                      checked={selectedPrices.includes(opt.value)}
                      onCheckedChange={() => togglePrice(opt.value)}
                    />
                    {opt.label}
                  </Label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Status */}
          <AccordionItem value="status">
            <AccordionTrigger>Status</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-1.5 py-1">
                {STATUS_OPTIONS.map((opt) => (
                  <Label
                    key={opt.value}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-normal text-[#4A5565] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(opt.value)}
                      onCheckedChange={() => toggleStatus(opt.value)}
                    />
                    {opt.label}
                  </Label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
