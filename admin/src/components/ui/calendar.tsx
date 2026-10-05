import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addMonths, format, subMonths } from "date-fns"
import { DayPicker } from "react-day-picker"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month,
  defaultMonth,
  onMonthChange,
  numberOfMonths = 1,
  ...props
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(defaultMonth ?? month ?? new Date())
  const currentMonth = month ?? internalMonth
  const lastVisibleMonth = addMonths(currentMonth, Math.max(numberOfMonths - 1, 0))
  const caption =
    numberOfMonths > 1
      ? `${format(currentMonth, "MMM yyyy")} - ${format(lastVisibleMonth, "MMM yyyy")}`
      : format(currentMonth, "MMMM yyyy")

  const setMonth = React.useCallback(
    (nextMonth: Date) => {
      if (!month) {
        setInternalMonth(nextMonth)
      }
      onMonthChange?.(nextMonth)
    },
    [month, onMonthChange],
  )

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="mb-3 flex h-9 items-center justify-between gap-3">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          onClick={() => setMonth(subMonths(currentMonth, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1 text-center font-libre text-base font-bold text-[#033333]">
          {caption}
        </div>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          onClick={() => setMonth(addMonths(currentMonth, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <DayPicker
        showOutsideDays={showOutsideDays}
        month={currentMonth}
        onMonthChange={setMonth}
        numberOfMonths={numberOfMonths}
        hideNavigation
        className="p-0"
        classNames={{
          months: "grid w-full gap-4 md:grid-cols-[repeat(var(--calendar-months),minmax(0,1fr))]",
          month: "w-full space-y-4",
          month_caption: "hidden",
          caption_label: "hidden",
          nav: "hidden",
          month_grid: "w-full border-collapse",
          weekdays: "grid grid-cols-7",
          weekday: "w-full rounded-md text-center font-syne text-[0.75rem] font-semibold text-muted-foreground",
          week: "mt-2 grid w-full grid-cols-7 gap-1",
          day: "relative min-w-0 p-0 text-center text-sm",
          day_button: cn(
            buttonVariants({ variant: "ghost" }),
            "h-10 w-full rounded-xl p-0 font-syne text-sm font-medium aria-selected:opacity-100",
          ),
          selected: "rounded-xl !bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground",
          today: "rounded-xl bg-secondary text-secondary-foreground",
          outside: "text-muted-foreground opacity-40",
          disabled: "text-muted-foreground opacity-40",
          range_middle: "rounded-none !bg-primary-100 !text-primary-900",
          range_start: "rounded-l-xl !bg-primary !text-primary-foreground",
          range_end: "rounded-r-xl !bg-primary !text-primary-foreground",
          hidden: "invisible",
          ...classNames,
        }}
        style={
          {
            "--calendar-months": numberOfMonths,
          } as React.CSSProperties
        }
        {...props}
      />
    </div>
  )
}

export { Calendar }
