/**
 * Presentation helpers shared by the blog index and the homepage journal strip.
 *
 * Both surfaces show the same DB rows, so a rule that only one of them applied
 * would be a bug on the other. Pure functions — no Astro, no DOM — so the rules
 * are unit-tested rather than eyeballed.
 */

/**
 * The public image CSP is `img-src 'self' data: blob:`, so an off-site cover is
 * refused before it loads: that logs a CSP violation and leaves a broken image.
 * Treat any cover the CSP would reject as absent so the caller's CSS fallback
 * renders instead.
 */
export function cspSafeCover(url: string | null | undefined, origin: string): string | undefined {
  if (!url) return undefined;
  const value = url.trim();
  if (!value) return undefined;
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    if (new URL(value, origin).origin === origin) return value;
  } catch {
    // Unparsable reference — never emit it.
  }
  return undefined;
}

/** Rough reading estimate; minimum 3 so a stub post does not claim "1 minute". */
export function readingMinutes(text: string | null | undefined): number {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 150));
}
