// src/lib/pricing/kit.ts
//
// Precio por versión y valor por separado de los kits. Es la única fuente de
// los números de la preventa (ficha, card, portada, barra, comparación): si
// cambia el precio de una agenda suelta, cambia solo el desglose del kit.
import { catalog } from '@/data/products';
import type { InteriorType, KitItem, Product } from '@/types/product';

/** Precio de lista según el interior; sin mapa, `basePrice`. */
export const listPriceFor = (
  product: Pick<Product, 'basePrice' | 'priceByInterior'>,
  interior?: InteriorType
): number => (interior && product.priceByInterior?.[interior]) || product.basePrice;

export const kitItemValue = (item: KitItem, interior?: InteriorType): number => {
  const slug = interior ? item.priceFromSlug?.[interior] : undefined;
  if (slug) {
    const p = catalog.find((x) => x.slug === slug);
    if (p) return p.basePrice;
  }
  return item.value ?? 0;
};

export type KitPricing = {
  items: { label: string; detail: string; image?: string; value: number }[];
  /** Suma de las piezas por separado (precio de referencia). */
  separateTotal: number;
  price: number;
  savings: number;
};

/** null si el producto no es un kit. */
export const kitPricingFor = (
  product: Pick<Product, 'basePrice' | 'priceByInterior' | 'kitItems'>,
  interior?: InteriorType
): KitPricing | null => {
  if (!product.kitItems?.length) return null;
  const items = product.kitItems.map((it) => ({
    label: it.label,
    detail: it.detail,
    image: it.image,
    value: kitItemValue(it, interior),
  }));
  const separateTotal = items.reduce((a, it) => a + it.value, 0);
  const price = listPriceFor(product, interior);
  return { items, separateTotal, price, savings: separateTotal - price };
};
