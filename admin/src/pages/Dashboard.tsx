import { useEffect, useState } from "react"
import { BookOpen, Calendar, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import type { OrderStatus, PaymentStatus } from "@/types/order"
import { getOrderStatusLabel, getPaymentStatusLabel } from "@/types/order"
import {
  DASHBOARD_RANGES,
  type DashboardAnalytics,
  type DashboardOverview,
  type DashboardRange,
} from "@/types/dashboard"
import { getDashboardAnalytics, getDashboardOverview } from "@/services/dashboardService"
import { handleError } from "@/lib/error-utils"
import { formatPrice } from "@/lib/utils"
import { ListHeader } from "@/components/ui/list-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ConsultationChart } from "@/components/dashboard/ConsultationChart"
import { CustomersChart } from "@/components/dashboard/CustomersChart"
import { DonutChart, toDonutData } from "@/components/dashboard/DonutChart"
import { LowStockList } from "@/components/dashboard/LowStockList"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { StatCard } from "@/components/dashboard/StatCard"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { ORDER_STATUS_CHART_COLORS, PAYMENT_STATUS_CHART_COLORS } from "@/components/dashboard/status-colors"

function LoadingPanel() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
      <Spinner className="size-6 text-primary-600" />
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-error-200 bg-error-100 px-4 py-3 text-sm text-error-700">{message}</div>
  )
}

export default function Dashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [range, setRange] = useState<DashboardRange>("30d")
  const [isOverviewLoading, setIsOverviewLoading] = useState(true)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsOverviewLoading(true)
      setOverviewError(null)
      try {
        const res = await getDashboardOverview()
        if (!cancelled) setOverview(res.data)
      } catch (err) {
        if (!cancelled) {
          handleError(err)
          setOverviewError("Failed to load dashboard overview")
        }
      } finally {
        if (!cancelled) setIsOverviewLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsAnalyticsLoading(true)
      setAnalyticsError(null)
      try {
        const res = await getDashboardAnalytics(range)
        if (!cancelled) setAnalytics(res.data)
      } catch (err) {
        if (!cancelled) {
          handleError(err)
          setAnalyticsError("Failed to load analytics")
        }
      } finally {
        if (!cancelled) setIsAnalyticsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [range])

  const kpis = overview?.kpis

  return (
    <div className="flex flex-col gap-5 px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ListHeader title="Dashboard" subtitle="Welcome back to your ayurvedic platform" className="sm:items-start" />
        <Select
          value={range}
          onValueChange={(value) => {
            if (value) setRange(value)
          }}
        >
          <SelectTrigger size="sm" className="h-9 w-fit gap-2 px-3 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {DASHBOARD_RANGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isOverviewLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-border bg-card shadow-sm" />
          ))}
        </div>
      ) : overviewError || !overview ? (
        <ErrorBanner message={overviewError ?? "Failed to load dashboard"} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Revenue"
              value={formatPrice(kpis!.revenue.total)}
              icon={DollarSign}
              iconClassName="bg-success-100 text-success-600"
              delta={kpis!.revenue.monthDelta}
              footer={`Rs. ${kpis!.revenue.today.toLocaleString()} today · ${formatPrice(kpis!.revenue.thisMonth)} this month`}
            />
            <StatCard
              title="Orders"
              value={String(kpis!.orders.total)}
              icon={ShoppingCart}
              iconClassName="bg-primary-100 text-primary-600"
              footer={`${kpis!.orders.today} today · ${kpis!.orders.thisMonth} this month`}
            />
            <StatCard
              title="Customers"
              value={String(kpis!.customers.total)}
              icon={Users}
              iconClassName="bg-info-100 text-info-600"
              footer={`${kpis!.customers.newThisMonth} new this month`}
            />
            <StatCard
              title="Consultations"
              value={String(kpis!.consultations.total)}
              icon={Calendar}
              iconClassName="bg-secondary-100 text-secondary-600"
              footer={`${kpis!.consultations.today} today`}
            />
            <StatCard
              title="Products"
              value={String(kpis!.products.total)}
              icon={Package}
              iconClassName="bg-warning-100 text-warning-700"
              footer={`${kpis!.products.active} active · ${kpis!.products.outOfStock} out of stock`}
            />
            <StatCard
              title="Knowledge Articles"
              value={String(kpis!.knowledge.published)}
              icon={BookOpen}
              iconClassName="bg-success-100 text-success-700"
              footer={`${kpis!.knowledge.draft} drafts`}
            />
          </div>

          {isAnalyticsLoading ? (
            <LoadingPanel />
          ) : analyticsError || !analytics ? (
            <ErrorBanner message={analyticsError ?? "Failed to load analytics"} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
                <RevenueChart data={analytics.revenueOverTime} range={range} />

                <Card className="flex flex-col md:col-span-1 xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Orders by Status</CardTitle>
                    <CardDescription>Distribution across all orders</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 items-center justify-center">
                    <DonutChart
                      data={toDonutData(analytics.ordersByStatus, ORDER_STATUS_CHART_COLORS, (key) =>
                        getOrderStatusLabel(key as OrderStatus),
                      )}
                    />
                  </CardContent>
                </Card>

                <CustomersChart data={analytics.customersOverTime} range={range} />
                <ConsultationChart
                  overTime={analytics.consultationsOverTime}
                  byType={analytics.consultationsByType}
                  range={range}
                />
                <TopProductsChart data={analytics.topProducts} />

                <Card className="flex flex-col md:col-span-1 xl:col-span-2">
                  <CardHeader>
                    <CardTitle>Orders by Payment</CardTitle>
                    <CardDescription>Distribution across payment statuses</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 items-center justify-center">
                    <DonutChart
                      data={toDonutData(analytics.ordersByPaymentStatus, PAYMENT_STATUS_CHART_COLORS, (key) =>
                        getPaymentStatusLabel(key as PaymentStatus),
                      )}
                    />
                  </CardContent>
                </Card>

                <LowStockList products={overview.lowStockProducts} />
              </div>

              <RecentActivity data={overview.recentActivity} />
            </>
          )}
        </>
      )}
    </div>
  )
}
