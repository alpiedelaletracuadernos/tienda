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
