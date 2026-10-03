/** Slot-grid math — the backbone of double-booking protection and availability.
 *
 *  Slots are indexed on the clinic's *local wall clock* (minutes since 1970-01-01 local),
 *  quantised to the configured granularity, then converted back to ISO instants. Because
 *  every write canonicalises the same way, `booking_slots(staff_key, slot_start)` behaves
 *  as an exclusion constraint in plain SQLite/D1 (which has no EXCLUDE constraint).
 */

import { addMinutes, instantFromLocalMinutes, localMinutesOf } from '../../lib/datetime/timezone';

/** Slot owner for bookings with no assigned staff. */
export const CLINIC_SLOT_OWNER = 'clinic';

export function staffSlotKey(staffId: string | null): string {
  return staffId ? `staff:${staffId}` : CLINIC_SLOT_OWNER;
}

function quantise(localMinutes: number, granularityMinutes: number): number {
  return Math.floor(localMinutes / granularityMinutes) * granularityMinutes;
}

/** Canonical grid instant for any moment (floor to the granularity grid). */
export function canonicalSlotStart(
  instantIso: string,
  timezone: string,
  granularityMinutes: number,
): string {
  return instantFromLocalMinutes(
    quantise(localMinutesOf(instantIso, timezone), granularityMinutes),
    timezone,
  );
}

export interface OccupiedSlotsInput {
  startsAt: string;
  durationMinutes: number;
  /** Extra spacing claimed after the service (settings.booking_buffer_minutes). */
  bufferMinutes: number;
  timezone: string;
  granularityMinutes: number;
}

/** Every grid slot a booking occupies: [startsAt, startsAt + duration + buffer). */
export function occupiedSlotStarts(input: OccupiedSlotsInput): string[] {
  const { startsAt, durationMinutes, bufferMinutes, timezone, granularityMinutes } = input;
  const startIdx = quantise(localMinutesOf(startsAt, timezone), granularityMinutes);
  const endIdx = localMinutesOf(addMinutes(startsAt, durationMinutes + bufferMinutes), timezone);
  const slots: string[] = [];
  // Bounded loop: at most (duration+buffer)/granularity + 1 iterations.
  for (let idx = startIdx; idx < endIdx; idx += granularityMinutes) {
    slots.push(instantFromLocalMinutes(idx, timezone));
  }
  if (slots.length === 0) {
    slots.push(instantFromLocalMinutes(startIdx, timezone));
  }
  return slots;
}

/** True when the booking would claim a slot already held in `occupied`. */
export function conflictsWithOccupied(
  input: OccupiedSlotsInput,
  occupied: ReadonlySet<string>,
): boolean {
  if (occupied.size === 0) return false;
  return occupiedSlotStarts(input).some((slot) => occupied.has(slot));
}

/** Human-friendly booking reference, e.g. 'TL-8F4K2'.
 *  Collisions are resolved by retrying against the UNIQUE index on bookings.reference. */
const REFERENCE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford, no I/L/O/U

export function generateReference(random: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += REFERENCE_ALPHABET[Math.floor(random() * REFERENCE_ALPHABET.length)] ?? '0';
  }
  return `TL-${code}`;
}
