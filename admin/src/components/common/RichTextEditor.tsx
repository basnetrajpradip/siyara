import { useEffect, useRef, useState } from "react"
import type React from "react"
import type { JSONContent } from "@tiptap/react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Bold, Heading2, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Quote } from "lucide-react"
import { toast } from "sonner"
import { uploadMedia } from "@/services/mediaService"
import env from "@/config/env-config"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  contentJson: JSONContent | null
  contentHtml: string
  onChange: (value: { contentJson: JSONContent; contentHtml: string }) => void
  className?: string
}

export default function RichTextEditor({ contentJson, contentHtml, onChange, className }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ allowBase64: false }),
    ],
    content: contentJson ?? contentHtml,
    editorProps: {
      attributes: {
        class:
          "rich-text-editor-content min-h-[320px] rounded-b-xl border-x border-b border-border bg-white px-4 py-3 font-syne text-sm leading-7 outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange({
        contentJson: currentEditor.getJSON(),
        contentHtml: currentEditor.getHTML(),
      })
    },
  })

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (contentJson && JSON.stringify(editor.getJSON()) !== JSON.stringify(contentJson)) {
      editor.commands.setContent(contentJson)
    }
  }, [contentJson, editor])

  const addLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Enter URL", previousUrl ?? "")
    if (url === null) return
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !editor) return

    setIsUploading(true)
    try {
      const media = await uploadMedia(file)
      editor
        .chain()
        .focus()
        .setImage({ src: `${env.BACKEND_BASE_URL}${media.url}`, alt: media.alt ?? "" })
        .run()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const buttonClass = (active = false) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-primary-100 disabled:opacity-50",
      active && "bg-primary-100 text-primary-900 ring-1 ring-primary-300",
    )

  return (
    <div className={cn("rich-text-editor overflow-hidden rounded-xl", className)}>
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} />
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-border bg-muted/40 p-2">
        <button type="button" className={buttonClass(editor?.isActive("bold"))} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </button>
        <button type="button" className={buttonClass(editor?.isActive("italic"))} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </button>
        <button type="button" className={buttonClass(editor?.isActive("heading", { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </button>
        <button type="button" className={buttonClass(editor?.isActive("bulletList"))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </button>
        <button type="button" className={buttonClass(editor?.isActive("orderedList"))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </button>
        <button type="button" className={buttonClass(editor?.isActive("blockquote"))} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <Quote className="size-4" />
        </button>
        <button type="button" className={buttonClass(editor?.isActive("link"))} onClick={addLink}>
          <LinkIcon className="size-4" />
        </button>
        <button type="button" className={buttonClass()} onClick={() => imageInputRef.current?.click()} disabled={isUploading}>
          <ImagePlus className="size-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
