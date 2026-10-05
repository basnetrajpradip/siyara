import { z } from "zod"

const tagsSchema = z
  .array(z.string().trim().min(1).max(80, "Each item must be at most 80 characters"))
  .max(20, "At most 20 items allowed")
  .optional()
  .default([])

const titleDescriptionItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title must be at most 120 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description must be at most 1000 characters"),
})

const titleDescriptionListSchema = (label: string, max: number) =>
  z.array(titleDescriptionItemSchema).max(max, `At most ${max} ${label} allowed`).optional().default([])

export const doctorFormSchema = z.object({
  name: z.string().min(1, "Doctor name is required"),
  title: z.string().optional(),
  badge: z.string().max(80, "Badge must be at most 80 characters").optional(),
  specializations: tagsSchema,
  bio: z.string().optional(),
  qualifications: z
    .array(z.string().trim().min(1).max(200, "Each qualification must be at most 200 characters"))
    .max(20, "At most 20 qualifications allowed")
    .optional()
    .default([]),
  treatmentApproach: titleDescriptionListSchema("treatment approach steps", 10),
  professionalExperience: titleDescriptionListSchema("professional experience entries", 20),
  officeAddress: z.string().max(300, "Office address must be at most 300 characters").optional(),
  experienceYears: z.preprocess(
    (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
    z.number().int().nonnegative().optional(),
  ),
  languages: tagsSchema,
  consultationFee: z.preprocess(
    (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
    z.number().nonnegative().optional(),
  ),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  imageMediaId: z.string().optional().nullable(),
  isActive: z.boolean(),
})

export const unavailableSlotSchema = z
  .object({
    mode: z.enum(["FULL_DAY", "DATE_RANGE", "TIME_RANGE"]),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode !== "TIME_RANGE") return
    if (!value.startTime || !value.endTime) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Start and end time are required" })
      return
    }
    if (value.startTime >= value.endTime) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Start time must be before end time" })
    }
  })

export type DoctorFormData = z.infer<typeof doctorFormSchema>
export type UnavailableSlotFormData = z.infer<typeof unavailableSlotSchema>
