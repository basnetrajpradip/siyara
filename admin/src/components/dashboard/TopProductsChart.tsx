import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TopProduct } from "@/types/dashboard"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "./ChartTooltip"

interface TopProductsChartProps {
  data: TopProduct[]
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue)

  return (
    <Card className="flex min-w-0 flex-col md:col-span-2 xl:col-span-2">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best sellers by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No product sales in this period</p>
        ) : (
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sorted}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      payload={payload}
                      label={label}
                      formatter={(value) => formatPrice(value)}
                    />
                  )}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#ff851f" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
