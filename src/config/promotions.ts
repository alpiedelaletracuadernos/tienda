import vars from '@/data/data';
import type { CartItem } from '@/types/cart';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export const normalizeCategory = (c?: string) => (c ?? '').trim().toLowerCase();

/** Forma mínima que necesitan los predicados de elegibilidad. */
type EligibilityInput = {
  product: { category: string };
  personalization?: string;
  isCustom?: boolean;
};

/**
 * ¿El ítem es personalizado?
 *
 * No alcanza con mirar `personalization` (el texto libre): el cliente puede
 * activar el toggle de personalización y dejar el texto vacío, y en ese caso
 * `handleAddToCart` guarda `personalization: undefined` con `isCustom: true`.
 * Si sólo se mirara el texto, un ítem personalizado sin texto se colaría en
 * las promos marcadas `applyToPersonalized: false` (hoy, el 2x1).
 */
const isPersonalized = (item: EligibilityInput): boolean =>
  !!item.isCustom || !!item.personalization;

/**
 * Validates if an item is eligible for the percentage discount
 */
export const isEligibleForDiscount = (item: CartItem | EligibilityInput): boolean => {
  const settings = vars.promotions.discount;
  if (!settings.enabled) return false;

  const itemCategory = normalizeCategory(item.product.category);
  const isCategoryEligible = settings.eligibleCategories
    .map(c => normalizeCategory(c))
    .includes(itemCategory);

  if (!isCategoryEligible) return false;

  // Si el ítem es personalizado, la promo debe permitirlo explícitamente.
  if (isPersonalized(item) && !settings.applyToPersonalized) {
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
 * Deriva el texto humano del rango de fechas del Hot Sale a partir de
 * `vars.promotions.hotSale.startDate`/`endDate` — única fuente de verdad
 * para los tres carteles (barra de PDP, HotSaleBanner, HotSaleModal), que
 * antes tenían la fecha escrita a mano y podían divergir de la config.
 *
 * Mismas horas/zona que `isHotSaleActive`: se parsea con 'T00:00:00' para
 * que se interprete en hora local y no un día antes por UTC.
 */
export const formatHotSaleDateRange = (): string => {
  const hs = vars.promotions.hotSale;
  const start = new Date(hs.startDate + 'T00:00:00');
  const end = new Date(hs.endDate + 'T00:00:00');

  if (isSameDay(start, end)) {
    return `el ${format(start, "d 'de' MMMM", { locale: es })}`;
  }

  if (isSameMonth(start, end)) {
    return `del ${format(start, 'd')} al ${format(end, "d 'de' MMMM", { locale: es })}`;
  }

  return `del ${format(start, "d 'de' MMMM", { locale: es })} al ${format(end, "d 'de' MMMM", { locale: es })}`;
};

/**
 * Returns true when Hot Sale is active. Applies to ALL categories.
 */
export const isEligibleForHotSale = (item: CartItem | EligibilityInput): boolean => {
  if (!isHotSaleActive()) return false;
  const hs = vars.promotions.hotSale;
  if (isPersonalized(item) && !hs.applyToPersonalized) return false;
  return true;
};

/**
 * Validates if an item is eligible for the 2x1 promotion
 */
export const isEligibleFor2x1 = (item: CartItem | EligibilityInput): boolean => {
  const settings = vars.promotions.twoForOne;
  if (!settings.enabled) return false;

  const itemCategory = normalizeCategory(item.product.category);
  const isCategoryEligible = settings.eligibleCategories
    .map(c => normalizeCategory(c))
    .includes(itemCategory);

  if (!isCategoryEligible) return false;

  // Si el ítem es personalizado, la promo debe permitirlo explícitamente.
  if (isPersonalized(item) && !settings.applyToPersonalized) {
    return false;
  }

  return true;
};
