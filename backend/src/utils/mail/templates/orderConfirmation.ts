import type { MailTemplates } from "../types.js"
import env from "../../../config/env.js"

export function renderOrderConfirmation(data: MailTemplates["orderConfirmation"]): { subject: string; html: string } {
  const { name, orderNumber, items, total, estimatedDelivery } = data

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
          <p style="margin: 0; color: #18181b; font-size: 14px;">${item.name}</p>
          ${item.sku ? `<p style="margin: 2px 0 0; color: #a1a1aa; font-size: 12px;">SKU: ${item.sku}</p>` : ""}
        </td>
        <td style="padding: 8px 0; text-align: center; color: #52525b; font-size: 14px; border-bottom: 1px solid #e4e4e7;">${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; color: #18181b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e4e4e7;">Rs. ${item.total.toLocaleString("en-IN")}</td>
      </tr>
    `,
    )
    .join("")

  return {
    subject: `Order Confirmed - ${orderNumber}`,
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
                    <td style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Order Confirmed</h1>
                      <p style="margin: 8px 0 0; color: #d1fae5; font-size: 14px;">${orderNumber}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px;">
                      <h2 style="margin: 0 0 8px; color: #18181b; font-size: 18px;">Thank you, ${name}!</h2>
                      <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.6;">
                        Your order has been placed successfully. We'll send you updates as it progresses.
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <thead>
                          <tr>
                            <th style="padding: 8px 0; text-align: left; font-size: 12px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; border-bottom: 2px solid #e4e4e7;">Item</th>
                            <th style="padding: 8px 0; text-align: center; font-size: 12px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; border-bottom: 2px solid #e4e4e7;">Qty</th>
                            <th style="padding: 8px 0; text-align: right; font-size: 12px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; border-bottom: 2px solid #e4e4e7;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="2" style="padding: 12px 0 0; text-align: right; font-weight: 600; color: #18181b; font-size: 16px;">Total</td>
                            <td style="padding: 12px 0 0; text-align: right; font-weight: 700; color: #059669; font-size: 18px;">Rs. ${total.toLocaleString("en-IN")}</td>
                          </tr>
                        </tfoot>
                      </table>

                      ${estimatedDelivery ? `<p style="margin: 24px 0 0; color: #52525b; font-size: 14px;">Estimated delivery: <strong>${estimatedDelivery}</strong></p>` : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                      <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
                        <a href="${env.FRONTEND_URL || "#"}/orders" style="color: #059669; text-decoration: none; font-weight: 600;">View your order</a>
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
