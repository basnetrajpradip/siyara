import type { ConsultationStatus, ConsultationType } from "./consultation"
import type { KnowledgeStatus } from "./knowledge"
import type { OrderStatus } from "./order"

export type DashboardRange = "7d" | "30d" | "90d" | "12m"

export interface RevenueKpis {
  total: number
  today: number
  thisMonth: number
  previousMonth: number
  monthDelta: number
}

export interface OrdersKpis {
  total: number
  today: number
  thisMonth: number
}

export interface CustomersKpis {
  total: number
  newThisMonth: number
}

export interface ProductsKpis {
  total: number
  active: number
  featured: number
  outOfStock: number
  lowStock: number
}

export interface ConsultationsKpis {
  total: number
  today: number
  byStatus: Array<{ status: ConsultationStatus; count: number }>
}

export interface KnowledgeKpis {
  published: number
  draft: number
}

export interface Kpis {
  revenue: RevenueKpis
  orders: OrdersKpis
  customers: CustomersKpis
  products: ProductsKpis
  consultations: ConsultationsKpis
  knowledge: KnowledgeKpis
}

export interface LowStockProduct {
  id: string
  name: string
  slug: string
  price: number
  stock: number
}

export interface RecentOrder {
  id: string
  orderNumber: string
  total: number
  status: OrderStatus
  customerName: string
  createdAt: string
}

export interface RecentCustomer {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

export interface RecentConsultation {
  id: string
  patientName: string
  consultationType: ConsultationType
  status: ConsultationStatus
  startsAtUtc: string
  createdAt: string
}

export interface RecentKnowledge {
  id: string
  title: string
  status: KnowledgeStatus
  publishedAt: string | null
  createdAt: string
}

export interface RecentActivity {
  orders: RecentOrder[]
  customers: RecentCustomer[]
  consultations: RecentConsultation[]
  knowledge: RecentKnowledge[]
}

export interface DashboardOverview {
  kpis: Kpis
  lowStockProducts: LowStockProduct[]
  recentActivity: RecentActivity
}

export interface DateValuePoint {
  date: string
  count: number
}

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

export interface StatusCount {
  status: string
  count: number
}

export interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
}

export interface DashboardAnalytics {
  range: DashboardRange
  revenueOverTime: RevenuePoint[]
  customersOverTime: DateValuePoint[]
  consultationsOverTime: DateValuePoint[]
  ordersByStatus: StatusCount[]
  ordersByPaymentStatus: StatusCount[]
  consultationsByType: StatusCount[]
  topProducts: TopProduct[]
}

export const DASHBOARD_RANGES: Array<{ value: DashboardRange; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
]
