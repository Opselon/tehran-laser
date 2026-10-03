/** Booking domain: states, records, events. */

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
  'no_show',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PRICING_CATEGORIES = ['male', 'female'] as const;
export type PricingCategory = (typeof PRICING_CATEGORIES)[number];

export interface Booking {
  id: string;
  reference: string;
  customerId: string;
  serviceId: string;
  staffId: string | null;
  pricingCategory: PricingCategory;
  /** ISO-8601 UTC instant */
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  /** Authoritative server-side quote (already discounted). */
  quotedAmount: number;
  /** Discount portion included in quotedAmount, for display. */
  discountAmount: number;
  currency: string;
  customerNote: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export const BOOKING_EVENT_TYPES = [
  'created',
  'confirmed',
  'rejected',
  'cancelled',
  'rescheduled',
  'completed',
  'no_show',
  'staff_changed',
  'note_updated',
] as const;

export type BookingEventType = (typeof BOOKING_EVENT_TYPES)[number];

export interface BookingEvent {
  id: string;
  bookingId: string;
  eventType: BookingEventType;
  actorId: string | null;
  detail: string | null;
  createdAt: string;
}

/** Persian status labels for UI — server messages stay language-neutral. */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأیید شده',
  rejected: 'رد شده',
  cancelled: 'لغو شده',
  completed: 'انجام شده',
  no_show: 'عدم حضور',
};
