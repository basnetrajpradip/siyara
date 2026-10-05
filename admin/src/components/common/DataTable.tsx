"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { generatePageSizeOptions } from "@/lib/table-utils"

// Types

export interface Column<T> {
  /** Unique key for the column */
  key: string
  /** Header label displayed in the thead */
  label: string
  /** Render function that receives the row item */
  render: (item: T) => React.ReactNode
  /** Class applied to every <td> in this column */
  className?: string
  /** Class applied to the <th> for this column */
  headerClassName?: string
}

export interface DataTablePagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Props

export interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[]
  /** Row data */
  data: T[]
  /** Unique key per row (string or number) */
  keyExtractor: (item: T) => string | number

  /** Show loading spinner instead of rows */
  isLoading?: boolean
  /** Message shown when data is empty and not loading */
  emptyMessage?: string

  /** Render prop for action buttons (receives the row item) */
  actions?: (item: T) => React.ReactNode
  /** Header label for the actions column (default "Actions") */
  actionsHeader?: string

  // Pagination (omit to hide footer)
  pagination?: DataTablePagination
  /** Callback when a page is selected */
  onPageChange?: (page: number) => void
  /** Callback when the page size is changed (the parent should reset to page 1) */
  onPageSizeChange?: (pageSize: number) => void
  /** Label used in the pagination info text (e.g. "products") */
  itemLabel?: string

  /** Table-level class */
  className?: string
}

// Component

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No data found.",
  actions,
  actionsHeader = "Actions",
  pagination,
  onPageSizeChange,
  itemLabel = "items",
  className,
}: DataTableProps<T>) {
  const colCount = columns.length + (actions ? 1 : 0)

  // Derived pagination display
  const pageSize = pagination?.pageSize ?? 50
  const from = pagination ? (pagination.page - 1) * pageSize + 1 : 0
  const to = pagination ? Math.min(pagination.page * pageSize, pagination.total) : 0

  // Generate page-size options (multiples of 50 based on total)
  const pageSizeOptions = pagination ? generatePageSizeOptions(pagination.total) : []

  return (
    <div className={cn("flex flex-col w-full rounded-2xl bg-white shadow-sm", className)}>
      {/* Scrollable table body */}
      <div className="overflow-auto flex-1 min-h-0">
        <Table>
          {/* Header */}
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "sticky top-0 z-10 bg-primary-100 h-[52.5px] px-4 text-xs font-bold uppercase tracking-[0.025em] text-foreground",
                    col.headerClassName,
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="sticky top-0 z-10 bg-primary-100 h-[52.5px] px-4 text-right text-xs font-bold uppercase tracking-[0.025em] text-foreground">
                  {actionsHeader}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colCount} className="py-20 text-center">
                  <Spinner className="mx-auto size-6" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading&hellip;</p>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="py-20 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={keyExtractor(item)} className="border-b border-[#F3F4F6] last:border-0">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("px-4 py-[18px] align-middle", col.className)}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="px-4 py-[18px] align-middle">
                      <div className="flex items-center justify-end gap-2">{actions(item)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      {pagination && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <p className="whitespace-nowrap text-sm text-muted-foreground">
            {from} to {to} of {pagination.total} {itemLabel}
          </p>

          <div className="flex items-center gap-3">
            {/* Page-size dropdown */}
            {onPageSizeChange && pageSizeOptions.length > 0 && (
              <Select value={`${pageSize} / page`} onValueChange={(value) => onPageSizeChange(Number(value))}>
                <SelectTrigger className="h-9 w-[120px] rounded-xl border-border px-3 py-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
