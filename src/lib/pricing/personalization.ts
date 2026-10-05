// src/lib/pricing/personalization.ts
//
// Recargo por personalizar la tapa. Es `vars.personalizationSurcharge`
// salvo en productos que ya la incluyen en el precio
// (`personalizationIncluded`, hoy Box premium y Cuaderno de pedidos).
import vars from '@/data/data';
import { catalog } from '@/data/products';
import type { Product } from '@/types/product';

export const personalizationSurchargeFor = (
  product?: Pick<Product, 'personalizationIncluded'>
): number => (product?.personalizationIncluded ? 0 : vars.personalizationSurcharge);

/** Para líneas de carrito, que sólo guardan el id del producto. */
export const personalizationSurchargeForId = (productId: string): number =>
  personalizationSurchargeFor(catalog.find((p) => p.id === productId));
