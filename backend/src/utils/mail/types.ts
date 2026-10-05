/**
 * Registry of email templates.
 * Add a new key here and a matching renderer in `templates/`.
 */
export interface MailTemplates {
  welcome: { name: string }
  passwordResetOtp: { name: string; otp: string; expiresInMinutes: number }
  orderConfirmation: {
    name: string
    orderNumber: string
    items: Array<{ name: string; sku: string | null; quantity: number; total: number }>
    total: number
    estimatedDelivery?: string
  }
  orderStatusUpdate: {
    name: string
    orderNumber: string
    status: string
    note?: string | null
    trackingNumber?: string | null
    carrier?: string | null
    estimatedDelivery?: string | null
  }
}

export type MailTemplateName = keyof MailTemplates

export interface SendMailOptions<T extends MailTemplateName = MailTemplateName> {
  to: string
  template: T
  data: MailTemplates[T]
}
