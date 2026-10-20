/**
 * Feature-module persistence — the only code that reads or writes the
 * `feature_modules` table (migration 0011).
 *
 * Rules enforced here:
 *  - Writes validate the config with the module's zod schema BEFORE the UPSERT,
 *    so the table can never hold unvalidated state. A rejection throws
 *    ApiError(VALIDATION_ERROR) with per-field messages.
 *  - `key` must exist in the registry; an unknown key is a 404, never a new row.
 *  - All reads go through the state merge helpers (domain/features/state.ts),
 *    so DB shape changes can't leak into templates.
 */

import { ApiError } from '../lib/api/errors';
import { all, one, run } from '../db/query';
import type { Queryable } from '../db/query';
import { getModuleDef, isKnownModuleKey, buildConfigSchema, defaultConfig } from '../domain/features/registry';
import {
  mergeAdminModules,
  mergeModuleStates,
  parseStoredConfig,
  toStateMap,
  type FeatureModuleRow,
} from '../domain/features/state';
import type { AdminModuleView, ModuleConfig, ModuleState } from '../domain/features/registry';

/* ───────────────────────────── READS ────────────────────────────── */

async function readRows(db: Queryable): Promise<FeatureModuleRow[]> {
  return all<FeatureModuleRow>(
    db,
    `SELECT key, enabled, display_order AS displayOrder, config FROM feature_modules`,
  );
}

/** Effective state of every module (override > default), sorted for the hub. */
export async function listModuleStates(db: Queryable): Promise<ModuleState[]> {
  return mergeModuleStates(await readRows(db));
}

/** key→state map, the shape SSR pages want for cheap `isOn('faq')` checks. */
export async function getModuleStateMap(db: Queryable): Promise<Map<string, ModuleState>> {
  return toStateMap(await listModuleStates(db));
}

/** True when the module exists and is enabled. Unknown keys fail closed. */
export async function isModuleEnabled(db: Queryable, key: string): Promise<boolean> {
  if (!isKnownModuleKey(key)) return false;
  const row = await one<{ enabled: number }>(
    db,
    `SELECT enabled FROM feature_modules WHERE key = ?`,
    key,
  );
  const def = getModuleDef(key)!;
  return row ? row.enabled === 1 : def.defaultEnabled;
}

/** Admin hub view: state + registry metadata + hasOverride. */
export async function listAdminModules(db: Queryable): Promise<AdminModuleView[]> {
  return mergeAdminModules(await readRows(db));
}

/* ───────────────────────────── WRITES ───────────────────────────── */

export interface PersistModuleInput {
  enabled?: boolean;
  order?: number;
  config?: ModuleConfig;
  updatedBy: string;
}

function validateConfig(key: string, config: ModuleConfig): ModuleConfig {
  const def = getModuleDef(key);
  if (!def) throw new ApiError('NOT_FOUND', 'ماژول مورد نظر یافت نشد.');

  // Carrying every submitted key (not just the known ones) into the parse is
  // deliberate: the module schema is strict, so a typo'd key becomes a 422
  // instead of a setting that is silently swallowed.
  const candidate: Record<string, unknown> = {};
  for (const [submittedKey, value] of Object.entries(config)) {
    const field = def.fields.find((f) => f.key === submittedKey);
    if (!field) {
      candidate[submittedKey] = value; // strict() rejects it below
      continue;
    }
    if (value === undefined) continue;
    const asString = field.type === 'boolean' ? value : String(value);
    candidate[submittedKey] =
      field.normalize && typeof asString === 'string' ? field.normalize(asString) : asString;
  }

  const result = buildConfigSchema(def).safeParse(candidate);
  if (!result.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const fieldKey = issue.path.length > 0 ? String(issue.path[0]) : '_';
      (fields[fieldKey] ?? (fields[fieldKey] = [])).push(issue.message);
    }
    throw new ApiError('VALIDATION_ERROR', 'تنظیمات ماژول معتبر نیست.', { fields });
  }
  return result.data as ModuleConfig;
}

/**
 * Upsert one module's override row. Fields not present in `config` keep their
 * current/registry value (partial update, same contract as the Instagram route).
 */
export async function persistModule(
  db: Queryable,
  key: string,
  input: PersistModuleInput,
): Promise<ModuleState> {
  const def = getModuleDef(key);
  if (!def) throw new ApiError('NOT_FOUND', 'ماژول مورد نظر یافت نشد.');

  const existing = await one<{ enabled: number; displayOrder: number; config: string | null }>(
    db,
    `SELECT enabled, display_order AS displayOrder, config FROM feature_modules WHERE key = ?`,
    key,
  );

  const enabled =
    input.enabled !== undefined
      ? input.enabled
      : existing
        ? existing.enabled === 1
        : def.defaultEnabled;
  const order = input.order !== undefined ? input.order : existing ? existing.displayOrder : def.defaultOrder;

  let config: ModuleConfig;
  if (input.config !== undefined) {
    const validated = validateConfig(key, input.config);
    config = existing
      ? { ...defaultConfig(def), ...parseStoredConfig(key, existing.config), ...validated }
      : { ...defaultConfig(def), ...validated };
  } else {
    config = existing
      ? { ...defaultConfig(def), ...parseStoredConfig(key, existing.config) }
      : defaultConfig(def);
  }

  const nowIso = new Date().toISOString();
  await run(
    db,
    `INSERT INTO feature_modules (key, enabled, display_order, config, updated_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       enabled = excluded.enabled,
       display_order = excluded.display_order,
       config = excluded.config,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
    key,
    enabled ? 1 : 0,
    order,
    JSON.stringify(config),
    nowIso,
    input.updatedBy,
  );

  return {
    key,
    enabled,
    order,
    config,
  };
}

/** Delete a module's override row → it falls back to its registry default. */
export async function resetModule(db: Queryable, key: string): Promise<boolean> {
  if (!isKnownModuleKey(key)) return false;
  const result = await run(db, `DELETE FROM feature_modules WHERE key = ?`, key);
  return (result.meta?.changes ?? 0) > 0;
}
