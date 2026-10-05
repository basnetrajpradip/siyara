import dotenv from "dotenv"

dotenv.config()

function getEnv(key: string, required = true): string {
  const value = process.env[key]

  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value as string
}

const DATABASE_URL = (() => {
  const user = getEnv("DATABASE_USER")
  const password = getEnv("DATABASE_PASSWORD")
  const name = getEnv("DATABASE_NAME")
  const host = getEnv("DATABASE_HOST", false) || "localhost"
  const port = getEnv("DATABASE_PORT", false) || "5432"

  return `postgresql://${user}:${password}@${host}:${port}/${name}`
})()

const env = {
  PORT: Number(getEnv("PORT", false)) || 4000,
  DATABASE_URL,
  NODE_ENV: getEnv("NODE_ENV", false) || "development",
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRY: getEnv("ACCESS_TOKEN_EXPIRY", false) || "1m",
  REFRESH_TOKEN_EXPIRY: getEnv("REFRESH_TOKEN_EXPIRY", false) || "7d",
  OTP_EXPIRY_MINUTES: Number(getEnv("OTP_EXPIRY_MINUTES", false)) || 10,
  RESET_TOKEN_EXPIRY: getEnv("RESET_TOKEN_EXPIRY", false) || "10m",

  MEDIA_DIR: getEnv("MEDIA_DIR", false) || "uploads",
  MEDIA_MAX_FILE_SIZE: Number(getEnv("MEDIA_MAX_FILE_SIZE", false)) * 1024 * 1024 || 50 * 1024 * 1024, // 50MB
  FRONTEND_URL: getEnv("FRONTEND_URL", false),
  ADMIN_URL: getEnv("ADMIN_URL", false),

  // Mail (SMTP)
  SMTP_HOST: getEnv("SMTP_HOST", false),
  SMTP_PORT: Number(getEnv("SMTP_PORT", false)) || 587,
  SMTP_USER: getEnv("SMTP_USER", false),
  SMTP_PASS: getEnv("SMTP_PASS", false),
  MAIL_FROM_ADDRESS: getEnv("MAIL_FROM_ADDRESS", false) || "noreply@ayurdarpan.com",
  MAIL_FROM_NAME: getEnv("MAIL_FROM_NAME", false) || "Ayur Darpan",

  // E-commerce settings
  MAX_ITEM_QUANTITY: Number(getEnv("MAX_ITEM_QUANTITY", false)) || 10,
  DEFAULT_SHIPPING_COST: Number(getEnv("DEFAULT_SHIPPING_COST", false)) || 0,
  FREE_SHIPPING_THRESHOLD: Number(getEnv("FREE_SHIPPING_THRESHOLD", false)) || 0,

  // Consultation settings
  SLOT_BOOKING_LEAD_HOURS: Number(getEnv("SLOT_BOOKING_LEAD_HOURS", false)) || 2,

  // OAuth Configuration
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID", false) || "",
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET", false) || "",
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", false) || "http://localhost:4000/api/auth/google/callback",
  FACEBOOK_APP_ID: getEnv("FACEBOOK_APP_ID", false) || "",
  FACEBOOK_APP_SECRET: getEnv("FACEBOOK_APP_SECRET", false) || "",
  FACEBOOK_CALLBACK_URL: getEnv("FACEBOOK_CALLBACK_URL", false) || "http://localhost:4000/api/auth/facebook/callback",
  SESSION_SECRET: getEnv("SESSION_SECRET", false) || "default-session-secret",
}

export default env
