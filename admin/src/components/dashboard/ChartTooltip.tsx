import type { TooltipContentProps } from "recharts"

interface ChartTooltipProps {
  active?: TooltipContentProps["active"]
  payload?: TooltipContentProps["payload"]
  label?: TooltipContentProps["label"]
  formatter?: (value: number, dataKey: string) => string
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-syne font-semibold text-primary-900">{label}</p>
      <div className="flex flex-col gap-1">
        {payload.map((entry, index) => {
          const value = Array.isArray(entry.value) ? entry.value[0] : entry.value
          const key = String(entry.dataKey ?? entry.name ?? index)
          const formatted = formatter ? formatter(Number(value ?? 0), key) : String(value)
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color ?? "#1a8d8d" }}
              />
              <span className="text-muted-foreground">{entry.name ?? key}:</span>
              <span className="font-semibold text-primary-900">{formatted}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
