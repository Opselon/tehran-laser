import type { BookingEventType, BookingStatus, PricingCategory } from '../booking/booking.types';
import type { Permission, RoleKey } from '../rbac/rbac.types';

/** ── Services & pricing ─────────────────────────────────────── */

export interface ServicePriceDto {
  pricingCategory: PricingCategory;
  amount: number;
  currency: string;
}

/** Public catalog item — internal ids are deliberately not exposed. */
export interface PublicServiceDto {
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  durationMinutes: number;
  featured: boolean;
  displayOrder: number;
  prices: ServicePriceDto[];
}

export interface AdminServiceDto extends PublicServiceDto {
  id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Pricing rows with their row ids — admin pricing reads/writes these (never the public shape). */
export interface AdminPriceDto extends ServicePriceDto {
  id: string;
  serviceId: string;
}

/** ── Availability ───────────────────────────────────────────── */

export interface AvailabilitySlotDto {
  startsAt: string;
  endsAt: string;
  available: boolean;
}

export interface AvailabilityResponseDto {
  serviceSlug: string;
  date: string; // 'YYYY-MM-DD' clinic-local
  pricingCategory: PricingCategory;
  durationMinutes: number;
  granularityMinutes: number;
  timezone: string;
  slots: AvailabilitySlotDto[];
}

/** ── Booking (public) ───────────────────────────────────────── */

export interface PublicBookingSummaryDto {
  reference: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  service: { slug: string; name: string };
  pricingCategory: PricingCategory;
  quotedAmount: number;
  discountAmount: number;
  currency: string;
}

/** ── Booking (admin) ────────────────────────────────────────── */

export interface AdminBookingDto {
  id: string;
  reference: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  pricingCategory: PricingCategory;
  quotedAmount: number;
  discountAmount: number;
  currency: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    pricingCategory: PricingCategory;
  };
  service: { id: string; slug: string; name: string; durationMinutes: number };
  staff: { id: string; name: string } | null;
  customerNote: string | null;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingTimelineDto {
  bookingId: string;
  reference: string;
  events: {
    id: string;
    eventType: BookingEventType;
    actor: string | null;
    detail: string | null;
    createdAt: string;
  }[];
}

export interface TodayItemDto {
  booking: AdminBookingDto;
}

export interface AdminDashboardDto {
  date: string; // clinic-local today
  today: {
    total: number;
    pending: number;
    confirmed: number;
  };
  counts: {
    pendingBookings: number;
    totalCustomers: number;
    activeServices: number;
  };
  todayBookings: AdminBookingDto[];
}

/** ── Customers ──────────────────────────────────────────────── */

export interface CustomerListItemDto {
  id: string;
  name: string;
  phone: string;
  pricingCategory: PricingCategory;
  bookingsCount: number;
  lastBookingAt: string | null;
  email?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface CustomerDetailDto extends CustomerListItemDto {
  email: string | null;
  note: string | null;
  updatedAt: string;
  bookings: AdminBookingDto[];
}

/** ── Staff & schedule ───────────────────────────────────────── */

export interface StaffDto {
  id: string;
  name: string;
  active: boolean;
  serviceIds: string[];
  serviceSlugs?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessSegmentDto {
  opensAt: string; // 'HH:MM'
  closesAt: string; // 'HH:MM'
}

export interface BusinessHoursDto {
  weekday: number; // 0 = Saturday … 6 = Friday
  segments: BusinessSegmentDto[];
}

export interface ScheduleExceptionDto {
  id: string;
  date: string; // 'YYYY-MM-DD'
  kind: 'holiday' | 'closed' | 'special_hours' | 'blocked_time' | 'temporary_change';
  opensAt: string | null;
  closesAt: string | null;
  note: string | null;
}

export interface ScheduleDto {
  hours: BusinessHoursDto[];
  exceptions: ScheduleExceptionDto[];
}

/** ── Blog ───────────────────────────────────────────────────── */

export interface BlogSeoDto {
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
}

export interface PublicBlogPostSummaryDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  author: string | null;
  publishedAt: string | null;
}

export interface PublicBlogPostDto {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string | null;
  author: string | null;
  publishedAt: string;
  seo: BlogSeoDto;
}

export interface AdminBlogPostDto extends BlogSeoDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  categoryId: string | null;
  author: string | null;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategoryDto {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

/** ── FAQ / settings / seo ───────────────────────────────────── */

export interface FaqItemDto {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface PublicSettingsDto {
  [key: string]: string;
}

export interface ClinicInfoDto {
  settings: PublicSettingsDto;
  hours: BusinessHoursDto[];
}

/** Cursor-paginated list envelope. `nextCursor` is an opaque `created_at|id` string. */
export interface PageDto<T> {
  items: T[];
  nextCursor: string | null;
}

export interface AdminSettingsDto {
  public: Record<string, string>;
  private: Record<string, string>;
}

export interface SeoMetadataDto {
  id: string;
  entityType: 'page' | 'service' | 'post';
  entityId: string;
  title: string;
  description: string;
  canonicalUrl: string | null;
  ogImage: string | null;
  noindex: boolean;
  updatedAt: string;
}

/** ── Auth / session ─────────────────────────────────────────── */

export interface MeDto {
  user: {
    id: string;
    email: string;
    displayName: string;
    roles: RoleKey[];
    permissions: Permission[];
  } | null;
}

/** ── Notifications & audit ──────────────────────────────────── */

export interface NotificationEventDto {
  id: string;
  eventType: string;
  channel: 'telegram' | 'whatsapp';
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  lastError: string | null;
  bookingReference: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface AuditLogDto {
  id: string;
  actor: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

/** Convenience aliases for repository row contracts. */
export type AdminBookingRowDto = AdminBookingDto;
export type AdminCustomerRowDto = CustomerListItemDto;
export type AdminStaffDto = StaffDto;
export type AuditLogRowDto = AuditLogDto;
export type NotificationEventRowDto = NotificationEventDto;

/** ── Health ─────────────────────────────────────────────────── */

export interface HealthDto {
  status: 'ok' | 'degraded';
  database: 'ok' | 'error';
  bookingEnabled: boolean;
  migrationsApplied: boolean;
  version: string;
}
