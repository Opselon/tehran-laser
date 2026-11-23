import type { Device, PricingCategory } from '../booking/booking.types';
import type { BookingQuote } from '../booking/booking.state';

export interface PriceRow {
  pricingCategory: PricingCategory;
  /** Absent on pre-device rows/tests — treated as 'rado'. */
  device?: Device;
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
 * booking amount is produced here from (service × category × device × current price × discount).
 */
export function calculateQuote(
  service: QuotableService,
  prices: readonly PriceRow[],
  category: PricingCategory,
  discountPercent: number,
  device: Device = 'rado',
): BookingQuote {
  if (!service.active) {
    throw new PricingError('SERVICE_INACTIVE', 'این خدمت در حال حاضر غیرفعال است.');
  }
  const row = prices.find(
    (price) => price.pricingCategory === category && (price.device ?? 'rado') === device,
  );
  // A row with amount <= 0 is not a price — it is a zeroed tariff (e.g. an
  // admin cleared the price). Quoting it would book the service for free.
  if (!row || row.amount <= 0) {
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
    device,
    baseAmount,
    discountPercent: percent,
    discountAmount,
    totalAmount: baseAmount - discountAmount,
    currency: row.currency,
    durationMinutes: service.durationMinutes,
  };
}

/** Whether a public price row exists for the requested category + device (drives "price on request" UI).
 *  A row with amount <= 0 is not a price — see calculateQuote. */
export function hasPriceFor(
  prices: readonly PriceRow[],
  category: PricingCategory,
  device: Device = 'rado',
): boolean {
  return prices.some(
    (price) =>
      price.pricingCategory === category && (price.device ?? 'rado') === device && price.amount > 0,
  );
}
