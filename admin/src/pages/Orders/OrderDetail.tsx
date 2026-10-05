import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft, Package, Truck, CreditCard, Clock, AlertCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { getOrder, updateOrderStatus, updatePaymentStatus, updateDeliveryInfo } from "@/services/orderService"
import {
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getPaymentMethodLabel,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/types/order"
import { formatPrice } from "@/lib/utils"
import { handleError } from "@/lib/error-utils"
import { toast } from "sonner"
import env from "@/config/env-config"

function StatusBadge({ status }: { status: OrderStatus }) {
  const c = ORDER_STATUS_COLORS[status]
  return <Badge className={`${c.bg} ${c.text} ${c.border}`}>{getOrderStatusLabel(status)}</Badge>
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const c = PAYMENT_STATUS_COLORS[status]
  return <Badge className={`${c.bg} ${c.text} ${c.border}`}>{getPaymentStatusLabel(status)}</Badge>
}

function StatusDot({ status }: { status: OrderStatus }) {
  return <div className={`mt-1.5 size-2.5 rounded-full shrink-0 ${ORDER_STATUS_COLORS[status].dot}`} />
}

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"]

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  // Action states
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{ type: "status" | "payment"; value: string } | null>(null)
  const [confirmInput, setConfirmInput] = useState("")
  const [confirmBusy, setConfirmBusy] = useState(false)

  // Fetch order data — start with loading=true as default state
  useEffect(() => {
    if (!id) return
    let cancelled = false

    getOrder(id)
      .then((res) => {
        if (cancelled) return
        setOrder(res.data)
        if (res.data.trackingNumber) setTrackingNumber(res.data.trackingNumber)
        if (res.data.carrier) setCarrier(res.data.carrier)
        if (res.data.estimatedDelivery) setEstimatedDelivery(res.data.estimatedDelivery.split("T")[0])
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load order")
        handleError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  const confirmStatusUpdate = useCallback(async () => {
    if (!id || !confirmModal || confirmModal.type !== "status") return
    setConfirmBusy(true)
    try {
      await updateOrderStatus(id, { status: confirmModal.value as OrderStatus, note: confirmInput || undefined })
      toast.success(`Order status updated to ${getOrderStatusLabel(confirmModal.value as OrderStatus)}`)
      setConfirmModal(null)
      setConfirmInput("")
      refresh()
    } catch (err) {
      handleError(err)
    } finally {
      setConfirmBusy(false)
    }
  }, [id, confirmModal, confirmInput, refresh])

  const confirmPaymentUpdate = useCallback(async () => {
    if (!id || !confirmModal || confirmModal.type !== "payment") return
    setConfirmBusy(true)
    try {
      await updatePaymentStatus(id, {
        paymentStatus: confirmModal.value as PaymentStatus,
        transactionId: confirmInput || undefined,
      })
      toast.success(`Payment status updated to ${getPaymentStatusLabel(confirmModal.value as PaymentStatus)}`)
      setConfirmModal(null)
      setConfirmInput("")
      refresh()
    } catch (err) {
      handleError(err)
    } finally {
      setConfirmBusy(false)
    }
  }, [id, confirmModal, confirmInput, refresh])

  const openStatusModal = useCallback((value: string | null) => {
    if (!value) return
    setConfirmInput("")
    setConfirmModal({ type: "status", value })
  }, [])

  const openPaymentModal = useCallback((value: string | null) => {
    if (!value) return
    setConfirmInput("")
    setConfirmModal({ type: "payment", value })
  }, [])

  const closeModal = useCallback(() => {
    if (confirmBusy) return
    setConfirmModal(null)
    setConfirmInput("")
  }, [confirmBusy])

  const handleDeliveryUpdate = useCallback(async () => {
    if (!id) return
    try {
      await updateDeliveryInfo(id, {
        trackingNumber: trackingNumber || undefined,
        carrier: carrier || undefined,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined,
      })
      toast.success("Delivery info updated")
      refresh()
    } catch (err) {
      handleError(err)
    }
  }, [id, trackingNumber, carrier, estimatedDelivery, refresh])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-4">
          <ArrowLeft className="mr-2 size-4" /> Back to Orders
        </Button>
        <div className="rounded-lg border border-error-200 bg-error-100 px-4 py-6 text-center text-sm text-error-700">
          {error || "Order not found"}
        </div>
      </div>
    )
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status)

  const allOrderStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]
  const isTerminal = ["REFUNDED"].includes(order.status)

  return (
    <div className="flex flex-col gap-6 sm:p-8 p-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="size-9 rounded-lg">
          <ArrowLeft className="size-5 text-[#4A5565]" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#033333] font-libre">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground font-syne">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progress */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565] mb-4 flex items-center gap-2">
              <Clock className="size-4" /> Order Progress
            </h2>
            <div className="flex items-center gap-1">
              {STATUS_FLOW.map((s, i) => {
                const isCompleted = i <= currentStatusIndex
                const c = ORDER_STATUS_COLORS[s]
                return (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`h-2.5 w-full rounded-full transition-colors ${
                        isCompleted ? c.dot : "bg-gray-200"
                      }`}
                    />
                    <span
                      className={`text-xs font-syne ${isCompleted ? `${c.text} font-semibold` : "text-gray-400"}`}
                    >
                      {getOrderStatusLabel(s)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565] mb-4 flex items-center gap-2">
              <Package className="size-4" /> Items ({order.items.length})
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-semibold text-[#4A5565]">Product</th>
                  <th className="text-center py-2 font-semibold text-[#4A5565]">Qty</th>
                  <th className="text-right py-2 font-semibold text-[#4A5565]">Price</th>
                  <th className="text-right py-2 font-semibold text-[#4A5565]">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {item.productImageUrl ? (
                          <img
                            src={`${env.BACKEND_BASE_URL}${item.productImageUrl}`}
                            alt={item.productName}
                            className="size-10 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="size-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#101828]">{item.productName}</p>
                          {item.productSku && <p className="text-xs text-muted-foreground">SKU: {item.productSku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 text-[#4A5565]">{item.quantity}</td>
                    <td className="text-right py-3 text-[#4A5565]">{formatPrice(item.unitPrice)}</td>
                    <td className="text-right py-3 font-semibold text-[#101828]">{formatPrice(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Status History Timeline */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565] mb-4 flex items-center gap-2">
              <Clock className="size-4" /> Status History
            </h2>
            <div className="space-y-3">
              {order.statusHistory.length === 0 && (
                <p className="text-sm text-muted-foreground">No status updates yet.</p>
              )}
              {order.statusHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <StatusDot status={entry.status} />
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#101828]">{getOrderStatusLabel(entry.status)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {entry.note && <p className="text-xs text-[#4A5565] mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Actions sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565] mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4A5565]">Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-[#101828]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565] mb-4 flex items-center gap-2">
              <CreditCard className="size-4" /> Payment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4A5565]">Method</span>
                <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#4A5565]">Status</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>
              {order.payments.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-[#4A5565] mb-2">Transactions</p>
                  {order.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{p.transactionId || "N/A"}</span>
                      <span className="font-medium">{formatPrice(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565] mb-4 flex items-center gap-2">
              <Truck className="size-4" /> Contact & Delivery
            </h2>
            <div className="text-sm text-[#4A5565] space-y-2">
              <div>
                <span className="text-xs font-semibold text-[#4A5565] block">Contact</span>
                <p className="font-medium text-[#101828]">{order.contactName}</p>
                <p>{order.contactEmail}</p>
                <p>{order.contactPhone}</p>
              </div>
              <div className="pt-2 border-t">
                <span className="text-xs font-semibold text-[#4A5565] block">Delivery Address</span>
                <p className="text-[#101828]">{order.deliveryAddress}</p>
              </div>
              {order.deliveryNotes && (
                <div className="pt-2 border-t">
                  <span className="text-xs font-semibold text-[#4A5565] block">Delivery Notes</span>
                  <p className="text-[#101828]">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
            {order.trackingNumber && (
              <div className="text-sm space-y-1 mt-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-[#4A5565]">Tracking #</span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
                {order.carrier && (
                  <div className="flex justify-between">
                    <span className="text-[#4A5565]">Carrier</span>
                    <span className="font-medium">{order.carrier}</span>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-[#4A5565]">Est. Delivery</span>
                    <span className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString("en-IN")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565]">Actions</h2>

            {/* Status Update */}
            {!isTerminal && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#4A5565]">Update Status</label>
                <Select value={order.status} onValueChange={openStatusModal}>
                  <SelectTrigger className="w-full h-10 text-sm">
                    <span className={`inline-flex items-center gap-2 ${ORDER_STATUS_COLORS[order.status].text}`}>
                      <span className={`inline-block size-2 rounded-full ${ORDER_STATUS_COLORS[order.status].dot}`} />
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {allOrderStatuses
                      .filter((s) => s !== order.status)
                      .map((s) => {
                        const c = ORDER_STATUS_COLORS[s]
                        return (
                          <SelectItem key={s} value={s}>
                            <span className={`inline-flex items-center gap-2 ${c.text}`}>
                              <span className={`inline-block size-2 rounded-full ${c.dot}`} />
                              {getOrderStatusLabel(s)}
                            </span>
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment Update */}
            <div className="space-y-2 pt-3 border-t">
              <label className="text-xs font-semibold text-[#4A5565]">Update Payment</label>
              <Select value={order.paymentStatus} onValueChange={openPaymentModal}>
                <SelectTrigger className="w-full h-10 text-sm">
                  <span className={`inline-flex items-center gap-2 ${PAYMENT_STATUS_COLORS[order.paymentStatus].text}`}>
                    <span className={`inline-block size-2 rounded-full ${PAYMENT_STATUS_COLORS[order.paymentStatus].dot}`} />
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] as PaymentStatus[])
                    .filter((s) => s !== order.paymentStatus)
                    .map((s) => {
                      const c = PAYMENT_STATUS_COLORS[s]
                      return (
                        <SelectItem key={s} value={s}>
                          <span className={`inline-flex items-center gap-2 ${c.text}`}>
                            <span className={`inline-block size-2 rounded-full ${c.dot}`} />
                            {getPaymentStatusLabel(s)}
                          </span>
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Update */}
            <div className="space-y-2 pt-3 border-t">
              <label className="text-xs font-semibold text-[#4A5565]">Delivery Tracking</label>
              <input
                type="text"
                placeholder="Tracking number"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              <input
                type="text"
                placeholder="Carrier (e.g., Nepal Post, DHL)"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
              <input
                type="date"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
              <Button variant="secondary" size="sm" className="w-full" onClick={handleDeliveryUpdate}>
                Update Tracking
              </Button>
            </div>
          </div>

          {/* Confirmation Modal */}
          {confirmModal && (
              <AlertDialog open onOpenChange={(open) => { if (!open) closeModal() }}>
              <AlertDialogContent size="sm" className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {confirmModal.type === "status"
                      ? `Change to ${getOrderStatusLabel(confirmModal.value as OrderStatus)}?`
                      : `Change payment to ${getPaymentStatusLabel(confirmModal.value as PaymentStatus)}?`}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {confirmModal.type === "status"
                      ? "Add a note to record why this status changed (optional)."
                      : "Add a transaction ID if the payment was processed (optional)."}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="px-1">
                  <Input
                    autoFocus
                    placeholder={confirmModal.type === "status" ? "Status note..." : "Transaction ID"}
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !confirmBusy) {
                        if (confirmModal.type === "status") confirmStatusUpdate()
                        else confirmPaymentUpdate()
                      }
                    }}
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={confirmBusy}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={confirmBusy}
                    onClick={confirmModal.type === "status" ? confirmStatusUpdate : confirmPaymentUpdate}
                  >
                    {confirmBusy ? (
                      <span className="flex items-center gap-2">
                        <Loader className="size-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Confirm"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {order.notes && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#4A5565] mb-2">Notes</h2>
              <p className="text-sm text-[#4A5565]">{order.notes}</p>
            </div>
          )}

          {order.cancelReason && (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-error-200">
              <div className="flex items-center gap-2 text-error-600 mb-2">
                <AlertCircle className="size-4" />
                <h2 className="text-sm font-bold uppercase tracking-wide">Cancellation Reason</h2>
              </div>
              <p className="text-sm text-[#4A5565]">{order.cancelReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
