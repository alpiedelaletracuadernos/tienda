// src/hooks/use-cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import { calculateCartPricing } from '@/lib/pricing/calc-cart-pricing';

interface CartStore {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (
    productId: string,
    size: string,
    interior: string,
    cover: string,
    personalization?: string
  ) => void;
  updateQuantity: (
    productId: string,
    size: string,
    interior: string,
    cover: string,
    quantity: number,
    personalization?: string
  ) => void;
  clearCart: () => void;

  // derived
  getTotalQty: () => number;
  getSubtotalList: () => number;
  getPromoDiscount: () => number;
  getTotalPrice: () => number; // total final (con promo si está activa)
  getPricing: () => ReturnType<typeof calculateCartPricing>;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const normalizedItem: CartItem = {
            ...newItem,
            price: newItem.product?.basePrice ?? newItem.price,
          };

          const idx = state.items.findIndex(
            (item) =>
              item.product.id === normalizedItem.product.id &&
              item.selectedSize === normalizedItem.selectedSize &&
              item.selectedInterior === normalizedItem.selectedInterior &&
              item.selectedCover === normalizedItem.selectedCover &&
              (item.personalization ?? '') === (normalizedItem.personalization ?? '')
          );

          if (idx > -1) {
            const updated = [...state.items];
            updated[idx].quantity += normalizedItem.quantity;
            updated[idx].price = normalizedItem.product.basePrice;
            return { items: updated };
          }

          return { items: [...state.items, normalizedItem] };
        }),

      removeItem: (productId, size, interior, cover, personalization) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedInterior === interior &&
                item.selectedCover === cover &&
                (item.personalization ?? '') === (personalization ?? '')
              )
          ),
        })),

      updateQuantity: (productId, size, interior, cover, quantity, personalization) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedInterior === interior &&
            item.selectedCover === cover &&
            (item.personalization ?? '') === (personalization ?? '')
              ? { ...item, quantity: Math.max(1, quantity), price: item.product.basePrice }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalQty: () => get().items.reduce((a, it) => a + it.quantity, 0),

      getSubtotalList: () =>
        get().items.reduce((a, it) => a + it.product.basePrice * it.quantity, 0),

      getPricing: () => calculateCartPricing(get().items),

      getPromoDiscount: () => get().getPricing().promoDiscount,

      getTotalPrice: () => get().getPricing().total,
    }),
    {
      name: 'cart:v3',
      version: 3,
      migrate: (persistedState: any) => {
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
    }
  )
);

// selectores finos (opcional)
export const cartSelectors = {
  items: (s: CartStore) => s.items,
  count: (s: CartStore) => s.getTotalQty(),
  subtotalList: (s: CartStore) => s.getSubtotalList(),
  promoDiscount: (s: CartStore) => s.getPromoDiscount(),
  total: (s: CartStore) => s.getTotalPrice(),
};
