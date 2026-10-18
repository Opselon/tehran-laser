/**
 * Comprehensive Schema.org JSON-LD Structured Data Generators for Tehran Laser Clinic
 *
 * Implements Google-compliant schema specifications for:
 * - MedicalClinic & MedicalBusiness
 * - MedicalProcedure / HealthAndBeautyBusiness (Rado Plus contact laser)
 * - FAQPage
 * - BreadcrumbList
 * - Article & MedicalWebPage
 */

import { DEFAULT_CANONICAL_ORIGIN } from './canonical';
import {
  CLINIC_CONTACT,
  CLINIC_HOURS,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SEO_DESCRIPTION,
} from './meta';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItemSchema {
  question: string;
  answer: string;
}

export interface ServiceSchemaInput {
  name: string;
  slug: string;
  description?: string | undefined;
  durationMinutes?: number | undefined;
  price?: number | undefined; // In Tomans (IRT)
  currency?: string | undefined;
}

export interface ArticleSchemaInput {
  title: string;
  slug: string;
  excerpt: string;
  content?: string | undefined;
  coverImage?: string | undefined;
  author?: string | undefined;
  publishedAt?: string | undefined;
  updatedAt?: string | undefined;
}

/**
 * 1. MedicalClinic / MedicalBusiness Core Schema (§31, §135)
 *
 * `aggregateRating` is deliberately ABSENT: the clinic has no verified external
 * review corpus, and inventing one is both a Google structured-data violation
 * and a fabrication. Only add it when real, attributable rating data exists.
 */
export function createMedicalClinicSchema(origin = DEFAULT_CANONICAL_ORIGIN) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'MedicalBusiness', 'HealthAndBeautyBusiness'],
    '@id': `${origin}/#clinic`,
    name: 'کلینیک تخصصی تهران لیزر',
    alternateName: [
      'Tehran Laser Clinic',
      'کلینیک تهران لیزر پاسداران',
      'مرکز تخصصی لیزر موهای زائد تهران',
    ],
    url: origin,
    logo: `${origin}/favicon.svg`,
    image: [`${origin}${DEFAULT_OG_IMAGE_PATH}`],
    description: DEFAULT_SEO_DESCRIPTION,
    telephone: CLINIC_CONTACT.telephone,
    priceRange: 'IRR',
    currenciesAccepted: 'IRR, IRT',
    paymentAccepted: 'کارت‌خوان بانکی، پرداخت نقدی، پرداخت آنلاین شتاب',
    isAcceptingNewPatients: true,
    medicalSpecialty: ['https://schema.org/Dermatology', 'https://schema.org/PlasticSurgery'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC_CONTACT.streetAddress,
      addressLocality: CLINIC_CONTACT.addressLocality,
      addressRegion: CLINIC_CONTACT.addressRegion,
      postalCode: CLINIC_CONTACT.postalCode,
      addressCountry: CLINIC_CONTACT.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CLINIC_CONTACT.latitude,
      longitude: CLINIC_CONTACT.longitude,
    },
    areaServed: [
      { '@type': 'City', name: 'تهران' },
      { '@type': 'AdministrativeArea', name: 'منطقه ۴ تهران' },
      { '@type': 'Country', name: 'ایران' },
    ],
    availableLanguage: [{ '@type': 'Language', name: 'Persian', alternateName: 'fa-IR' }],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${CLINIC_CONTACT.latitude}%2C${CLINIC_CONTACT.longitude}`,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...CLINIC_HOURS.weekdays.days],
        opens: CLINIC_HOURS.weekdays.opens,
        closes: CLINIC_HOURS.weekdays.closes,
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...CLINIC_HOURS.thursday.days],
        opens: CLINIC_HOURS.thursday.opens,
        closes: CLINIC_HOURS.thursday.closes,
      },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: CLINIC_CONTACT.telephone,
        contactType: 'رزرو نوبت و پذیرش',
        availableLanguage: ['fa-IR'],
        areaServed: 'IR',
      },
    ],
    potentialAction: {
      '@type': 'ReserveAction',
      name: 'رزرو آنلاین نوبت',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${origin}/booking`,
        inLanguage: 'fa-IR',
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'Reservation', name: 'نوبت لیزر موهای زائد' },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدمات تخصصی لیزر موهای زائد بانوان و آقایان',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'پکیج‌های لیزر تماسی رادو پلاس',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: 'لیزر کل بدن بانوان (Full Body)',
                description:
                  'پکیج کامل دست، پا، بیکینی، زیر بغل، خط باسن، خط ناف و شکم با شات نامحدود دستگاه لیزر تماسی رادو پلاس',
              },
              price: '1940000',
              priceCurrency: 'IRT',
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: 'لیزر موهای زائد کاربردی (بیکینی و زیر بغل)',
                description: 'لیزر نواحی حساس با سرمایش پیوسته بدون درد و کاور یکبار مصرف استریل',
              },
              price: '980000',
              priceCurrency: 'IRT',
            },
          ],
        },
      ],
    },
    sameAs: [...CLINIC_CONTACT.sameAs],
  };
}

