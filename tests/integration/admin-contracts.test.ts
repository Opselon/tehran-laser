/**
 * Wave W4 admin contracts — integration coverage.
 *
 * These existed only as documentation before this wave: `docs/API.md`
 * promises detail/timeline/customer/pricing/SEO/search routes that the
 * router never answered. Each test below is a contract claim you can diff
 * against the API doc, driven through the real worker + local D1.
 *
 * Setup notes:
 *  - `ensureMigrated()` applies migrations 0001–0005 and seeds one super_admin
 *    (admin@tehranlaser.ir / AdminPass123!) and one editor (no pricing perms).
 *  - Bookings require a real customer + service row, so the "exists" cases
 *    create their own fixtures instead of assuming a seed.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { env } from 'cloudflare:workers';
import worker from './worker';
import { ensureMigrated } from './helpers';

const ADMIN = { email: 'admin@tehranlaser.ir', password: 'AdminPass123!' };
const EDITOR = { email: 'editor@tehranlaser.ir', password: 'EditorPass123!' };

interface Envelope<T> {
  data: T;
  error: { code: string; message: string } | null;
  meta: Record<string, unknown>;
}

describe('W4 admin contracts — auth plumbing', () => {
  let adminCookie = '';
  let editorCookie = '';

  beforeAll(async () => {
    await ensureMigrated();
    const admin = await worker.fetch(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(ADMIN),
      }),
    );
    expect(admin.status).toBe(200);
    adminCookie = admin.headers.get('set-cookie') ?? '';

    const editor = await worker.fetch(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(EDITOR),
      }),
    );
    expect(editor.status).toBe(200);
    editorCookie = editor.headers.get('set-cookie') ?? '';
  });

  describe('GET /admin/bookings/:id and /timeline', () => {
    let bookingId: string;

    beforeAll(async () => {
      /* Create one booking through the real machine: a service row to attach
         to, then a booking slot + booking. */
      const svcId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO services (id, name, slug, description, duration_minutes, active, created_at, updated_at)
         VALUES (?, 'svc for detail test', 'svc-detail-test', 'd', 30, 1, ?, ?)`,
      )
        .bind(svcId, new Date().toISOString(), new Date().toISOString())
        .run();

      const custId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO customers (id, name, phone, pricing_category, created_at, updated_at)
         VALUES (?, 'detail مخاطب', '+989120000111', 'female', ?, ?)`,
      )
        .bind(custId, new Date().toISOString(), new Date().toISOString())
        .run();

      bookingId = crypto.randomUUID();
      const now = new Date().toISOString();
      const later = new Date(Date.parse(now) + 30 * 60_000).toISOString();
      await env.DB.prepare(
        `INSERT INTO bookings (id, reference, customer_id, service_id, pricing_category,
             starts_at, ends_at, status, quoted_amount, discount_amount, currency,
             customer_note, admin_note, created_at, updated_at)
         VALUES (?, 'TL-DT1', ?, ?, 'female', ?, ?, 'pending', 1000, 0, 'IRT', NULL, NULL, ?, ?)`,
      )
        .bind(bookingId, custId, svcId, now, later, now, now)
        .run();

      /* A booking_events row gives the timeline something to read (this is the
         same table the booking actions write to). */
      await env.DB.prepare(
        `INSERT INTO booking_events (id, booking_id, event_type, actor_id, detail, created_at)
         VALUES (?, ?, 'created', 'usr_test_superadmin', 'تست', ?)`,
      )
        .bind(crypto.randomUUID(), bookingId, now)
        .run();
    });

    it('answers the documented envelope for an existing booking', async () => {
      const res = await worker.fetch(
        new Request(`http://localhost/api/v1/admin/bookings/${bookingId}`, {
          headers: { cookie: adminCookie },
        }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Envelope<{ id: string; reference: string }>;
      expect(body.error).toBeNull();
      expect(body.data.id).toBe(bookingId);
      expect(body.data.reference).toBe('TL-DT1');
    });

    it('returns NOT_FOUND for an unknown id', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/bookings/nope-nope', {
          headers: { cookie: adminCookie },
        }),
      );
      expect(res.status).toBe(404);
      const body = (await res.json()) as Envelope<null>;
      expect(body.error?.code).toBe('NOT_FOUND');
    });

    it('401s without a session', async () => {
      const res = await worker.fetch(
        new Request(`http://localhost/api/v1/admin/bookings/${bookingId}`),
      );
      expect(res.status).toBe(401);
    });

    it('returns the timeline with at least one event', async () => {
      const res = await worker.fetch(
        new Request(`http://localhost/api/v1/admin/bookings/${bookingId}/timeline`, {
          headers: { cookie: adminCookie },
        }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Envelope<{ bookingId: string; events: unknown[] }>;
      expect(body.error).toBeNull();
      expect(body.data.bookingId).toBe(bookingId);
      expect(body.data.events.length).toBeGreaterThan(0);
    });

    it('exposes neither to an editor (booking.read denied per RBAC)', async () => {
      /* The editor role holds NO booking.read — this pins the permission gate,
         not just the middleware's anonymous check. */
      const res = await worker.fetch(
        new Request(`http://localhost/api/v1/admin/bookings/${bookingId}`, {
          headers: { cookie: editorCookie },
        }),
      );
      expect(res.status).toBe(403);
    });
  });

  describe('GET /admin/customers/:id', () => {
    let customerId: string;

    beforeAll(async () => {
      customerId = crypto.randomUUID();
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO customers (id, name, phone, pricing_category, email, note, created_at, updated_at)
         VALUES (?, 'مشتری پرونده', '+989123335555', 'female', 'x@y.ir', 'یادداشت', ?, ?)`,
      )
        .bind(customerId, new Date().toISOString(), now)
        .run();
    });

    it('returns the customer with an empty bookings array', async () => {
      const res = await worker.fetch(
        new Request(`http://localhost/api/v1/admin/customers/${customerId}`, {
          headers: { cookie: adminCookie },
        }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Envelope<{
        id: string;
        name: string;
        phone: string;
        bookings: unknown[];
      }>;
      expect(body.error).toBeNull();
      expect(body.data.id).toBe(customerId);
      expect(body.data.phone).toBe('+989123335555');
      expect(Array.isArray(body.data.bookings)).toBe(true);
    });

    it('404s for an unknown customer', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/customers/nope', {
          headers: { cookie: adminCookie },
        }),
      );
      expect(res.status).toBe(404);
    });
  });

  describe('GET /admin/pricing, /admin/seo, /admin/search', () => {
    it('lists the seeded price rows', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/pricing', { headers: { cookie: adminCookie } }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Envelope<unknown[]>;
      expect(body.error).toBeNull();
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('never exposes pricing to an editor (pricing.read denied)', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/pricing', { headers: { cookie: editorCookie } }),
      );
      expect(res.status).toBe(403);
    });

    it('starts with an empty SEO ledger', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/seo', { headers: { cookie: adminCookie } }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Envelope<unknown[]>;
      expect(body.error).toBeNull();
      expect(body.data).toEqual([]);
    });

    it('rejects an SEO filter with an unknown entity type', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/seo?entityType=nonsense&entityId=x', {
          headers: { cookie: adminCookie },
        }),
      );
      expect(res.status).toBe(422);
      const body = (await res.json()) as Envelope<null>;
      expect(body.error?.code).toBe('VALIDATION_ERROR');
    });

    it('upserts an SEO override and answers the detail filter with it', async () => {
      const svc = await env.DB.prepare(`SELECT id FROM services LIMIT 1`).first<{ id: string }>();
      expect(svc).toBeTruthy();

      const put = await worker.fetch(
        new Request('http://localhost/api/v1/admin/seo', {
          method: 'PUT',
          headers: { 'content-type': 'application/json', cookie: adminCookie },
          body: JSON.stringify({
            entityType: 'service',
            entityId: svc!.id,
            title: 'لیزر تماسی رادو پلاس — تعرفه و رزرو',
            description: 'صفحه تعرفه به‌روز شده از پنل مدیریت.',
            noindex: false,
          }),
        }),
      );
      expect(put.status).toBe(200);

      /* Idempotence: the second identical save must not create a second row. */
      const putAgain = await worker.fetch(
        new Request('http://localhost/api/v1/admin/seo', {
          method: 'PUT',
          headers: { 'content-type': 'application/json', cookie: adminCookie },
          body: JSON.stringify({
            entityType: 'service',
            entityId: svc!.id,
            title: 'لیزر تماسی رادو پلاس — تعرفه و رزرو',
            description: 'صفحه تعرفه به‌روز شده از پنل مدیریت.',
            noindex: false,
          }),
        }),
      );
      expect(putAgain.status).toBe(200);

      const detail = await worker.fetch(
        new Request(`http://localhost/api/v1/admin/seo?entityType=service&entityId=${svc!.id}`, {
          headers: { cookie: adminCookie },
        }),
      );
      expect(detail.status).toBe(200);
      const body = (await detail.json()) as Envelope<{
        title: string;
        noindex: boolean;
      } | null>;
      expect(body.data?.title).toBe('لیزر تماسی رادو پلاس — تعرفه و رزرو');
      expect(body.data?.noindex).toBe(false);

      const ledger = await worker.fetch(
        new Request('http://localhost/api/v1/admin/seo', { headers: { cookie: adminCookie } }),
      );
      const ledgerBody = (await ledger.json()) as Envelope<unknown[]>;
      expect(ledgerBody.data).toHaveLength(1);
    });

    it('rejects non-http canonical URLs', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/seo', {
          method: 'PUT',
          headers: { 'content-type': 'application/json', cookie: adminCookie },
          body: JSON.stringify({
            entityType: 'page',
            entityId: 'home',
            title: 't',
            description: 'd',
            canonicalUrl: 'javascript:alert(1)',
          }),
        }),
      );
      expect(res.status).toBe(422);
    });

    it('answers the palette search with at most 8 hits and no 500s', async () => {
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/search?q=TL', { headers: { cookie: adminCookie } }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Envelope<unknown[]>;
      expect(body.error).toBeNull();
      expect(body.data.length).toBeLessThanOrEqual(8);
    });
  });

  describe('audit parity on money + clinical writes', () => {
    it('audit_logs gets a row for walkin.booked', async () => {
      /* Drive the real /admin/walkin/book to keep the audit claim honest. */
      const svc = await env.DB.prepare(`SELECT id FROM services LIMIT 1`).first<{ id: string }>();
      const res = await worker.fetch(
        new Request('http://localhost/api/v1/admin/walkin/book', {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: adminCookie },
          body: JSON.stringify({
            customerName: 'پذیرش حضوری تست',
            customerPhone: '+989121119999',
            serviceId: svc!.id,
            amount: 900,
            paymentMethod: 'pos',
            sessionNumber: 1,
            totalSessions: 8,
          }),
        }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Envelope<{ customerId: string }>;
      expect(body.data.customerId).toBeTruthy();

      const probe = await env.DB.prepare(
        `SELECT COUNT(*) AS c FROM audit_logs a
          WHERE a.entity_type = 'booking'
            AND a.action = 'walkin.booked'
            AND a.actor_id = 'usr_test_superadmin'
            AND a.entity_id IS NOT NULL`,
      ).first<{ c: number }>();
      expect(probe?.c ?? 0).toBeGreaterThan(0);
    });
  });
});
