import { addMinutes } from "date-fns"
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

/**
 * Timezone boundary helpers.
 */

/** Clinic business timezone - must match backend BUSINESS_TIME_ZONE. */
export const BUSINESS_TIME_ZONE = "Asia/Kathmandu"

/** Used when the viewer's timezone cannot be detected (e.g. during SSR). */
export const FALLBACK_TIME_ZONE = "UTC"

/** IANA timezone of the viewer's device, e.g. "America/New_York". */
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE
  } catch {
    return FALLBACK_TIME_ZONE
  }
}

/** Format an absolute UTC instant for display in the given zone (default: viewer's). */
export function formatUtcTime(utcIso: string | Date, timeZone: string = getUserTimeZone(), format = "h:mm a"): string {
  return formatInTimeZone(utcIso, timeZone, format)
}

/** "9:00 AM" style label for a slot start, in the viewer's timezone. */
export function formatSlotLabel(startsAtUtc: string, timeZone: string = getUserTimeZone()): string {
  return formatUtcTime(startsAtUtc, timeZone, "h:mm a")
}

/** "9:00 – 10:00 AM" style range, in the viewer's timezone. */
export function formatSlotRange(startsAtUtc: string, endsAtUtc: string, timeZone: string = getUserTimeZone()): string {
  const start = formatInTimeZone(startsAtUtc, timeZone, "h:mm a")
  const end = formatInTimeZone(endsAtUtc, timeZone, "h:mm a")
  const [startTime, startMeridiem] = start.split(" ")
  const [, endMeridiem] = end.split(" ")
  return startMeridiem === endMeridiem ? `${startTime} – ${end}` : `${start} – ${end}`
}

/** "Sun, Sep 20" style day label for an instant, in the viewer's timezone. */
export function formatUtcDate(utcIso: string | Date, timeZone: string = getUserTimeZone()): string {
  return formatInTimeZone(utcIso, timeZone, "EEE, MMM d")
}

/**
 * Wall time in a zone → absolute UTC instant (ISO).
 * inverse of formatUtcTime. DST-safe via IANA data, unlike fixed offsets.
 */
export function zonedTimeToUtcIso(date: string, time: string, timeZone: string = BUSINESS_TIME_ZONE): string {
  return fromZonedTime(`${date}T${time}:00`, timeZone).toISOString()
}

/**
 * UTC range for a clinic slot picked as a business-day wall time,
 * e.g. ("2026-09-20", "09:00", 60). Matches backend slot generation.
 */
export function clinicSlotToUtcRange(
  date: string,
  time: string,
  durationMinutes: number,
  timeZone: string = BUSINESS_TIME_ZONE,
): { startsAtUtc: string; endsAtUtc: string } {
  const starts = fromZonedTime(`${date}T${time}:00`, timeZone)
  return {
    startsAtUtc: starts.toISOString(),
    endsAtUtc: addMinutes(starts, durationMinutes).toISOString(),
  }
}

/** Today's calendar day in a zone ("YYYY-MM-DD") — e.g. min value for a date input. */
export function getTodayInTimeZone(timeZone: string = BUSINESS_TIME_ZONE): string {
  return formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd")
}