/**
 * 2b. WebSite node — sitelinks search box + publisher linkage.
 * Emitted once per page by the layout; kept here so the clinic and article
 * schemas can reference the same `#website` @id.
 */
export function createWebSiteSchema(origin = DEFAULT_CANONICAL_ORIGIN) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: 'کلینیک تخصصی تهران لیزر',
    alternateName: 'Tehran Laser Clinic',
    description: DEFAULT_SEO_DESCRIPTION,
    inLanguage: 'fa-IR',
    publisher: { '@id': `${origin}/#clinic` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${origin}/services?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 2c. WebPage node for the current document — ties each page to the site and
 * clinic entities and declares its share image, so crawlers see one connected
 * graph instead of a pile of disconnected nodes.
 */
export function createWebPageSchema(input: {
  origin?: string;
  url: string;
  name: string;
  description?: string | undefined;
  inLanguage?: string | undefined;
  type?: string | string[] | undefined;
  datePublished?: string | undefined;
  dateModified?: string | undefined;
}) {
  const origin = input.origin || DEFAULT_CANONICAL_ORIGIN;
  const type = input.type || 'WebPage';
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description || DEFAULT_SEO_DESCRIPTION,
    inLanguage: input.inLanguage || 'fa-IR',
    isPartOf: { '@id': `${origin}/#website` },
    about: { '@id': `${origin}/#clinic` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${origin}${DEFAULT_OG_IMAGE_PATH}`,
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

/**
 * 2d. SiteNavigationElement ItemList built from the REAL rendered nav. Emitting
 * it from the same array the markup loops over means the schema can never
 * advertise a link the page does not actually show.
 */
export function createNavigationItemListSchema(
  navItems: Array<{ href: string; label: string }>,
  origin = DEFAULT_CANONICAL_ORIGIN,
) {
  if (navItems.length === 0) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${origin}/#primary-navigation`,
    name: 'منوی اصلی سایت',
    itemListElement: navItems.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.label,
      url: `${origin}${item.href}`,
    })),
  };
}

/**
 * 2. MedicalProcedure / HealthAndBeautyBusiness Schema for specific treatments
 */
