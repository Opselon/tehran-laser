/** Opaque tokens, session cookies, password hashing surface for auth.

 *  Cookie rules (contract §56): HttpOnly + Secure + SameSite=Lax, server-managed,
 *  no localStorage, rotated by revoking the old session and issuing a new token.
 */

export const SESSION_COOKIE_NAME = 'tl_session';

export function randomToken(bytes = 32): string {
  const buffer = crypto.getRandomValues(new Uint8Array(bytes));
  return base64Url(buffer);
}

export function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export interface CookieOptions {
  maxAgeSeconds: number;
  secure: boolean;
}

export function buildSessionCookie(token: string, options: CookieOptions): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`,
  ];
  // Secure would break plain-http local development; production is always https.
  if (options.secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const chunk of header.split(';')) {
    const eq = chunk.indexOf('=');
    if (eq === -1) continue;
    if (chunk.slice(0, eq).trim() !== SESSION_COOKIE_NAME) continue;
    const raw = chunk.slice(eq + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return null;
    }
  }
  return null;
}

export function isSecureRequest(request: Request): boolean {
  const url = request.url;
  if (url.startsWith('https://')) return true;
  const forwarded = request.headers.get('x-forwarded-proto');
  return forwarded === 'https';
}
