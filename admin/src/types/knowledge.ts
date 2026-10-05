import type { MediaItem } from "./media"
import type { User } from "./user"

export type KnowledgeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  contentJson: Record<string, unknown>
  contentHtml: string
  coverMediaId: string | null
  coverMedia: MediaItem | null
  authorId: string | null
  author: Pick<User, "id" | "firstName" | "lastName" | "email" | "avatar"> | null
  status: KnowledgeStatus
  featured: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface KnowledgeFilters {
  page?: number
  limit?: number
  search?: string
  status?: KnowledgeStatus
  featured?: boolean
}

export function getKnowledgeStatusLabel(status: KnowledgeStatus): string {
  const labels: Record<KnowledgeStatus, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  }
  return labels[status]
}
