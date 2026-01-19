import type { CartItem } from '@/types/cart';
import type { ProductCategory } from '@/types/product';

const ELIGIBLE_TYPES_2X1: ReadonlySet<ProductCategory> = new Set([
  'agendas','agendas docentes' // <- acá definís qué tipos entran
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
