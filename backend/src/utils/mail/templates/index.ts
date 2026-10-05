import type { MailTemplates, MailTemplateName } from "../types.js"
import { renderWelcome } from "./welcome.js"
import { renderPasswordResetOtp } from "./passwordResetOtp.js"
import { renderOrderConfirmation } from "./orderConfirmation.js"
import { renderOrderStatusUpdate } from "./orderStatusUpdate.js"

type TemplateRenderer = (data: MailTemplates[MailTemplateName]) => { subject: string; html: string }

export const templates: Record<string, TemplateRenderer> = {
  welcome: renderWelcome as TemplateRenderer,
  passwordResetOtp: renderPasswordResetOtp as TemplateRenderer,
  orderConfirmation: renderOrderConfirmation as TemplateRenderer,
  orderStatusUpdate: renderOrderStatusUpdate as TemplateRenderer,
}
