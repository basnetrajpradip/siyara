import { useState, useCallback, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TagInput from "@/components/ui/TagInput"
import { getProduct, createProduct, updateProduct } from "@/services/productService"
import { updateMedia } from "@/services/mediaService"
import { productFormSchema, type ProductFormData } from "@/validation/productValidation"
import { DOSHA_OPTIONS, type Dosha } from "@/types/product"

import { FormHeader, FormField, SectionCard } from "@/components/common/FormComponents"

import CategorySelect from "@/components/Products/CategorySelect"
import HealthConcernMultiSelect from "@/components/Products/HealthConcernMultiSelect"
import ProductMediaInput, { type UploadedImage } from "@/components/Products/ProductMediaInput"
import Toggle from "@/components/ui/toggle"
import { handleError } from "@/lib/error-utils"

const DOSHA_LABELS: Record<Dosha, string> = Object.fromEntries(DOSHA_OPTIONS.map((o) => [o.value, o.label])) as Record<
  Dosha,
  string
>

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [images, setImages] = useState<UploadedImage[]>([])
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      sku: "",
      price: undefined,
      discountAmount: undefined,
      stock: undefined,
      featured: false,
      categoryId: "",
      dosha: undefined,
      healthConcernIds: [],
      keyIngredients: [],
      recommendedUse: [],
      notRecommendedUse: [],
      media: [],
    },
  })

  const featured = watch("featured")
  const categoryId = watch("categoryId")

  // Fetch product for editing
  useEffect(() => {
    if (!isEdit || !id) return
    const productId = id
    let cancelled = false

    setIsLoadingProduct(true)
    getProduct(productId)
      .then((res) => {
        if (cancelled) return
        const product = res.data
        reset({
          name: product.name,
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          sku: product.sku ?? "",
          price: Number(product.price),
          discountAmount: product.discountAmount ? Number(product.discountAmount) : undefined,
          stock: product.stock,
          featured: product.featured,
          categoryId: product.categoryId,
          dosha: product.dosha ?? undefined,
          healthConcernIds: product.healthConcerns.map((h) => h.id),
          keyIngredients: product.keyIngredients,
          recommendedUse: product.recommendedUse,
          notRecommendedUse: product.notRecommendedUse,
          media: product.media.map((m) => ({
            mediaId: m.mediaId,
            sortOrder: m.sortOrder,
            isPrimary: m.isPrimary,
          })),
        })
        setImages(
          product.media.map((m) => ({
            fileId: m.id,
            mediaItem: {
              id: m.mediaId,
              url: m.media.url,
              alt: m.media.alt,
              type: m.media.type,
            },
            isPrimary: m.isPrimary,
          })),
        )
      })
      .catch((err) => {
        if (cancelled) return
        handleError(err)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProduct(false)
      })
    return () => {
      cancelled = true
    }
  }, [isEdit, id, reset])

  // Submit
  const onSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      const payload: Record<string, unknown> = {
        ...formData,
        discountAmount: formData.discountAmount || undefined,
        media: images.map((img, index) => ({
          mediaId: img.mediaItem.id,
          sortOrder: index,
          isPrimary: img.isPrimary,
        })),
      }

      try {
        // Persist alt text changes to media items
        await Promise.all(images.map((img) => updateMedia(img.mediaItem.id, { alt: img.mediaItem.alt ?? undefined })))

        if (isEdit && id) {
          await updateProduct(id, payload)
          toast.success("Product updated successfully")
        } else {
          await createProduct(payload)
          toast.success("Product created successfully")
        }
        navigate("/products")
      } catch (err: unknown) {
        handleError(err)
      }
    },
    [images, isEdit, id, navigate],
  )

  if (isLoadingProduct) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col overflow-hidden">
      {/* Header bar */}
      <FormHeader moduleName="Product" isSubmitting={isSubmitting} isEdit={isEdit} />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-[#F5F5F5]">
        {/* Page title */}
        <div className="px-4 pb-4 pt-6 md:px-8 md:pb-6 md:pt-8">
          <h1 className="font-libre text-2xl font-bold leading-8 text-[#033333] md:text-[30px] md:leading-9">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-1 font-syne text-sm text-[#066666]">
            {isEdit ? "Update your ayurvedic product details" : "Create a new ayurvedic product in your catalog"}
          </p>
        </div>

        {/* Two-column form layout */}
        <div className="flex flex-col gap-6 px-4 pb-8 md:px-8 md:pb-12 lg:flex-row">
          {/* Left column */}
          <div className="flex w-full flex-col gap-6 lg:w-[60%] lg:shrink-0">
            {/* Basic Information */}
            <SectionCard title="Basic Information">
              <div className="mt-4 flex flex-col gap-4">
                <FormField label="Product Name" required error={errors.name?.message}>
                  <Input placeholder="e.g., Brahmi Ghrita" aria-invalid={!!errors.name} {...register("name")} />
                </FormField>

                <FormField label="Short Description" error={errors.shortDescription?.message}>
                  <Input placeholder="Brief one-line summary of the product" {...register("shortDescription")} />
                </FormField>

                <FormField label="Full Description" error={errors.description?.message}>
                  <Textarea
                    placeholder="Detailed product description \u2014 ingredients, benefits, usage instructions..."
                    rows={5}
                    className="min-h-[120px] resize-y"
                    {...register("description")}
                  />
                </FormField>
              </div>
            </SectionCard>

            {/* Ayurvedic Details */}
            <SectionCard title="Ayurvedic Details">
              <div className="mt-4 flex flex-col gap-4">
                <FormField label="Dosha" error={errors.dosha?.message}>
                  <Controller
                    name="dosha"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                      >
                        <SelectTrigger className="w-full" aria-invalid={!!errors.dosha}>
                          <SelectValue placeholder="Select a dosha">
                            {field.value ? DOSHA_LABELS[field.value as Dosha] : "Select a dosha"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="none">None</SelectItem>
                          {DOSHA_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="font-syne text-xs text-muted-foreground">Leave as None if not applicable</p>
                </FormField>

                <Controller
                  name="healthConcernIds"
                  control={control}
                  render={({ field }) => (
                    <HealthConcernMultiSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                      error={errors.healthConcernIds?.message}
                      helperText="Products can be filtered by these concerns on the storefront"
                    />
                  )}
                />

                <FormField label="Key Ingredients" error={errors.keyIngredients?.message}>
                  <Controller
                    name="keyIngredients"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Add ingredient, press Enter"
                      />
                    )}
                  />
                </FormField>

                <FormField label="Recommended Use" error={errors.recommendedUse?.message}>
                  <Controller
                    name="recommendedUse"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Add recommendation, press Enter"
                      />
                    )}
                  />
                </FormField>

                <FormField label="Not Recommended Use" error={errors.notRecommendedUse?.message}>
                  <Controller
                    name="notRecommendedUse"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Add caution, press Enter"
                      />
                    )}
                  />
                </FormField>
              </div>
            </SectionCard>

            {/* Product Media */}
            <ProductMediaInput images={images} onImagesChange={setImages} />
          </div>

          {/* Right column */}
          <div className="flex w-full flex-col gap-6 lg:w-[38%] lg:shrink-0">
            {/* Pricing */}
            <SectionCard title="Pricing">
              <div className="mt-4 flex flex-col gap-4">
                <FormField label="Price (Rs.)" required error={errors.price?.message}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    aria-invalid={!!errors.price}
                    {...register("price", { valueAsNumber: true })}
                  />
                </FormField>

                <FormField label="Discount Amount (Rs.)" error={errors.discountAmount?.message}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder=""
                    aria-invalid={!!errors.discountAmount}
                    {...register("discountAmount", { valueAsNumber: true })}
                  />
                  <p className="font-syne text-xs text-muted-foreground">Leave blank if no discount applies</p>
                </FormField>
              </div>
            </SectionCard>

            {/* Inventory */}
            <SectionCard title="Inventory">
              <div className="mt-4 flex flex-col gap-4">
                <FormField label="SKU" error={errors.sku?.message}>
                  <Input placeholder="e.g., AYU-BG-001" {...register("sku")} />
                </FormField>

                <FormField label="Stock Quantity" required error={errors.stock?.message}>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="0"
                    aria-invalid={!!errors.stock}
                    {...register("stock", { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            </SectionCard>

            {/* Organization */}
            <SectionCard title="Organization">
              <div className="mt-4 flex flex-col gap-4">
                <CategorySelect
                  value={categoryId}
                  onChange={(v) => setValue("categoryId", v ?? "", { shouldValidate: true })}
                  error={errors.categoryId?.message}
                />

                {/* Visibility */}
                <div>
                  <Label className="mb-1 font-syne text-sm font-semibold text-[#364153]">Visibility</Label>
                  <div className="mt-1.5 flex items-start gap-3">
                    <Toggle checked={featured} onChange={(v) => setValue("featured", v)} id="featured-toggle" />
                    <div>
                      <Label
                        htmlFor="featured-toggle"
                        className="cursor-pointer font-syne text-sm font-semibold text-[#364153]"
                      >
                        Featured product
                      </Label>
                      <p className="font-syne text-xs text-muted-foreground">Show on homepage</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </form>
  )
}
