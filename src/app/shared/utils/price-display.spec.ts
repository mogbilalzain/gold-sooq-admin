import { priceKind } from './price-display';

describe('priceKind', () => {
  it('classifies market price ads', () => {
    expect(priceKind('market')).toBe('market');
  });

  it('classifies contact price ads', () => {
    expect(priceKind('contact')).toBe('contact');
  });

  it('treats fixed and legacy (missing) price types as fixed', () => {
    expect(priceKind('fixed')).toBe('fixed');
    expect(priceKind(null)).toBe('fixed');
    expect(priceKind(undefined)).toBe('fixed');
    expect(priceKind('')).toBe('fixed');
  });
});
