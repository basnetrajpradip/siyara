import { z } from "zod"

export const profileSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
