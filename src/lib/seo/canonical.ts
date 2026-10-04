import { env } from 'cloudflare:workers';

/**
 * Canonical URL resolution engine for Tehran Laser (Contract §133, §135)
 *
 * Ensures all pages emit an absolute, normalized, canonical URL:
 * - HTTPS protocol enforced
 * - Preferred production origin resolved at runtime:
 *   env.SITE_URL (wrangler `vars`) → DEFAULT_CANONICAL_ORIGIN
 * - Trailing slash normalization (single slash for root, no trailing slash for subpaths)
 * - Strip transient marketing query params (utm_*, gclid, fbclid, etc.)
 *
 * NOTE: tehranlaser.ir is the intended future vanity domain. It is NOT live yet
 * (it currently serves a domain-parking page), so it must never be emitted as a
 * canonical/OG/sitemap URL until it points at this worker. The live origin is
 * https://tehran-laser.samerkhaldounmarefi.workers.dev.
 */

/**
 * Fallback canonical origin. Only used when no SITE_URL binding is available
 * (e.g. unit tests, local builds). Keep this pointed at the LIVE workers
 * origin, never the parked vanity domain.
 */
export const DEFAULT_CANONICAL_ORIGIN = 'https://tehran-laser.samerkhaldounmarefi.workers.dev';

/**
 * Single source of truth for the origin used in canonical links, og:url,
 * og:image, hreflang, JSON-LD @id and sitemap/robots <loc>/Sitemap values.
 *
 * Precedence: SITE_URL wrangler var → DEFAULT_CANONICAL_ORIGIN.
 * A non-https or empty SITE_URL is ignored so a misconfiguration can never
 * emit a dead origin.
 */
export function resolveCanonicalOrigin(): string {
  const configured = typeof env !== 'undefined' ? env.SITE_URL : undefined;
  if (configured && /^https:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  return DEFAULT_CANONICAL_ORIGIN;
}

const STRIPPED_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
  'ref',
  'source',
]);

function normalizeUrlObject(u: URL): URL {
  let pathname = u.pathname.replace(/\/+/g, '/');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  u.pathname = pathname;
  // Clean stripped query params
  const toDelete: string[] = [];
  u.searchParams.forEach((_, key) => {
    if (STRIPPED_QUERY_PARAMS.has(key.toLowerCase())) {
      toDelete.push(key);
    }
  });
  toDelete.forEach((k) => u.searchParams.delete(k));
  return u;
}

/**
 * Normalizes an arbitrary pathname, URL string, or URL object into a pristine canonical URL.
 *
 * `preferredOrigin` is optional: when omitted the runtime canonical origin is
 * resolved automatically (see `resolveCanonicalOrigin`).
 */
export function buildCanonicalUrl(
  input: string | URL,
  customCanonical?: string,
  preferredOrigin?: string,
): string {
  const resolvedOrigin = (preferredOrigin || resolveCanonicalOrigin()).replace(/\/+$/, '');

  // 1. If explicit custom canonical URL is supplied, normalize and return it
  if (customCanonical && customCanonical.trim()) {
    const trimmed = customCanonical.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const u = new URL(trimmed);
        return normalizeUrlObject(u).href;
      } catch {
        return trimmed;
      }
    }
    // Relative custom canonical
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${resolvedOrigin}${cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '')}`;
  }

  // 2. Resolve path from input
  let parsedUrl: URL;
  try {
    if (input instanceof URL) {
      parsedUrl = new URL(input.href);
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      parsedUrl = new URL(input);
    } else {
      const cleanPath = input.startsWith('/') ? input : `/${input}`;
      parsedUrl = new URL(cleanPath, resolvedOrigin);
    }
  } catch {
    parsedUrl = new URL('/', resolvedOrigin);
  }

  // 3. Force origin to preferred canonical origin
  const canonicalUrl = new URL(parsedUrl.pathname, resolvedOrigin);

  // 5. Normalize pathname (remove trailing slashes, keep root '/')
  let pathname = canonicalUrl.pathname.replace(/\/+/g, '/');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  canonicalUrl.pathname = pathname;

  // 6. Filter out transient marketing queries while keeping pagination if necessary
  parsedUrl.searchParams.forEach((value, key) => {
    if (!STRIPPED_QUERY_PARAMS.has(key.toLowerCase()) && key.toLowerCase() === 'page') {
      canonicalUrl.searchParams.set(key, value);
    }
  });

  return canonicalUrl.href;
}
