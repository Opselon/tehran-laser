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

/** Laser devices the clinic runs. Prices are per (service × category × device)
 *  — migration 0016 added the device dimension (Rado Plus was the only device
 *  until then; Deka is shot-based «شاتی»). */
export const DEVICES = ['rado', 'deka'] as const;
export type Device = (typeof DEVICES)[number];

/** Persian device labels for UI — server messages stay language-neutral. */
export const DEVICE_LABELS: Record<Device, string> = {
  rado: 'رادو پلاس',
  deka: 'دکا',
};

export interface Booking {
  id: string;
  reference: string;
  customerId: string;
  serviceId: string;
  staffId: string | null;
  pricingCategory: PricingCategory;
  /** Laser device the reservation is for (migration 0016; 'rado' before then). */
  device: Device;
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
