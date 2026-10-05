import nodemailer from "nodemailer"
import logger from "../../config/logger.js"
import env from "../../config/env.js"
import type { MailTemplateName, SendMailOptions } from "./types.js"
import { templates } from "./templates/index.js"

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER || "",
        pass: env.SMTP_PASS || "",
      },
    })
  }
  return transporter
}

/**
 * Send an email using a named template.
 *
 * In production the email is dispatched via SMTP using nodemailer.
 * In development the email contents are logged via logger.info
 * so you can inspect them without a real mail server.
 */
export async function sendMail<T extends MailTemplateName>(options: SendMailOptions<T>): Promise<void> {
  const template = templates[options.template]

  if (!template) {
    logger.error(`Unknown mail template: "${options.template}"`)
    return
  }

  const { subject, html } = template(options.data)

  if (env.NODE_ENV === "production") {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      logger.error("Mail not sent — SMTP is not configured in production")
      return
    }

    try {
      await getTransporter().sendMail({
        from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
        to: options.to,
        subject,
        html,
      })
      logger.info(`Email sent to ${options.to} — subject: "${subject}"`)
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error)
    }
  } else {
    logger.info("📧 Email (dev mode — not sent)")
    logger.info(`  To:       ${options.to}`)
    logger.info(`  Template: ${options.template}`)
    logger.info(`  Subject:  ${subject}`)
    logger.info(`  Data:     ${JSON.stringify(options.data)}`)
  }
}

/**
 * Low-level helper that sends raw content without any template.
 * Useful for ad-hoc emails outside the template system.
 */
export async function sendRawMail(options: { to: string; subject: string; html: string }): Promise<void> {
  if (env.NODE_ENV === "production") {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      logger.error("Mail not sent — SMTP is not configured in production")
      return
    }

    try {
      await getTransporter().sendMail({
        from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      logger.info(`Raw email sent to ${options.to} — subject: "${options.subject}"`)
    } catch (error) {
      logger.error(`Failed to send raw email to ${options.to}:`, error)
    }
  } else {
    logger.info("📧 Raw email (dev mode — not sent)")
    logger.info(`  To:      ${options.to}`)
    logger.info(`  Subject: ${options.subject}`)
  }
}
