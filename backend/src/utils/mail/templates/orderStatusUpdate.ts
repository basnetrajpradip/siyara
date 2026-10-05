import type { MailTemplates } from "../types.js"
import env from "../../../config/env.js"

export function renderOrderStatusUpdate(data: MailTemplates["orderStatusUpdate"]): { subject: string; html: string } {
  const { name, orderNumber, status, note, trackingNumber, carrier, estimatedDelivery } = data

  const trackingHtml =
    trackingNumber || carrier || estimatedDelivery
      ? `
        <div style="margin-top: 20px; padding: 16px; border-radius: 10px; background-color: #f0fdfa;">
          <p style="margin: 0 0 8px; color: #0f766e; font-size: 14px; font-weight: 700;">Delivery details</p>
          ${carrier ? `<p style="margin: 0 0 4px; color: #334155; font-size: 14px;">Carrier: <strong>${carrier}</strong></p>` : ""}
          ${trackingNumber ? `<p style="margin: 0 0 4px; color: #334155; font-size: 14px;">Tracking number: <strong>${trackingNumber}</strong></p>` : ""}
          ${estimatedDelivery ? `<p style="margin: 0; color: #334155; font-size: 14px;">Estimated delivery: <strong>${estimatedDelivery}</strong></p>` : ""}
        </div>
      `
      : ""

  return {
    subject: `Order Update - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 32px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Order Status Updated</h1>
                      <p style="margin: 8px 0 0; color: #ccfbf1; font-size: 14px;">${orderNumber}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px;">
                      <h2 style="margin: 0 0 8px; color: #18181b; font-size: 18px;">Hello ${name},</h2>
                      <p style="margin: 0 0 18px; color: #52525b; font-size: 15px; line-height: 1.6;">
                        Your order status is now <strong>${status}</strong>.
                      </p>
                      ${note ? `<p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;">${note}</p>` : ""}
                      ${trackingHtml}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                      <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
                        <a href="${env.FRONTEND_URL || "#"}/orders" style="color: #0f766e; text-decoration: none; font-weight: 600;">View your order</a>
                      </p>
                      <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 13px;">
                        &copy; ${new Date().getFullYear()} Ayurdarpan. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `.trim(),
  }
}
