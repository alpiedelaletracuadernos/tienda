// src/hooks/use-cart.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import { calculateCartPricing } from '@/lib/pricing/calc-cart-pricing';
import { getCartLineKey } from '@/lib/cart-key';

interface CartStore {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
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

          const newKey = getCartLineKey(normalizedItem);
          const idx = state.items.findIndex((item) => getCartLineKey(item) === newKey);

          if (idx > -1) {
            const updated = [...state.items];
            updated[idx].quantity += normalizedItem.quantity;
            updated[idx].price = normalizedItem.product.basePrice;
            return { items: updated };
          }

          return { items: [...state.items, normalizedItem] };
        }),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((item) => getCartLineKey(item) !== key),
        })),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            getCartLineKey(item) === key
              ? { ...item, quantity: Math.max(1, quantity), price: item.product.basePrice }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalQty: () => get().items.reduce((a, it) => a + it.quantity, 0),

      getSubtotalList: () =>
        get().items.reduce((a, it) => a + it.product.basePrice * it.quantity, 0),

      getPricing: () => calculateCartPricing(get().items),

      getPromoDiscount: () => get().getPricing().promo?.amount ?? 0,

      getTotalPrice: () => get().getPricing().total,
    }),
    {
      // ⚠️ `name` es la CLAVE de localStorage, no un número de versión: al
      // cambiarla de 'cart:v3' a 'cart:v4', zustand deja de leer los datos
      // viejos y `migrate` NO corre para carritos guardados con la clave
      // anterior — esos carritos arrancan vacíos. Es intencional: los ítems
      // v3 no tienen selectedModel/isCustom, así que fusionarlos bajo la
      // clave de identidad nueva produciría líneas con el diseño equivocado.
      // Si en el futuro hace falta migrar de verdad, dejá `name` fijo y
      // subí sólo `version` (que es lo que dispara `migrate`).
      name: 'cart:v4',
      version: 4,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { items?: CartItem[] } | undefined;
        if (state?.items && Array.isArray(state.items)) {
          state.items = state.items.map((it: CartItem) => {
            if (it?.product?.basePrice && it.price !== it.product.basePrice) {
              return { ...it, price: it.product.basePrice };
            }
            return it;
          });
        }
        return state;
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
