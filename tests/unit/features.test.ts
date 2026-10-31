/**
 * Feature-module system (the "plugin hub") — unit tests for the pure layer.
 *
 * What must never regress:
 *  - The registry is the single source of truth: no DB row ⇒ the registry
 *    default applies exactly ("default IS the absence").
 *  - An unknown module key can never create state, render, or be written.
 *  - Stored config that fails validation collapses to {} (never half-applied).
 *  - Disabled/public-internal rules: what is off is invisible to the public
 *    API, and internal modules never leak their config.
 *  - Instagram resolution never trusts user input (handle, reel URL, bio link).
 */

import { describe, expect, it } from 'vitest';
import {
  CATEGORY_LABELS,
  FEATURE_MODULES,
  buildConfigSchema,
  defaultConfig,
  getModuleDef,
  isKnownModuleKey,
} from '../../src/domain/features/registry';
import {
  enabledConfig,
  effectiveConfig,
  isModuleOn,
  mergeAdminModules,
  mergeModuleStates,
  normalizeInstagramHandle,
  parseStoredConfig,
  publicModules,
  resolveInstagram,
  safeExternalLink,
  safeInstagramReelUrl,
  toStateMap,
  type FeatureModuleRow,
} from '../../src/domain/features/state';

/* ── Fixture rows ─────────────────────────────────────────────────────── */

const row = (key: string, overrides: Partial<FeatureModuleRow> = {}): FeatureModuleRow => ({
  key,
  enabled: 1,
  displayOrder: 0,
  config: '{}',
  ...overrides,
});

/* ── Registry contract ─────────────────────────────────────────────────── */

