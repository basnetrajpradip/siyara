import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { DashboardRange, RevenuePoint } from "@/types/dashboard"
import { formatPrice } from "@/lib/utils"
import { formatChartDate } from "@/lib/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "./ChartTooltip"

interface RevenueChartProps {
  data: RevenuePoint[]
  range: DashboardRange
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
}

export function RevenueChart({ data, range }: RevenueChartProps) {
  return (
    <Card className="flex min-w-0 flex-col md:col-span-2 xl:col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Paid revenue and order volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatChartDate(String(value), range)}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={16}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => formatCompact(Number(value))}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltip
                    active={active}
                    payload={payload}
                    label={label}
                    formatter={(value, key) => (key === "revenue" ? formatPrice(value) : String(value))}
                  />
                )}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#1a8d8d"
                fill="#1a8d8d"
                fillOpacity={0.12}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#ff851f"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
