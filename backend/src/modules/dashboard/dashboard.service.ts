import { addDays, format, subDays, subMonths } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { prisma } from "../../db/prisma.js"
import { BUSINESS_TIME_ZONE, formatKathmanduDate, getBusinessDayUtcRange } from "../../utils/timezone.js"
import type {
  DashboardAnalytics,
  DashboardOverview,
  DateValuePoint,
  RangeKey,
  RevenuePoint,
  TopProduct,
} from "./dashboard.types.js"

const LOW_STOCK_THRESHOLD = 5

const rangeDays: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 0,
}

const monthStartInZone = (now: Date, monthsAgo: number): Date => {
  const zonedNow = toZonedTime(now, BUSINESS_TIME_ZONE)
  const monthDate = subMonths(zonedNow, monthsAgo)
  return fromZonedTime(`${format(monthDate, "yyyy-MM-01")}T00:00:00`, BUSINESS_TIME_ZONE)
}

const getRangeStart = (range: RangeKey, now: Date): Date => {
  if (range === "12m") return subMonths(now, 11)
  return subDays(now, rangeDays[range] - 1)
}

const buildDateKeys = (range: RangeKey, now: Date): string[] => {
  const keys: string[] = []
  if (range === "12m") {
    for (let i = 11; i >= 0; i -= 1) {
      keys.push(formatKathmanduDate(subMonths(now, i)).slice(0, 7))
    }
    return keys
  }
  const start = getRangeStart(range, now)
  for (let i = 0; i < rangeDays[range]; i += 1) {
    keys.push(formatKathmanduDate(addDays(start, i)))
  }
  return keys
}

const bucketKey = (date: Date, range: RangeKey): string => {
  const key = formatKathmanduDate(date)
  return range === "12m" ? key.slice(0, 7) : key
}

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const now = new Date()
  const todayRange = getBusinessDayUtcRange(formatKathmanduDate(now))
  const monthStart = monthStartInZone(now, 0)
  const prevMonthStart = monthStartInZone(now, 1)

  const [
    revenueTotal,
    revenueToday,
    revenueThisMonth,
    revenuePreviousMonth,
    ordersTotal,
    ordersToday,
    ordersThisMonth,
    customersTotal,
    customersNewThisMonth,
    productsTotal,
    productsActive,
    productsFeatured,
    productsOutOfStock,
    productsLowStock,
    consultationsTotal,
    consultationsToday,
    consultationsByStatus,
    knowledgePublished,
    knowledgeDraft,
    lowStockProducts,
    recentOrders,
    recentCustomers,
    recentConsultations,
    recentKnowledge,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: todayRange.startsAtUtc, lte: todayRange.endsAtUtc } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: monthStart } }, _sum: { total: true } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: prevMonthStart, lt: monthStart } },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: todayRange.startsAtUtc, lte: todayRange.endsAtUtc } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: monthStart } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { featured: true } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.product.count({ where: { stock: { gte: 1, lte: LOW_STOCK_THRESHOLD } } }),
    prisma.consultationAppointment.count(),
    prisma.consultationAppointment.count({
      where: { createdAt: { gte: todayRange.startsAtUtc, lte: todayRange.endsAtUtc } },
    }),
    prisma.consultationAppointment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.knowledgeArticle.count({ where: { status: "PUBLISHED" } }),
    prisma.knowledgeArticle.count({ where: { status: "DRAFT" } }),
    prisma.product.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 8,
      select: { id: true, name: true, slug: true, price: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
    }),
    prisma.consultationAppointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, patientName: true, consultationType: true, status: true, startsAtUtc: true, createdAt: true },
    }),
    prisma.knowledgeArticle.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, status: true, publishedAt: true, createdAt: true },
    }),
  ])

  const previousMonth = revenuePreviousMonth._sum.total?.toNumber() ?? 0
  const thisMonth = revenueThisMonth._sum.total?.toNumber() ?? 0
  const monthDelta =
    previousMonth > 0 ? Number((((thisMonth - previousMonth) / previousMonth) * 100).toFixed(1)) : thisMonth > 0 ? 100 : 0

  return {
    kpis: {
      revenue: {
        total: revenueTotal._sum.total?.toNumber() ?? 0,
        today: revenueToday._sum.total?.toNumber() ?? 0,
        thisMonth,
        previousMonth,
        monthDelta,
      },
      orders: {
        total: ordersTotal,
        today: ordersToday,
        thisMonth: ordersThisMonth,
      },
      customers: {
        total: customersTotal,
        newThisMonth: customersNewThisMonth,
      },
      products: {
        total: productsTotal,
        active: productsActive,
        featured: productsFeatured,
        outOfStock: productsOutOfStock,
        lowStock: productsLowStock,
      },
      consultations: {
        total: consultationsTotal,
        today: consultationsToday,
        byStatus: consultationsByStatus.map((group) => ({ status: group.status, count: group._count._all })),
      },
      knowledge: {
        published: knowledgePublished,
        draft: knowledgeDraft,
      },
    },
    lowStockProducts: lowStockProducts.map((product) => ({
      ...product,
      price: product.price.toNumber(),
    })),
    recentActivity: {
      orders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total.toNumber(),
        status: order.status,
        customerName: `${order.user.firstName} ${order.user.lastName}`.trim(),
        createdAt: order.createdAt,
      })),
      customers: recentCustomers,
      consultations: recentConsultations,
      knowledge: recentKnowledge,
    },
  }
}

