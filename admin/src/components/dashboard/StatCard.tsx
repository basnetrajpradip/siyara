import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  iconClassName?: string
  footer?: string
  delta?: number
}

export function StatCard({ title, value, icon: Icon, iconClassName, footer, delta }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-syne text-sm font-medium text-muted-foreground">{title}</p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600",
            iconClassName,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="font-libre text-[28px] font-bold leading-none text-primary-900">{value}</p>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              delta >= 0 ? "bg-success-100 text-success-700" : "bg-error-100 text-error-700",
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
    </Card>
  )
}
