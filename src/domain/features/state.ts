/**
 * Pure feature-state helpers — merge, gate and config resolution.
 *
 * Kept free of D1/Astro imports so the rules that decide "does this section
 * render?" are unit-testable in plain Node (tests/unit/features.test.ts) and
 * have exactly one implementation shared by SSR pages, the public API and the
 * admin hub.
 */

import {
  FEATURE_MODULES,
  buildConfigSchema,
  defaultConfig,
  getModuleDef,
  normalizeInstagramHandle,
  type AdminModuleView,
  type ModuleConfig,
  type ModuleState,
} from './registry';

// Re-exported for callers that imported it from the state module.
export { normalizeInstagramHandle };

/** Raw row shape read from `feature_modules` (snake_case, as D1 returns it). */
export interface FeatureModuleRow {
  key: string;
  enabled: number;
  displayOrder: number;
  config: string | null;
}

/** Parse a stored config JSON blob, validated against the module schema.
 *  Anything unparseable or invalid collapses to `{}` — never to a half-applied
 *  config — and the caller merges defaults on top. */
export function parseStoredConfig(key: string, raw: string | null | undefined): ModuleConfig {
  const def = getModuleDef(key);
  if (!def || !raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result = buildConfigSchema(def).safeParse(parsed);
    return result.success ? (result.data as ModuleConfig) : {};
  } catch {
    return {};
  }
}

/** Effective config = registry defaults overlaid with the validated override. */
export function effectiveConfig(key: string, override: ModuleConfig): ModuleConfig {
  const def = getModuleDef(key);
  if (!def) return {};
  return { ...defaultConfig(def), ...override };
}

/** Merge registry defaults with DB override rows into the effective state list. */
export function mergeModuleStates(rows: FeatureModuleRow[]): ModuleState[] {
  const overrides = new Map(rows.map((r) => [r.key, r]));

  return FEATURE_MODULES.map((def) => {
    const row = overrides.get(def.key);
    return {
      key: def.key,
      enabled: row ? row.enabled === 1 : def.defaultEnabled,
      order: row ? row.displayOrder : def.defaultOrder,
      config: effectiveConfig(def.key, parseStoredConfig(def.key, row?.config ?? null)),
    };
  }).sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

/** Admin hub view: state + registry metadata + hasOverride flag. */
export function mergeAdminModules(rows: FeatureModuleRow[]): AdminModuleView[] {
  const overrides = new Map(rows.map((r) => [r.key, r]));

  return FEATURE_MODULES.map((def) => {
    const row = overrides.get(def.key);
    return {
      key: def.key,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      premium: def.premium,
      internal: def.internal,
      hasOverride: !!row,
      offNote: def.offNote,
      fields: def.fields,
      enabled: row ? row.enabled === 1 : def.defaultEnabled,
      order: row ? row.displayOrder : def.defaultOrder,
      config: effectiveConfig(def.key, parseStoredConfig(def.key, row?.config ?? null)),
    };
  }).sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

/** key→state map, the shape SSR pages want for cheap `isOn('faq')` checks. */
export function toStateMap(states: ModuleState[]): Map<string, ModuleState> {
  return new Map(states.map((s) => [s.key, s]));
}

/** Gate used by templates: unknown module ⇒ false (fail closed). */
export function isModuleOn(states: Map<string, ModuleState>, key: string): boolean {
  return states.get(key)?.enabled === true;
}

/** Config of an enabled module, or an empty object when it is off/unknown. */
export function enabledConfig(states: Map<string, ModuleState>, key: string): ModuleConfig {
  const state = states.get(key);
  return state?.enabled ? state.config : {};
}

/** Public API list: enabled + public modules only, config included. */
export function publicModules(states: ModuleState[]): Array<{ key: string; config: ModuleConfig }> {
  return states
    .filter((s) => {
      const def = getModuleDef(s.key);
      return s.enabled && def !== null && !def.internal;
    })
    .map((s) => ({ key: s.key, config: s.config }));
}

/** Reel URL is only honoured when it is an instagram.com https URL. */
export function safeInstagramReelUrl(value: string, fallback: string): string {
  const candidate = value.trim();
  return /^https:\/\/(www\.)?instagram\.com\//i.test(candidate) ? candidate : fallback;
}

/** Bio link must be https (or empty); anything else collapses to ''. */
export function safeExternalLink(value: string): string {
  const candidate = value.trim();
  return /^https?:\/\//i.test(candidate) ? candidate : '';
}

export interface InstagramView {
  handle: string;
  profileUrl: string;
  reelUrl: string;
  promoCode: string;
  discountPercent: string;
  bioLink: string;
}

/**
 * Resolve the Instagram hub view from the module config, falling back to the
 * legacy `instagram_*` settings rows for a site that has never saved the module
 * (existing deployments keep their real handle/promo until the first save).
 */
export function resolveInstagram(
  config: ModuleConfig,
  legacySettings: Record<string, string> = {},
): InstagramView {
  const pick = (configKey: string, settingsKey: string): string => {
    const fromConfig = config[configKey];
    if (typeof fromConfig === 'string' && fromConfig.trim() !== '') return fromConfig;
    if (typeof fromConfig === 'number') return String(fromConfig);
    return legacySettings[settingsKey] ?? '';
  };

  const handle = normalizeInstagramHandle(pick('handle', 'instagram_username')) || 'tehranlaser_clinic';
  const profileUrl = `https://www.instagram.com/${handle}/`;
  const discountPercent = String(pick('promoDiscountPercent', 'instagram_follower_discount_percent'))
    .replace(/\D/g, '')
    .slice(0, 2);

  return {
    handle,
    profileUrl,
    reelUrl: safeInstagramReelUrl(pick('latestReelUrl', 'instagram_latest_reel_url'), profileUrl),
    promoCode: pick('promoCode', 'instagram_promo_code').replace(/[^\w-]/g, '').slice(0, 24),
    discountPercent,
    bioLink: safeExternalLink(pick('bioLink', 'instagram_bio_link')),
  };
}
