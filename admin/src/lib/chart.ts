import { format, parse } from "date-fns"
import type { DashboardRange } from "@/types/dashboard"

export const CHART_COLORS = [
  "#1a8d8d",
  "#ff851f",
  "#3fc97c",
  "#ffb91a",
  "#ff4423",
  "#6c9ee6",
  "#8b5cf6",
  "#94a3b8",
]

export function formatChartDate(value: string, range: DashboardRange): string {
  if (value.length === 7) {
    return format(parse(value, "yyyy-MM", new Date()), "MMM")
  }
  const date = parse(value, "yyyy-MM-dd", new Date())
  if (range === "7d") return format(date, "EEE")
  return format(date, "d MMM")
}
