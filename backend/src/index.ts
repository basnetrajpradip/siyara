import dotenv from "dotenv"
dotenv.config()
import app from "./app.js"
import logger from "./config/logger.js"
import { prisma } from "./db/prisma.js"
import env from "./config/env.js"
import { runOrphanCleanup } from "./scripts/cleanupOrphans.js"

const PORT = env.PORT || 4000

const bootstrap = async () => {
  try {
    // Connect to database
    await prisma.$connect()
    logger.info("Database connected successfully")

    // Start orphan cleanup job every 6 hours
    const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000 // 6 hours
    const CLEANUP_GRACE_PERIOD_HOURS = 24 // delete orphans older than 24h

    runOrphanCleanup(CLEANUP_GRACE_PERIOD_HOURS) // run once on startup
    setInterval(() => {
      runOrphanCleanup(CLEANUP_GRACE_PERIOD_HOURS)
    }, CLEANUP_INTERVAL).unref()

    logger.info("Orphan cleanup job scheduled (every 6 hours)")

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`)
    })

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`)

      server.close(async () => {
        logger.info("HTTP server closed")

        try {
          await prisma.$disconnect()
          logger.info("Database disconnected successfully")
        } catch (err) {
          logger.error("Error disconnecting from database", { error: err })
        } finally {
          process.exit(0)
        }
      })

      // Force shutdown if graceful close takes too long
      setTimeout(() => {
        logger.error("Forced shutdown due to timeout")
        process.exit(1)
      }, 10_000).unref()
    }

    process.on("SIGINT", () => shutdown("SIGINT"))
    process.on("SIGTERM", () => shutdown("SIGTERM"))
  } catch (err) {
    logger.error("Failed to start server", { error: err })
    await prisma.$disconnect()
    process.exit(1)
  }
}

await bootstrap()
