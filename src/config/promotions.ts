import type { CartItem } from '@/types/cart';
import type { ProductCategory } from '@/types/product';

const ELIGIBLE_TYPES_2X1: ReadonlySet<ProductCategory> = new Set([
  'agendas',
  'agendas docentes', // <- acá definís qué tipos entran
  // 'cuaderno',
]);

export const PROMO_2X1 = {
  enabled: import.meta.env.VITE_PROMO_2X1 === 'true',
  label: 'Promo 2x1',
  eligible: (item: CartItem) => {
    // 1) por tipo
    if (!ELIGIBLE_TYPES_2X1.has(item.product.category)) return false;

    // 2) reglas extra opcionales
    // - excluir personalizados:
    // if (item.personalization) return false;

    return true;
  },
};

export const DESCUENTOS = {
  enabled: import.meta.env.VITE_DESCUENTOS === 'true',
  label: `Descuento del ${import.meta.env.VITE_PORCENTAJE_DESCUENTO}% en la unidad`,
  percentage: import.meta.env.VITE_PORCENTAJE_DESCUENTO
    ? parseInt(import.meta.env.VITE_PORCENTAJE_DESCUENTO)
    : undefined,
  eligible: (item: CartItem) => {
    // 1) por tipo
    if (!ELIGIBLE_TYPES_2X1.has(item.product.category)) return false;

    // 2) reglas extra opcionales
    // - excluir personalizados:
    // if (item.personalization) return false;

    return true;
  },
};

export const PROMOTIONS = {
  PROMO2x1: true,
  DESCUENTO: true,
  PORCENTAJEDESCUENTO: 40,
  CATEGORIAS: ['agendas', 'agendas docentes'],
} as const;

// Helpers (evitan errores por mayúsculas/espacios)
export const normalizeCategory = (c?: string) => (c ?? '').trim().toLowerCase();

export const isCategoryEligible = (category?: string) =>
  PROMOTIONS.CATEGORIAS.map((c) => c.toLowerCase()).includes(normalizeCategory(category));

// Elegibilidad del 2x1: dejalo simple, o ajustalo si querés excluir cosas.
export const is2x1Eligible = (item: CartItem) => {
  PROMOTIONS.CATEGORIAS.map((c) => c.toLowerCase());
  if (!isCategoryEligible(item.product.category)) return false;
  // ejemplo: 2x1 a TODO (o podés filtrarlo por categoría también)
  return true;
};
