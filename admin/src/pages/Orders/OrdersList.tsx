import { useState, useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ListHeader } from "@/components/ui/list-header"
import { DataTable, type Column } from "@/components/common/DataTable"
import { getAdminOrders } from "@/services/orderService"
import { useDebounce } from "@/hooks/useDebounce"
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
import { cn, formatPrice } from "@/lib/utils"
import { handleError } from "@/lib/error-utils"
import SearchFilter from "@/components/common/SearchFilter"
import OrderFilter from "@/components/Orders/OrderFilter"

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = ORDER_STATUS_COLORS[status]
  return <Badge className={`${c.bg} ${c.text} rounded-md`}>{getOrderStatusLabel(status)}</Badge>
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const c = PAYMENT_STATUS_COLORS[status]
  return <Badge className={`${c.bg} ${c.text} rounded-md`}>{getPaymentStatusLabel(status)}</Badge>
}

export default function OrdersList() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Filter state
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounce(searchInput, 400)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPaymentStatuses, setSelectedPaymentStatuses] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchInput("")
  }, [])

  const handleStatusesChange = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses)
  }, [])

  const handlePaymentStatusesChange = useCallback((statuses: string[]) => {
    setSelectedPaymentStatuses(statuses)
  }, [])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getAdminOrders({
          limit: pageSize,
          search: search || undefined,
          status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          paymentStatus: selectedPaymentStatuses.length > 0 ? selectedPaymentStatuses : undefined,
        })
        if (!cancelled) {
          setOrders(res.data.items)
          setTotal(res.data.pagination.total)
          setTotalPages(res.data.pagination.totalPages)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders")
          handleError(err)
          setOrders([])
          setTotal(0)
          setTotalPages(1)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [pageSize, refreshKey, search, selectedStatuses, selectedPaymentStatuses])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
  }, [])

  const hasActiveFilters = selectedStatuses.length > 0 || selectedPaymentStatuses.length > 0

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    setSelectedStatuses([])
    setSelectedPaymentStatuses([])
  }, [])

  const clearAllFiltersAndClose = useCallback(() => {
    clearAllFilters()
    setFilterOpen(false)
  }, [clearAllFilters])

  const pagination = useMemo(() => ({ page: 1, pageSize, total, totalPages }), [pageSize, total, totalPages])

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        key: "orderNumber",
        label: "Order #",
        render: (order) => <span className="text-sm font-semibold text-[#101828] font-syne">{order.orderNumber}</span>,
      },
      {
        key: "customer",
        label: "Customer",
        render: (order) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#101828] font-syne">{order.user.firstName} {order.user.lastName}</p>
            <p className="text-xs text-muted-foreground font-syne">{order.user.email}</p>
          </div>
        ),
      },
      {
        key: "items",
        label: "Items",
        render: (order) => <span className="text-sm text-[#4A5565] font-syne">{order.items.length} item(s)</span>,
      },
      {
        key: "total",
        label: "Total",
        render: (order) => (
          <span className="text-sm font-semibold text-[#101828] font-syne">{formatPrice(order.total)}</span>
        ),
      },
      {
        key: "payment",
        label: "Payment",
        render: (order) => (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground font-syne">
              {getPaymentMethodLabel(order.paymentMethod)}
            </span>
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        ),
      },
      {
        key: "status",
        label: "Order Status",
        render: (order) => <OrderStatusBadge status={order.status} />,
      },
      {
        key: "date",
        label: "Date",
        render: (order) => (
          <span className="text-sm text-[#4A5565] font-syne">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6 sm:p-8 p-4 h-full overflow-hidden">
      <ListHeader title="Orders" subtitle="Manage customer orders and track fulfillment" showButton={false} />

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-100 px-4 py-3 text-sm text-error-700">
          {error}
          <button onClick={refresh} className="ml-2 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      <SearchFilter
        searchInput={searchInput}
        handleSearchChange={handleSearchChange}
        handleSearchClear={handleSearchClear}
        placeholder="Search by order#, name or email.."
        hasFilters
        hasActiveFilters={hasActiveFilters}
        setFilterOpen={setFilterOpen}
      />

      <DataTable<Order>
        className="flex-1 min-h-0"
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.id}
        isLoading={isLoading}
        emptyMessage={error ? undefined : "No orders found."}
        actionsHeader="View"
        actions={(order) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            onClick={() => navigate(`/orders/${order.id}`)}
            title="View order details"
          >
            <Eye className="size-4 text-[#4A5565]" />
          </Button>
        )}
        pagination={pagination}
        onPageSizeChange={handlePageSizeChange}
        itemLabel="orders"
      />

      {/* Filter drawer overlay */}
      {filterOpen && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setFilterOpen(false)} />}

      {/* Filter drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out",
          filterOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <OrderFilter
          selectedStatuses={selectedStatuses}
          onStatusesChange={handleStatusesChange}
          selectedPaymentStatuses={selectedPaymentStatuses}
          onPaymentStatusesChange={handlePaymentStatusesChange}
          onClearAll={clearAllFiltersAndClose}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  )
}
