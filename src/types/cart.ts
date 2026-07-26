// src/types/cart.ts
import type { Product, ProductSize, InteriorType, CoverType } from './product';

export interface CartItem {
  product: Pick<Product, 'id' | 'name' | 'basePrice' | 'images' | 'category'>;
  quantity: number;
  price: number; // unitario guardado
  personalization?: string;
  selectedModel?: string;
  selectedColor?: string;
  selectedSize?: ProductSize;
  selectedInterior?: InteriorType;
  selectedCover?: CoverType;
  // Distingue un ítem armado en modo "Personalizar" de uno estándar,
  // incluso cuando el texto de personalización quedó vacío. Sin este
  // flag, un ítem personalizado sin texto es indistinguible (misma
  // clave de carrito) de la versión estándar del mismo producto, y
  // ambos se fusionarían perdiendo el recargo de personalización.
  isCustom?: boolean;
  discountApplied?: boolean;
  discountAmount?: number;
  discountPercentage?: number;
  promo?: boolean;
  promoDiscount?: number;
}

export interface BuyerInfo {
  name: string;
  city: string;
  deliveryMethod: 'retiro' | 'envio';
  address?: string;
  notes?: string;
  paymentMethod?: 'efectivo' | 'transferencia' | 'mercado-pago';
}
