// src/lib/pricing/calc-cart-pricing.ts
import type { CartItem } from '@/types/cart';
import { PROMO_2X1 } from '@/config/promotions';

type Unit = { price: number; key: string };

function lineKey(item: CartItem) {
  return [
    item.product.id,
    item.selectedSize,
    item.selectedInterior,
    item.selectedCover,
    item.personalization ?? '',
  ].join('|');
}

export function calculateCartPricing(items: CartItem[]) {
  const totalQty = items.reduce((a, it) => a + it.quantity, 0);

  const subtotalList = items.reduce(
    (a, it) => a + it.product.basePrice * it.quantity,
    0
  );

  // line breakdown (opcional pero útil para UI “X gratis”)
  const lines: Record<string, { listSubtotal: number; discount: number; total: number; freeUnits: number }> = {};
  for (const it of items) {
    const key = lineKey(it);
    const listSubtotal = it.product.basePrice * it.quantity;
    lines[key] = { listSubtotal, discount: 0, total: listSubtotal, freeUnits: 0 };
  }

  let promoDiscount = 0;

  if (PROMO_2X1.enabled) {
    const eligibleUnits: Unit[] = [];

    for (const it of items) {
      if (!PROMO_2X1.eligible(it)) continue;
      const key = lineKey(it);
      const price = it.product.basePrice;
      for (let i = 0; i < it.quantity; i++) eligibleUnits.push({ price, key });
    }

    const freeCount = Math.floor(eligibleUnits.length / 2);
    if (freeCount > 0) {
      eligibleUnits.sort((a, b) => a.price - b.price);
      const freeUnits = eligibleUnits.slice(0, freeCount);

      for (const u of freeUnits) {
        promoDiscount += u.price;
        lines[u.key].discount += u.price;
        lines[u.key].freeUnits += 1;
      }
    }
  }

  for (const k of Object.keys(lines)) {
    lines[k].total = Math.max(0, lines[k].listSubtotal - lines[k].discount);
  }

  const total = Math.max(0, subtotalList - promoDiscount);

  return {
    subtotalList,
    totalQty,
    promo: PROMO_2X1.enabled ? { label: PROMO_2X1.label, amount: promoDiscount } : null,
    promoDiscount,
    total,
    lines,
  };
}
