import { z } from "zod"

export const healthConcernFormSchema = z.object({
  name: z.string().min(1, "Health concern name is required"),
})

export type HealthConcernFormData = z.infer<typeof healthConcernFormSchema>
