// src/data/catalog-order.ts
//
// Orden en que se muestran los productos (catálogo, y de ahí "Destacados",
// que toma los primeros disponibles). Se identifica cada producto por su
// slug. Los que no estén en la lista van al final, en el orden en que están
// cargados en products.ts, así un producto nuevo nunca desaparece.
import type { Product } from '@/types/product';
import { isPresaleActive, presale } from '@/config/presale';

// Durante la preventa el kit va primero (y por eso también en Destacados).
const PRESALE_FIRST = isPresaleActive() ? [presale.slug] : [];

export const CATALOG_ORDER = [
  ...PRESALE_FIRST,
  'agenda-semanal-a5',
  'agenda-diaria-a5',
  'agenda-perpetua-pocket-a6',
  'agenda-universitaria',
  'agenda-docente-nivel-inicial',
  'agenda-docente-nivel-primario',
  'agenda-docente-nivel-secundario-universitario',
  'cuaderno-A4-tapa-blanda',
  'cuaderno-A5-tapa-dura',
  'recetario',
  'libretas-a6',
  'cuaderno-con-planner-perpetuo',
  'cuaderno-de-pedidos',
  'planner-semanal-perpetuo-con-horarios',
  'cuaderno-docente-secundaria-perpetuo',
  'combo-premium',
  'cuaderno-a4-libreta-a6',
];

export const sortByCatalogOrder = <T extends Pick<Product, 'slug'>>(list: T[]): T[] => {
  const rank = (slug: string) => {
    const i = CATALOG_ORDER.indexOf(slug);
    return i === -1 ? CATALOG_ORDER.length : i;
  };
  // sort es estable: los no listados conservan su orden relativo.
  return [...list].sort((a, b) => rank(a.slug) - rank(b.slug));
};
