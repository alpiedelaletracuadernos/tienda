// src/lib/availability.ts
// Única regla de "¿se puede comprar este producto?". Catálogo, PDP, carrito y
// checkout la consultan acá en vez de leer `inStock` directamente.
import type { Product } from '@/types/product';

export const COMING_SOON_LABEL = 'Próximamente';
const DEFAULT_NOTE = 'Próxima actualización';

export const isPurchasable = (product: Pick<Product, 'inStock'>) => product.inStock;

export const availabilityNote = (product: Pick<Product, 'availabilityNote'>) =>
  product.availabilityNote ?? DEFAULT_NOTE;

/** Etiqueta del estado no disponible ("Próximamente" o una propia, p. ej. "Preventa cerrada"). */
export const availabilityLabel = (product: Pick<Product, 'availabilityLabel'>) =>
  product.availabilityLabel ?? COMING_SOON_LABEL;

/** Texto explicativo de la ficha cuando no se puede comprar. */
export const availabilityMessage = (
  product: Pick<Product, 'availabilityMessage' | 'availabilityNote'>
) =>
  product.availabilityMessage ??
  `${availabilityNote(product)}: estamos actualizando este producto para 2027.`;
