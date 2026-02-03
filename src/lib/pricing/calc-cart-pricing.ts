// src/lib/pricing/calc-cart-pricing.ts
import type { CartItem } from '@/types/cart';
import { PROMO_2X1, DESCUENTOS } from '@/config/promotions';

// ✅ mismas categorías para % descuento (no hardcode en Cart.tsx)
const DISCOUNT_CATEGORIES = new Set(['agendas', 'agendas docentes']);
const normalizeCategory = (c?: string) => (c ?? '').trim().toLowerCase();
const isDiscountEligibleCategory = (category?: string) =>
  DISCOUNT_CATEGORIES.has(normalizeCategory(category));

type Unit = { price: number; key: string };

function lineKey(item: CartItem) {
  return [
    item.product.id,
    item.selectedSize ?? '',
    item.selectedInterior ?? '',
    item.selectedCover ?? '',
    item.personalization ?? '',
  ].join('|');
}

export function calculateCartPricing(items: CartItem[]) {
  const totalQty = items.reduce((a, it) => a + (it.quantity ?? 0), 0);

  const subtotalList = items.reduce(
    (a, it) => a + (it.product.basePrice ?? 0) * (it.quantity ?? 0),
    0
  );

  // ✅ guardamos breakdown por línea para UI y para aplicar % después
  const lines: Record<
    string,
    {
      listSubtotal: number;
      discount: number; // descuento total (2x1 + %)
      total: number; // total final de la línea
      freeUnits: number; // gratis por 2x1
      percentDiscount: number; // descuento por % (solo categorías)
    }
  > = {};

  for (const it of items) {
    const key = lineKey(it);
    const listSubtotal = (it.product.basePrice ?? 0) * (it.quantity ?? 0);
    lines[key] = {
      listSubtotal,
      discount: 0,
      total: listSubtotal,
      freeUnits: 0,
      percentDiscount: 0,
    };
  }

  // =====================
  // 1) PROMO 2x1 (si enabled)
  // =====================
  let promo2x1Discount = 0;

  if (PROMO_2X1.enabled) {
    const eligibleUnits: Unit[] = [];

    for (const it of items) {
      if (!PROMO_2X1.eligible(it)) continue;
      const key = lineKey(it);
      const price = it.product.basePrice ?? 0;
      for (let i = 0; i < (it.quantity ?? 0); i++) eligibleUnits.push({ price, key });
    }

    const freeCount = Math.floor(eligibleUnits.length / 2);
    if (freeCount > 0) {
      eligibleUnits.sort((a, b) => a.price - b.price);
      const freeUnits = eligibleUnits.slice(0, freeCount);

      for (const u of freeUnits) {
        promo2x1Discount += u.price;
        lines[u.key].discount += u.price;
        lines[u.key].freeUnits += 1;
      }
    }
  }

  // total tras 2x1 por línea
  for (const k of Object.keys(lines)) {
    lines[k].total = Math.max(0, lines[k].listSubtotal - lines[k].discount);
  }

  // =====================
  // 2) DESCUENTO % (si enabled) SOLO categorías
  //    ✅ se aplica SOBRE el total ya afectado por 2x1 (para no descontar unidades gratis)
  // =====================
  let percentDiscountTotal = 0;

  const discountPct = DESCUENTOS.enabled ? (DESCUENTOS.percentage ?? 0) : 0;
  const rate = discountPct / 100;

  if (DESCUENTOS.enabled && rate > 0) {
    for (const it of items) {
      if (!isDiscountEligibleCategory(it.product?.category)) continue;

      const key = lineKey(it);

      const baseAfter2x1 = lines[key].total; // ✅ base correcta
      const d = Math.round(baseAfter2x1 * rate);

      if (d > 0) {
        percentDiscountTotal += d;
        lines[key].percentDiscount += d;
        lines[key].discount += d;
      }
    }

    // recalcular totales tras %
    for (const k of Object.keys(lines)) {
      lines[k].total = Math.max(0, lines[k].listSubtotal - lines[k].discount);
    }
  }

  const total = Math.max(0, subtotalList - promo2x1Discount - percentDiscountTotal);

  return {
    subtotalList,
    totalQty,
    total,
    lines,
    promo: PROMO_2X1.enabled ? { label: PROMO_2X1.label, amount: promo2x1Discount } : null,
    percent: DESCUENTOS.enabled ? { label: DESCUENTOS.label, amount: percentDiscountTotal } : null,
  };
}
