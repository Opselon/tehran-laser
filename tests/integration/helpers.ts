import { env } from 'cloudflare:workers';
import m1 from '../../migrations/0001_init.sql?raw';
import m2 from '../../migrations/0002_rbac.sql?raw';
import m3 from '../../migrations/0003_settings_hours.sql?raw';
import m4 from '../../migrations/0004_services_prices.sql?raw';
import m5 from '../../migrations/0005_faq.sql?raw';
import { hashPassword } from '../../src/lib/security/password';

let migrated = false;

function splitSqlStatements(sql: string): string[] {
  const cleaned = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => {
      const idx = line.indexOf('--');
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join('\n');

  return cleaned
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function runMigration(sql: string): Promise<void> {
  const statements = splitSqlStatements(sql);
  for (const stmt of statements) {
    await env.DB.prepare(stmt).run();
  }
}

export async function ensureMigrated(): Promise<void> {
  if (migrated) return;
  // Apply in strict order
  await runMigration(m1);
  await runMigration(m2);
  await runMigration(m3);
  await runMigration(m4);
  await runMigration(m5);

  // Seed a test super_admin for admin integration tests
  const adminId = 'usr_test_superadmin';
  const hashed = await hashPassword('AdminPass123!');
  const nowIso = new Date().toISOString();

  await env.DB.prepare(
    `INSERT OR IGNORE INTO users (id, email, password_hash, display_name, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`,
  )
    .bind(adminId, 'admin@tehranlaser.ir', hashed, 'مدیر سیستم', nowIso, nowIso)
    .run();

  await env.DB.prepare(
    `INSERT OR IGNORE INTO user_roles (user_id, role_id)
     VALUES (?, 'role_super_admin')`,
  )
    .bind(adminId)
    .run();

  // Also seed a test editor (has blog and seo, but NOT pricing or settings) to test RBAC
  const editorId = 'usr_test_editor';
  const editorHashed = await hashPassword('EditorPass123!');

  await env.DB.prepare(
    `INSERT OR IGNORE INTO users (id, email, password_hash, display_name, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`,
  )
    .bind(editorId, 'editor@tehranlaser.ir', editorHashed, 'نویسنده محتوا', nowIso, nowIso)
    .run();

  await env.DB.prepare(
    `INSERT OR IGNORE INTO user_roles (user_id, role_id)
     VALUES (?, 'role_editor')`,
  )
    .bind(editorId)
    .run();

  migrated = true;
}
