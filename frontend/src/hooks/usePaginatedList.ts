import { useCallback, useEffect, useRef, useState } from "react"
import type { PaginatedData } from "@/types/api"

type FetchPage<T, F> = (args: { page: number; limit: number; filters: F }) => Promise<PaginatedData<T>>

interface UsePaginatedListOptions<T, F> {
  fetchPage: FetchPage<T, F>
  /** Changing any value refetches page 1 and replaces items. */
  filters: F
  limit?: number
  /** SSR data for the default filters — skips the first client fetch when provided. */
  initialData?: PaginatedData<T>
}

export function usePaginatedList<T, F extends Record<string, unknown>>({
  fetchPage,
  filters,
  limit = 12,
  initialData,
}: UsePaginatedListOptions<T, F>) {
  const [items, setItems] = useState<T[]>(initialData?.items ?? [])
  const [total, setTotal] = useState(initialData?.pagination.total ?? 0)
  const [totalPages, setTotalPages] = useState(initialData?.pagination.totalPages ?? 1)
  const [page, setPage] = useState(initialData?.pagination.page ?? 1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Latest callbacks/values without retriggering effects.
  // Synced in an effect (declared first) so the fetch effect below always reads fresh values.
  const fetchPageRef = useRef(fetchPage)
  const filtersRef = useRef(filters)

  useEffect(() => {
    fetchPageRef.current = fetchPage
    filtersRef.current = filters
  })

  const skipFirstFetch = useRef(initialData !== undefined)
  const filtersKey = JSON.stringify({ ...filters, limit })

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetchPageRef
      .current({ page: 1, limit, filters: filtersRef.current })
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setTotal(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
        setPage(1)
      })
      .catch(() => {
        if (cancelled) return
        setItems([])
        setTotal(0)
        setTotalPages(1)
        setPage(1)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filtersKey, limit])

  const hasMore = page < totalPages

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || page >= totalPages) return

    setIsLoadingMore(true)
    try {
      const data = await fetchPageRef.current({ page: page + 1, limit, filters: filtersRef.current })
      setItems((prev) => [...prev, ...data.items])
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
      setPage(page + 1)
    } catch {
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoading, isLoadingMore, page, totalPages, limit])

  return { items, total, page, totalPages, hasMore, isLoading, isLoadingMore, loadMore }
}
