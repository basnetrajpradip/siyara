import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getOrderStatusLabel, getPaymentStatusLabel, type OrderStatus, type PaymentStatus } from "@/types/order"

const ORDER_STATUS_OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]

interface OrderFilterProps {
  selectedStatuses: string[]
  onStatusesChange: (statuses: string[]) => void
  selectedPaymentStatuses: string[]
  onPaymentStatusesChange: (statuses: string[]) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

export default function OrderFilter({
  selectedStatuses,
  onStatusesChange,
  selectedPaymentStatuses,
  onPaymentStatusesChange,
  onClearAll,
  hasActiveFilters,
}: OrderFilterProps) {
  const toggleStatus = (value: OrderStatus) => {
    if (selectedStatuses.includes(value)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== value))
    } else {
      onStatusesChange([...selectedStatuses, value])
    }
  }

  const togglePaymentStatus = (value: PaymentStatus) => {
    if (selectedPaymentStatuses.includes(value)) {
      onPaymentStatusesChange(selectedPaymentStatuses.filter((s) => s !== value))
    } else {
      onPaymentStatusesChange([...selectedPaymentStatuses, value])
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-syne text-base font-semibold text-[#033333]">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-auto px-2 text-xs text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-2">
        <Accordion className="w-full">
          {/* Order Status */}
          <AccordionItem value="orderStatus">
            <AccordionTrigger>Order Status</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-1.5 py-1">
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <Label
                    key={status}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-normal text-[#4A5565] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                    {getOrderStatusLabel(status)}
                  </Label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Payment Status */}
          <AccordionItem value="paymentStatus">
            <AccordionTrigger>Payment Status</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-1.5 py-1">
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <Label
                    key={status}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-normal text-[#4A5565] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Checkbox
                      checked={selectedPaymentStatuses.includes(status)}
                      onCheckedChange={() => togglePaymentStatus(status)}
                    />
                    {getPaymentStatusLabel(status)}
                  </Label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
