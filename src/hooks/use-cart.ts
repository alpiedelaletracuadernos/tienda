// src/hooks/use-cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';

// ———————————————————————————————————————————————
// Descuento por escalera (cart-level)
// 1+ = 15%, 2+ = 20%, 3+ = 30%
const DISCOUNT_LADDER = [
  { minQty: 3, rate: 0.30, label: '30% OFF' },
  { minQty: 2, rate: 0.20, label: '20% OFF' },
  { minQty: 1, rate: 0.15, label: '15% OFF' },
] as const;

function getTierForQty(totalQty: number) {
  for (const tier of DISCOUNT_LADDER) {
    if (totalQty >= tier.minQty) return tier;
  }
  return { minQty: 0, rate: 0, label: '0% OFF' };
}

function getNextTierForQty(totalQty: number) {
  // Ordenar asc para identificar el siguiente fácilmente
  const asc = [...DISCOUNT_LADDER].sort((a, b) => a.minQty - b.minQty);
  for (const tier of asc) {
    if (totalQty < tier.minQty) return tier;
  }
  return null;
}

// ———————————————————————————————————————————————

interface CartStore {
  items: CartItem[];

  // Mutators
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, interior: string, cover: string) => void;
  updateQuantity: (productId: string, size: string, interior: string, cover: string, quantity: number) => void;
  clearCart: () => void;

  // Selectors (cart-level, consistentes con la escalera)
  getTotalQty: () => number;               // total de unidades
  getSubtotalList: () => number;           // subtotal con precio de lista (basePrice)
  getCurrentTier: () => { rate: number; label: string; minQty: number };
  getNextTier: () => { rate: number; label: string; minQty: number } | null;

  // Cálculos compuestos (para el Summary)
  getDiscountAmount: () => number;         // importe de descuento (sobre subtotal de lista)
  getTotalAfterDiscount: () => number;     // total final = subtotal - descuento

  // Compatibilidad: antes este sumaba item.price; mantenemos para no romper
  getTotalPrice: () => number;             // alias a getTotalAfterDiscount() (o deprecado internamente)
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => set((state) => {
        // Reglas: el ítem guardado debe llevar siempre precio de lista (no descontado)
        // Si el caller envió price ya descontado, lo normalizamos aquí.
        const normalizedItem: CartItem = {
          ...newItem,
          price: newItem.product?.basePrice ?? newItem.price, // normaliza a basePrice si está disponible
        };

        const idx = state.items.findIndex(
          item =>
            item.product.id === normalizedItem.product.id &&
            item.selectedSize === normalizedItem.selectedSize &&
            item.selectedInterior === normalizedItem.selectedInterior &&
            item.selectedCover === normalizedItem.selectedCover &&
            item.personalization === normalizedItem.personalization
        );

        if (idx > -1) {
          const updated = [...state.items];
          updated[idx].quantity += normalizedItem.quantity;
          // Asegura precio de lista
          updated[idx].price = normalizedItem.product.basePrice;
          return { items: updated };
        }

        return { items: [...state.items, normalizedItem] };
      }),

      removeItem: (productId, size, interior, cover) => set((state) => ({
        items: state.items.filter(
          item =>
            !(
              item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedInterior === interior &&
              item.selectedCover === cover
            )
        ),
      })),

      updateQuantity: (productId, size, interior, cover, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedInterior === interior &&
          item.selectedCover === cover
            ? {
                ...item,
                quantity: Math.max(1, quantity),
                // re-normaliza precio por las dudas
                price: item.product.basePrice,
              }
            : item
        ),
      })),

      clearCart: () => set({ items: [] }),

      // ——————————————————————————————————————————
      // Selectors consistentes con precio de lista
      getTotalQty: () => {
        const { items } = get();
        return items.reduce((acc, it) => acc + it.quantity, 0);
      },

      getSubtotalList: () => {
        const { items } = get();
        // SIEMPRE calcula con basePrice
        return items.reduce((acc, it) => acc + (it.product.basePrice * it.quantity), 0);
      },

      getCurrentTier: () => {
        const qty = get().getTotalQty();
        const tier = getTierForQty(qty);
        return tier;
      },

      getNextTier: () => {
        const qty = get().getTotalQty();
        return getNextTierForQty(qty);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotalList();
        const { rate } = get().getCurrentTier();
        // Descuento solo una vez, sobre el subtotal de lista
        return Math.round(subtotal * rate);
      },

      getTotalAfterDiscount: () => {
        const subtotal = get().getSubtotalList();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      // Compatibilidad con código previo:
      // Antes sumaba item.price (que podía venir descontado). Ahora lo redefinimos como el TOTAL final.
      // getTotalPrice: () => {
      //   return get().getTotalAfterDiscount();
      // },
      // Precio total basado en items con price (legacy)
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const unit = item.product?.basePrice ?? item.price ?? 0;
          return total + unit * item.quantity;
        }, 0);
},

    }),
    {
      name: 'cart:v2',        // bump de versión para activar migración
      version: 2,
      migrate: (persistedState: any, fromVersion) => {
        // Normaliza items heredados que tengan price distinto al basePrice
        if (persistedState?.items && Array.isArray(persistedState.items)) {
          persistedState.items = persistedState.items.map((it: CartItem) => {
            if (it?.product?.basePrice && it.price !== it.product.basePrice) {
              return { ...it, price: it.product.basePrice };
            }
            return it;
          });
        }
        return persistedState;
      },
      // Opcional: partialize si quieres reducir lo que se persiste
      // partialize: (state) => ({ items: state.items })
    }
  )
);

// Selectores opcionales para suscripciones de grano fino
export const cartSelectors = {
  items: (s: CartStore) => s.items,
  count: (s: CartStore) => s.getTotalQty(),
  subtotalList: (s: CartStore) => s.getSubtotalList(),
  tier: (s: CartStore) => s.getCurrentTier(),
  nextTier: (s: CartStore) => s.getNextTier(),
  discount: (s: CartStore) => s.getDiscountAmount(),
  total: (s: CartStore) => s.getTotalAfterDiscount(),
};
