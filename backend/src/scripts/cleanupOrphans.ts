import logger from "../config/logger.js"
import { deleteOrphanedMedia } from "../modules/media/media.service.js"

/**
 * Orphaned media cleanup job.
 *
 * Finds media records that were uploaded but never associated with any entity
 * (no ProductMedia relation, not used as a user avatar) and deletes both the
 * database record and the physical file.
 *
 * Run this on a schedule (e.g., every 6 hours via setInterval in index.ts,
 * or as a cron job via your hosting platform).
 *
 * @param hoursOld Minimum age (in hours) before an orphan is eligible for deletion
 */
export const runOrphanCleanup = async (hoursOld = 24) => {
  try {
    const count = await deleteOrphanedMedia(hoursOld)

    if (count > 0) {
      logger.info(`Orphan cleanup: deleted ${count} orphaned media file(s)`)
    }
  } catch (err) {
    logger.error("Orphan cleanup failed", { error: err })
  }
}