export const getDashboardAnalytics = async (range: RangeKey): Promise<DashboardAnalytics> => {
  const now = new Date()
  const rangeStart = getRangeStart(range, now)
  const dateKeys = buildDateKeys(range, now)

  const [orders, customers, consultations, ordersByStatus, ordersByPaymentStatus, consultationsByType, topRows] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true, total: true, status: true, paymentStatus: true },
      }),
      prisma.user.findMany({
        where: { role: "USER", createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
      prisma.consultationAppointment.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.groupBy({ by: ["paymentStatus"], _count: { _all: true } }),
      prisma.consultationAppointment.groupBy({ by: ["consultationType"], _count: { _all: true } }),
      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        where: { productId: { not: null }, createdAt: { gte: rangeStart } },
        _count: { _all: true },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
      }),
    ])

  const revenueByDate = new Map<string, { revenue: number; orders: number }>()
  for (const order of orders) {
    const key = bucketKey(order.createdAt, range)
    const entry = revenueByDate.get(key) ?? { revenue: 0, orders: 0 }
    entry.orders += 1
    if (order.paymentStatus === "PAID") entry.revenue += order.total.toNumber()
    revenueByDate.set(key, entry)
  }

  const countByDate = (rows: Array<{ createdAt: Date }>): Map<string, number> => {
    const map = new Map<string, number>()
    for (const row of rows) {
      const key = bucketKey(row.createdAt, range)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }

  const customersByDate = countByDate(customers)
  const consultationsByDate = countByDate(consultations)

  const revenueOverTime: RevenuePoint[] = dateKeys.map((date) => ({
    date,
    revenue: revenueByDate.get(date)?.revenue ?? 0,
    orders: revenueByDate.get(date)?.orders ?? 0,
  }))

  const customersOverTime: DateValuePoint[] = dateKeys.map((date) => ({
    date,
    count: customersByDate.get(date) ?? 0,
  }))

  const consultationsOverTime: DateValuePoint[] = dateKeys.map((date) => ({
    date,
    count: consultationsByDate.get(date) ?? 0,
  }))

  const topProducts: TopProduct[] = topRows.map((row) => ({
    id: row.productId ?? "",
    name: row.productName,
    quantity: row._count._all,
    revenue: row._sum.totalPrice?.toNumber() ?? 0,
  }))

  return {
    range,
    revenueOverTime,
    customersOverTime,
    consultationsOverTime,
    ordersByStatus: ordersByStatus.map((group) => ({ status: group.status, count: group._count._all })),
    ordersByPaymentStatus: ordersByPaymentStatus.map((group) => ({
      status: group.paymentStatus,
      count: group._count._all,
    })),
    consultationsByType: consultationsByType.map((group) => ({
      status: group.consultationType,
      count: group._count._all,
    })),
    topProducts,
  }
}
