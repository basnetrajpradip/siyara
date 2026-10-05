/** Standard API response for non-paginated endpoints */
export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

/** Pagination metadata */
export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Wrapper for paginated data */
export type PaginatedData<T> = {
  items: T[]
  pagination: PaginationMeta
}

/** Standard API response for paginated endpoints */
export type PaginatedResponse<T> = {
  success: boolean
  message: string
  data: PaginatedData<T>
}
