/**
 * Canonical URL resolution engine for Tehran Laser (Contract §133, §135)
 *
 * Ensures all pages emit an absolute, normalized, canonical URL:
 * - HTTPS protocol enforced
 * - Preferred production origin (tehranlaser.ir or configured SITE_URL)
 * - Trailing slash normalization (single slash for root, no trailing slash for subpaths)
 * - Strip transient marketing query params (utm_*, gclid, fbclid, etc.)
 */

export const DEFAULT_CANONICAL_ORIGIN = 'https://tehranlaser.ir';

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
 */
export function buildCanonicalUrl(
  input: string | URL,
  customCanonical?: string,
  preferredOrigin?: string,
): string {
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
    const origin = (preferredOrigin || DEFAULT_CANONICAL_ORIGIN).replace(/\/+$/, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${origin}${cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '')}`;
  }

  // 2. Resolve origin
  const origin = (preferredOrigin || DEFAULT_CANONICAL_ORIGIN).replace(/\/+$/, '');

  // 3. Resolve path from input
  let parsedUrl: URL;
  try {
    if (input instanceof URL) {
      parsedUrl = new URL(input.href);
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      parsedUrl = new URL(input);
    } else {
      const cleanPath = input.startsWith('/') ? input : `/${input}`;
      parsedUrl = new URL(cleanPath, origin);
    }
  } catch {
    parsedUrl = new URL('/', origin);
  }

  // 4. Force origin to preferred canonical origin
  const canonicalUrl = new URL(parsedUrl.pathname, origin);

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
