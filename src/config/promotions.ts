import vars from '@/data/data';
import type { CartItem } from '@/types/cart';

export const normalizeCategory = (c?: string) => (c ?? '').trim().toLowerCase();

/**
 * Validates if an item is eligible for the percentage discount
 */
export const isEligibleForDiscount = (item: CartItem | { product: { category: string }, personalization?: string }): boolean => {
  const settings = vars.promotions.discount;
  if (!settings.enabled) return false;

  const itemCategory = normalizeCategory(item.product.category);
  const isCategoryEligible = settings.eligibleCategories
    .map(c => normalizeCategory(c))
    .includes(itemCategory);

  if (!isCategoryEligible) return false;

  // If item is personalized, check if the promo allows personalized items
  if (item.personalization && !settings.applyToPersonalized) {
    return false;
  }

  return true;
};

/**
 * Returns true only when today falls within the configured Hot Sale date window
 * AND the master switch is enabled.
 */
export const isHotSaleActive = (): boolean => {
  const hs = vars.promotions.hotSale;
  if (!hs.enabled) return false;
  const now   = new Date();
  const start = new Date(hs.startDate + 'T00:00:00');
  const end   = new Date(hs.endDate   + 'T23:59:59');
  return now >= start && now <= end;
};

/**
 * Returns true when Hot Sale is active. Applies to ALL categories.
 */
export const isEligibleForHotSale = (item: CartItem | { product: { category: string }, personalization?: string }): boolean => {
  if (!isHotSaleActive()) return false;
  const hs = vars.promotions.hotSale;
  if (item.personalization && !hs.applyToPersonalized) return false;
  return true;
};

/**
 * Validates if an item is eligible for the 2x1 promotion
 */
export const isEligibleFor2x1 = (item: CartItem | { product: { category: string }, personalization?: string }): boolean => {
  const settings = vars.promotions.twoForOne;
  if (!settings.enabled) return false;

  const itemCategory = normalizeCategory(item.product.category);
  const isCategoryEligible = settings.eligibleCategories
    .map(c => normalizeCategory(c))
    .includes(itemCategory);

  if (!isCategoryEligible) return false;

  // If item is personalized, check if the promo allows personalized items
  if (item.personalization && !settings.applyToPersonalized) {
    return false;
  }

  return true;
};
