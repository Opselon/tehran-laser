#!/usr/bin/env node
/**
 * Hash a password exactly like the Worker does, for seeding or handover.
 *
 *   node scripts/hash-password.mjs 'SomePass123!'
 *
 * Prints a `pbkdf2-sha256$<iterations>$<salt>$<hash>` string that
 * src/lib/security/password.ts verifies. Never write a plaintext password into
 * a migration or a seed file — hash it here first.
 */
import { webcrypto } from 'node:crypto';

const { subtle } = webcrypto;
const encoder = new TextEncoder();
const ITERATIONS = 100_000;

const password = process.argv[2];
if (!password) {
  console.error("usage: node scripts/hash-password.mjs '<password>'");
  process.exit(1);
}

const salt = webcrypto.getRandomValues(new Uint8Array(16));
const key = await subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
const bits = await subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);

const b64 = (bytes) => Buffer.from(bytes).toString('base64');
console.log(`pbkdf2-sha256$${ITERATIONS}$${b64(salt)}$${b64(new Uint8Array(bits))}`);
