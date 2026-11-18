/**
 * Location-agnostic local calendar date utilities for hotel check-in / check-out.
 * Uses Temporal.PlainDate when natively available, with local calendar Date fallback
 * so `.toISOString()` UTC conversions never shift calendar days across timezones.
 */

/**
 * Normalize a Date to local midnight (00:00:00.000).
 * @param {Date} [date]
 * @returns {Date}
 */
export function startOfLocalDay(date = new Date()) {
  const source = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  return new Date(source.getFullYear(), source.getMonth(), source.getDate());
}

/**
 * Add whole calendar days without UTC/DST millisecond drift.
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addCalendarDays(date, days) {
  const base = startOfLocalDay(date);
  if (typeof globalThis.Temporal !== "undefined") {
    const plain = globalThis.Temporal.PlainDate.from({
      year: base.getFullYear(),
      month: base.getMonth() + 1,
      day: base.getDate(),
    }).add({ days });
    return new Date(plain.year, plain.month - 1, plain.day);
  }
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
}

/**
 * Compute whole calendar days between startDate and endDate (endDate - startDate).
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
export function diffCalendarDays(startDate, endDate) {
  const s = startOfLocalDay(startDate);
  const e = startOfLocalDay(endDate);
  if (typeof globalThis.Temporal !== "undefined") {
    const ps = globalThis.Temporal.PlainDate.from({
      year: s.getFullYear(),
      month: s.getMonth() + 1,
      day: s.getDate(),
    });
    const pe = globalThis.Temporal.PlainDate.from({
      year: e.getFullYear(),
      month: e.getMonth() + 1,
      day: e.getDate(),
    });
    return ps.until(pe, { largestUnit: "days" }).days;
  }
  const utcStart = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const utcEnd = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  return Math.round((utcEnd - utcStart) / 86400000);
}

/**
 * Format a Date as a location-agnostic ISO calendar string (YYYY-MM-DD).
 * @param {Date} date
 * @returns {string}
 */
export function formatPlainDateISO(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  if (typeof globalThis.Temporal !== "undefined") {
    return globalThis.Temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }).toString();
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
