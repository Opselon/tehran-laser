/**
 * Typed client for the operator API (`/api/v1/admin/operators`).
 *
 * One rule: the dashboard never builds a domain object on its own. Every write
 * goes to the server and the server's DTO replaces the local copy, so the UI can
 * never drift from the permission/validation rules. Failures arrive as
 * `ApiClientError` carrying the same `fields` map the form renders inline.
 */

import type {
  OperatorAgendaItem,
  OperatorCapabilities,
  OperatorCreateInput,
  OperatorDto,
  OperatorListMeta,
} from '../../../domain/operators/operators';
import type { OperatorStatsDto } from '../../../domain/operators/operators';
import type { OperatorRoleKey, OperatorStatus } from '../../../domain/operators/catalog';
import type { RoleKey } from '../../../domain/rbac/rbac.types';

export interface ApiEnvelope<T> {
  data: T | null;
  error: { code: string; message: string; fields?: Record<string, string[]> } | null;
  meta: Record<string, unknown>;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: Record<string, string[]>;

  constructor(
    message: string,
    code: string,
    status: number,
    fields: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }

  /** First message for a field, if the server blamed one. */
  fieldError(field: string): string | undefined {
    return this.fields[field]?.[0];
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      headers: {
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        'x-requested-with': 'tehran-laser-dashboard',
        ...(init.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new ApiClientError('ارتباط با سرور برقرار نشد. اتصال شبکه را بررسی کنید.', 'NETWORK', 0);
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    body = null;
  }

  if (!response.ok || !body || body.error) {
    throw new ApiClientError(
      body?.error?.message ?? 'خطای غیرمنتظره در سرور رخ داد.',
      body?.error?.code ?? 'INTERNAL_ERROR',
      response.status,
      body?.error?.fields ?? {},
    );
  }

  return body.data as T;
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

/* ── Read shapes ─────────────────────────────────────────────────────── */

export interface RosterFilters {
  q?: string;
  role?: OperatorRoleKey | 'all';
  status?: OperatorStatus | 'all';
  serviceId?: string;
  weekday?: number | null;
  sort?: string;
}

export interface RosterResponse {
  items: OperatorDto[];
  meta: OperatorListMeta;
  today: { weekday: number; label: string; localDate: string };
  capabilities: OperatorCapabilities;
}

export interface CatalogRole {
  key: OperatorRoleKey;
  label: string;
  icon: string;
  accent: string;
  hint: string;
  defaultTitle: string;
  accessRole: RoleKey;
}

export interface OperatorCatalog {
  roles: CatalogRole[];
  workdays: ReadonlyArray<{ index: number; label: string; short: string; en: string }>;
  accents: ReadonlyArray<{ hex: string; label: string }>;
  templates: ReadonlyArray<{
    key: string;
    label: string;
    description: string;
    roleKey: OperatorRoleKey;
    workdays: number[];
    shiftStart: string;
    shiftEnd: string;
    commissionPercent: number;
  }>;
  shifts: ReadonlyArray<{ label: string; start: string; end: string }>;
  statuses: ReadonlyArray<{ key: OperatorStatus; label: string }>;
  sorts: ReadonlyArray<{ key: string; label: string }>;
  teamRoles: ReadonlyArray<{
    key: RoleKey;
    name: string;
    description: string;
    permissions: string[];
  }>;
}

export interface CoverageResponse {
  weekday: number;
  label: string;
  segments: Array<{ start: string; end: string; count: number; operators: string[] }>;
  hourly: number[];
  roster: Array<{
    id: string;
    displayName: string;
    initials: string;
    avatarColor: string;
    roleLabel: string;
    shiftStart: string;
    shiftEnd: string;
  }>;
}

export interface OperatorDetailResponse {
  operator: OperatorDto;
  stats: OperatorStatsDto;
  agenda: OperatorAgendaItem[];
  unassigned: OperatorAgendaItem[];
  today: { weekday: number; label: string; localDate: string };
}

export interface IssuedAccountResponse {
  account: {
    mode: 'created' | 'reset';
    userId: string;
    email: string;
    temporaryPassword: string | null;
    roles: RoleKey[];
  };
  operator: OperatorDto | null;
}

/* ── Reads ───────────────────────────────────────────────────────────── */

export function fetchRoster(filters: RosterFilters = {}): Promise<RosterResponse> {
  return request<RosterResponse>(
    `/api/v1/admin/operators${qs({
      q: filters.q,
      role: filters.role === 'all' ? undefined : filters.role,
      status: filters.status === 'all' ? undefined : filters.status,
      serviceId: filters.serviceId,
      weekday: filters.weekday ?? undefined,
      sort: filters.sort,
    })}`,
  );
}

export function fetchCatalog(): Promise<OperatorCatalog> {
  return request<OperatorCatalog>('/api/v1/admin/operators/catalog');
}

export function fetchCoverage(weekday?: number): Promise<CoverageResponse> {
  return request<CoverageResponse>(`/api/v1/admin/operators/coverage${qs({ weekday })}`);
}

export function fetchOperator(id: string): Promise<OperatorDetailResponse> {
  return request<OperatorDetailResponse>(`/api/v1/admin/operators/${encodeURIComponent(id)}`);
}

export function fetchStats(id: string, days = 30): Promise<{ stats: OperatorStatsDto }> {
  return request<{ stats: OperatorStatsDto }>(
    `/api/v1/admin/operators/${encodeURIComponent(id)}/stats${qs({ days })}`,
  );
}

export function fetchAgenda(
  id: string,
  date: string,
): Promise<{ localDate: string; items: OperatorAgendaItem[] }> {
  return request<{ localDate: string; items: OperatorAgendaItem[] }>(
    `/api/v1/admin/operators/${encodeURIComponent(id)}/agenda${qs({ date })}`,
  );
}

export function fetchUnassigned(
  date: string,
): Promise<{ localDate: string; items: OperatorAgendaItem[] }> {
  return request<{ localDate: string; items: OperatorAgendaItem[] }>(
    `/api/v1/admin/sessions/unassigned${qs({ date })}`,
  );
}

export function fetchSnapshot(): Promise<{
  total: number;
  active: number;
  onShiftToday: number;
  weekday: number;
  localDate: string;
}> {
  return request('/api/v1/admin/operators/snapshot');
}

/* ── Writes ──────────────────────────────────────────────────────────── */

export function createOperator(payload: OperatorCreateInput): Promise<{ operator: OperatorDto }> {
  return request('/api/v1/admin/operators', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateOperator(
  id: string,
  payload: Partial<OperatorCreateInput> & { sortOrder?: number },
): Promise<{ operator: OperatorDto }> {
  return request(`/api/v1/admin/operators/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function setOperatorActive(id: string, active: boolean): Promise<{ operator: OperatorDto }> {
  return request(`/api/v1/admin/operators/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ active }),
  });
}

export function archiveOperator(id: string): Promise<{ id: string; archived: true }> {
  return request(`/api/v1/admin/operators/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function deleteOperatorPermanently(id: string): Promise<{ id: string; deleted: true }> {
  return request(`/api/v1/admin/operators/${encodeURIComponent(id)}?hard=1`, { method: 'DELETE' });
}

export function restoreOperator(id: string): Promise<{ operator: OperatorDto }> {
  return request(`/api/v1/admin/operators/${encodeURIComponent(id)}/restore`, { method: 'POST' });
}

export function reorderOperators(
  order: Array<{ id: string; sortOrder: number }>,
): Promise<{ items: OperatorDto[]; meta: OperatorListMeta }> {
  return request('/api/v1/admin/operators/reorder', {
    method: 'POST',
    body: JSON.stringify({ order }),
  });
}

export function issueAccount(
  id: string,
  payload: {
    email?: string | undefined;
    role?: RoleKey | undefined;
    password?: string | undefined;
  },
): Promise<IssuedAccountResponse> {
  return request(`/api/v1/admin/operators/${encodeURIComponent(id)}/account`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function assignBookingOperator(
  bookingId: string,
  operatorId: string | null,
): Promise<{ bookingId: string; operatorId: string | null; operatorName: string | null }> {
  return request(`/api/v1/admin/bookings/${encodeURIComponent(bookingId)}/operator`, {
    method: 'POST',
    body: JSON.stringify({ operatorId }),
  });
}

export function updateOwnProfile(payload: {
  phone?: string | undefined;
  email?: string | null | undefined;
  bio?: string | null | undefined;
  title?: string | undefined;
  avatarColor?: string | undefined;
}): Promise<{ operator: OperatorDto | null }> {
  return request('/api/v1/me/operator', { method: 'PATCH', body: JSON.stringify(payload) });
}
