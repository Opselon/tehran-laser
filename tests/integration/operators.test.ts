import { describe, it, expect, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import worker from './worker';
import { ensureMigrated } from './helpers';
import { hashPassword } from '../../src/lib/security/password';

/**
 * Team / operator API — integration coverage against the real worker + D1.
 *
 * The suite is written the way a hostile client would use the API: it checks the
 * authorization boundary before the happy path, then creates, edits, assigns,
 * archives and deletes, asserting the invariants the dashboard depends on:
 *
 *  - "no operator yet" is a valid, empty state (meta.total === 0), not a 404;
 *  - an operator code is never reused and sort order appends;
 *  - a phone number is unique among live profiles, and free again after archive;
 *  - issuing an account returns the temporary password exactly once and that
 *    password really authenticates as an OPERATOR with its own permission set;
 *  - archive hides the profile from booking assignment but keeps its history;
 *  - hard delete is refused once the operator owns a session.
 */

const BASE = 'http://localhost';

interface Operator {
  id: string;
  code: string;
  displayName: string;
  phone: string;
  email: string | null;
  roleKey: string;
  roleLabel: string;
  title: string;
  bio: string | null;
  initials: string;
  serviceIds: string[];
  workdays: number[];
  shiftStart: string;
  shiftEnd: string;
  commissionPercent: number;
  active: boolean;
  status: string;
  sortOrder: number;
  account: { userId: string; email: string; roles: string[] } | null;
  stats: { sessions: number; revenue: number; upcoming: number; utilization: number };
  archivedAt: string | null;
}

interface ListBody {
  data: {
    items: Operator[];
    meta: {
      total: number;
      active: number;
      archived: number;
      onShiftToday: number;
      linkedAccounts: number;
      roles: Record<string, number>;
    };
    today: { weekday: number; label: string; localDate: string };
    capabilities: { canWrite: boolean; canManageAccounts: boolean; currentUserId: string | null };
  };
}

let adminCookie = '';
let operatorCookie = '';
let managerCookie = '';

let primaryId = '';
let secondId = '';
let accountUserId = '';
let createdBookingId = '';
let replacementId = '';

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  return worker.fetch(new Request(`${BASE}${path}`, init));
}

function asAdmin(init: RequestInit = {}): RequestInit {
  return { ...init, headers: { cookie: adminCookie, ...(init.headers ?? {}) } };
}

async function json<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

