import type { MailTemplates } from "../types.js"
import env from "../../../config/env.js"

export function renderPasswordResetOtp(data: MailTemplates["passwordResetOtp"]): { subject: string; html: string } {
  const { name, otp, expiresInMinutes } = data

  return {
    subject: "Reset Your Ayur Darpan Password",
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
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Ayur Darpan</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 40px;">
                      <h2 style="margin: 0 0 8px; color: #18181b; font-size: 20px;">Password Reset Request</h2>
                      <p style="margin: 0 0 4px; color: #52525b; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
                      <p style="margin: 0 0 20px; color: #52525b; font-size: 15px; line-height: 1.6;">
                        We received a request to reset the password for your Ayur Darpan account. Use the OTP below to proceed.
                      </p>
                      <div style="text-align: center; margin: 24px 0;">
                        <div style="display: inline-block; background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 16px 40px; letter-spacing: 12px; font-size: 32px; font-weight: 700; color: #059669; font-family: 'Courier New', monospace;">
                          ${otp}
                        </div>
                      </div>
                      <p style="margin: 0 0 4px; color: #52525b; font-size: 14px; line-height: 1.6;">
                        This OTP is valid for <strong>${expiresInMinutes} minutes</strong>. If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
                      <p style="margin: 0; color: #a1a1aa; font-size: 13px;">
                        &copy; ${new Date().getFullYear()} Ayur Darpan. All rights reserved.
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
