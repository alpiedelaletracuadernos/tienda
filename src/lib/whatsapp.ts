// src/lib/whatsapp.ts
import type { Product, ProductSize, InteriorType, CoverType } from '@/types/product';
import type { CartItem, BuyerInfo } from '@/types/cart';
import { formatARS } from '@/lib/currency';
import { calculateCartPricing } from '@/lib/pricing/calc-cart-pricing';

export type PersonalizationStyleId = 'nombre' | 'frase' | 'foto' | 'trama' | 'logo';

export function buildWaLink(phone: string, message: string): string {
  const normalized = (phone || '').replace(/[^0-9+]/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message || '')}`;
}

// Catálogo (Shop)
export type CatalogFilters = {
  category?: string | 'all';
  size?: ProductSize | 'all';
  interior?: InteriorType | 'all';
};

export type ShopPersonalization = {
  styleId?: PersonalizationStyleId;
  buyerName?: string;
  buyerCity?: string;
  deliveryMethod?: 'retiro' | 'envio';
  deliveryAddress?: string;
  buyerNotes?: string;
};

export function buildShopMessage(
  filters: CatalogFilters,
  personalization: ShopPersonalization
): string {
  const lines: string[] = [];
  lines.push('¡Hola! Quiero consultar y/o finalizar la compra desde la tienda.');
  lines.push('');

  const parts: string[] = [];
  if (filters?.category && filters.category !== 'all') parts.push(`Categoría: ${filters.category}`);
  if (filters?.size && filters.size !== 'all') parts.push(`Tamaño: ${filters.size}`);
  if (filters?.interior && filters.interior !== 'all') parts.push(`Interior: ${filters.interior}`);
  if (parts.length) {
    lines.push('*Filtros seleccionados:*');
    parts.forEach((p) => lines.push(`• ${p}`));
    lines.push('');
  }

  if (personalization?.styleId) {
    const styleLabel =
      personalization.styleId === 'nombre'
        ? 'Nombre/Iniciales'
        : personalization.styleId === 'frase'
          ? 'Frase/Versículo'
          : personalization.styleId === 'foto'
            ? 'Foto/Imagen'
            : personalization.styleId === 'trama'
              ? 'Trama/Patrón'
              : personalization.styleId === 'logo'
                ? 'Logo/Marca'
                : 'A definir';
    lines.push(`Preferencia de personalización: ${styleLabel}`);
    lines.push('');
  }

  if (personalization?.buyerName || personalization?.buyerCity) {
    lines.push('*Datos del comprador:*');
    if (personalization.buyerName) lines.push(`• Nombre: ${personalization.buyerName}`);
    if (personalization.buyerCity) lines.push(`• Ciudad/Localidad: ${personalization.buyerCity}`);
    if (personalization.deliveryMethod)
      lines.push(
        `• Entrega: ${personalization.deliveryMethod === 'envio' ? 'Envío a domicilio' : 'Retiro en punto'}`
      );
    if (personalization.deliveryMethod === 'envio' && personalization.deliveryAddress)
      lines.push(`• Dirección: ${personalization.deliveryAddress}`);
    if (personalization.buyerNotes) lines.push(`• Notas: ${personalization.buyerNotes}`);
    lines.push('');
  }

  lines.push('¿Me confirmás disponibilidad y próximos pasos? ¡Gracias!');
  return lines.join('\n');
}

// PDP (detalle de producto)
export type PdpSelections = {
  size?: ProductSize;
  interior?: InteriorType;
  cover?: CoverType;
  modelLabel?: string;
  color?: string;
  quantity?: number;
};

export type PdpPersonalization = {
  text?: string; // texto libre ingresado por el usuario
  styleId?: PersonalizationStyleId; // guía de estilo
};

export function buildPdpMessage(
  product: Product,
  selections: PdpSelections,
  personalization?: PdpPersonalization
): string {
  const qty = selections.quantity ?? 1;
  const lines: string[] = [];
  lines.push('Hola! Me interesa este producto:');
  lines.push('');
  lines.push(`*${product?.name ?? 'Producto'}*`);
  if (selections.modelLabel) lines.push(`Modelo: ${selections.modelLabel}`);
  if (selections.color) lines.push(`Color: ${selections.color}`);
  if (selections.size) lines.push(`Tamaño: ${selections.size}`);
  if (selections.interior) lines.push(`Interior: ${selections.interior}`);
  if (selections.cover) lines.push(`Tapa: ${selections.cover}`);
  if (personalization?.text) lines.push(`Personalización: "${personalization.text}"`);
  if (personalization?.styleId) {
    const styleLabel = personalization.styleId
      .replace('nombre', 'Nombre/Iniciales')
      .replace('frase', 'Frase/Versículo')
      .replace('foto', 'Foto/Imagen')
      .replace('trama', 'Trama/Patrón')
      .replace('logo', 'Logo/Marca');
    lines.push(`Estilo de personalización: ${styleLabel}`);
  }
  lines.push(`Cantidad: ${qty}`);
  lines.push('');
  lines.push('¿Está disponible? ✨');
  return lines.join('\n');
}

// Checkout (carrito completo)
export function buildCheckoutMessage(cartItems: CartItem[], buyer: BuyerInfo): string {
  const lines: string[] = [];
  lines.push('¡Hola! Quiero *finalizar la compra* 👋');
  lines.push('');

  if (!cartItems?.length) {
    lines.push('_(No tengo productos en el carrito aún)_');
  } else {
    lines.push('*Detalle del pedido:*');
    lines.push('');
    cartItems.forEach((it, idx) => {
      const name = it.product?.name ?? 'Producto';
      const qty = it.quantity ?? 1;
      const unit = it.price ?? it.product?.basePrice ?? 0;
      const subtotal = unit * qty;
      lines.push(`• ${idx + 1}) *${name}* x${qty}`);
      if (it.selectedModel) lines.push(`   Modelo: ${it.selectedModel}`);
      if (it.selectedColor) lines.push(`   Color: ${it.selectedColor}`);
      if (it.selectedSize) lines.push(`   Tamaño: ${it.selectedSize}`);
      if (it.selectedInterior) lines.push(`   Interior: ${it.selectedInterior}`);
      if (it.selectedCover) lines.push(`   Tapa: ${it.selectedCover}`);
      if (it.personalization) lines.push(`   Personalización: “${it.personalization}”`);
      lines.push(`   Unitario: ${formatARS(unit)}  |  Subtotal: ${formatARS(subtotal)}`);
      lines.push('');
    });

    const pricing = calculateCartPricing(cartItems);

    if (pricing.promo) {
      lines.push(`*Promo aplicada:* ${pricing.promo.label} (-${formatARS(pricing.promo.amount)})`);
    }
    if (pricing.percent) {
      lines.push(`*Descuento aplicado:* ${pricing.percent.label} (-${formatARS(pricing.percent.amount)})`);
    }
    if (pricing.hotSale) {
      lines.push(`*${pricing.hotSale.label}:* -${formatARS(pricing.hotSale.amount)}`);
    }

    lines.push(`*Total estimado:* ${formatARS(pricing.total)}`);
    lines.push('');
  }

  lines.push('*Datos del comprador:*');
  lines.push(`• Nombre: ${buyer.name || 'A completar'}`);
  lines.push(`• Ciudad/Localidad: ${buyer.city || 'A completar'}`);
  lines.push(
    `• Entrega: ${buyer.deliveryMethod === 'envio' ? 'Envío a domicilio' : 'Retiro en punto de entrega'}`
  );
  if (buyer.deliveryMethod === 'envio')
    lines.push(`• Dirección: ${buyer.address || 'A completar'}`);
  if (buyer.notes) lines.push(`• Notas: ${buyer.notes}`);
  if (buyer.paymentMethod)
    lines.push(`• Método de pago preferido: ${buyer.paymentMethod.replace('-', ' ')}`);
  lines.push('');
  lines.push('¿Me confirmás disponibilidad y próximos pasos? ¡Gracias!');
  return lines.join('\n');
}
