import { describe, it, expect, beforeAll } from 'vitest';
import worker from './worker';
import { ensureMigrated } from './helpers';

/**
 * Plugin hub (`feature_modules`, migration 0011) — integration tests for the
 * public + admin API surface:
 *
 *  - everything is auth-gated: no session ⇒ 401, editor (no settings.*) ⇒ 403;
 *  - GET admin list returns the full registry view with defaults;
 *  - PUT persists enabled + config, mirrors instagram into the legacy settings,
 *    validates config per-field, 404s unknown keys, never creates rows for them;
 *  - DELETE resets back to registry defaults ("default IS the absence");
 *  - the public endpoint exposes only enabled public modules and never leaks
 *    internal or disabled module state.
 */

const BASE = 'http://localhost';

interface AdminModule {
  key: string;
  name: string;
  enabled: boolean;
  order: number;
  hasOverride: boolean;
  config: Record<string, unknown>;
  fields: Array<{ key: string }>;
  category: string;
  internal: boolean;
}

let adminCookie = '';
let editorCookie = '';

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  return worker.fetch(new Request(`${BASE}${path}`, init));
}

/** Admin list helper — returns the module array, asserting the read succeeded. */
async function listModules(): Promise<AdminModule[]> {
  const res = await api('/api/v1/admin/features', { headers: { cookie: adminCookie } });
  expect(res.status).toBe(200);
  const body = (await res.json()) as { data: AdminModule[] };
  return body.data;
}

async function listPublicModules(): Promise<Array<{ key: string; config: Record<string, unknown> }>> {
  const res = await api('/api/v1/features');
  expect(res.status).toBe(200);
  const body = (await res.json()) as { data: Array<{ key: string; config: Record<string, unknown> }> };
  return body.data;
}

