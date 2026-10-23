import { env } from 'cloudflare:workers';
import m1 from '../../migrations/0001_init.sql?raw';
import m2 from '../../migrations/0002_rbac.sql?raw';
import m3 from '../../migrations/0003_settings_hours.sql?raw';
import m4 from '../../migrations/0004_services_prices.sql?raw';
import m5 from '../../migrations/0005_faq.sql?raw';
import m6 from '../../migrations/0006_seed_blog.sql?raw';
import m7 from '../../migrations/0007_advanced_crm_suite.sql?raw';
import m9 from '../../migrations/0009_male_prices.sql?raw';
import m10 from '../../migrations/0010_device_content_refresh.sql?raw';
import m11 from '../../migrations/0011_feature_modules.sql?raw';
import m12 from '../../migrations/0012_operators.sql?raw';
import m13 from '../../migrations/0013_content_cleanup.sql?raw';
import { hashPassword } from '../../src/lib/security/password';

let migrated = false;

/**
 * Split a migration file into executable statements.
 *
 * A naive `split(';')` corrupts any migration whose INSERT carries HTML copy
 * with semicolons inside a quoted string (0010 seeds article bodies that do).
 * This walks the SQL, tracks single-quoted strings (including the '' escape)
 * and skips `--` / block comments, so `;` only splits real statement
 * boundaries.
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i]!;
    const next = sql[i + 1];

    if (inString) {
      current += char;
      if (char === "'") {
        if (next === "'") {
          current += next; // escaped quote inside the literal
          i += 1;
        } else {
          inString = false;
        }
      }
      continue;
    }

    // Line comment → drop to end of line.
    if (char === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i += 1;
      current += '\n';
      continue;
    }

    // Block comment → drop it entirely.
    if (char === '/' && next === '*') {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 1;
      continue;
    }

    if (char === "'") {
      inString = true;
      current += char;
      continue;
    }

    if (char === ';') {
      const stmt = current.trim();
      if (stmt.length > 0) statements.push(stmt);
      current = '';
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail.length > 0) statements.push(tail);
  return statements;
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
  await runMigration(m6);
  await runMigration(m7);
  await runMigration(m9);
  await runMigration(m10);
  await runMigration(m11);
  await runMigration(m12);
  await runMigration(m13);

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
