/** Response helpers — one envelope for every /api/v1 reply (contract §6). */

import type { ZodType } from 'zod';
import type { ApiErrorCode, ApiResponse } from '../../domain/shared/api.types';
import { ApiError } from './errors';

export function ok<T>(data: T, meta: Record<string, unknown> = {}): Response {
  const body: ApiResponse<T> = { data, error: null, meta };
  return json(body, 200);
}

export function okWithStatus<T>(data: T, status: number, meta: Record<string, unknown> = {}): Response {
  const body: ApiResponse<T> = { data, error: null, meta };
  return json(body, status);
}

export function fail(
  code: ApiErrorCode,
  message: string,
  options: { fields?: Record<string, string[]>; meta?: Record<string, unknown>; status?: number } = {},
): Response {
  const body: ApiResponse<null> = {
    data: null,
    error: options.fields ? { code, message, fields: options.fields } : { code, message },
    meta: options.meta ?? {},
  };
  const status = options.status ?? new ApiError(code, message).status;
  return json(body, status);
}

export function json(body: unknown, status: number, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

/** Parse JSON body with a schema; throws ApiError(VALIDATION_ERROR) with field messages. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError('BAD_REQUEST', 'بدنه درخواست معتبر نیست.');
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError('VALIDATION_ERROR', 'اطلاعات واردشده معتبر نیست.', {
      fields: zodFieldErrors(result.error.issues),
    });
  }
  return result.data;
}

/** Parse URL query params with a schema (same error contract as parseBody). */
export function parseQuery<T>(url: URL, schema: ZodType<T>): T {
  const record: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    record[key] = value;
  });
  const result = schema.safeParse(record);
  if (!result.success) {
    throw new ApiError('VALIDATION_ERROR', 'پارامترهای درخواست معتبر نیست.', {
      fields: zodFieldErrors(result.error.issues),
    });
  }
  return result.data;
}

export function zodFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_';
    const list = fields[key] ?? (fields[key] = []);
    if (!list.includes(issue.message)) list.push(issue.message);
  }
  return fields;
}

/**
 * Wrap a route handler: converts ApiError / unknown failures into the envelope,
 * never leaking stack traces or internals (contract §6).
 */
export function handleRoute(handler: () => Promise<Response>): Promise<Response> {
  return handler().catch((error: unknown): Response => {
    if (error instanceof ApiError) {
      return fail(error.code, error.message, {
        ...(error.fields ? { fields: error.fields } : {}),
        meta: error.meta,
        status: error.status,
      });
    }
    // Log the real cause server-side only.
    console.error('[api] unhandled error', error instanceof Error ? error.message : String(error));
    return fail('INTERNAL_ERROR', 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
  });
}
