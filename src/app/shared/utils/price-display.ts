export type PriceKind = 'fixed' | 'market' | 'contact';

/**
 * Classifies an ad price for display.
 * - fixed: show the numeric price + currency (a fixed price of 0 is still valid)
 * - market: show the localized "market price" label, no number
 * - contact: show the localized "contact for price" label, no number
 * Unknown/missing values fall back to 'fixed' (legacy ads have no price_type).
 */
export function priceKind(priceType: string | null | undefined): PriceKind {
  if (priceType === 'market') return 'market';
  if (priceType === 'contact') return 'contact';
  return 'fixed';
}
