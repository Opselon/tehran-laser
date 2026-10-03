import { describe, expect, it } from 'vitest';
import { calculateQuote, hasPriceFor, PricingError } from '../../src/domain/pricing/pricing';

const service = { id: 'svc_face', durationMinutes: 30, active: true };
const femalePrice = { pricingCategory: 'female' as const, amount: 320, currency: 'IRT' };
const malePrice = { pricingCategory: 'male' as const, amount: 500, currency: 'IRT' };

describe('calculateQuote', () => {
  it('quotes the female price with the configured discount', () => {
    const quote = calculateQuote(service, [femalePrice], 'female', 15);
    expect(quote.baseAmount).toBe(320);
    expect(quote.discountPercent).toBe(15);
    expect(quote.discountAmount).toBe(48);
    expect(quote.totalAmount).toBe(272);
    expect(quote.currency).toBe('IRT');
    expect(quote.durationMinutes).toBe(30);
  });

  it('quotes male and female independently', () => {
    const male = calculateQuote(service, [femalePrice, malePrice], 'male', 0);
    const female = calculateQuote(service, [femalePrice, malePrice], 'female', 0);
    expect(male.totalAmount).toBe(500);
    expect(female.totalAmount).toBe(320);
    expect(male.discountAmount).toBe(0);
  });

  it('rounds the discount to whole units', () => {
    const quote = calculateQuote(
      { id: 'svc_full_body', durationMinutes: 30, active: true },
      [{ pricingCategory: 'female', amount: 2290, currency: 'IRT' }],
      'female',
      15,
    );
    expect(quote.discountAmount).toBe(344); // round(343.5)
    expect(quote.totalAmount).toBe(1946);
  });

  it('treats discount 0 and 100 correctly', () => {
    expect(calculateQuote(service, [femalePrice], 'female', 0).totalAmount).toBe(320);
    expect(calculateQuote(service, [femalePrice], 'female', 100).totalAmount).toBe(0);
  });

  it('clamps out-of-range discounts', () => {
    expect(calculateQuote(service, [femalePrice], 'female', -10).discountPercent).toBe(0);
    expect(calculateQuote(service, [femalePrice], 'female', 400).discountPercent).toBe(100);
  });

  it('rejects a category with no configured price', () => {
    expect(() => calculateQuote(service, [femalePrice], 'male', 15)).toThrow(PricingError);
    try {
      calculateQuote(service, [femalePrice], 'male', 15);
    } catch (error) {
      expect((error as PricingError).code).toBe('PRICE_NOT_CONFIGURED');
    }
  });

  it('rejects inactive services', () => {
    try {
      calculateQuote({ ...service, active: false }, [femalePrice], 'female', 15);
      throw new Error('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(PricingError);
      expect((error as PricingError).code).toBe('SERVICE_INACTIVE');
    }
  });
});

describe('hasPriceFor', () => {
  it('reports missing price rows for display', () => {
    expect(hasPriceFor([femalePrice], 'female')).toBe(true);
    expect(hasPriceFor([femalePrice], 'male')).toBe(false);
  });
});
