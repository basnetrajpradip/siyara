import type { Request, Response } from "express"
import { sendSuccessResponse } from "../../utils/response.js"
import { getDashboardAnalytics, getDashboardOverview } from "./dashboard.service.js"
import type { RangeKey } from "./dashboard.types.js"

export const getOverview = async (req: Request, res: Response) => {
  const overview = await getDashboardOverview()

  sendSuccessResponse(res, overview, "Dashboard overview retrieved successfully")
}

export const getAnalytics = async (req: Request, res: Response) => {
  const { range } = req.query as { range?: RangeKey }
  const analytics = await getDashboardAnalytics(range ?? "30d")

  sendSuccessResponse(res, analytics, "Dashboard analytics retrieved successfully")
}
