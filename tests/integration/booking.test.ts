import { describe, it, expect, beforeAll } from 'vitest';
import worker from './worker';
import { ensureMigrated } from './helpers';

describe('Tehran Laser — Full Integration Flow', () => {
  beforeAll(async () => {
    await ensureMigrated();
  });

  it('1. GET /api/health returns 200 with DB status', async () => {
    const res = await worker.fetch(new Request('http://localhost/api/health'));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { status: string; database: string } };
    expect(body.data.status).toBe('ok');
    expect(body.data.database).toBe('ok');
  });

  it('2. GET /api/v1/services returns catalog with Kishlaser prices', async () => {
    const res = await worker.fetch(new Request('http://localhost/api/v1/services'));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: Array<{
        slug: string;
        name: string;
        prices: Array<{ pricingCategory: string; amount: number }>;
      }>;
    };
    expect(body.data.length).toBeGreaterThanOrEqual(18);

    // Full body service check
    const fullBody = body.data.find((s) => s.slug === 'full-body');
    expect(fullBody).toBeDefined();
    const femalePrice = fullBody?.prices.find((p) => p.pricingCategory === 'female');
    expect(femalePrice?.amount).toBe(2290); // 2,290,000 Tomans base
  });

  it('3. GET /api/v1/availability returns available slots for a future day', async () => {
    // Next Saturday
    const req = new Request('http://localhost/api/v1/availability?service=full-body&category=female&date=2026-10-10');
    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: {
        slots: Array<{ startsAt: string; endsAt: string; available: boolean }>;
      };
    };
    expect(body.data.slots.length).toBeGreaterThan(0);
    expect(body.data.slots.some((s) => s.available)).toBe(true);
  });

  it('4. POST /api/v1/bookings creates a booking with authoritative discount', async () => {
    const targetSlot = '2026-10-10T06:30:00.000Z'; // 10:00 Iran time
    const res = await worker.fetch(
      new Request('http://localhost/api/v1/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: 'full-body',
          pricingCategory: 'female',
          startsAt: targetSlot,
          customerName: 'مریم رضایی',
          customerPhone: '09123456789',
          customerEmail: 'maryam@example.com',
          note: 'جلسه اول',
          idempotencyKey: 'idem-test-1',
        }),
      }),
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      data: {
        bookingId: string;
        reference: string;
        quotedAmount: number;
        discountAmount: number;
      };
    };
    expect(body.data.bookingId).toBeDefined();
    expect(body.data.reference.startsWith('TL-')).toBe(true);
    // Base 2290, 15% discount is applied: 2290 * 0.15 = 344 (or 350 promo -> net 1940)
    expect(body.data.quotedAmount).toBe(2290);
    expect(body.data.discountAmount).toBeGreaterThan(0);
  });

  it('5. DOUBLE-BOOKING CONCURRENCY RACE (§15, §102): Conflicting simultaneous writes resolve safely', async () => {
    const conflictSlot = '2026-10-10T07:30:00.000Z'; // 11:00 Iran time

    // Attempt 5 concurrent booking submissions for the exact same slot
    const attempts = Array.from({ length: 5 }, (_, i) =>
      worker.fetch(
        new Request('http://localhost/api/v1/bookings', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            serviceSlug: 'face',
            pricingCategory: 'female',
            startsAt: conflictSlot,
            customerName: `مشتری رقابتی ${i + 1}`,
            customerPhone: `0912345678${i}`,
            idempotencyKey: `idem-race-${i}`,
          }),
        }),
      ),
    );

    const responses = await Promise.all(attempts);
    const statuses = responses.map((r) => r.status);
    const bodies = await Promise.all(responses.map((r) => r.clone().json()));

    const successCount = statuses.filter((s) => s === 201).length;
    const conflictCount = statuses.filter((s) => s === 409).length;

    if (successCount !== 1) {
      console.log('Race test unexpected statuses:', statuses, bodies);
    }

    // Hard requirement: EXACTLY 1 succeeds, all others reject with 409 Conflict
    expect(successCount).toBe(1);
    expect(conflictCount).toBe(4);
  });

  it('6. Admin workflow: login -> accept booking -> verify status', async () => {
    // 6a. Login as super_admin
    const loginRes = await worker.fetch(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@tehranlaser.ir',
          password: 'AdminPass123!',
        }),
      }),
    );
    expect(loginRes.status).toBe(200);
    const cookie = loginRes.headers.get('set-cookie');
    expect(cookie).toContain('tl_session=');

    // 6b. Create a pending booking to operate on
    const createRes = await worker.fetch(
      new Request('http://localhost/api/v1/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: 'underarm',
          pricingCategory: 'female',
          startsAt: '2026-10-10T08:30:00.000Z',
          customerName: 'سارا حسینی',
          customerPhone: '09987654321',
        }),
      }),
    );
    if (createRes.status !== 201) {
      console.log('Test 6 create error:', await createRes.clone().json());
    }
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { data: { bookingId: string } };

    // 6c. Accept the booking
    const acceptRes = await worker.fetch(
      new Request(`http://localhost/api/v1/admin/bookings/${created.data.bookingId}/accept`, {
        method: 'POST',
        headers: {
          cookie: cookie ?? '',
        },
      }),
    );
    expect(acceptRes.status).toBe(200);
    const accepted = (await acceptRes.json()) as { data: { status: string } };
    expect(accepted.data.status).toBe('confirmed');

    // 6d. Complete the booking
    const completeRes = await worker.fetch(
      new Request(`http://localhost/api/v1/admin/bookings/${created.data.bookingId}/complete`, {
        method: 'POST',
        headers: {
          cookie: cookie ?? '',
        },
      }),
    );
    expect(completeRes.status).toBe(200);
    const completed = (await completeRes.json()) as { data: { status: string } };
    expect(completed.data.status).toBe('completed');
  });

  it('7. RBAC Security: Editor cannot modify pricing (403 Forbidden)', async () => {
    // Login as editor
    const loginRes = await worker.fetch(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'editor@tehranlaser.ir',
          password: 'EditorPass123!',
        }),
      }),
    );
    expect(loginRes.status).toBe(200);
    const cookie = loginRes.headers.get('set-cookie');

    // Attempt to modify pricing
    const pricingRes = await worker.fetch(
      new Request('http://localhost/api/v1/admin/pricing/prc_underarms_f', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          cookie: cookie ?? '',
        },
        body: JSON.stringify({
          amount: 500,
        }),
      }),
    );
    // Editor lacks 'pricing.write' permission -> 403 Forbidden
    expect(pricingRes.status).toBe(403);
    const errBody = (await pricingRes.json()) as { error: { code: string } };
    expect(errBody.error.code).toBe('FORBIDDEN');
  });
});