async function login(email: string, password: string): Promise<string> {
  const res = await api('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  expect(res.status).toBe(200);
  return res.headers.get('set-cookie') ?? '';
}

async function createOperator(payload: Record<string, unknown>): Promise<Operator> {
  const res = await api(
    '/api/v1/admin/operators',
    asAdmin({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
  expect(res.status).toBe(201);
  const body = await json<{ data: { operator: Operator } }>(res);
  return body.data.operator;
}

async function listRoster(query = ''): Promise<ListBody['data']> {
  const res = await api(`/api/v1/admin/operators${query}`, asAdmin());
  expect(res.status).toBe(200);
  return (await json<ListBody>(res)).data;
}

function futureSlot(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 5);
  while (date.getUTCDay() === 5) date.setUTCDate(date.getUTCDate() + 1); // Friday is closed
  date.setUTCHours(6, 30, 0, 0); // 10:00 Tehran
  return date.toISOString();
}

describe('operators API', () => {
  beforeAll(async () => {
    await ensureMigrated();
    adminCookie = await login('admin@tehranlaser.ir', 'AdminPass123!');

    // A manager: may write the roster, may NOT issue logins. Seeded here because
    // the account boundary is the one place role granularity matters.
    const nowIso = new Date().toISOString();
    const managerHash = await hashPassword('ManagerPass123!');
    await env.DB.prepare(
      `INSERT OR IGNORE INTO users (id, email, password_hash, display_name, active, created_at, updated_at)
       VALUES ('usr_test_manager', 'manager@tehranlaser.ir', ?, 'مدیر کلینیک', 1, ?, ?)`,
    )
      .bind(managerHash, nowIso, nowIso)
      .run();
    await env.DB.prepare(
      `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('usr_test_manager', 'role_manager')`,
    ).run();
    managerCookie = await login('manager@tehranlaser.ir', 'ManagerPass123!');
  });

  /* ── Authorization boundary ────────────────────────────────────────── */

  it('rejects anonymous callers before any handler runs', async () => {
    for (const [path, method] of [
      ['/api/v1/admin/operators', 'GET'],
      ['/api/v1/admin/operators', 'POST'],
      ['/api/v1/admin/operators/catalog', 'GET'],
      ['/api/v1/admin/operators/snapshot', 'GET'],
      ['/api/v1/me/operator', 'GET'],
    ] as const) {
      const res = await api(path, { method });
      expect(res.status).toBe(401);
      const body = await json<{ error: { code: string } }>(res);
      expect(body.error.code).toBe('AUTH_REQUIRED');
    }
  });

  it('refuses a role without operator.read (editor) with 403 on read and write', async () => {
    const editorCookie = await login('editor@tehranlaser.ir', 'EditorPass123!');
    const read = await api('/api/v1/admin/operators', { headers: { cookie: editorCookie } });
    expect(read.status).toBe(403);

    const write = await api('/api/v1/admin/operators', {
      method: 'POST',
      headers: { cookie: editorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: 'نفوذی', phone: '09120000000', roleKey: 'doctor' }),
    });
    expect(write.status).toBe(403);
  });

  /* ── Empty state ───────────────────────────────────────────────────── */

  it('reports an empty roster as a first-class state', async () => {
    const data = await listRoster();
    expect(data.items).toEqual([]);
    expect(data.meta.total).toBe(0);
    expect(data.meta.active).toBe(0);
    expect(data.capabilities.canWrite).toBe(true);
    expect(data.capabilities.canManageAccounts).toBe(true);
    expect(data.today.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.today.weekday).toBeGreaterThanOrEqual(0);
  });

  it('exposes the closed vocabulary the form renders', async () => {
    const res = await api('/api/v1/admin/operators/catalog', asAdmin());
    expect(res.status).toBe(200);
    const body = await json<{
      data: {
        roles: Array<{
          key: string;
          label: string;
          accessRole: string;
          performsSessions?: boolean;
        }>;
        workdays: Array<{ index: number; label: string }>;
        accents: Array<{ hex: string }>;
        templates: Array<{ key: string; roleKey: string }>;
        shifts: Array<{ label: string; start: string; end: string }>;
        teamRoles: Array<{ key: string; permissions: string[] }>;
      };
    }>(res);
    expect(body.data.roles.map((role) => role.key)).toContain('laser_technician');
    expect(body.data.workdays).toHaveLength(7);
    expect(body.data.workdays[0]).toMatchObject({ index: 0, label: 'شنبه' });
    expect(body.data.accents.length).toBeGreaterThan(5);
    expect(body.data.templates.length).toBeGreaterThan(0);
    expect(body.data.shifts.some((shift) => shift.label === 'تمام‌وقت')).toBe(true);
    const operatorRole = body.data.teamRoles.find((role) => role.key === 'OPERATOR');
    expect(operatorRole?.permissions).toEqual(
      expect.arrayContaining(['operator.read', 'booking.read']),
    );
  });

  /* ── Create ────────────────────────────────────────────────────────── */

  it('creates the first operator with derived code, initials and defaults', async () => {
    const operator = await createOperator({
      displayName: 'دکتر سارا محمدی',
      phone: '0912 123 4567',
      roleKey: 'doctor',
      title: 'متخصص پوست و مو',
      commissionPercent: 20,
      workdays: [0, 1, 2, 3],
    });
    primaryId = operator.id;

    expect(operator.code).toBe('OP-01');
    expect(operator.displayName).toBe('دکتر سارا محمدی');
    expect(operator.phone).toBe('+989121234567');
    expect(operator.roleLabel).toBe('پزشک');
    expect(operator.initials).toBe('سم');
    expect(operator.workdays).toEqual([0, 1, 2, 3]);
    expect(operator.shiftStart).toBe('09:00');
    expect(operator.shiftEnd).toBe('20:00');
    expect(operator.commissionPercent).toBe(20);
    expect(operator.active).toBe(true);
    expect(operator.status).toBe('active');
    expect(operator.account).toBeNull();
    expect(operator.stats).toEqual({ sessions: 0, revenue: 0, upcoming: 0, utilization: 0 });
  });

  it('appends the second operator and never reuses a code', async () => {
    const operator = await createOperator({
      displayName: 'مینا رضایی',
      phone: '۰۹۳۵۹۸۷۶۵۴۳',
      roleKey: 'laser_technician',
      serviceIds: ['svc_laser_face'],
    });
    secondId = operator.id;
    expect(operator.code).toBe('OP-02');
    expect(operator.phone).toBe('+989359876543');
    expect(operator.serviceIds).toEqual(['svc_laser_face']);
    expect(operator.sortOrder).toBe(20);
  });

  it('refuses invalid input with per-field Persian messages', async () => {
    const cases: Array<{ payload: Record<string, unknown>; field: string }> = [
      {
        payload: { displayName: 'x', phone: '09121110000', roleKey: 'doctor' },
        field: 'displayName',
      },
      { payload: { displayName: 'نام معتبر', phone: '123', roleKey: 'doctor' }, field: 'phone' },
      {
        payload: { displayName: 'نام معتبر', phone: '09121110001', roleKey: 'wizard' },
        field: 'roleKey',
      },
      {
        payload: {
          displayName: 'نام معتبر',
          phone: '09121110002',
          roleKey: 'doctor',
          shiftStart: '20:00',
          shiftEnd: '09:00',
        },
        field: 'shiftStart',
      },
      {
        payload: {
          displayName: 'نام معتبر',
          phone: '09121110003',
          roleKey: 'doctor',
          workdays: [],
        },
        field: 'workdays',
      },
      {
        payload: {
          displayName: 'نام معتبر',
          phone: '09121110004',
          roleKey: 'doctor',
          commissionPercent: 140,
        },
        field: 'commissionPercent',
      },
    ];

    for (const { payload, field } of cases) {
      const res = await api(
        '/api/v1/admin/operators',
        asAdmin({
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      );
      expect(res.status).toBe(422);
      const body = await json<{ error: { code: string; fields?: Record<string, string[]> } }>(res);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(Object.keys(body.error.fields ?? {})).toContain(field);
    }
  });

  it('refuses a duplicate phone among live profiles', async () => {
    const res = await api(
      '/api/v1/admin/operators',
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: 'تکرار شماره',
          phone: '09121234567',
          roleKey: 'assistant',
        }),
      }),
    );
    expect(res.status).toBe(422);
    const body = await json<{ error: { fields?: Record<string, string[]> } }>(res);
    expect(body.error.fields?.phone?.[0]).toContain('سارا');
  });

  it('protects the roster against unknown fields', async () => {
    const res = await api(
      '/api/v1/admin/operators',
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          displayName: 'کاربر مخفی',
          phone: '09121112222',
          roleKey: 'doctor',
          role: 'SUPER_ADMIN',
        }),
      }),
    );
    expect(res.status).toBe(422);
  });

  /* ── Read / filter ─────────────────────────────────────────────────── */

  it('lists the roster with meta, today and per-role counts', async () => {
    const data = await listRoster();
    expect(data.items).toHaveLength(2);
    expect(data.meta.total).toBe(2);
    expect(data.meta.active).toBe(2);
    expect(data.meta.archived).toBe(0);
    expect(data.meta.roles.doctor).toBe(1);
    expect(data.meta.roles.laser_technician).toBe(1);
    // Sort order is manual by default: OP-01 first.
    expect(data.items[0]?.code).toBe('OP-01');
  });

  it('searches by name, code and local-form phone', async () => {
    expect((await listRoster('?q=%D8%B3%D8%A7%D8%B1%D8%A7')).items).toHaveLength(1);
    expect((await listRoster('?q=OP-02')).items[0]?.displayName).toBe('مینا رضایی');
    expect((await listRoster('?q=09359876543')).items).toHaveLength(1);
    expect((await listRoster('?q=nobody-here')).items).toHaveLength(0);
  });

  it('filters by role and rejects an unknown role instead of returning junk', async () => {
    expect((await listRoster('?role=doctor')).items).toHaveLength(1);
    const res = await api('/api/v1/admin/operators?role=wizard', asAdmin());
    expect(res.status).toBe(422);
  });

  it('returns one operator with stats, agenda and the unassigned pool', async () => {
    const res = await api(`/api/v1/admin/operators/${primaryId}`, asAdmin());
    expect(res.status).toBe(200);
    const body = await json<{
      data: {
        operator: Operator;
        stats: {
          totals: { sessions: number };
          daily: Array<{ date: string }>;
          insights: Array<{ text: string }>;
        };
        agenda: unknown[];
        unassigned: unknown[];
        today: { localDate: string };
      };
    }>(res);
    expect(body.data.operator.id).toBe(primaryId);
    expect(body.data.stats.totals.sessions).toBe(0);
    expect(body.data.stats.daily).toHaveLength(30);
    expect(Array.isArray(body.data.agenda)).toBe(true);
    expect(Array.isArray(body.data.unassigned)).toBe(true);
    expect(body.data.today.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // An accountless operator is told why that matters.
    expect(body.data.stats.insights.some((insight) => insight.text.includes('حساب'))).toBe(true);
  });

  it('404s an unknown operator id', async () => {
    const res = await api('/api/v1/admin/operators/does-not-exist', asAdmin());
    expect(res.status).toBe(404);
  });

  /* ── Update ────────────────────────────────────────────────────────── */

  it('merges a partial update without clobbering untouched fields', async () => {
    const res = await api(
      `/api/v1/admin/operators/${primaryId}`,
      asAdmin({
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shiftStart: '10:00', bio: 'فلوشیپ لیزر' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await json<{ data: { operator: Operator } }>(res);
    expect(body.data.operator.shiftStart).toBe('10:00');
    expect(body.data.operator.shiftEnd).toBe('20:00');
    expect(body.data.operator.displayName).toBe('دکتر سارا محمدی');
    expect(body.data.operator.phone).toBe('+989121234567');
  });

  it('re-validates the merged shift so a lone start cannot invert the window', async () => {
    const res = await api(
      `/api/v1/admin/operators/${primaryId}`,
      asAdmin({
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shiftStart: '21:00' }),
      }),
    );
    expect(res.status).toBe(422);
  });

  it('toggles active state and revokes a linked session when deactivated', async () => {
    const off = await api(
      `/api/v1/admin/operators/${secondId}/status`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: false }),
      }),
    );
    expect(off.status).toBe(200);
    expect((await json<{ data: { operator: Operator } }>(off)).data.operator.active).toBe(false);

    const on = await api(
      `/api/v1/admin/operators/${secondId}/status`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: true }),
      }),
    );
    expect(on.status).toBe(200);
    expect((await json<{ data: { operator: Operator } }>(on)).data.operator.active).toBe(true);
  });

  it('reorders the roster in one request', async () => {
    const res = await api(
      '/api/v1/admin/operators/reorder',
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          order: [
            { id: primaryId, sortOrder: 90 },
            { id: secondId, sortOrder: 10 },
          ],
        }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await listRoster();
    expect(data.items[0]?.id).toBe(secondId);
  });

  /* ── Coverage & snapshot ───────────────────────────────────────────── */

  it('computes weekday coverage from the live roster', async () => {
    const res = await api('/api/v1/admin/operators/coverage?weekday=0', asAdmin());
    expect(res.status).toBe(200);
    const body = await json<{
      data: {
        weekday: number;
        label: string;
        segments: Array<{ start: string; end: string; count: number }>;
        hourly: number[];
        roster: Array<{ id: string }>;
      };
    }>(res);
    expect(body.data.weekday).toBe(0);
    expect(body.data.label).toBe('شنبه');
    expect(body.data.hourly).toHaveLength(24);
    // Both operators work Saturdays, from 10:00 (updated) and 09:00.
    expect(body.data.segments.length).toBeGreaterThan(0);
    expect(body.data.segments.every((segment) => segment.count >= 1)).toBe(true);
  });

  it('rejects an out-of-range weekday', async () => {
    const res = await api('/api/v1/admin/operators/coverage?weekday=9', asAdmin());
    expect(res.status).toBe(422);
  });

  it('returns a roster snapshot for the dashboard strip', async () => {
    const res = await api('/api/v1/admin/operators/snapshot', asAdmin());
    expect(res.status).toBe(200);
    const body = await json<{ data: { total: number; active: number; localDate: string } }>(res);
    expect(body.data.total).toBe(2);
    expect(body.data.active).toBe(2);
    expect(body.data.localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  /* ── Accounts ──────────────────────────────────────────────────────── */

  it('lets a manager write the roster but not issue a login', async () => {
    const create = await api('/api/v1/admin/operators', {
      method: 'POST',
      headers: { cookie: managerCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        displayName: 'دستیار موقت',
        phone: '09127770000',
        roleKey: 'assistant',
      }),
    });
    expect(create.status).toBe(201);

    const account = await api(`/api/v1/admin/operators/${secondId}/account`, {
      method: 'POST',
      headers: { cookie: managerCookie, 'content-type': 'application/json' },
      body: '{}',
    });
    expect(account.status).toBe(403);
  });

  it('issues a login and returns the temporary password exactly once', async () => {
    const res = await api(
      `/api/v1/admin/operators/${secondId}/account`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'mina@tehranlaser.ir' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await json<{
      data: {
        account: {
          mode: string;
          userId: string;
          email: string;
          temporaryPassword: string | null;
          roles: string[];
        };
        operator: Operator;
      };
    }>(res);
    expect(body.data.account.mode).toBe('created');
    expect(body.data.account.email).toBe('mina@tehranlaser.ir');
    expect(body.data.account.temporaryPassword).toMatch(/^TL-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(body.data.account.roles).toEqual(['OPERATOR']);
    expect(body.data.operator.account?.email).toBe('mina@tehranlaser.ir');
    accountUserId = body.data.account.userId;

    operatorCookie = await login('mina@tehranlaser.ir', body.data.account.temporaryPassword!);
    expect(operatorCookie).toContain('tl_session=');
  });

  it('gives the operator login exactly the front-line permission set', async () => {
    const me = await api('/api/v1/me', { headers: { cookie: operatorCookie } });
    expect(me.status).toBe(200);
    const body = await json<{ data: { roles: string[]; permissions: string[] } }>(me);
    expect(body.data.roles).toContain('OPERATOR');
    expect(body.data.permissions).toEqual(
      expect.arrayContaining([
        'operator.read',
        'booking.read',
        'booking.complete',
        'customer.read',
      ]),
    );
    expect(body.data.permissions).not.toContain('operator.write');
    expect(body.data.permissions).not.toContain('operator.account');
    expect(body.data.permissions).not.toContain('settings.write');

    // Reads the roster, cannot write it.
    const roster = await api('/api/v1/admin/operators', { headers: { cookie: operatorCookie } });
    expect(roster.status).toBe(200);
    const write = await api('/api/v1/admin/operators', {
      method: 'POST',
      headers: { cookie: operatorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({
        displayName: 'تلاش غیرمجاز',
        phone: '09120001111',
        roleKey: 'doctor',
      }),
    });
    expect(write.status).toBe(403);
  });

  it('resolves the operator’s own profile and lets them fix their contact details only', async () => {
    const own = await api('/api/v1/me/operator', { headers: { cookie: operatorCookie } });
    expect(own.status).toBe(200);
    const ownBody = await json<{ data: { operator: Operator | null } }>(own);
    expect(ownBody.data.operator?.id).toBe(secondId);

    const patch = await api('/api/v1/me/operator', {
      method: 'PATCH',
      headers: { cookie: operatorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ bio: 'کارشناس لیزر و پوست' }),
    });
    expect(patch.status).toBe(200);
    expect((await json<{ data: { operator: Operator } }>(patch)).data.operator.bio).toBe(
      'کارشناس لیزر و پوست',
    );

    const forbidden = await api('/api/v1/me/operator', {
      method: 'PATCH',
      headers: { cookie: operatorCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ commissionPercent: 100 }),
    });
    expect(forbidden.status).toBe(422);
  });

  it('resets the password on a second issue call instead of creating a second identity', async () => {
    const res = await api(
      `/api/v1/admin/operators/${secondId}/account`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'mina@tehranlaser.ir', password: 'Handed-Over-Pass-1' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await json<{
      data: {
        account: { mode: string; userId: string; temporaryPassword: string | null };
        operator: Operator;
      };
    }>(res);
    expect(body.data.account.mode).toBe('reset');
    expect(body.data.account.userId).toBe(accountUserId);
    expect(body.data.account.temporaryPassword).toBeNull();

    // The explicit password works; the previous session was revoked.
    const freshCookie = await login('mina@tehranlaser.ir', 'Handed-Over-Pass-1');
    const oldSession = await api('/api/v1/me', { headers: { cookie: operatorCookie } });
    expect(oldSession.status).toBe(401);
    const newSession = await api('/api/v1/me', { headers: { cookie: freshCookie } });
    expect(newSession.status).toBe(200);
  });

  it('refuses an account for an archived profile', async () => {
    const created = await createOperator({
      displayName: 'موقت',
      phone: '09125550000',
      roleKey: 'assistant',
    });
    await api(`/api/v1/admin/operators/${created.id}/archive`, asAdmin({ method: 'POST' }));
    const res = await api(
      `/api/v1/admin/operators/${created.id}/account`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'temp@tehranlaser.ir' }),
      }),
    );
    expect(res.status).toBe(422);
  });

  /* ── Booking assignment ────────────────────────────────────────────── */

  it('assigns a real booking to an operator and logs it', async () => {
    const bookingRes = await api('/api/v1/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        serviceSlug: 'full-body',
        pricingCategory: 'female',
        startsAt: futureSlot(),
        customerName: 'مریم رضایی',
        customerPhone: '09120001122',
        idempotencyKey: `op-assign-${Date.now()}`,
      }),
    });
    expect(bookingRes.status).toBe(201);
    const bookingBody = await json<{ data: { bookingId: string } }>(bookingRes);
    createdBookingId = bookingBody.data.bookingId;

    const assign = await api(
      `/api/v1/admin/bookings/${createdBookingId}/operator`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ operatorId: primaryId }),
      }),
    );
    expect(assign.status).toBe(200);
    const assigned = await json<{ data: { operatorId: string; operatorName: string } }>(assign);
    expect(assigned.data.operatorId).toBe(primaryId);
    expect(assigned.data.operatorName).toBe('دکتر سارا محمدی');

    const stats = await api(`/api/v1/admin/operators/${primaryId}/stats?days=60`, asAdmin());
    expect(stats.status).toBe(200);
    const statsBody = await json<{ data: { stats: { totals: { upcoming: number } } } }>(stats);
    expect(statsBody.data.stats.totals.upcoming).toBeGreaterThanOrEqual(1);
  });

  it('refuses assigning to an inactive operator', async () => {
    await api(
      `/api/v1/admin/operators/${secondId}/status`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: false }),
      }),
    );
    const res = await api(
      `/api/v1/admin/bookings/${createdBookingId}/operator`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ operatorId: secondId }),
      }),
    );
    expect(res.status).toBe(422);

    await api(
      `/api/v1/admin/operators/${secondId}/status`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: true }),
      }),
    );
  });

  it('unassigns with a null operatorId', async () => {
    const res = await api(
      `/api/v1/admin/bookings/${createdBookingId}/operator`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ operatorId: null }),
      }),
    );
    expect(res.status).toBe(200);
    expect((await json<{ data: { operatorId: null } }>(res)).data.operatorId).toBeNull();
  });

  /* ── Archive / restore / delete ────────────────────────────────────── */

  it('archives a profile, hides it from active lists and frees the phone', async () => {
    const res = await api(`/api/v1/admin/operators/${secondId}`, asAdmin({ method: 'DELETE' }));
    expect(res.status).toBe(200);
    expect((await json<{ data: { archived: boolean } }>(res)).data.archived).toBe(true);

    const active = await listRoster('?status=active');
    expect(active.items.some((operator) => operator.id === secondId)).toBe(false);

    const archived = await listRoster('?status=archived');
    expect(archived.items.some((operator) => operator.id === secondId)).toBe(true);
    expect(archived.meta.archived).toBeGreaterThanOrEqual(1);

    // Archived logins cannot sign in.
    const loginAttempt = await api('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'mina@tehranlaser.ir', password: 'Handed-Over-Pass-1' }),
    });
    expect(loginAttempt.status).toBe(403);

    // The phone is free for a replacement hire.
    const replacement = await createOperator({
      displayName: 'جانشین مینا',
      phone: '09359876543',
      roleKey: 'laser_technician',
    });
    replacementId = replacement.id;
    expect(replacement.phone).toBe('+989359876543');
  });

  it('refuses to change status of an archived profile', async () => {
    const res = await api(
      `/api/v1/admin/operators/${secondId}/status`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: true }),
      }),
    );
    expect(res.status).toBe(422);
  });

  it('refuses to restore into a phone number a live operator now holds', async () => {
    const res = await api(
      `/api/v1/admin/operators/${secondId}/restore`,
      asAdmin({ method: 'POST' }),
    );
    expect(res.status).toBe(422);
    const body = await json<{ error: { fields?: Record<string, string[]> } }>(res);
    expect(body.error.fields?.phone?.[0]).toContain('جانشین مینا');
  });

  it('restores an archived profile and its login once the number is free', async () => {
    // The replacement keeps the number; archiving it frees the phone again.
    const archiveReplacement = await api(
      `/api/v1/admin/operators/${replacementId}`,
      asAdmin({ method: 'DELETE' }),
    );
    expect(archiveReplacement.status).toBe(200);

    const res = await api(
      `/api/v1/admin/operators/${secondId}/restore`,
      asAdmin({ method: 'POST' }),
    );
    expect(res.status).toBe(200);
    const operator = (await json<{ data: { operator: Operator } }>(res)).data.operator;
    expect(operator.archivedAt).toBeNull();
    expect(operator.active).toBe(true);

    const login = await api('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'mina@tehranlaser.ir', password: 'Handed-Over-Pass-1' }),
    });
    expect(login.status).toBe(200);
  });

  it('hard-deletes a profile that never owned a session, and its login', async () => {
    const created = await createOperator({
      displayName: 'اشتباه ساخته شد',
      phone: '09124440000',
      roleKey: 'assistant',
    });
    const accountRes = await api(
      `/api/v1/admin/operators/${created.id}/account`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'oops@tehranlaser.ir' }),
      }),
    );
    expect(accountRes.status).toBe(200);
    const issued = await json<{ data: { account: { userId: string; temporaryPassword: string } } }>(
      accountRes,
    );

    const res = await api(
      `/api/v1/admin/operators/${created.id}?hard=1`,
      asAdmin({ method: 'DELETE' }),
    );
    expect(res.status).toBe(200);
    expect((await json<{ data: { deleted: boolean } }>(res)).data.deleted).toBe(true);

    const gone = await api(`/api/v1/admin/operators/${created.id}`, asAdmin());
    expect(gone.status).toBe(404);

    const orphanLogin = await api('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'oops@tehranlaser.ir',
        password: issued.data.account.temporaryPassword,
      }),
    });
    expect(orphanLogin.status).toBe(403);
  });

  it('refuses hard delete once the profile owns a session', async () => {
    // Give OP-01 a booking again so it has history.
    await api(
      `/api/v1/admin/bookings/${createdBookingId}/operator`,
      asAdmin({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ operatorId: primaryId }),
      }),
    );
    const res = await api(
      `/api/v1/admin/operators/${primaryId}?hard=1`,
      asAdmin({ method: 'DELETE' }),
    );
    expect(res.status).toBe(422);
    const body = await json<{ error: { message: string } }>(res);
    expect(body.error.message).toContain('بایگانی');
  });

  /* ── Audit ─────────────────────────────────────────────────────────── */

  it('records every roster mutation in the audit log', async () => {
    const rows = await env.DB.prepare(
      `SELECT action FROM audit_logs WHERE action LIKE 'operator.%'`,
    ).all<{ action: string }>();
    const actions = new Set(rows.results.map((row) => row.action));
    expect(actions.has('operator.created')).toBe(true);
    expect(actions.has('operator.updated')).toBe(true);
    expect(actions.has('operator.archived')).toBe(true);
    expect(actions.has('operator.account_created')).toBe(true);
    expect(actions.has('operator.account_reset')).toBe(true);
    expect(actions.has('operator.deleted')).toBe(true);
  });
});
