#!/usr/bin/env node
/**
 * Seed a local development super_admin so `wrangler dev` has a way in.
 *
 *   npm run db:seed:admin                 # admin@tehranlaser.ir / AdminPass123!
 *   ADMIN_EMAIL=me@x.dev ADMIN_PASSWORD='...' npm run db:seed:admin
 *
 * Local only, deliberately: the halting check below refuses `--remote` so this
 * can never plant a known-password admin in production. Runs against the same
 * local D1 file that `wrangler dev` uses.
 */
import { execFileSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';

const { subtle } = webcrypto;
const ITERATIONS = 100_000;

const email = process.env.ADMIN_EMAIL ?? 'admin@tehranlaser.ir';
const password = process.env.ADMIN_PASSWORD ?? 'AdminPass123!';
const displayName = process.env.ADMIN_NAME ?? 'مدیر سیستم';
const userId = process.env.ADMIN_ID ?? 'usr_dev_admin';
const roleId = process.env.ADMIN_ROLE ?? 'role_super_admin';

if (process.argv.includes('--remote')) {
  console.error('refusing to seed a development admin into the remote database');
  process.exit(1);
}

async function hash(value) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const key = await subtle.importKey('raw', new TextEncoder().encode(value), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);
  const b64 = (bytes) => Buffer.from(bytes).toString('base64');
  return `pbkdf2-sha256$${ITERATIONS}$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}

const escape = (value) => String(value).replace(/'/g, "''");
const passwordHash = await hash(password);
const now = new Date().toISOString();

const statements = [
  `INSERT INTO users (id, email, password_hash, display_name, active, created_at, updated_at)
   VALUES ('${escape(userId)}', '${escape(email)}', '${escape(passwordHash)}', '${escape(displayName)}', 1, '${now}', '${now}')
   ON CONFLICT(id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash,
     display_name = excluded.display_name, active = 1, updated_at = excluded.updated_at`,
  `INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES ('${escape(userId)}', '${escape(roleId)}')`,
];

execFileSync(
  'npx',
  ['wrangler', 'd1', 'execute', 'tehran-laser-db', '--local', '--command', statements.join('; ')],
  { stdio: 'inherit' },
);

console.log(`seeded ${email} (local only)`);
