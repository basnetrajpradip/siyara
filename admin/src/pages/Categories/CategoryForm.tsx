import { useState, useCallback, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { getCategory, createCategory, updateCategory } from "@/services/categoryService"
import { categoryFormSchema, type CategoryFormData } from "@/validation/categoryValidation"
import { SectionCard, FormField, FormHeader } from "@/components/common/FormComponents"
import CategorySelect from "@/components/Products/CategorySelect"
import { handleError } from "@/lib/error-utils"

export default function CategoryForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [isLoadingCategory, setIsLoadingCategory] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues: {
      name: "",
      parentId: null,
    },
  })

  const parentId = watch("parentId")

  // Fetch category for editing
  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false

    setIsLoadingCategory(true)
    getCategory(id)
      .then((res) => {
        if (cancelled) return
        const category = res.data
        reset({
          name: category.name,
          parentId: category.parentId,
        })
      })
      .catch((err) => {
        if (cancelled) return
        handleError(err)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCategory(false)
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, reset])

  // Submit
  const onSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      const payload: Record<string, unknown> = {
        name: formData.name,
        parentId: formData.parentId || null,
      }

      try {
        if (isEdit && id) {
          await updateCategory(id, payload)
          toast.success("Category updated successfully")
        } else {
          await createCategory(payload)
          toast.success("Category created successfully")
        }
        navigate("/categories")
      } catch (err: unknown) {
        handleError(err)
      }
    },
    [isEdit, id, navigate],
  )

  if (isLoadingCategory) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col overflow-hidden">
      {/* Header bar */}
      <FormHeader moduleName="Category" isEdit={isEdit} isSubmitting={isSubmitting} />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-[#F5F5F5]">
        {/* Page title */}
        <div className="px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8">
          <h1 className="font-libre text-2xl font-bold leading-8 text-[#033333] md:text-[30px] md:leading-9">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h1>
          <p className="mt-1 font-syne text-sm text-[#066666]">
            {isEdit ? "Update your product category details" : "Create a new category for your product catalog"}
          </p>
        </div>

        {/* Form content */}
        <div className="flex flex-col gap-6 px-4 pb-8 md:px-8 md:pb-12">
          <div className="w-full">
            <SectionCard title="Category Details">
              <div className="mt-4 flex flex-col gap-4">
                <FormField label="Category Name" required error={errors.name?.message}>
                  <Input placeholder="e.g., Herbal Oils" aria-invalid={!!errors.name} {...register("name")} />
                </FormField>

                <CategorySelect
                  value={parentId}
                  onChange={(v) => setValue("parentId", v, { shouldValidate: true })}
                  error={errors.parentId?.message}
                  label="Parent Category"
                  required={false}
                  placeholder="No parent (top-level category)"
                  includeNoneOption
                  noneLabel="No parent (top-level category)"
                  excludeId={isEdit ? id : undefined}
                  helperText="Leave empty to create a top-level category"
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </form>
  )
}
