import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "./ChartTooltip"

export interface DonutDatum {
  key: string
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutDatum[]
  height?: number
}

export function toDonutData<T extends string>(
  items: Array<{ status: string; count: number }>,
  colorMap: Record<T, string>,
  labelFn: (key: string) => string,
): DonutDatum[] {
  return items.map((item) => ({
    key: item.status,
    label: labelFn(item.status),
    value: item.count,
    color: colorMap[item.status as T] ?? "#94a3b8",
  }))
}

export function DonutChart({ data, height = 200 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data for this period</p>
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  formatter={(value) => `${value} (${((value / total) * 100).toFixed(1)}%)`}
                />
              )}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((item) => (
                <Cell key={item.key} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid w-full grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {data.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate text-muted-foreground">{item.label}</span>
            <span className="ml-auto font-semibold text-primary-900">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
