import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { DashboardRange, DateValuePoint } from "@/types/dashboard"
import { formatChartDate } from "@/lib/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "./ChartTooltip"

interface CustomersChartProps {
  data: DateValuePoint[]
  range: DashboardRange
}

export function CustomersChart({ data, range }: CustomersChartProps) {
  return (
    <Card className="flex min-w-0 flex-col md:col-span-1 xl:col-span-2">
      <CardHeader>
        <CardTitle>New Customers</CardTitle>
        <CardDescription>Customer signups over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
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
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltip active={active} payload={payload} label={label} formatter={(value) => String(value)} />
                )}
              />
              <Bar dataKey="count" name="Customers" fill="#1a8d8d" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
