import { z } from "zod"

export const consultationFormSchema = z
  .object({
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
    internalNotes: z.string().optional(),
    cancellationReason: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "CANCELLED" && !value.cancellationReason?.trim()) {
      ctx.addIssue({ code: "custom", path: ["cancellationReason"], message: "Cancellation reason is required" })
    }
  })

export type ConsultationFormData = z.infer<typeof consultationFormSchema>
