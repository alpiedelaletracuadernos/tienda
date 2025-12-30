// src/types/cart.ts
import type { Product, ProductSize, InteriorType, CoverType } from './product';

export interface CartItem {
  product: Pick<Product, 'id' | 'name' | 'basePrice' | 'images'>;
  quantity: number;
  price: number; // unitario guardado
  personalization?: string;
  selectedModel?: string;
  selectedSize?: ProductSize;
  selectedInterior?: InteriorType;
  selectedCover?: CoverType;
}

export interface BuyerInfo {
  name: string;
  city: string;
  deliveryMethod: 'retiro' | 'envio';
  address?: string;
  notes?: string;
  paymentMethod?: 'efectivo' | 'transferencia' | 'mercado-pago';
}