export function createMedicalProcedureSchema(
  service: ServiceSchemaInput,
  origin = DEFAULT_CANONICAL_ORIGIN,
) {
  const serviceUrl = `${origin}/services/${service.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${serviceUrl}#procedure`,
    name: `لیزر موهای زائد ${service.name} با رادو پلاس`,
    procedureType: 'https://schema.org/NonSurgicalProcedure',
    bodyLocation: service.name,
    description:
      service.description ||
      `خدمات تخصصی لیزر موهای زائد ناحیه ${service.name} با دستگاه لیزر تماسی رادو پلاس در کلینیک تهران لیزر پاسداران.`,
    preparation:
      'شیو کامل ناحیه با تیغ یا ژیلت ۲۴ ساعت قبل از جلسه، عدم مصرف داروهای لایه‌بردار و پرهیز از برنزه کردن و آفتاب گرفتن.',
    followup:
      'استفاده از کرم زینک اکساید و ژل آلوئه‌ورا، پرهیز از دوش آب داغ، سونا و ورزش سنگین تا ۲۴ ساعت پس از جلسه.',
    howPerformed:
      'تابش پالس‌های متمرکز لیزر تماسی در سه طول موج ۷۵۵ و ۸۰۸ و ۱۰۶۴ نانومتر همزمان با سرمایش پیوسته TEC Double و ژل خنک‌کننده جهت مهار قطعی فولیکول مو بدون کوچک‌ترین درد و سوختگی.',
    provider: {
      '@type': 'MedicalClinic',
      '@id': `${origin}/#clinic`,
      name: 'کلینیک تخصصی تهران لیزر',
      url: origin,
      telephone: CLINIC_CONTACT.telephone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CLINIC_CONTACT.streetAddress,
        addressLocality: CLINIC_CONTACT.addressLocality,
        addressCountry: CLINIC_CONTACT.addressCountry,
      },
    },
    offers: service.price
      ? {
          '@type': 'Offer',
          url: serviceUrl,
          price: service.price,
          priceCurrency: 'IRT',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: service.price,
            priceCurrency: 'IRT',
            valueAddedTaxIncluded: true,
          },
          availability: 'https://schema.org/InStock',
          validFrom: '2026-01-01',
        }
      : undefined,
  };
}

/**
 * 3. BreadcrumbList Schema for hierarchical search engine navigation (§31, §135)
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[], origin = DEFAULT_CANONICAL_ORIGIN) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith('http')
        ? item.url
        : `${origin}${item.url.startsWith('/') ? item.url : `/${item.url}`}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: fullUrl,
      };
    }),
  };
}

/**
 * 4. FAQPage Schema for Rich Snippets / Google FAQ Accordions (§31, §135)
 */
export function createFAQPageSchema(faqs: FaqItemSchema[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 5. Article & MedicalWebPage Schema for blog posts (§31, §135)
 */
export function createArticleSchema(post: ArticleSchemaInput, origin = DEFAULT_CANONICAL_ORIGIN) {
  const articleUrl = `${origin}/blog/${post.slug}`;
  const defaultImage = `${origin}/images/og-share.jpg`;

  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'MedicalWebPage'],
    '@id': `${articleUrl}#article`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: 'کلینیک تهران لیزر',
      url: origin,
    },
    headline: post.title,
    description: post.excerpt,
    url: articleUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    image: post.coverImage
      ? post.coverImage.startsWith('http')
        ? post.coverImage
        : `${origin}${post.coverImage}`
      : defaultImage,
    // Dates are only emitted when the CMS actually has them. A `new Date()`
    // fallback would stamp "modified now" on every render, which tells Google
    // every article changed each time a crawler visits.
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt || post.publishedAt
      ? { dateModified: post.updatedAt || post.publishedAt }
      : {}),
    inLanguage: 'fa-IR',
    isAccessibleForFree: true,
    author: {
      '@type': 'Person',
      name: post.author || 'تیم علمی و تخصصی تهران لیزر',
      url: `${origin}/clinic`,
    },
    publisher: {
      '@type': 'MedicalClinic',
      '@id': `${origin}/#clinic`,
      name: 'کلینیک تخصصی تهران لیزر',
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/favicon.svg`,
      },
    },
    about: {
      '@type': 'MedicalTherapy',
      name: 'لیزر موهای زائد تماسی رادو پلاس',
      description:
        'رفع موهای زائد با سه طول موج ۷۵۵ و ۸۰۸ و ۱۰۶۴ نانومتر و سیستم خنک‌کننده TEC Double',
    },
  };
}
