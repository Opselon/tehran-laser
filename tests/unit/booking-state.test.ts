import { describe, expect, it } from 'vitest';
import {
  BOOKING_STATUSES,
  type BookingStatus,
} from '../../src/domain/booking/booking.types';
import { canTransitionBookingState } from '../../src/domain/booking/booking.state';

/** Exhaustive 6×6 transition matrix — every pair is asserted explicitly. */
const EXPECTED: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  rejected: [],
  cancelled: [],
  completed: [],
  no_show: [],
};

describe('canTransitionBookingState', () => {
  it('accepts exactly the allowed transitions and nothing else', () => {
    for (const current of BOOKING_STATUSES) {
      for (const next of BOOKING_STATUSES) {
        const allowed = EXPECTED[current].includes(next);
        expect(
          canTransitionBookingState(current, next),
          `${current} → ${next} should be ${allowed ? 'allowed' : 'rejected'}`,
        ).toBe(allowed);
      }
    }
  });

  it('never allows a no-op transition to the same status', () => {
    for (const status of BOOKING_STATUSES) {
      expect(canTransitionBookingState(status, status)).toBe(false);
    }
  });

  it('keeps terminal states terminal', () => {
    for (const terminal of ['rejected', 'cancelled', 'completed', 'no_show'] as const) {
      for (const next of BOOKING_STATUSES) {
        expect(canTransitionBookingState(terminal, next)).toBe(false);
      }
    }
  });
});
