import { useRef, useState } from "react"
import type React from "react"
import { ImagePlus, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { uploadMedia } from "@/services/mediaService"
import type { MediaItem } from "@/types/media"
import env from "@/config/env-config"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageUploadFieldProps {
  value: MediaItem | null
  onChange: (media: MediaItem | null) => void
  label?: string
  helperText?: string
  className?: string
}

export default function ImageUploadField({ value, onChange, label, helperText, className }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setIsUploading(true)
    try {
      const media = await uploadMedia(file)
      onChange(media)
      toast.success("Image uploaded")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <p className="font-syne text-sm font-semibold text-[#364153]">{label}</p>}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />

      {value ? (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3">
          <img
            src={`${env.BACKEND_BASE_URL}${value.url}`}
            alt={value.alt ?? "Uploaded image"}
            className="size-20 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-syne text-sm font-semibold text-[#033333]">{value.alt || value.url}</p>
            <p className="font-syne text-xs text-muted-foreground">{value.type}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
            <Upload className="mr-2 size-4" />
            Replace
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)} disabled={isUploading}>
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 transition-colors hover:border-primary/50 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ImagePlus className="size-6 text-muted-foreground" />
          <span className="font-syne text-sm font-semibold text-[#364153]">
            {isUploading ? "Uploading..." : "Click to upload image"}
          </span>
        </button>
      )}
      {helperText && <p className="font-syne text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}
