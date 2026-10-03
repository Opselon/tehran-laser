/** Typed API error carried through the server layer and mapped to a safe HTTP response. */

import type { ApiErrorCode } from '../../domain/shared/api.types';

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  AUTH_REQUIRED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 422,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  BOOKING_CONFLICT: 409,
  BOOKING_DISABLED: 409,
  INVALID_BOOKING_STATUS: 409,
  SERVICE_INACTIVE: 409,
  SLOT_UNAVAILABLE: 409,
  RATE_LIMITED: 429,
  INTEGRATION_FAILURE: 502,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields: Record<string, string[]> | undefined;
  /** Machine-safe extra payload for the `meta` bag (never free-form internals). */
  readonly meta: Record<string, unknown>;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: {
      fields?: Record<string, string[]>;
      meta?: Record<string, unknown>;
      status?: number;
    } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = options.status ?? STATUS_BY_CODE[code];
    this.fields = options.fields;
    this.meta = options.meta ?? {};
  }
}

export function statusForCode(code: ApiErrorCode): number {
  return STATUS_BY_CODE[code];
}
