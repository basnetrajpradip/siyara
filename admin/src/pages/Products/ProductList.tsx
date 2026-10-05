import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ListHeader } from "@/components/ui/list-header"
import { DataTable, type Column } from "@/components/common/DataTable"
import { getAdminProducts, updateProduct, deleteProduct } from "@/services/productService"
import { deriveProductStatus, type Product, type ProductStatus } from "@/types/product"
import ProductFilter from "@/components/Products/ProductFilter"
import { useDebounce } from "@/hooks/useDebounce"
import env from "@/config/env-config"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatPrice } from "@/lib/utils"
import { handleError } from "@/lib/error-utils"
import { toast } from "sonner"
import Toggle from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import SearchFilter from "@/components/common/SearchFilter"

// Status Badge

function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, { label: string; variant: "success" | "error" | "inactive" }> = {
    active: { label: "Active", variant: "success" },
    out_of_stock: { label: "Out of Stock", variant: "error" },
    inactive: { label: "Inactive", variant: "inactive" },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// Price Helpers

function PriceDisplay({ price, discountedPrice }: { price: number; discountedPrice: number | null }) {
  if (discountedPrice && discountedPrice < price) {
    return (
      <div className="text-base font-semibold text-[#101828] font-syne flex flex-col">
        <span>{formatPrice(discountedPrice)}</span>
        <span className="ml-1 font-normal text-muted-foreground line-through">{formatPrice(price)}</span>
      </div>
    )
  }
  return <span className="text-base font-semibold text-[#101828] font-syne">{formatPrice(price)}</span>
}

// Product Thumbnail

function ProductThumb({ product }: { product: Product }) {
  const primaryMedia = product.media.find((m) => m.isPrimary) ?? product.media[0]

  return (
    <Avatar className="size-[50px] border-none">
      {primaryMedia && (
        <AvatarImage className="rounded-[4px]" src={`${env.BACKEND_BASE_URL}${primaryMedia.media.url}`} />
      )}
      <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

// Product List Page

export default function ProductList() {
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Filter state
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounce(searchInput, 400)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedHealthConcernIds, setSelectedHealthConcernIds] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const isFirstSearch = useRef(true)

  // Reset page when debounced search settles (skip initial mount)
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false
      return
    }
  }, [search])

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchInput("")
  }, [])

  const handleCategoryIdsChange = useCallback((ids: string[]) => {
    setSelectedCategoryIds(ids)
  }, [])

  const handleHealthConcernIdsChange = useCallback((ids: string[]) => {
    setSelectedHealthConcernIds(ids)
  }, [])

  const handlePricesChange = useCallback((prices: string[]) => {
    setSelectedPrices(prices)
  }, [])

  const handleStatusesChange = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses)
  }, [])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getAdminProducts({
          limit: pageSize,
          search: search || undefined,
          categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
          healthConcernIds: selectedHealthConcernIds.length > 0 ? selectedHealthConcernIds : undefined,
          price: selectedPrices.length === 1 ? (selectedPrices[0] as "lowToHigh" | "highToLow") : undefined,
          statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        })
        if (!cancelled) {
          setProducts(res.data.items)
          setTotal(res.data.pagination.total)
          setTotalPages(res.data.pagination.totalPages)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products")
          handleError(err)
          setProducts([])
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
  }, [pageSize, refreshKey, search, selectedCategoryIds, selectedHealthConcernIds, selectedPrices, selectedStatuses])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
  }, [])

  const handleAddProduct = useCallback(() => {
    navigate("/products/new")
  }, [navigate])

  const handleDelete = useCallback((product: Product) => {
    setProductToDelete(product)
  }, [])

  const handleToggleStatus = useCallback(
    async (product: Product) => {
      try {
        const newStatus = !product.isActive
        await updateProduct(product.id, { isActive: newStatus })
        toast.success(`${product.name} is now ${newStatus ? "active" : "inactive"}`)
        refresh()
      } catch (error) {
        handleError(error)
      }
    },
    [refresh],
  )

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return
    try {
      const res = await deleteProduct(productToDelete.id)
      toast.success(res.message)
      refresh()
    } catch (error) {
      handleError(error)
    } finally {
      setProductToDelete(null)
    }
  }, [productToDelete, refresh])

  const hasActiveFilters =
    selectedCategoryIds.length > 0 ||
    selectedHealthConcernIds.length > 0 ||
    selectedPrices.length > 0 ||
    selectedStatuses.length > 0

  const clearAllFilters = useCallback(() => {
    setSearchInput("")
    setSelectedCategoryIds([])
    setSelectedHealthConcernIds([])
    setSelectedPrices([])
    setSelectedStatuses([])
  }, [])

  const pagination = useMemo(() => ({ page: 1, pageSize, total, totalPages }), [pageSize, total, totalPages])

  const columns: Column<Product>[] = useMemo(
    () => [
      {
        key: "image",
        label: "Image",
        render: (product) => <ProductThumb product={product} />,
      },
      {
        key: "name",
        label: "Product Name",
        render: (product) => (
          <div>
            <p className="text-base font-semibold text-[#101828] font-syne">{product.name}</p>
            {product.sku && <p className="text-xs text-muted-foreground font-syne">SKU: {product.sku}</p>}
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        render: (product) => <span className="text-base text-[#4A5565] font-syne">{product.category.name}</span>,
      },
      {
        key: "dosha",
        label: "Dosha",
        render: (product) => (
          <span className="text-base text-[#4A5565] font-syne">
            {product.dosha ? product.dosha.charAt(0) + product.dosha.slice(1).toLowerCase() : "—"}
          </span>
        ),
      },
      {
        key: "price",
        label: "Price",
        render: (product) => <PriceDisplay price={product.price} discountedPrice={product.discountedPrice} />,
      },
      {
        key: "stock",
        label: "Stock",
        render: (product) => <span className="text-base text-[#4A5565] font-syne">{product.stock}</span>,
      },
      {
        key: "status",
        label: "Status",
        render: (product) => (
          <div className="flex items-center gap-2">
            <Toggle
              checked={product.isActive}
              onChange={() => handleToggleStatus(product)}
              id={`toggle-${product.id}`}
            />
            <StatusBadge status={deriveProductStatus(product)} />
          </div>
        ),
      },
    ],
    [handleToggleStatus],
  )

  return (
    <div className="flex flex-col gap-6 sm:p-8 p-4 h-full overflow-hidden">
      <ListHeader
        title="Products"
        subtitle="Manage your ayurvedic product catalog"
        showButton
        buttonLabel="Add New Product"
        onButtonClick={handleAddProduct}
      />

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
        placeholder="Search Products.."
        hasFilters
        hasActiveFilters={hasActiveFilters}
        setFilterOpen={setFilterOpen}
      />

      <DataTable<Product>
        className="flex-1 min-h-0"
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        emptyMessage={error ? undefined : "No products found."}
        actionsHeader="Actions"
        actions={(product) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => navigate(`/products/${product.id}/edit`)}
              title="Edit product"
            >
              <Pencil className="size-4 text-[#4A5565]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => handleDelete(product)}
              title="Delete product"
            >
              <Trash2 className="size-4 text-[#E7000B]" />
            </Button>
          </>
        )}
        pagination={pagination}
        onPageSizeChange={handlePageSizeChange}
        itemLabel="products"
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
        <ProductFilter
          selectedCategoryIds={selectedCategoryIds}
          onCategoryIdsChange={handleCategoryIdsChange}
          selectedHealthConcernIds={selectedHealthConcernIds}
          onHealthConcernIdsChange={handleHealthConcernIdsChange}
          selectedPrices={selectedPrices}
          onPricesChange={handlePricesChange}
          selectedStatuses={selectedStatuses}
          onStatusesChange={handleStatusesChange}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-error-600" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
