/** Timezone-correct wall-clock math for the clinic timezone (no Node APIs — works in workerd).
 *
 *  Conventions:
 *   * instants are ISO-8601 UTC strings
 *   * local dates are 'YYYY-MM-DD' in the clinic timezone
 *   * times of day are 'HH:MM' wall clock
 */

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export interface WallClock {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
}

/** Wall-clock parts of an instant in the given timezone. */
export function wallClockOf(instantIso: string, timeZone: string): WallClock {
  const instant = new Date(instantIso);
  if (Number.isNaN(instant.getTime())) throw new Error(`Invalid instant: ${instantIso}`);
  const parts = formatterFor(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type);
    return part ? Number.parseInt(part.value, 10) : 0;
  };
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    // Some engines render midnight as hour '24'.
    hour: read('hour') % 24,
    minute: read('minute'),
  };
}

/** Offset (ms) of `timeZone` from UTC at the given instant. */
export function timezoneOffsetMs(instant: Date, timeZone: string): number {
  const wall = wallClockOf(instant.toISOString(), timeZone);
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, instant.getUTCSeconds(), instant.getUTCMilliseconds());
  return asUtc - instant.getTime();
}

/** 'YYYY-MM-DD' local date of an instant. */
export function localDateOf(instantIso: string, timeZone: string): string {
  const wall = wallClockOf(instantIso, timeZone);
  return `${String(wall.year).padStart(4, '0')}-${String(wall.month).padStart(2, '0')}-${String(wall.day).padStart(2, '0')}`;
}

/** Iranian weekday for a local date: 0 = Saturday … 6 = Friday. */
export function weekdayOf(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  const utcDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday … 6 = Saturday
  return (utcDay + 1) % 7;
}

/** Minutes since the local midnight of 1970-01-01, in wall-clock terms.
 *  Slot grids are built on this axis so alignment never depends on UTC offsets. */
export function localMinutesOf(instantIso: string, timeZone: string): number {
  const wall = wallClockOf(instantIso, timeZone);
  return Math.round(Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute) / MS_PER_MINUTE);
}

/** Inverse of localMinutesOf: the instant whose wall clock equals those minutes. */
export function instantFromLocalMinutes(minutes: number, timeZone: string): string {
  const wallMs = minutes * MS_PER_MINUTE;
  const guess = new Date(wallMs);
  const firstOffset = timezoneOffsetMs(guess, timeZone);
  let result = wallMs - firstOffset;
  const secondOffset = timezoneOffsetMs(new Date(result), timeZone);
  if (secondOffset !== firstOffset) result = wallMs - secondOffset;
  return new Date(result).toISOString();
}

/** Convert a local date + 'HH:MM' wall time into an ISO instant. */
export function zonedTimeToUtc(localDate: string, timeOfDay: string, timeZone: string): string {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  const [hh, mm] = timeOfDay.split(':').map(Number) as [number, number];
  const minutes = Math.round(Date.UTC(y, m - 1, d, hh, mm) / MS_PER_MINUTE);
  return instantFromLocalMinutes(minutes, timeZone);
}

/** 'YYYY-MM-DD' + N days (pure calendar arithmetic, immune to DST). */
export function addDays(localDate: string, days: number): string {
  const [y, m, d] = localDate.split('-').map(Number) as [number, number, number];
  const next = new Date(Date.UTC(y, m - 1, d) + days * MS_PER_DAY);
  return `${String(next.getUTCFullYear()).padStart(4, '0')}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`;
}

/** Add minutes to an instant. */
export function addMinutes(instantIso: string, minutes: number): string {
  return new Date(Date.parse(instantIso) + minutes * MS_PER_MINUTE).toISOString();
}

/** Whole minutes between two instants (b - a). */
export function minutesBetween(aIso: string, bIso: string): number {
  return Math.round((Date.parse(bIso) - Date.parse(aIso)) / MS_PER_MINUTE);
}

/** True when [aStart, aEnd) overlaps [bStart, bEnd). */
export function overlaps(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
}
