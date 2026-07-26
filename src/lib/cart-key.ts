// src/lib/cart-key.ts
import type { CartItem } from '@/types/cart';

/**
 * Identidad canónica de una línea del carrito.
 *
 * Esta es la ÚNICA fuente de verdad para determinar si dos ítems del
 * carrito son "el mismo" (y por lo tanto deben fusionarse incrementando
 * la cantidad) o si son líneas distintas. TODOS los consumidores
 * (use-cart.ts, calc-cart-pricing.ts, Cart.tsx, Checkout.tsx, etc.)
 * deben importar y usar esta función en lugar de reimplementar la
 * comparación campo por campo.
 *
 * Incluye `selectedModel` (el diseño/modelo elegido), `selectedColor`
 * (el color elegido, para productos como las libretas que no usan
 * diseños de tapa) e `isCustom` (si el ítem viene del modo
 * "Personalizar") porque todos afectan qué producto exacto se
 * fabrica y/o su precio, y por lo tanto deben distinguir una línea
 * de otra.
 */
export function getCartLineKey(
  item: Pick<
    CartItem,
    | 'product'
    | 'selectedSize'
    | 'selectedInterior'
    | 'selectedCover'
    | 'personalization'
    | 'selectedModel'
    | 'selectedColor'
    | 'isCustom'
  >
): string {
  return [
    item.product.id,
    item.selectedSize ?? '',
    item.selectedInterior ?? '',
    item.selectedCover ?? '',
    item.personalization ?? '',
    item.selectedModel ?? '',
    item.selectedColor ?? '',
    item.isCustom ? 'custom' : '',
  ].join('|');
}