describe('registry', () => {
  it('every module has a stable, unique, URL-safe key', () => {
    const keys = FEATURE_MODULES.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(key).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it('every module declares a category that has a Persian label', () => {
    for (const def of FEATURE_MODULES) {
      expect(CATEGORY_LABELS).toHaveProperty(def.category);
      expect(typeof CATEGORY_LABELS[def.category]).toBe('string');
    }
  });

  it('registry defs are immutable snapshots — the map lookup matches the list', () => {
    for (const def of FEATURE_MODULES) {
      expect(getModuleDef(def.key)).toBe(def);
      expect(isKnownModuleKey(def.key)).toBe(true);
    }
  });

  it('unknown keys fail closed at every entry point', () => {
    expect(getModuleDef('nope')).toBeNull();
    expect(isKnownModuleKey('nope')).toBe(false);
    expect(isKnownModuleKey('')).toBe(false);
    // No row can ever be manufactured for an unknown key: parse and merge
    // ignore it entirely.
    expect(parseStoredConfig('nope', '{"a":1}')).toEqual({});
    expect(mergeModuleStates([row('nope')]).map((m) => m.key)).not.toContain('nope');
  });

  it('every field default satisfies that field’s schema (defaults are always valid)', () => {
    for (const def of FEATURE_MODULES) {
      const result = buildConfigSchema(def).safeParse(defaultConfig(def));
      expect(result.success, `${def.key} default config failed validation`).toBe(true);
    }
  });

  it('field defs use the supported types only', () => {
    const allowed = new Set(['text', 'textarea', 'url', 'number', 'boolean']);
    for (const def of FEATURE_MODULES) {
      for (const field of def.fields) {
        expect(allowed.has(field.type), `${def.key}.${field.key} type ${field.type}`).toBe(true);
      }
    }
  });

  it('buildConfigSchema refuses unknown keys (strict) and accepts partial updates', () => {
    const def = getModuleDef('pricing-table')!;
    const schema = buildConfigSchema(def);
    expect(schema.safeParse({ promoTitle: 'x' }).success).toBe(true);
    expect(schema.safeParse({ typoKey: 'x' }).success).toBe(false);
  });

  it('number fields treat an empty string as "not provided", not zero', () => {
    const def = getModuleDef('instagram-hub')!;
    const schema = buildConfigSchema(def);
    expect(def.fields.find((f) => f.key === 'promoDiscountPercent')?.type).toBe('number');
    const blank = schema.safeParse({ promoDiscountPercent: '' });
    expect(blank.success).toBe(true);
    expect((blank as { data: Record<string, unknown> }).data.promoDiscountPercent).toBeUndefined();
    expect(schema.safeParse({ promoDiscountPercent: '20' }).success).toBe(true);
    expect(schema.safeParse({ promoDiscountPercent: 'junk' }).success).toBe(false);
    // Clamped by the field's min/max.
    expect(schema.safeParse({ promoDiscountPercent: 250 }).success).toBe(false);
  });

  it('booleans accept checkbox-style strings from HTML form posts', () => {
    const def = getModuleDef('sticky-booking-cta')!;
    const schema = buildConfigSchema(def);
    expect(def.fields.find((f) => f.key === 'desktop')?.type).toBe('boolean');
    const parsed = schema.parse({ desktop: 'on' });
    expect(parsed.desktop).toBe(true);
    expect(schema.parse({ desktop: 'false' }).desktop).toBe(false);
    expect(schema.parse({ desktop: '' }).desktop).toBeUndefined();
    expect(schema.safeParse({ desktop: 'maybe' }).success).toBe(false);
  });

  it('url fields refuse javascript: and data: values (config can never become an executable href)', () => {
    const defs = FEATURE_MODULES.filter((m) => m.fields.some((f) => f.type === 'url'));
    expect(defs.length).toBeGreaterThan(0);
    for (const def of defs) {
      const urlKey = def.fields.find((f) => f.type === 'url')!.key;
      const schema = buildConfigSchema(def);
      expect(schema.safeParse({ [urlKey]: 'javascript:alert(1)' }).success).toBe(false);
      expect(schema.safeParse({ [urlKey]: 'data:text/html,<script>' }).success).toBe(false);
      expect(schema.safeParse({ [urlKey]: 'https://example.com' }).success).toBe(true);
      expect(schema.safeParse({ [urlKey]: '/internal/path' }).success).toBe(true);
    }
  });
});

/* ── Merge semantics — "default IS the absence" ───────────────────────── */

describe('mergeModuleStates', () => {
  it('applies registry defaults when the table is empty', () => {
    const states = mergeModuleStates([]);
    expect(states.length).toBe(FEATURE_MODULES.length);
    for (const def of FEATURE_MODULES) {
      const state = states.find((s) => s.key === def.key)!;
      expect(state.enabled).toBe(def.defaultEnabled);
      expect(state.order).toBe(def.defaultOrder);
      expect(state.config).toEqual(defaultConfig(def));
    }
  });

  it('an override row wins over the registry default; absence keeps the default', () => {
    const off = getModuleDef('faq')!.defaultEnabled;
    const states = mergeModuleStates([row('faq', { enabled: off ? 0 : 1, displayOrder: 7 })]);
    const faq = states.find((s) => s.key === 'faq')!;
    expect(faq.enabled).toBe(!off);
    expect(faq.order).toBe(7);
    // Untouched module keeps its default.
    const hero = states.find((s) => s.key === 'hero')!;
    expect(hero.enabled).toBe(getModuleDef('hero')!.defaultEnabled);
  });

  it('enabled is read from the 0/1 integer only — no truthy coercion', () => {
    expect(
      mergeModuleStates([row('faq', { enabled: 2 })]).find((s) => s.key === 'faq')!.enabled,
    ).toBe(false);
    expect(
      mergeModuleStates([row('faq', { enabled: 1 })]).find((s) => s.key === 'faq')!.enabled,
    ).toBe(true);
    expect(
      mergeModuleStates([row('faq', { enabled: 0 })]).find((s) => s.key === 'faq')!.enabled,
    ).toBe(false);
  });

  it('sorts by order, then key — deterministic across renders', () => {
    const states = mergeModuleStates([
      row('faq', { displayOrder: 5 }),
      row('hero', { displayOrder: 5 }),
    ]);
    const orders = states.map((s) => s.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    // Two modules sharing an order are tie-broken alphabetically.
    const tied = states.filter((s) => s.order === 5).map((s) => s.key);
    expect(tied).toEqual([...tied].sort((a, b) => a.localeCompare(b)));
    // Rendering twice yields the same sequence (no Map iteration surprises).
    expect(mergeModuleStates([row('faq', { displayOrder: 5 })]).map((s) => s.key)).toEqual(
      mergeModuleStates([row('faq', { displayOrder: 5 })]).map((s) => s.key),
    );
  });

  it('garbage config JSON collapses to {} and the defaults still apply on top', () => {
    const def = getModuleDef('pricing-table')!;
    const states = mergeModuleStates([row('pricing-table', { config: 'not-json' })]);
    expect(states.find((s) => s.key === 'pricing-table')!.config).toEqual(defaultConfig(def));
  });

  it('a row only affects its own key — sibling modules stay at their defaults', () => {
    const states = mergeModuleStates([
      row('pricing-table', { config: JSON.stringify({ promoTitle: 'دoverride' }) }),
    ]);
    expect(states.find((s) => s.key === 'pricing-table')!.config.promoTitle).toBe('دoverride');
    expect(states.find((s) => s.key === 'hero')!.config).toEqual(
      defaultConfig(getModuleDef('hero')!),
    );
  });
});

/* ── Admin hub view ────────────────────────────────────────────────────── */

describe('mergeAdminModules', () => {
  it('sets hasOverride only when a row exists', () => {
    const view = mergeAdminModules([row('faq', { enabled: 0 })]);
    expect(view.find((m) => m.key === 'faq')!.hasOverride).toBe(true);
    expect(view.find((m) => m.key === 'hero')!.hasOverride).toBe(false);
  });

  it('carries the registry metadata the hub renders (name, icon, category, premium, offNote)', () => {
    const view = mergeAdminModules([]);
    for (const def of FEATURE_MODULES) {
      const module = view.find((m) => m.key === def.key)!;
      expect(module.name).toBe(def.name);
      expect(module.icon).toBe(def.icon);
      expect(module.category).toBe(def.category);
      expect(module.premium).toBe(def.premium);
      expect(module.offNote).toBe(def.offNote);
      expect(module.fields).toBe(def.fields);
    }
  });
});

/* ── Public API surface — what the site exposes ────────────────────────── */

describe('publicModules', () => {
  it('lists only enabled, non-internal modules — disabled ones are invisible', () => {
    const states = mergeModuleStates([row('faq', { enabled: 0 })]);
    const list = publicModules(states);
    const keys = list.map((m) => m.key);
    expect(keys).not.toContain('faq');
    for (const item of list) {
      const def = getModuleDef(item.key)!;
      expect(def.internal).toBe(false);
      expect(states.find((s) => s.key === item.key)!.enabled).toBe(true);
    }
  });

  it('includes the effective config for each enabled module', () => {
    const list = publicModules(
      mergeModuleStates([row('pricing-table', { config: '{"promoTitle":"T"}' })]),
    );
    const pricing = list.find((m) => m.key === 'pricing-table')!;
    expect(pricing.config.promoTitle).toBe('T');
  });
});

/* ── Template gates ────────────────────────────────────────────────────── */

describe('isModuleOn / enabledConfig', () => {
  it('unknown keys are off and expose no config', () => {
    const map = toStateMap(mergeModuleStates([]));
    expect(isModuleOn(map, 'nope')).toBe(false);
    expect(enabledConfig(map, 'nope')).toEqual({});
  });

  it('a disabled module exposes no config through enabledConfig', () => {
    const map = toStateMap(mergeModuleStates([row('faq', { enabled: 0 })]));
    expect(isModuleOn(map, 'faq')).toBe(false);
    expect(enabledConfig(map, 'faq')).toEqual({});
  });

  it('an enabled module returns its effective config', () => {
    const map = toStateMap(mergeModuleStates([row('faq', { enabled: 1 })]));
    expect(isModuleOn(map, 'faq')).toBe(true);
    expect(enabledConfig(map, 'faq')).toEqual(defaultConfig(getModuleDef('faq')!));
  });
});

/* ── Stored-config parsing ─────────────────────────────────────────────── */

describe('parseStoredConfig', () => {
  it('rejects non-object JSON (arrays, strings, null) instead of half-applying', () => {
    expect(parseStoredConfig('pricing-table', '[]')).toEqual({});
    expect(parseStoredConfig('pricing-table', '"x"')).toEqual({});
    expect(parseStoredConfig('pricing-table', 'null')).toEqual({});
    expect(parseStoredConfig('pricing-table', '')).toEqual({});
    expect(parseStoredConfig('pricing-table', null)).toEqual({});
  });

  it('one invalid value rejects the whole blob (never half-applied)', () => {
    const parsed = parseStoredConfig(
      'pricing-table',
      JSON.stringify({ promoTitle: 'valid', promoServiceSlug: 12 }),
    );
    // `promoServiceSlug` is a text field, so a number is invalid there and the
    // whole blob is refused rather than persisted half-valid.
    expect(parsed).toEqual({});
  });

  it('refuses a blob carrying an unknown key (strict schema, no silent drop)', () => {
    expect(
      parseStoredConfig('pricing-table', JSON.stringify({ promoTitle: 'a', unknown: 'b' })),
    ).toEqual({});
  });
});

/* ── Instagram resolution — never trust user input ─────────────────────── */

describe('resolveInstagram', () => {
  it('falls back to the legacy settings keys when the module config is empty', () => {
    const view = resolveInstagram(
      {},
      {
        instagram_username: 'tehranlaser_clinic',
        instagram_promo_code: 'LASER15',
        instagram_follower_discount_percent: '20',
        instagram_latest_reel_url: 'https://www.instagram.com/reel/abc/',
        instagram_bio_link: 'https://example.com',
      },
    );
    expect(view.handle).toBe('tehranlaser_clinic');
    expect(view.profileUrl).toBe('https://www.instagram.com/tehranlaser_clinic/');
    expect(view.promoCode).toBe('LASER15');
    expect(view.discountPercent).toBe('20');
    expect(view.reelUrl).toBe('https://www.instagram.com/reel/abc/');
    expect(view.bioLink).toBe('https://example.com');
  });

  it('module config wins over legacy settings', () => {
    const view = resolveInstagram(
      { handle: 'newhandle', promoCode: 'NEW', promoDiscountPercent: 10 },
      {
        instagram_username: 'old',
        instagram_promo_code: 'OLD',
        instagram_follower_discount_percent: '99',
      },
    );
    expect(view.handle).toBe('newhandle');
    expect(view.promoCode).toBe('NEW');
    expect(view.discountPercent).toBe('10');
  });

  it('cleans a pasted handle: strips @, host and illegal characters', () => {
    expect(normalizeInstagramHandle('@TehranLaser')).toBe('TehranLaser');
    expect(normalizeInstagramHandle('https://www.instagram.com/TehranLaser/')).toBe('TehranLaser');
    expect(normalizeInstagramHandle('tehran laser!')).toBe('tehranlaser');
    expect(normalizeInstagramHandle('')).toBe('');
  });

  it('never hosts an unsafe reel URL: falls back to the profile', () => {
    const profile = 'https://www.instagram.com/tehranlaser_clinic/';
    expect(safeInstagramReelUrl('http://instagram.com/x', profile)).toBe(profile);
    expect(safeInstagramReelUrl('https://evil.com/reel', profile)).toBe(profile);
    expect(safeInstagramReelUrl('https://www.instagram.com/reel/xyz/', profile)).toBe(
      'https://www.instagram.com/reel/xyz/',
    );
  });

  it('never returns a non-https bio link', () => {
    expect(safeExternalLink('javascript:alert(1)')).toBe('');
    expect(safeExternalLink('ftp://x')).toBe('');
    expect(safeExternalLink('https://ok.example')).toBe('https://ok.example');
  });

  it('produces a safe profile URL even from an empty handle', () => {
    const view = resolveInstagram({}, {});
    expect(view.handle).toBe('tehranlaser_clinic');
    expect(view.profileUrl).toBe('https://www.instagram.com/tehranlaser_clinic/');
    expect(view.reelUrl).toBe(view.profileUrl);
  });
});

/* ── effectiveConfig ───────────────────────────────────────────────────── */

describe('effectiveConfig', () => {
  it('overlays the override on the defaults without mutating either', () => {
    const def = getModuleDef('pricing-table')!;
    const defaults = defaultConfig(def);
    const override = { promoTitle: 'دoverride' } as Record<string, string | number | boolean>;
    const merged = effectiveConfig('pricing-table', override);
    expect(merged.promoTitle).toBe('دoverride');
    expect(defaultConfig(def)).toEqual(defaults);
    expect(override).toEqual({ promoTitle: 'دoverride' });
  });

  it('returns {} for unknown keys', () => {
    expect(effectiveConfig('nope', {})).toEqual({});
  });
});
