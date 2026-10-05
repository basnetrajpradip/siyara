import type { Request, Response, NextFunction } from "express"
import { ZodObject, ZodError } from "zod"
import { BadRequestError } from "../errors/app.error.js"

/**
 * Format Zod errors into readable string
 */
export const formatZodError = (error: ZodError): string => {
  return error.issues.map((issue) => `${issue.path.join(".") || "field"}: ${issue.message}`).join("; ")
  // return `${error.issues[0]?.path.join(".") || "field"}:${error.issues[0]?.message ?? "Invalid request"}`
}

type SchemaTarget = "body" | "query" | "params"

/**
 * Generic validation factory
 */
export const validate =
  <T extends ZodObject<any>>(schema: T, target: SchemaTarget = "body") =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      //  async refinements
      const parsed = await schema.parseAsync(req[target])

      if (target !== "query") {
        req[target] = parsed as any
      }

      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = formatZodError(error)

        // forward to global error handler
        return next(new BadRequestError(formatted))
      }

      return next(error)
    }
  }
