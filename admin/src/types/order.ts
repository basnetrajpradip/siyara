export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED"

export type PaymentMethod = "COD" | "ONLINE" | "BANK_TRANSFER"

export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  productName: string
  productSku: string | null
  productImageUrl: string | null
  unitPrice: number
  totalPrice: number
  quantity: number
  createdAt: string
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: OrderStatus
  changedBy: string | null
  note: string | null
  createdAt: string
}

export interface OrderPayment {
  id: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  user: OrderUser
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  subtotal: number
  discount: number
  shippingCost: number
  tax: number
  total: number
  deliveryAddress: string
  deliveryNotes: string | null
  contactName: string
  contactEmail: string
  contactPhone: string
  trackingNumber: string | null
  carrier: string | null
  estimatedDelivery: string | null
  deliveredAt: string | null
  notes: string | null
  cancelledAt: string | null
  cancelReason: string | null
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
  payments: OrderPayment[]
  createdAt: string
  updatedAt: string
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  }
  return labels[status]
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, {
  badge: "success" | "warning" | "error" | "info" | "inactive"
  bg: string
  text: string
  border: string
  dot: string
}> = {
  PENDING:    { badge: "warning",  bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" },
  CONFIRMED:  { badge: "info",     bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500" },
  PROCESSING: { badge: "info",     bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500" },
  SHIPPED:    { badge: "info",     bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-500" },
  DELIVERED:  { badge: "success",  bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   dot: "bg-green-500" },
  CANCELLED:  { badge: "error",    bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" },
  REFUNDED:   { badge: "inactive", bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400" },
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, {
  badge: "success" | "warning" | "error" | "info" | "inactive"
  bg: string
  text: string
  border: string
  dot: string
}> = {
  PENDING:             { badge: "warning", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500" },
  PAID:                { badge: "success", bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   dot: "bg-green-500" },
  FAILED:              { badge: "error",   bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500" },
  REFUNDED:            { badge: "info",    bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500" },
  PARTIALLY_REFUNDED:  { badge: "info",    bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-500" },
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    PARTIALLY_REFUNDED: "Partially Refunded",
  }
  return labels[status]
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    COD: "Cash on Delivery",
    ONLINE: "Online Payment",
    BANK_TRANSFER: "Bank Transfer",
  }
  return labels[method]
}

export interface OrderFilters {
  search?: string
  status?: string[]
  paymentStatus?: string[]
  userId?: string
  startDate?: string
  endDate?: string
  sort?: "newest" | "oldest"
  page?: number
  limit?: number
}
