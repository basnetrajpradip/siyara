import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface ListHeaderProps {
  /** Page title (e.g. "Products") */
  title: string
  /** Subtitle beneath the title (e.g. "Manage your ayurvedic product catalog") */
  subtitle: string
  /** Whether to show the action button */
  showButton?: boolean
  /** Label for the action button */
  buttonLabel?: string
  /** Click handler for the action button */
  onButtonClick?: () => void
  /** Optional extra classes */
  className?: string
}

export function ListHeader({
  title,
  subtitle,
  showButton = false,
  buttonLabel,
  onButtonClick,
  className,
}: ListHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="font-libre text-[30px] font-bold leading-9 text-primary-900">
          {title}
        </h1>
        <p className="mt-1 text-base text-primary-700 font-syne">
          {subtitle}
        </p>
      </div>
      {showButton && (
        <Button
          onClick={onButtonClick}
          className="h-12 shrink-0 gap-2 rounded-xl bg-secondary-600 px-6 text-base font-semibold text-white hover:bg-secondary-700"
        >
          <Plus className="size-5" />
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}
