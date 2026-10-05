import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ConsultationType } from "@/types/consultation"
import { getConsultationTypeLabel } from "@/types/consultation"
import type { DashboardRange, DateValuePoint, StatusCount } from "@/types/dashboard"
import { formatChartDate } from "@/lib/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "./ChartTooltip"
import { DonutChart, toDonutData } from "./DonutChart"
import { CONSULTATION_TYPE_CHART_COLORS } from "./status-colors"

interface ConsultationChartProps {
  overTime: DateValuePoint[]
  byType: StatusCount[]
  range: DashboardRange
}

export function ConsultationChart({ overTime, byType, range }: ConsultationChartProps) {
  const typeData = toDonutData(
    byType,
    CONSULTATION_TYPE_CHART_COLORS,
    (key) => getConsultationTypeLabel(key as ConsultationType),
  )

  return (
    <Card className="flex min-w-0 flex-col md:col-span-2 xl:col-span-2">
      <CardHeader>
        <CardTitle>Consultations</CardTitle>
        <CardDescription>Appointments scheduled over time</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="h-56 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overTime} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
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
              <Bar dataKey="count" name="Consultations" fill="#ff851f" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full">
          <DonutChart data={typeData} height={180} />
        </div>
      </CardContent>
    </Card>
  )
}
