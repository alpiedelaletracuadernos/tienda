// src/lib/pricing/calc-cart-pricing.ts
import type { CartItem } from '@/types/cart';
import { isEligibleFor2x1, isEligibleForDiscount, isHotSaleActive, isEligibleForHotSale } from '@/config/promotions';
import vars from '@/data/data';
import { getCartLineKey } from '@/lib/cart-key';

type Unit = { price: number; key: string };

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
      discount: number; // descuento total (2x1 + % + hotSale)
      total: number; // total final de la línea
      freeUnits: number; // gratis por 2x1
      percentDiscount: number; // descuento por % (solo categorías)
      hotSaleDiscount: number; // descuento por Hot Sale
    }
  > = {};

  for (const it of items) {
    const key = getCartLineKey(it);
    const listSubtotal = (it.product.basePrice ?? 0) * (it.quantity ?? 0);
    lines[key] = {
      listSubtotal,
      discount: 0,
      total: listSubtotal,
      freeUnits: 0,
      percentDiscount: 0,
      hotSaleDiscount: 0,
    };
  }

  // =====================
  // 1) PROMO 2x1 (si enabled)
  // =====================
  let promo2x1Discount = 0;

  if (vars.promotions.twoForOne.enabled) {
    const eligibleUnits: Unit[] = [];

    for (const it of items) {
      if (!isEligibleFor2x1(it)) continue;
      const key = getCartLineKey(it);
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

  const discountSettings = vars.promotions.discount;
  const discountPct = discountSettings.enabled ? discountSettings.percentage : 0;
  const rate = discountPct / 100;

  if (discountSettings.enabled && rate > 0) {
    for (const it of items) {
      if (!isEligibleForDiscount(it)) continue;

      const key = getCartLineKey(it);

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

  // =====================
  // 3) HOT SALE % (si activo) — aplica a TODOS los productos
  // =====================
  let hotSaleDiscountTotal = 0;
  const hotSaleSettings = vars.promotions.hotSale;

  if (isHotSaleActive()) {
    const hsRate = hotSaleSettings.percentage / 100;

    for (const it of items) {
      if (!isEligibleForHotSale(it)) continue;
      const key = getCartLineKey(it);
      const baseAfterPrev = lines[key].total;
      const d = Math.round(baseAfterPrev * hsRate);
      if (d > 0) {
        hotSaleDiscountTotal += d;
        lines[key].hotSaleDiscount += d;
        lines[key].discount += d;
      }
    }

    for (const k of Object.keys(lines)) {
      lines[k].total = Math.max(0, lines[k].listSubtotal - lines[k].discount);
    }
  }

  const total = Math.max(0, subtotalList - promo2x1Discount - percentDiscountTotal - hotSaleDiscountTotal);

  return {
    subtotalList,
    totalQty,
    total,
    lines,
    promo: vars.promotions.twoForOne.enabled ? { label: 'Promo 2x1', amount: promo2x1Discount } : null,
    percent: vars.promotions.discount.enabled ? { label: `Descuento del ${discountSettings.percentage}% en la unidad`, amount: percentDiscountTotal } : null,
    hotSale: isHotSaleActive() ? { label: `${hotSaleSettings.label} ${hotSaleSettings.percentage}% OFF`, amount: hotSaleDiscountTotal } : null,
  };
}
