import type { MailTemplates } from "../types.js"
import env from "../../../config/env.js"

export function renderWelcome(data: MailTemplates["welcome"]): { subject: string; html: string } {
  const { name } = data

  return {
    subject: "Welcome to Ayur Darpan!",
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
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Ayurdarpan</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px;">
                      <h2 style="margin: 0 0 8px; color: #18181b; font-size: 20px;">Welcome, ${name}!</h2>
                      <p style="margin: 0 0 16px; color: #52525b; font-size: 15px; line-height: 1.6;">
                        Thank you for joining Ayudarpan. We're excited to have you on board!
                      </p>
                      <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.6;">
                        Your account has been created successfully. You can now explore our ayurvedic products, book your ayurvedic consultations, gain access to our ayurvedic resources, and more.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="border-radius: 8px; background-color: #059669;">
                            <a href="${env.FRONTEND_URL || "#"}" style="display: inline-block; padding: 12px 28px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">
                              Get Started
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                      <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
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
