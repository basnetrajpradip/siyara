export interface MediaItem {
  id: string
  url: string
  alt: string | null
  type: string
  filePath?: string | null
  fileSize?: number | null
  mimeType?: string | null
}
