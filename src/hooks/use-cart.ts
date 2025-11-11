import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, interior: string, cover: string) => void;
  updateQuantity: (productId: string, size: string, interior: string, cover: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          item =>
            item.product.id === newItem.product.id &&
            item.selectedSize === newItem.selectedSize &&
            item.selectedInterior === newItem.selectedInterior &&
            item.selectedCover === newItem.selectedCover &&
            item.personalization === newItem.personalization
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          return { items: updatedItems };
        }

        return { items: [...state.items, newItem] };
      }),

      removeItem: (productId, size, interior, cover) => set((state) => ({
        items: state.items.filter(
          item =>
            !(item.product.id === productId &&
              item.selectedSize === size &&
              item.selectedInterior === interior &&
              item.selectedCover === cover)
        ),
      })),

      updateQuantity: (productId, size, interior, cover, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedInterior === interior &&
          item.selectedCover === cover
            ? { ...item, quantity }
            : item
        ),
      })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart:v1',
      version: 1,
    }
  )
);

// Optional selectors for finer-grained subscriptions
export const cartSelectors = {
  items: (s: CartStore) => s.items,
  count: (s: CartStore) => s.items.reduce((acc, it) => acc + it.quantity, 0),
  total: (s: CartStore) => s.getTotalPrice(),
};
