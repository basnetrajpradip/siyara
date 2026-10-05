import { useState, useCallback, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ListHeader } from "@/components/ui/list-header"
import { DataTable, type Column } from "@/components/common/DataTable"
import { getAdminCategories, deleteCategory } from "@/services/categoryService"
import type { AdminCategory } from "@/types/product"
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
import { handleError } from "@/lib/error-utils"
import { toast } from "sonner"
import SearchFilter from "@/components/common/SearchFilter"
import { useDebounce } from "@/hooks/useDebounce"

export default function CategoryList() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [searchInput, setSearchInput] = useState("")
  const search = useDebounce(searchInput, 400)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getAdminCategories({ page, limit: pageSize, search: search })
        if (!cancelled) {
          setCategories(res.data.items)
          setTotal(res.data.pagination.total)
          setTotalPages(res.data.pagination.totalPages)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load categories")
          handleError(err)
          setCategories([])
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
  }, [page, pageSize, refreshKey, search])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }, [])

  const handleAddCategory = useCallback(() => {
    navigate("/categories/new")
  }, [navigate])

  const handleDelete = useCallback((category: AdminCategory) => {
    setCategoryToDelete(category)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return
    try {
      const res = await deleteCategory(categoryToDelete.id)
      toast.success(res.message)
      refresh()
    } catch (error) {
      handleError(error)
    } finally {
      setCategoryToDelete(null)
    }
  }, [categoryToDelete, refresh])

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchInput("")
  }, [])

  const pagination = useMemo(() => ({ page, pageSize, total, totalPages }), [page, pageSize, total, totalPages])

  const columns: Column<AdminCategory>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Category Name",
        render: (category) => (
          <div>
            <p className="text-base font-semibold text-[#101828] font-syne">{category.name}</p>
            <p className="text-xs text-muted-foreground font-syne">Slug: {category.slug}</p>
          </div>
        ),
      },
      {
        key: "parent",
        label: "Parent Category",
        render: (category) => (
          <span className="text-base text-[#4A5565] font-syne">{category.parent ? category.parent.name : "—"}</span>
        ),
      },
      {
        key: "children",
        label: "Sub-categories",
        render: (category) => (
          <span className="text-base text-[#4A5565] font-syne">
            {category.children.length > 0 ? category.children.length : "—"}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6 sm:p-8 p-4 h-full overflow-hidden">
      <ListHeader
        title="Categories"
        subtitle="Organize your product catalog with categories"
        showButton
        buttonLabel="Add New Category"
        onButtonClick={handleAddCategory}
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
        placeholder="Search Categories.."
        hasFilters={false}
      />

      <DataTable<AdminCategory>
        className="flex-1 min-h-0"
        columns={columns}
        data={categories}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        emptyMessage={error ? undefined : "No categories found."}
        actionsHeader="Actions"
        actions={(category) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => navigate(`/categories/${category.id}/edit`)}
              title="Edit category"
            >
              <Pencil className="size-4 text-[#4A5565]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => handleDelete(category)}
              title="Delete category"
            >
              <Trash2 className="size-4 text-[#E7000B]" />
            </Button>
          </>
        )}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        itemLabel="categories"
      />

      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-error-600" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
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
