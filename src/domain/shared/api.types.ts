/** Canonical API envelope — every /api/v1 response uses exactly this shape. */

export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'BOOKING_CONFLICT'
  | 'BOOKING_DISABLED'
  | 'INVALID_BOOKING_STATUS'
  | 'SERVICE_INACTIVE'
  | 'SLOT_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'INTEGRATION_FAILURE'
  | 'INTERNAL_ERROR';

export interface ApiSuccess<T> {
  data: T;
  error: null;
  meta: Record<string, unknown>;
}

export interface ApiFailure {
  data: null;
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string[]>;
  };
  meta: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PageMeta {
  limit: number;
  cursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface Paginated<T> {
  items: T[];
  page: PageMeta;
}
