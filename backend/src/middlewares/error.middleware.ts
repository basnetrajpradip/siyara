import type { Request, Response, NextFunction } from "express"
import { AppError } from "../errors/app.error.js"
import logger from "../config/logger.js"
import { sendErrorResponse } from "../utils/response.js"

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let error = err

  // Normalize unknown errors
  if (!(error instanceof AppError)) {
    error = new AppError("Internal Server Error", 500)
  }

  // Log error centrally
  logger.error(error.message, {
    statusCode: error.statusCode,
    stack: err.stack,
    type: err.name,
    path: _req.originalUrl,
    method: _req.method,
  })

  sendErrorResponse(res, error.message, error.statusCode)
}
