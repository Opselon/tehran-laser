/** PBKDF2-SHA256 password hashing via WebCrypto (available in workerd + Node).
 *
 *  Format: `pbkdf2-sha256$<iterations>$<saltB64>$<hashB64>` so the cost factor can
 *  evolve without invalidating stored hashes.
 *
 *  Default iterations = 100k: a deliberate trade-off documented in SECURITY.md —
 *  Workers Free has a small per-invocation CPU budget, so OWASP's 600k recommendation
 *  would breach it on every login. Raise via the private `password_iterations` setting
 *  if the plan allows more CPU.
 */

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const DEFAULT_PASSWORD_ITERATIONS = 100_000;

export async function hashPassword(
  password: string,
  iterations: number = DEFAULT_PASSWORD_ITERATIONS,
  salt?: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    key,
    256,
  );
  return `pbkdf2-sha256$${iterations}$${toBase64(saltBytes)}${'$'}${toBase64(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') return false;
  const iterations = Number.parseInt(parts[1] ?? '', 10);
  if (!Number.isFinite(iterations) || iterations < 1_000 || iterations > 5_000_000) return false;
  let salt: Uint8Array<ArrayBuffer>;
  let expected: Uint8Array<ArrayBuffer>;
  try {
    salt = fromBase64(parts[2] ?? '');
    expected = fromBase64(parts[3] ?? '');
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    expected.length * 8,
  );
  const actual = new Uint8Array(bits);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) diff |= (actual[i] ?? 0) ^ (expected[i] ?? 0);
  return diff === 0;
}
