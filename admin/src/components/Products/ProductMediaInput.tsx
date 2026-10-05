import { useState, useCallback, useRef } from "react"
import { toast } from "sonner"
import { GripVertical, ImagePlus, Star, Upload, X } from "lucide-react"
import { uploadMedia, type MediaItem } from "@/services/mediaService"
import { cn } from "@/lib/utils"
import env from "@/config/env-config"
import { SectionCard } from "@/components/common/FormComponents"

export type UploadedImage = {
  fileId: string
  mediaItem: MediaItem
  isPrimary: boolean
}

interface ProductMediaInputProps {
  images: UploadedImage[]
  onImagesChange: React.Dispatch<React.SetStateAction<UploadedImage[]>>
}

export default function ProductMediaInput({ images, onImagesChange }: ProductMediaInputProps) {
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  // File upload
  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      setUploadingFiles(true)
      try {
        const results = await Promise.all(
          fileArray.map(async (file) => {
            const mediaItem = await uploadMedia(file)
            return { fileId: crypto.randomUUID(), mediaItem, isPrimary: false } as UploadedImage
          }),
        )
        onImagesChange((prev: UploadedImage[]) => {
          const updated = [...prev, ...results]
          if (!updated.some((img) => img.isPrimary) && updated.length > 0) {
            updated[0].isPrimary = true
          }
          return updated
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to upload images")
      } finally {
        setUploadingFiles(false)
      }
    },
    [onImagesChange],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files)
        e.target.value = ""
      }
    },
    [processFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      dragCounterRef.current = 0
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles],
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      setIsDragOver(false)
      dragCounterRef.current = 0
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const removeImage = useCallback(
    (fileId: string) => {
      onImagesChange((prev: UploadedImage[]) => {
        const filtered = prev.filter((img) => img.fileId !== fileId)
        const removed = prev.find((img) => img.fileId === fileId)
        if (removed?.isPrimary && filtered.length > 0) {
          filtered[0].isPrimary = true
        }
        return filtered
      })
    },
    [onImagesChange],
  )

  const setPrimaryImage = useCallback(
    (fileId: string) => {
      onImagesChange((prev: UploadedImage[]) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.fileId === fileId,
        })),
      )
    },
    [onImagesChange],
  )

  const updateAltText = useCallback(
    (fileId: string, alt: string) => {
      onImagesChange((prev: UploadedImage[]) =>
        prev.map((img) => (img.fileId === fileId ? { ...img, mediaItem: { ...img.mediaItem, alt } } : img)),
      )
    },
    [onImagesChange],
  )

  // Drag-to-reorder handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDragEnterItem = useCallback(
    (index: number) => {
      if (draggedIndex === null || draggedIndex === index) return
      onImagesChange((prev: UploadedImage[]) => {
        const next = [...prev]
        const [item] = next.splice(draggedIndex, 1)
        next.splice(index, 0, item)
        return next
      })
      setDraggedIndex(index)
    },
    [draggedIndex, onImagesChange],
  )

  return (
    <SectionCard title="Product Media">
      <div className="mt-4">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors md:p-8",
            isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <ImagePlus className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-syne text-sm font-semibold text-[#364153]">Click to upload or drag & drop images</p>
            <p className="mt-1 font-syne text-xs text-muted-foreground">PNG, JPG, WEBP — multiple images supported</p>
          </div>
        </div>

        {/* Uploading indicator */}
        {uploadingFiles && (
          <div className="mt-3 flex items-center gap-2 font-syne text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Uploading images...
          </div>
        )}

        {/* Image Preview List */}
        {images.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="font-syne text-xs text-muted-foreground">
              Drag rows to reorder · Click ★ to set primary image
            </p>
            <div className="space-y-2">
              {images.map((img, index) => (
                <div
                  key={img.fileId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnterItem(index)}
                  onDragEnd={() => setDraggedIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-all",
                    img.isPrimary ? "border-primary bg-primary/5" : "border-border bg-muted/30",
                  )}
                >
                  {/* Drag handle */}
                  <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/50" />

                  {/* Thumbnail */}
                  <img
                    src={`${env.BACKEND_BASE_URL}${img.mediaItem.url}`}
                    alt={img.mediaItem.alt ?? "Product image"}
                    className="size-14 shrink-0 rounded-lg object-cover"
                  />

                  {/* Alt text + file info */}
                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={img.mediaItem.alt ?? ""}
                      onChange={(e) => updateAltText(img.fileId, e.target.value)}
                      placeholder="Alt text (optional)"
                      className="w-full rounded-lg border border-border px-3 py-1.5 font-syne text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Primary star */}
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(img.fileId)}
                    title={img.isPrimary ? "Primary image" : "Set as primary"}
                    className={cn(
                      "shrink-0 rounded-lg p-1.5 transition-colors",
                      img.isPrimary ? "text-[#F87828]" : "text-muted-foreground/30 hover:text-[#F87828]",
                    )}
                  >
                    <Star className="size-4" fill={img.isPrimary ? "#F87828" : "none"} />
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeImage(img.fileId)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground/30 transition-colors hover:text-error-600"
                    title="Remove image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add more images */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex items-center gap-2 font-syne text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <Upload className="size-4" />
              Add more images
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
