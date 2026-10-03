import type { PricingCategory } from '../booking/booking.types';
import type { BookingQuote } from '../booking/booking.state';

export interface PriceRow {
  pricingCategory: PricingCategory;
  amount: number;
  currency: string;
}

export interface QuotableService {
  id: string;
  durationMinutes: number;
  active: boolean;
}

export type PricingErrorCode = 'SERVICE_INACTIVE' | 'PRICE_NOT_CONFIGURED';

export class PricingError extends Error {
  readonly code: PricingErrorCode;
  constructor(code: PricingErrorCode, message: string) {
    super(message);
    this.name = 'PricingError';
    this.code = code;
  }
}

/**
 * Server-authoritative quote. The client only ever *presents* prices — every stored
 * booking amount is produced here from (service × category × current price × discount).
 */
export function calculateQuote(
  service: QuotableService,
  prices: readonly PriceRow[],
  category: PricingCategory,
  discountPercent: number,
): BookingQuote {
  if (!service.active) {
    throw new PricingError('SERVICE_INACTIVE', 'این خدمت در حال حاضر غیرفعال است.');
  }
  const row = prices.find((price) => price.pricingCategory === category);
  if (!row) {
    throw new PricingError(
      'PRICE_NOT_CONFIGURED',
      'قیمت این خدمت برای این دسته هنوز ثبت نشده است.',
    );
  }
  const percent = Math.min(100, Math.max(0, Math.round(discountPercent)));
  const baseAmount = row.amount;
  const discountAmount = Math.round((baseAmount * percent) / 100);
  return {
    serviceId: service.id,
    pricingCategory: category,
    baseAmount,
    discountPercent: percent,
    discountAmount,
    totalAmount: baseAmount - discountAmount,
    currency: row.currency,
    durationMinutes: service.durationMinutes,
  };
}

/** Whether a public price row exists for the requested category (drives "price on request" UI). */
export function hasPriceFor(
  prices: readonly PriceRow[],
  category: PricingCategory,
): boolean {
  return prices.some((price) => price.pricingCategory === category);
}
