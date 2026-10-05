import axios from "axios"
import { toast } from "sonner"

export const handleError = (err: unknown, fallback?: string) => {
  let message = fallback ?? "An error occurred."
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    message = String(err.response.data.message)
  } else if (err instanceof Error) {
    message = err.message
  }
  toast.error(message)
}
