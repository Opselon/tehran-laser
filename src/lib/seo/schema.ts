/**
 * Comprehensive Schema.org JSON-LD Structured Data Generators for Tehran Laser Clinic
 *
 * Implements Google-compliant schema specifications for:
 * - MedicalClinic & MedicalBusiness
 * - MedicalProcedure / HealthAndBeautyBusiness (Candela GentleMax Pro)
 * - FAQPage
 * - BreadcrumbList
 * - Article & MedicalWebPage
 */

import { DEFAULT_CANONICAL_ORIGIN } from './canonical';

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
 */
export function createMedicalClinicSchema(origin = DEFAULT_CANONICAL_ORIGIN) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'MedicalBusiness', 'HealthAndBeautyBusiness'],
    '@id': `${origin}/#clinic`,
    name: 'کلینیک تخصصی تهران لیزر',
    alternateName: ['Tehran Laser Clinic', 'کلینیک تهران لیزر پاسداران', 'مرکز تخصصی لیزر موهای زائد تهران'],
    url: origin,
    logo: `${origin}/favicon.svg`,
    image: [
      `${origin}/images/og-share.jpg`,
    ],
    telephone: '+989035555090',
    priceRange: 'IRR',
    currenciesAccepted: 'IRR, IRT',
    paymentAccepted: 'کارت‌خوان بانکی، پرداخت نقدی، پرداخت آنلاین شتاب',
    medicalSpecialty: [
      'https://schema.org/Dermatology',
      'https://schema.org/PlasticSurgery',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'خیابان پاسداران، خیابان پایدارفرد، نبش بوستان هفتم',
      addressLocality: 'تهران',
      addressRegion: 'منطقه ۴ - پاسداران',
      postalCode: '1666612345',
      addressCountry: 'IR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.7645,
      longitude: 51.4628,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
        opens: '09:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Thursday',
        opens: '09:00',
        closes: '18:00',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدمات تخصصی لیزر موهای زائد بانوان و آقایان',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'پکیج‌های لیزر الکساندرایت کندلا ۲۰۲۶',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: 'لیزر کل بدن بانوان (Full Body)',
                description: 'پکیج کامل دست، پا، بیکینی، زیر بغل، خط باسن، خط ناف و شکم با شات نامحدود کندلا جنتل مکس پرو',
              },
              price: '1940000',
              priceCurrency: 'IRT',
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MedicalProcedure',
                name: 'لیزر موهای زائد کاربردی (بیکینی و زیر بغل)',
                description: 'لیزر نواحی حساس با سیستم کولینگ بدون درد و سری‌های استریل یکبار مصرف',
              },
              price: '980000',
              priceCurrency: 'IRT',
            },
          ],
        },
      ],
    },
    sameAs: [
      'https://t.me/tehranlaser_clinic',
      'https://wa.me/989035555090',
    ],
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
    name: `لیزر موهای زائد ${service.name} با کندلا جنتل مکس پرو`,
    procedureType: 'https://schema.org/NonSurgicalProcedure',
    bodyLocation: service.name,
    description:
      service.description ||
      `خدمات تخصصی لیزر موهای زائد ناحیه ${service.name} با دستگاه الکساندرایت کندلا جنتل مکس پرو ۲۰۲۶ در کلینیک تهران لیزر پاسداران.`,
    preparation:
      'شیو کامل ناحیه با تیغ یا ژیلت ۲۴ ساعت قبل از جلسه، عدم مصرف داروهای لایه‌بردار و پرهیز از برنزه کردن و آفتاب گرفتن.',
    followup:
      'استفاده از کرم زینک اکساید و ژل آلوئه‌ورا، پرهیز از دوش آب داغ، سونا و ورزش سنگین تا ۲۴ ساعت پس از جلسه.',
    howPerformed:
      'تابش پالس‌های متمرکز لیزر الکساندرایت با طول موج ۷۵۵ نانومتر همزمان با اسپری خنک‌کننده داینامیک کندلا (DCD) جهت مهار قطعی فولیکول مو بدون کوچک‌ترین درد و سوختگی.',
    provider: {
      '@type': 'MedicalClinic',
      name: 'کلینیک تخصصی تهران لیزر',
      url: origin,
      telephone: '+989035555090',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'خیابان پاسداران، خیابان پایدارفرد، نبش بوستان هفتم',
        addressLocality: 'تهران',
        addressCountry: 'IR',
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
export function createBreadcrumbSchema(
  items: BreadcrumbItem[],
  origin = DEFAULT_CANONICAL_ORIGIN,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith('http') ? item.url : `${origin}${item.url.startsWith('/') ? item.url : `/${item.url}`}`;
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
export function createArticleSchema(
  post: ArticleSchemaInput,
  origin = DEFAULT_CANONICAL_ORIGIN,
) {
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
    image: post.coverImage ? (post.coverImage.startsWith('http') ? post.coverImage : `${origin}${post.coverImage}`) : defaultImage,
    datePublished: post.publishedAt || new Date().toISOString(),
    dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
    inLanguage: 'fa-IR',
    author: {
      '@type': 'Person',
      name: post.author || 'تیم علمی و تخصصی تهران لیزر',
      url: `${origin}/clinic`,
    },
    publisher: {
      '@type': 'MedicalClinic',
      name: 'کلینیک تخصصی تهران لیزر',
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/favicon.svg`,
      },
    },
    about: {
      '@type': 'MedicalTherapy',
      name: 'لیزر موهای زائد الکساندرایت کندلا ۲۰۲۶',
      description: 'استاندارد طلایی رفع موهای زائد با طول موج ۷۵۵ نانومتر و سیستم خنک‌کننده DCD',
    },
  };
}
