/** Availability engine — pure, bounded, server-side.
 *
 *  Input is deliberately small: one day's open hours, that day's exceptions, the
 *  already-occupied slot set (one indexed range query on booking_slots), and the
 *  booking parameters. There is no per-minute or per-slot database access (contract
 *  §17: one bounded indexed query + in-memory interval calculation).
 */

import {
  addMinutes,
  instantFromLocalMinutes,
  localMinutesOf,
  overlaps,
  weekdayOf,
  zonedTimeToUtc,
} from '../../lib/datetime/timezone';

export type ScheduleExceptionKind =
  | 'holiday'
  | 'closed'
  | 'special_hours'
  | 'blocked_time'
  | 'temporary_change';

export interface HoursSegment {
  /** 'HH:MM' clinic wall clock */
  opensAt: string;
  closesAt: string;
}

export interface HoursRow {
  /** 0 = Saturday … 6 = Friday */
  weekday: number;
  segments: HoursSegment[];
}

export interface ExceptionRow {
  date: string; // 'YYYY-MM-DD'
  kind: ScheduleExceptionKind;
  opensAt: string | null;
  closesAt: string | null;
}

export interface AvailabilityInput {
  localDate: string;
  timezone: string;
  hours: readonly HoursRow[];
  /** Exceptions; the engine filters to `localDate` itself. */
  exceptions: readonly ExceptionRow[];
  durationMinutes: number;
  granularityMinutes: number;
  bufferMinutes: number;
  /** Canonical grid instants already taken for the relevant slot owner. */
  occupiedSlots: ReadonlySet<string>;
  nowIso: string;
  minLeadMinutes: number;
}

export interface AvailabilitySlot {
  startsAt: string;
  endsAt: string;
  available: boolean;
}

export type SlotRejectionReason =
  | 'closed'
  | 'outside_hours'
  | 'too_soon'
  | 'blocked'
  | 'occupied'
  | 'past';

const MAX_SLOTS_PER_DAY = 512; // hard request budget (contract §165)

interface EffectiveDay {
  segments: HoursSegment[];
  blocked: { startsAt: string; endsAt: string }[];
}

/** Reduce regular hours + day exceptions into concrete open segments and blocked ranges. */
export function effectiveDay(
  input: Pick<AvailabilityInput, 'localDate' | 'timezone' | 'hours' | 'exceptions'>,
): EffectiveDay {
  const weekday = weekdayOf(input.localDate);
  const dayExceptions = input.exceptions.filter((exception) => exception.date === input.localDate);

  if (dayExceptions.some((exception) => exception.kind === 'closed' || exception.kind === 'holiday')) {
    return { segments: [], blocked: [] };
  }

  let segments = (input.hours.find((row) => row.weekday === weekday)?.segments ?? []).map(
    (segment) => ({ ...segment }),
  );

  const overrides = dayExceptions.filter(
    (exception) =>
      (exception.kind === 'special_hours' || exception.kind === 'temporary_change') &&
      exception.opensAt !== null &&
      exception.closesAt !== null,
  );
  if (overrides.length > 0) {
    segments = overrides.map((exception) => ({
      opensAt: exception.opensAt as string,
      closesAt: exception.closesAt as string,
    }));
  }

  const blocked = dayExceptions
    .filter(
      (exception) =>
        exception.kind === 'blocked_time' &&
        exception.opensAt !== null &&
        exception.closesAt !== null,
    )
    .map((exception) => ({
      startsAt: zonedTimeToUtc(input.localDate, exception.opensAt as string, input.timezone),
      endsAt: zonedTimeToUtc(input.localDate, exception.closesAt as string, input.timezone),
    }));

  return { segments, blocked };
}

/** Every bookable start for one day, ascending. Only genuinely free slots are returned. */
export function calculateAvailability(input: AvailabilityInput): AvailabilitySlot[] {
  const { localDate, timezone, durationMinutes, granularityMinutes, bufferMinutes } = input;
  const { segments, blocked } = effectiveDay(input);
  const earliestInstant = addMinutes(input.nowIso, input.minLeadMinutes);
  const earliestIdx = localMinutesOf(earliestInstant, timezone);

  const slots: AvailabilitySlot[] = [];

  for (const segment of segments) {
    const segmentStart = zonedTimeToUtc(localDate, segment.opensAt, timezone);
    const segmentEnd = zonedTimeToUtc(localDate, segment.closesAt, timezone);
    if (segmentStart >= segmentEnd) continue;

    const firstIdx = Math.ceil(localMinutesOf(segmentStart, timezone) / granularityMinutes) * granularityMinutes;
    const endIdx = localMinutesOf(segmentEnd, timezone);

    for (let idx = firstIdx; idx < endIdx && slots.length < MAX_SLOTS_PER_DAY; idx += granularityMinutes) {
      if (idx < earliestIdx) continue;
      const startsAt = instantFromLocalMinutes(idx, timezone);
      const endsAt = addMinutes(startsAt, durationMinutes);
      if (Date.parse(endsAt) > Date.parse(segmentEnd)) break;

      if (blocked.some((range) => overlaps(startsAt, endsAt, range.startsAt, range.endsAt))) continue;

      let occupied = false;
      const claimEnd = idx + durationMinutes + bufferMinutes;
      for (let claimIdx = idx; claimIdx < claimEnd; claimIdx += granularityMinutes) {
        if (input.occupiedSlots.has(instantFromLocalMinutes(claimIdx, timezone))) {
          occupied = true;
          break;
        }
      }
      if (occupied) continue;

      slots.push({ startsAt, endsAt, available: true });
    }
  }

  return slots;
}

/** Validate one concrete start time without enumerating the whole day. */
export function validateSlotStart(
  input: AvailabilityInput,
  startsAt: string,
): { ok: true } | { ok: false; reason: SlotRejectionReason } {
  const { timezone, durationMinutes, granularityMinutes, bufferMinutes, localDate } = input;
  const { segments, blocked } = effectiveDay(input);
  const endsAt = addMinutes(startsAt, durationMinutes);

  const idx = localMinutesOf(startsAt, timezone);
  const canonicalIdx = Math.floor(idx / granularityMinutes) * granularityMinutes;
  if (canonicalIdx !== idx) return { ok: false, reason: 'outside_hours' };

  if (Date.parse(startsAt) < Date.parse(input.nowIso)) return { ok: false, reason: 'past' };
  if (Date.parse(startsAt) < Date.parse(addMinutes(input.nowIso, input.minLeadMinutes))) {
    return { ok: false, reason: 'too_soon' };
  }

  const inSegment = segments.some((segment) => {
    const open = zonedTimeToUtc(localDate, segment.opensAt, timezone);
    const close = zonedTimeToUtc(localDate, segment.closesAt, timezone);
    return (
      Date.parse(startsAt) >= Date.parse(open) && Date.parse(endsAt) <= Date.parse(close)
    );
  });
  if (!inSegment) return { ok: false, reason: 'outside_hours' };

  if (blocked.some((range) => overlaps(startsAt, endsAt, range.startsAt, range.endsAt))) {
    return { ok: false, reason: 'blocked' };
  }

  const claimEnd = idx + durationMinutes + bufferMinutes;
  for (let claimIdx = canonicalIdx; claimIdx < claimEnd; claimIdx += granularityMinutes) {
    if (input.occupiedSlots.has(instantFromLocalMinutes(claimIdx, timezone))) {
      return { ok: false, reason: 'occupied' };
    }
  }

  return { ok: true };
}
