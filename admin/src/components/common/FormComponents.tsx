import { useNavigate } from "react-router"
import { Label } from "../ui/label"
import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

export const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h3 className="font-libre text-lg font-bold text-[#033333]">{title}</h3>
      {children}
    </div>
  )
}

export const FormField = ({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="font-syne text-sm font-semibold text-[#364153]">
        {label}
        {required && <span className="ml-0.5 text-error-500">*</span>}
      </Label>
      {children}
      {error && <p className="font-syne text-xs text-error-500">{error}</p>}
    </div>
  )
}

export const FormHeader = ({
  moduleName,
  isSubmitting,
  isEdit,
}: {
  moduleName: string
  isSubmitting: boolean
  isEdit: boolean
}) => {
  const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between border-b border-[#F3F4F6] bg-white px-4 py-3 md:px-8 md:py-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 font-syne text-sm font-semibold text-[#4A5565] transition-colors hover:text-[#033333]"
      >
        <ArrowLeft className="size-4" />
        <span className="hidden sm:inline">Back</span>
        <span className="sm:hidden">Back</span>
      </button>
      <div className="flex items-center gap-2 md:gap-3">
        <Button type="button" variant="outline" size="sm" className="md:size-default" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="hidden sm:inline">Saving...</span>
            </span>
          ) : isEdit ? (
            <span>Update {moduleName}</span>
          ) : (
            <span>Create {moduleName}</span>
          )}
        </Button>
      </div>
    </div>
  )
}
