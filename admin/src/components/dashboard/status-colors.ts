import type { ConsultationStatus, ConsultationType } from "@/types/consultation"
import type { KnowledgeStatus } from "@/types/knowledge"
import type { OrderStatus, PaymentStatus } from "@/types/order"

export const ORDER_STATUS_CHART_COLORS: Record<OrderStatus, string> = {
  PENDING: "#ffb91a",
  CONFIRMED: "#6c9ee6",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#1a8d8d",
  DELIVERED: "#3fc97c",
  CANCELLED: "#ff4423",
  REFUNDED: "#94a3b8",
}

export const PAYMENT_STATUS_CHART_COLORS: Record<PaymentStatus, string> = {
  PENDING: "#ffb91a",
  PAID: "#3fc97c",
  FAILED: "#ff4423",
  REFUNDED: "#6c9ee6",
  PARTIALLY_REFUNDED: "#8b5cf6",
}

export const CONSULTATION_TYPE_CHART_COLORS: Record<ConsultationType, string> = {
  IN_CLINIC: "#1a8d8d",
  ONLINE: "#ff851f",
}

export const CONSULTATION_STATUS_CHART_COLORS: Record<ConsultationStatus, string> = {
  PENDING: "#ffb91a",
  CONFIRMED: "#6c9ee6",
  COMPLETED: "#3fc97c",
  CANCELLED: "#ff4423",
}

export const KNOWLEDGE_STATUS_CHART_COLORS: Record<KnowledgeStatus, string> = {
  DRAFT: "#94a3b8",
  PUBLISHED: "#3fc97c",
  ARCHIVED: "#ffb91a",
}
