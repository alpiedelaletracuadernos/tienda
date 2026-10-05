// src/lib/pricing/calc-product-pricing.ts
import type { InteriorType, Product } from '@/types/product';
import type { CartItem } from '@/types/cart';
import { calculateCartPricing } from './calc-cart-pricing';
import { personalizationSurchargeFor } from './personalization';
import { listPriceFor } from './kit';

/**
 * Única fuente de precios para vistas de producto (PDP, ProductCard).
 *
 * No reimplementa el cálculo de promos: arma un CartItem hipotético con la
 * cantidad/personalización pedidas y delega en `calculateCartPricing`, el
 * mismo motor que usa el carrito. Así cualquier cambio futuro en cómo se
 * acumulan 2x1 / descuento % / Hot Sale se propaga solo a estas vistas, sin
 * que puedan volver a divergir del total que ve el cliente en el carrito.
 *
 * Ojo con el 2x1: el motor poolea unidades elegibles de TODO el carrito y
 * regala las `floor(N/2)` más baratas. Acá el "carrito" hipotético tiene una
 * sola línea, así que el resultado es exactamente el que tendría esa línea
 * si fuera el único ítem en el carrito real (todas las unidades son del
 * mismo producto, al mismo precio, así que cuáles unidades específicas caen
 * gratis no cambia el total de la línea).
 */
export function calculateProductPricing(args: {
  product: Pick<
    Product,
    | 'id'
    | 'name'
    | 'basePrice'
    | 'images'
    | 'category'
    | 'personalizationIncluded'
    | 'priceByInterior'
  >;
  /** Interior elegido: define el precio si el producto tiene `priceByInterior`. */
  interior?: InteriorType;
  quantity?: number; // default 1
  isCustom?: boolean; // suma el recargo de personalización
}): {
  listUnit: number;
  finalUnit: number;
  listTotal: number;
  finalTotal: number;
  discounts: { label: string; amount: number }[];
  hasDiscount: boolean;
} {
  const { product, interior, quantity = 1, isCustom = false } = args;
  const qty = Math.max(1, quantity);

  const base = listPriceFor(product, interior);
  const listUnit = isCustom ? base + personalizationSurchargeFor(product) : base;

  const hypotheticalItem: CartItem = {
    product: {
      id: product.id,
      name: product.name,
      basePrice: listUnit,
      images: product.images,
      category: product.category,
    },
    quantity: qty,
    price: listUnit,
    // Sin texto de personalización a propósito: el ítem real que arma
    // `handleAddToCart` guarda `personalization: undefined` cuando el toggle
    // está activo pero el cliente no escribió nada. La elegibilidad se decide
    // por `isCustom`, así que este ítem hipotético es idéntico al real a los
    // ojos del motor y ambos no pueden dar precios distintos.
    isCustom,
  };

  const pricing = calculateCartPricing([hypotheticalItem]);

  const listTotal = listUnit * qty;
  const finalTotal = pricing.total;
  const finalUnit = Math.round(finalTotal / qty);

  const discounts = [pricing.promo, pricing.percent, pricing.hotSale].filter(
    (d): d is { label: string; amount: number } => !!d && d.amount > 0
  );

  return {
    listUnit,
    finalUnit,
    listTotal,
    finalTotal,
    discounts,
    hasDiscount: finalTotal < listTotal,
  };
}

export default calculateProductPricing;
