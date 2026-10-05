import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

interface SearchFilterProps {
  searchInput: string
  handleSearchChange: (value: string) => void
  handleSearchClear: () => void
  placeholder: string
  hasFilters?: boolean
  hasActiveFilters?: boolean
  setFilterOpen?: (open: boolean) => void
}

const SearchFilter = ({
  searchInput,
  handleSearchChange,
  handleSearchClear,
  hasFilters,
  hasActiveFilters,
  setFilterOpen,
  placeholder,
}: SearchFilterProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-[46px] w-full pl-9 pr-9"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {hasFilters && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFilterOpen?.(true)}
          className={cn(
            "relative size-[46px] shrink-0 rounded-lg border-border",
            hasActiveFilters && "border-primary text-primary",
          )}
          title="Open filters"
        >
          <SlidersHorizontal className="size-4" />
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-primary" />
            </span>
          )}
        </Button>
      )}
    </div>
  )
}

export default SearchFilter
