import { describe, it, expect, beforeAll } from 'vitest';
import worker from './worker';
import { ensureMigrated } from './helpers';

/**
 * Lane C regression: the admin price editor must be able to set AND persist BOTH
 * pricing categories (بانوان / آقایان) for a service — and, since migration 0016,
 * BOTH devices (رادو پلاس / دکا) without one clobbering the other.
 *
 * This exercises the exact production path the dashboard form posts to —
 * PUT /api/v1/admin/pricing/:serviceId — then reads back through
 * GET /api/v1/admin/services to confirm the rows survive, including a
 * subsequent change (UPDATE branch, not a duplicate row).
 */
describe('Lane C — admin dual-price persistence', () => {
  let cookie = '';

  beforeAll(async () => {
    await ensureMigrated();
    const loginRes = await worker.fetch(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'admin@tehranlaser.ir', password: 'AdminPass123!' }),
      }),
    );
    expect(loginRes.status).toBe(200);
    cookie = loginRes.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('tl_session=');
  });

  async function putPrice(
    serviceId: string,
    pricingCategory: 'male' | 'female',
    amount: number,
    device?: 'rado' | 'deka',
  ) {
    return worker.fetch(
      new Request(`http://localhost/api/v1/admin/pricing/${serviceId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', cookie },
        body: JSON.stringify({ pricingCategory, device, amount, currency: 'IRT' }),
      }),
    );
  }

  async function readPrices(serviceId: string) {
    const res = await worker.fetch(
      new Request('http://localhost/api/v1/admin/services', { headers: { cookie } }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: Array<{
        id: string;
        prices: Array<{
          pricingCategory: string;
          device: string;
          amount: number;
          currency: string;
        }>;
      }>;
    };
    return body.data.find((s) => s.id === serviceId)?.prices ?? [];
  }

  it('sets and persists BOTH بانوان and آقایان prices for one service', async () => {
    const listRes = await worker.fetch(
      new Request('http://localhost/api/v1/admin/services', { headers: { cookie } }),
    );
    const list = (await listRes.json()) as { data: Array<{ id: string; slug: string }> };
    const target = list.data.find((s) => s.slug === 'full-body');
    expect(target).toBeDefined();
    const serviceId = target!.id;

    // Female Rado: overwrite an existing row (UPDATE branch), 1,234 thousand IRT.
    const femaleRes = await putPrice(serviceId, 'female', 1234);
    expect(femaleRes.status).toBe(200);

    // Male Rado: overwrite an existing row (UPDATE branch).
    const maleRes = await putPrice(serviceId, 'male', 5678);
    expect(maleRes.status).toBe(200);

    const prices = await readPrices(serviceId);
    const female = prices.find((p) => p.pricingCategory === 'female' && p.device === 'rado');
    const male = prices.find((p) => p.pricingCategory === 'male' && p.device === 'rado');

    expect(female?.amount).toBe(1234);
    expect(male?.amount).toBe(5678);
    // Amounts are stored in THOUSANDS of IRT — confirm no scaling happened server-side.
    expect(prices.length).toBeGreaterThanOrEqual(2);

    // Second write must UPDATE (not duplicate) the same category+device row.
    const maleUpdate = await putPrice(serviceId, 'male', 9000);
    expect(maleUpdate.status).toBe(200);
    const after = await readPrices(serviceId);
    const males = after.filter((p) => p.pricingCategory === 'male' && p.device === 'rado');
    expect(males).toHaveLength(1);
    expect(males[0]?.amount).toBe(9000);

    // A Deka write for the same category must land on its own row and leave
    // the Rado row untouched.
    const dekaRes = await putPrice(serviceId, 'female', 4321, 'deka');
    expect(dekaRes.status).toBe(200);
    const afterDeka = await readPrices(serviceId);
    const femaleDeka = afterDeka.find((p) => p.pricingCategory === 'female' && p.device === 'deka');
    const femaleRado = afterDeka.find((p) => p.pricingCategory === 'female' && p.device === 'rado');
    expect(femaleDeka?.amount).toBe(4321);
    expect(femaleRado?.amount).toBe(1234);
  });

  it('rejects a price write without the pricing.write permission', async () => {
    const editorLogin = await worker.fetch(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'editor@tehranlaser.ir', password: 'EditorPass123!' }),
      }),
    );
    expect(editorLogin.status).toBe(200);
    const editorCookie = editorLogin.headers.get('set-cookie') ?? '';

    const res = await worker.fetch(
      new Request('http://localhost/api/v1/admin/pricing/whatever-service', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', cookie: editorCookie },
        body: JSON.stringify({ pricingCategory: 'male', amount: 100 }),
      }),
    );
    expect(res.status).toBe(403);
  });
});
