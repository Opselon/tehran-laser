/** One typed API client for all browser code (contract §245).
 *  Every call understands the ApiSuccess/ApiFailure envelope and surfaces a typed error,
 *  so components never hand-roll fetch or parse JSON ad hoc. */

import type { ApiErrorCode } from '../../domain/shared/api.types';

export class ApiClientError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields: Record<string, string[]> | undefined;

  constructor(
    code: ApiErrorCode,
    message: string,
    status: number,
    fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** Appended to the response `meta` handling — e.g. 'no-store' default kept. */
  headers?: Record<string, string>;
}

/** True when the browser reports no connectivity (drives offline UX, §48). */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, headers = {} } = options;

  if (isOffline()) {
    throw new ApiClientError(
      'INTERNAL_ERROR',
      'اتصال اینترنت برقرار نیست. لطفاً دوباره تلاش کنید.',
      0,
    );
  }

  const requestInit: RequestInit = {
    method,
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
  };
  if (body !== undefined) requestInit.body = JSON.stringify(body);
  if (signal) requestInit.signal = signal;

  let response: Response;
  try {
    response = await fetch(path, requestInit);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiClientError(
      'INTERNAL_ERROR',
      'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.',
      0,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiClientError('INTERNAL_ERROR', 'پاسخ نامعتبر از سرور.', response.status);
  }

  const envelope = payload as
    | { data: T; error: null; meta?: Record<string, unknown> }
    | { data: null; error: { code: ApiErrorCode; message: string; fields?: Record<string, string[]> } };

  if (envelope && typeof envelope === 'object' && 'error' in envelope && envelope.error) {
    throw new ApiClientError(
      envelope.error.code,
      envelope.error.message,
      response.status,
      envelope.error.fields,
    );
  }

  if (!response.ok) {
    throw new ApiClientError('INTERNAL_ERROR', 'خطایی رخ داد.', response.status);
  }

  return (envelope as { data: T }).data;
}

/** Small helpers so callers read like the endpoint itself. */
export const api = {
  get: <T>(path: string, signal?: AbortSignal): Promise<T> =>
    apiRequest<T>(path, signal ? { signal } : {}),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiRequest<T>(path, { method: 'POST', ...(body !== undefined ? { body } : {}) }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    apiRequest<T>(path, { method: 'PUT', ...(body !== undefined ? { body } : {}) }),
  delete: <T>(path: string): Promise<T> => apiRequest<T>(path, { method: 'DELETE' }),
};
