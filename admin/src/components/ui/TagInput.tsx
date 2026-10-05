import { useId, useRef, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  maxTags?: number
  maxLength?: number
  disabled?: boolean
}

/**
 * Reusable tag/chip input. Type a value and press Enter, comma, or Tab to
 * commit it as a chip; Backspace on an empty field removes the last chip,
 * and each chip has a remove button. Pasting comma-separated text adds
 * multiple chips at once. Values are trimmed and de-duplicated
 * (case-insensitive).
 */
export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  maxTags = 20,
  maxLength = 80,
  disabled = false,
}: TagInputProps) {
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  const commitDraft = (raw: string) => {
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
    if (parts.length === 0) return

    const next = [...value]
    for (const part of parts) {
      if (next.length >= maxTags) break
      if (part.length > maxLength) continue
      if (!next.some((tag) => tag.toLowerCase() === part.toLowerCase())) {
        next.push(part)
      }
    }
    if (next.length !== value.length) {
      onChange(next)
    }
    setDraft("")
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
    inputRef.current?.focus()
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex min-h-[46px] w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "cursor-not-allowed bg-input/50 opacity-50",
      )}
    >
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary-100 py-0.5 pl-2.5 pr-1.5 font-syne text-xs font-semibold text-primary-800"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              removeTag(index)
            }}
            className="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-primary-800/15"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={inputId}
        value={draft}
        disabled={disabled || value.length >= maxTags}
        maxLength={maxLength}
        placeholder={value.length === 0 ? placeholder : ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
            e.preventDefault()
            commitDraft(draft)
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            removeTag(value.length - 1)
          } else if (e.key === "Escape") {
            setDraft("")
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text")
          if (!text.includes(",")) return
          e.preventDefault()
          commitDraft(text)
        }}
        onBlur={() => commitDraft(draft)}
        className="min-w-28 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  )
}
