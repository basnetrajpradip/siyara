import type { Response } from "express"

export const sendSuccessResponse = (res: Response, data: any, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const sendErrorResponse = (res: Response, message = "Error", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  })
}

export const sendNotFoundResponse = (res: Response, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message,
    data: null,
  })
}

export const sendUnauthorizedResponse = (res: Response, message = "Unauthorized") => {
  return res.status(401).json({
    success: false,
    message,
    data: null,
  })
}

export const sendForbiddenResponse = (res: Response, message = "Forbidden") => {
  return res.status(403).json({
    success: false,
    message,
    data: null,
  })
}

export const sendBadRequestResponse = (res: Response, message = "Bad Request") => {
  return res.status(400).json({
    success: false,
    message,
    data: null,
  })
}
