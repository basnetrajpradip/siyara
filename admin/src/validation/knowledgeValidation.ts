import { z } from "zod"

export const knowledgeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  contentJson: z.record(z.string(), z.unknown()),
  contentHtml: z.string().min(1, "Content is required"),
  coverMediaId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
})

export type KnowledgeFormData = z.infer<typeof knowledgeFormSchema>
