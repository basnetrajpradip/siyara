import winston from "winston"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import DailyRotateFile from "winston-daily-rotate-file"

const { combine, timestamp, printf, colorize, errors } = winston.format

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Anchor to the backend package root so logs always land in backend/logs
// regardless of where the process is started from.
const logDir = path.resolve(__dirname, "..", "..", "logs")

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// Console format
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] : ${stack || message}`
})

// App log (info + warn)
const appTransport = new DailyRotateFile({
  filename: path.join(logDir, "app.log"),
  datePattern: undefined, // no daily splitting
  maxSize: "20m", // rotate when file reaches size
  maxFiles: "14d", // keep logs for 14 days
  zippedArchive: true,
  level: "info",
})

// Error log (error only)
const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, "error.log"),
  datePattern: undefined,
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true,
  level: "error",
})

// Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",

  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true })),

  transports: [
    // Console (dev)
    new winston.transports.Console({
      format: combine(colorize(), devFormat),
    }),

    // App logs (info + warn)
    appTransport,

    // Error logs only
    errorTransport,
  ],
})

export default logger