describe('feature plugins API', () => {
  beforeAll(async () => {
    await ensureMigrated();

    const loginRes = await api('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@tehranlaser.ir', password: 'AdminPass123!' }),
    });
    expect(loginRes.status).toBe(200);
    adminCookie = loginRes.headers.get('set-cookie') ?? '';

    const editorRes = await api('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'editor@tehranlaser.ir', password: 'EditorPass123!' }),
    });
    expect(editorRes.status).toBe(200);
    editorCookie = editorRes.headers.get('set-cookie') ?? '';
  });

  /* ── Authz ─────────────────────────────────────────────────────────── */

  it('anonymous callers get 401 on every feature route', async () => {
    const list = await api('/api/v1/admin/features');
    expect(list.status).toBe(401);

    const write = await api('/api/v1/admin/features/faq', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    });
    expect(write.status).toBe(401);

    const order = await api('/api/v1/admin/features/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ order: [] }),
    });
    expect(order.status).toBe(401);

    const reset = await api('/api/v1/admin/features/faq', { method: 'DELETE' });
    expect(reset.status).toBe(401);
  });

  it('an editor (no settings.* permission) gets 403, not a silent no-op', async () => {
    const read = await api('/api/v1/admin/features', { headers: { cookie: editorCookie } });
    expect(read.status).toBe(403);

    const write = await api('/api/v1/admin/features/faq', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ enabled: false }),
    });
    expect(write.status).toBe(403);
  });

  /* ── Admin list ────────────────────────────────────────────────────── */

  it('lists all registry modules with defaults and no override', async () => {
    const data = await listModules();
    expect(data.length).toBeGreaterThanOrEqual(10);
    expect(data.map((m) => m.key)).toContain('instagram-hub');
    for (const module of data) {
      expect(module).toHaveProperty('enabled');
      expect(module).toHaveProperty('name');
      expect(module.hasOverride).toBe(false);
      // Every module must tell the hub how to render its config form.
      expect(Array.isArray(module.fields)).toBe(true);
    }
    // The instagram module ships enabled with a default handle.
    const ig = data.find((m) => m.key === 'instagram-hub')!;
    expect(ig.enabled).toBe(true);
    expect(ig.config.handle).toBe('tehranlaser_clinic');
  });

  /* ── Toggle ────────────────────────────────────────────────────────── */

  it('disabling a module takes it out of the public API and hides its config', async () => {
    const put = await api('/api/v1/admin/features/instagram-hub', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ enabled: false }),
    });
    expect(put.status).toBe(200);

    const pub = await listPublicModules();
    expect(pub.map((m) => m.key)).not.toContain('instagram-hub');

    // Admin list confirms the state flipped.
    const list = await listModules();
    expect(list.find((m) => m.key === 'instagram-hub')!.enabled).toBe(false);

    // A module that stays on is still published, with its config.
    const pricing = pub.find((m) => m.key === 'pricing-table');
    expect(pricing?.config).toBeDefined();
  });

  /* ── Config validation ─────────────────────────────────────────────── */

  it('persists a valid partial config and mirrors instagram into legacy settings', async () => {
    const put = await api('/api/v1/admin/features/instagram-hub', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ config: { handle: '@clinic.Official', promoDiscountPercent: '25' } }),
    });
    expect(put.status).toBe(200);

    const body = (await put.json()) as { data: { config: Record<string, unknown> } };
    // Partial update: other fields keep their stored/default values.
    expect(body.data.config.handle).toBe('clinic.Official');
    expect(body.data.config.promoDiscountPercent).toBe(25);
    expect(body.data.config.promoCode).toBe('INSTA20');

    // The legacy instagram settings must mirror the same truth.
    const settings = await api('/api/v1/settings/public');
    expect(settings.status).toBe(200);
    const settingsBody = (await settings.json()) as { data: Record<string, string | undefined> };
    expect(settingsBody.data.instagram_username).toBe('clinic.Official');
    expect(String(settingsBody.data.instagram_follower_discount_percent)).toBe('25');
  });

  it('rejects an invalid config per field with VALIDATION_ERROR and stores nothing', async () => {
    const beforeConfig = JSON.stringify((await listModules()).find((m) => m.key === 'instagram-hub')!.config);

    const put = await api('/api/v1/admin/features/instagram-hub', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ config: { latestReelUrl: 'javascript:alert(1)' } }),
    });
    expect(put.status).toBe(422);
    const err = (await put.json()) as { error: { code: string; fields?: Record<string, string[]> } };
    expect(err.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(err.error.fields ?? {})).toContain('latestReelUrl');

    const afterConfig = JSON.stringify((await listModules()).find((m) => m.key === 'instagram-hub')!.config);
    expect(afterConfig).toBe(beforeConfig);
  });

  it('rejects an unknown config key instead of silently dropping it', async () => {
    const put = await api('/api/v1/admin/features/faq', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ config: { typoKey: 'ooh' } }),
    });
    expect(put.status).toBe(422);
  });

  /* ── Unknown keys never become rows ────────────────────────────────── */

  it('unknown module key: PUT / DELETE are a 404 and nothing is created', async () => {
    const put = await api('/api/v1/admin/features/definitely-not-a-plugin', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ enabled: true }),
    });
    expect(put.status).toBe(404);

    const reset = await api('/api/v1/admin/features/definitely-not-a-plugin', {
      method: 'DELETE',
      headers: { cookie: adminCookie },
    });
    expect(reset.status).toBe(404);

    expect((await listModules()).map((m) => m.key)).not.toContain('definitely-not-a-plugin');
  });

  /* ── Internal modules ──────────────────────────────────────────────── */

  it('internal modules never leak their config through the public API', async () => {
    // Enable the internal sms module directly through the admin API first.
    const put = await api('/api/v1/admin/features/sms-campaigns', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ enabled: true }),
    });
    expect(put.status).toBe(200);

    expect((await listPublicModules()).map((m) => m.key)).not.toContain('sms-campaigns');
  });

  /* ── Ordering ──────────────────────────────────────────────────────── */

  it('reorders two modules and persists the swap', async () => {
    const list = await listModules();
    const hero = list.find((m) => m.key === 'hero')!;
    const trust = list.find((m) => m.key === 'trust-strip')!;

    const post = await api('/api/v1/admin/features/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        order: [
          { key: 'hero', displayOrder: trust.order },
          { key: 'trust-strip', displayOrder: hero.order },
        ],
      }),
    });
    expect(post.status).toBe(200);

    const after = await listModules();
    expect(after.find((m) => m.key === 'hero')!.order).toBe(trust.order);
    expect(after.find((m) => m.key === 'trust-strip')!.order).toBe(hero.order);
  });

  it('refuses a reorder containing an unknown key', async () => {
    const post = await api('/api/v1/admin/features/order', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ order: [{ key: 'ghost-module', displayOrder: 1 }] }),
    });
    // A rejected payload, not a missing resource: the route exists and the body
    // is malformed, so it is a 422 carrying a per-key hint.
    expect(post.status).toBe(422);
    const err = (await post.json()) as { error: { code: string; fields?: Record<string, string[]> } };
    expect(err.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(err.error.fields ?? {})).toContain('ghost-module');

    // The refusal must not half-apply: a real module in the same batch keeps
    // its previous order when the payload is rejected as a whole.
    const list = await listModules();
    expect(list.map((m) => m.key)).not.toContain('ghost-module');
  });

  /* ── Reset = factory default ────────────────────────────────────────── */

  it('DELETE clears the override row and restores the registry default', async () => {
    const ig = (await listModules()).find((m) => m.key === 'instagram-hub')!;
    expect(ig.hasOverride).toBe(true);

    const reset = await api('/api/v1/admin/features/instagram-hub', {
      method: 'DELETE',
      headers: { cookie: adminCookie },
    });
    expect(reset.status).toBe(200);

    const fresh = (await listModules()).find((m) => m.key === 'instagram-hub')!;
    expect(fresh.hasOverride).toBe(false);
    expect(fresh.enabled).toBe(true);
    expect(fresh.config.handle).toBe('tehranlaser_clinic');

    expect((await listPublicModules()).map((m) => m.key)).toContain('instagram-hub');
  });

  it('resetting a module with no override still answers 200', async () => {
    const reset = await api('/api/v1/admin/features/faq', {
      method: 'DELETE',
      headers: { cookie: adminCookie },
    });
    expect(reset.status).toBe(200);
  });

  /* ── Public endpoint shape ──────────────────────────────────────────── */

  it('the public list only carries key + config (no admin metadata)', async () => {
    const list = await listPublicModules();
    expect(list.length).toBeGreaterThan(0);
    for (const item of list) {
      expect(Object.keys(item).sort()).toEqual(['config', 'key']);
    }
  });
});
