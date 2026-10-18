/**
 * Route registry — the single source of truth for the public site's
 * navigational surface.
 *
 * Why it lives in the SEO layer: the primary nav markup, the mobile drawer, the
 * footer "quick access" column, the SiteNavigationElement JSON-LD and the
 * layout-level BreadcrumbList all describe the SAME set of pages. When each one
 * hardcodes its own hrefs, a renamed route silently leaves a 404 in the footer
 * or a stale URL in structured data. Everything reads from here instead.
 */

export interface NavItem {
  /** Root-relative path, exactly as rendered in an href. */
  href: string;
  /** Persian label, exactly as rendered in the link text. */
  label: string;
  /** Icon.astro glyph name — bottom nav renders one per item. */
  icon?: string;
}

/** Primary navigation — desktop nav, mobile drawer, SiteNavigationElement. */
export const PRIMARY_NAV: NavItem[] = [
  { href: '/', label: 'صفحه اصلی' },
  { href: '/services', label: 'خدمات و تعرفه‌ها' },
  { href: '/clinic', label: 'درباره کلینیک' },
  { href: '/faq', label: 'سوالات متداول' },
  { href: '/blog', label: 'مجله تخصصی' },
  { href: '/contact', label: 'تماس و آدرس' },
];

/** Mobile bottom navigation (≤768px). */
export const BOTTOM_NAV: Array<NavItem & { icon: string }> = [
  { href: '/', label: 'خانه', icon: 'dashboard' },
  { href: '/services', label: 'خدمات', icon: 'services' },
  { href: '/booking', label: 'رزرو', icon: 'calendar' },
  { href: '/contact', label: 'تماس', icon: 'phone' },
];

/** Footer "دسترسی سریع" column. */
export const FOOTER_QUICK_LINKS: NavItem[] = [
  { href: '/services', label: 'تعرفه لیزر بانوان و آقایان' },
  { href: '/booking', label: 'سامانه رزرو آنلاین' },
  { href: '/clinic', label: 'معرفی کلینیک و دستگاه‌ها' },
  { href: '/faq', label: 'سوالات متداول مراجعین' },
  { href: '/blog', label: 'مقالات و راهنمای مراقبت' },
  { href: '/contact', label: 'راه‌های ارتباطی و نقشه' },
];

/**
 * Persian display name per static route, used to build BreadcrumbList nodes for
 * pages that do not declare their own. Keys are the canonical paths emitted by
 * the sitemap; a path missing here simply gets no synthetic breadcrumb.
 */
export const ROUTE_LABELS: Record<string, string> = {
  '/': 'صفحه اصلی',
  '/services': 'خدمات و تعرفه‌ها',
  '/clinic': 'درباره کلینیک',
  '/faq': 'سوالات متداول',
  '/blog': 'مجله تخصصی',
  '/contact': 'تماس و آدرس',
  '/booking': 'رزرو آنلاین نوبت',
  '/privacy': 'حریم خصوصی',
  '/terms': 'قوانین و مقررات',
};

/**
 * Section roots: a nested path (`/services/full-body`) is rendered as
 * Root → Section → Leaf, using the section's label and slug-derived leaf.
 */
const SECTION_ROOTS: Record<string, string> = {
  '/services': 'خدمات و تعرفه‌ها',
  '/blog': 'مجله تخصصی',
};

/**
 * Derive a BreadcrumbList trail from a request pathname.
 *
 * Returns `undefined` when the path is not a known indexable page (admin, api,
 * 404/500), so the layout can call this unconditionally without ever emitting a
 * breadcrumb for a surface that must not appear in search.
 */
export function breadcrumbsForPath(
  pathname: string,
): Array<{ name: string; url: string }> | undefined {
  const clean = `/${pathname.replace(/^\/+|\/+$/g, '')}`.replace(/\/+$/, '') || '/';
  if (
    clean !== '/' &&
    !ROUTE_LABELS[clean] &&
    !Object.keys(SECTION_ROOTS).some((r) => clean.startsWith(`${r}/`))
  ) {
    return undefined;
  }

  const home = { name: 'صفحه اصلی', url: '/' };
  if (clean === '/') return undefined; // A one-item trail on the homepage is noise.

  const exact = ROUTE_LABELS[clean];
  if (exact) return [home, { name: exact, url: clean }];

  const sectionRoot = Object.keys(SECTION_ROOTS).find((root) => clean.startsWith(`${root}/`));
  if (!sectionRoot) return undefined;

  // Nested pages (`/services/full-body`) get Root → Section only. The leaf name
  // is NOT derived from the URL slug: that would put a Latin slug such as
  // "full-body" into a Persian breadcrumb name. Detail pages declare their own
  // trail with the real title, and this fallback is skipped when they do.
  return [home, { name: SECTION_ROOTS[sectionRoot] as string, url: sectionRoot }];
}

/** True when a path belongs to a surface that must never be indexed. */
export function isPrivatePath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_actions') ||
    pathname === '/404' ||
    pathname === '/500'
  );
}
