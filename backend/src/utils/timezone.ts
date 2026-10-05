import { addMinutes } from "date-fns"
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz"

export const BUSINESS_TIME_ZONE = "Asia/Kathmandu"
export const DEFAULT_CONSULTATION_SLOT_MINUTES = 60
export const DEFAULT_SLOT_START_HOUR = 9
export const DEFAULT_SLOT_END_HOUR = 17

export type TimeRange = {
  startsAtUtc: Date
  endsAtUtc: Date
}

export const parseUtcDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date")
  }
  return date
}

export const zonedDateTimeToUtc = (date: string, time: string, timeZone = BUSINESS_TIME_ZONE) =>
  fromZonedTime(`${date}T${time}:00`, timeZone)

export const getBusinessDayUtcRange = (date: string, timeZone = BUSINESS_TIME_ZONE): TimeRange => {
  const startsAtUtc = fromZonedTime(`${date}T00:00:00`, timeZone)
  const endsAtUtc = fromZonedTime(`${date}T23:59:59.999`, timeZone)
  return { startsAtUtc, endsAtUtc }
}

export const generateDefaultConsultationSlots = (date: string, timeZone = BUSINESS_TIME_ZONE): TimeRange[] => {
  const slots: TimeRange[] = []

  for (let hour = DEFAULT_SLOT_START_HOUR; hour <= DEFAULT_SLOT_END_HOUR; hour += 1) {
    const startsAtUtc = fromZonedTime(`${date}T${String(hour).padStart(2, "0")}:00:00`, timeZone)
    slots.push({
      startsAtUtc,
      endsAtUtc: addMinutes(startsAtUtc, DEFAULT_CONSULTATION_SLOT_MINUTES),
    })
  }

  return slots
}

export const rangesOverlap = (left: TimeRange, right: TimeRange) =>
  left.startsAtUtc < right.endsAtUtc && left.endsAtUtc > right.startsAtUtc

/**
 * Whether a slot start is still bookable: it must be after now plus the
 * booking lead time. Comparison is on absolute UTC instants, so it is
 * independent of timezone — "current business time" is simply now.
 */
export const isSlotStartBookable = (startsAtUtc: Date | string, now: Date, leadHours: number): boolean => {
  const start = startsAtUtc instanceof Date ? startsAtUtc : parseUtcDate(startsAtUtc)
  return start.getTime() > now.getTime() + leadHours * 60 * 60 * 1000
}

export const formatKathmanduDate = (date: Date | string) =>
  formatInTimeZone(date, BUSINESS_TIME_ZONE, "yyyy-MM-dd")

export const formatKathmanduTime = (date: Date | string) =>
  formatInTimeZone(date, BUSINESS_TIME_ZONE, "HH:mm")

export const getKathmanduDateParts = (date: Date | string) => {
  const zoned = toZonedTime(date, BUSINESS_TIME_ZONE)
  return {
    date: formatKathmanduDate(zoned),
    time: formatKathmanduTime(zoned),
  }
}
