import type { Booking, BookingStatus, PricingCategory } from './booking.types';

/** Server-authoritative quote. The client never supplies any of these. */
export interface BookingQuote {
  serviceId: string;
  pricingCategory: PricingCategory;
  baseAmount: number;
  discountPercent: number;
  discountAmount: number;
  /** Final amount charged/quoted: baseAmount - discountAmount. */
  totalAmount: number;
  currency: string;
  durationMinutes: number;
}

/** Hard-rule transition table. See canTransitionBookingState(). */
export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  rejected: [],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function canTransitionBookingState(current: BookingStatus, next: BookingStatus): boolean {
  if (current === next) return false;
  return BOOKING_TRANSITIONS[current].includes(next);
}

export type BookingAction = 'accept' | 'reject' | 'cancel' | 'reschedule' | 'complete' | 'no_show';

export const BOOKING_ACTION_TARGET: Record<BookingAction, BookingStatus> = {
  accept: 'confirmed',
  reject: 'rejected',
  cancel: 'cancelled',
  complete: 'completed',
  no_show: 'no_show',
  reschedule: 'confirmed',
};

/** What a reschedule does to status: a pending booking stays pending,
 *  a confirmed booking stays confirmed. */
export const RESCHEDULE_KEEPS_STATUS: readonly BookingStatus[] = ['pending', 'confirmed'];

export function bookingIsCancellable(booking: Pick<Booking, 'status'>): boolean {
  return canTransitionBookingState(booking.status, 'cancelled');
}
