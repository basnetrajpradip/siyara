import { addDays } from "date-fns"
import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

export const BUSINESS_TIME_ZONE = "Asia/Kathmandu"

export function kathmanduDateTimeToUtcIso(date: string, time: string) {
  return fromZonedTime(`${date}T${time}:00`, BUSINESS_TIME_ZONE).toISOString()
}

export function kathmanduDayToUtcRange(date: string) {
  return {
    startsAtUtc: kathmanduDateTimeToUtcIso(date, "00:00"),
    endsAtUtc: kathmanduDateTimeToUtcIso(date, "23:59"),
  }
}

export function kathmanduDateRangeToUtcRange(fromDate: string, toDate: string) {
  return {
    startsAtUtc: kathmanduDateTimeToUtcIso(fromDate, "00:00"),
    endsAtUtc: kathmanduDateTimeToUtcIso(toDate, "23:59"),
  }
}

export function kathmanduDateTimeRangeToUtcRange(date: string, startTime: string, endTime: string) {
  return {
    startsAtUtc: kathmanduDateTimeToUtcIso(date, startTime),
    endsAtUtc: kathmanduDateTimeToUtcIso(date, endTime),
  }
}

export function formatKathmanduDate(date: string | Date) {
  return formatInTimeZone(date, BUSINESS_TIME_ZONE, "MMM d, yyyy")
}

export function formatKathmanduDateInput(date: string | Date) {
  return formatInTimeZone(date, BUSINESS_TIME_ZONE, "yyyy-MM-dd")
}

export function formatKathmanduTime(date: string | Date) {
  return formatInTimeZone(date, BUSINESS_TIME_ZONE, "h:mm a")
}

export function formatKathmanduTimeInput(date: string | Date) {
  return formatInTimeZone(date, BUSINESS_TIME_ZONE, "HH:mm")
}

export function formatKathmanduDateTimeRange(startsAtUtc: string | Date, endsAtUtc: string | Date) {
  const startDate = formatKathmanduDate(startsAtUtc)
  const endDate = formatKathmanduDate(endsAtUtc)
  const startTime = formatKathmanduTime(startsAtUtc)
  const endTime = formatKathmanduTime(endsAtUtc)

  if (startDate === endDate) {
    return `${startDate} · ${startTime} - ${endTime}`
  }

  return `${startDate} ${startTime} - ${endDate} ${endTime}`
}

export function dateToInputValue(date: Date) {
  return formatInTimeZone(date, BUSINESS_TIME_ZONE, "yyyy-MM-dd")
}

export function inputDateToCalendarDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

export function nextKathmanduDate(date: string) {
  return formatKathmanduDateInput(addDays(fromZonedTime(`${date}T00:00:00`, BUSINESS_TIME_ZONE), 1))
}
