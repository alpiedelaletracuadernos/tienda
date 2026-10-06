// src/data/collections.ts
//
// Categorías del catálogo pensadas para el cliente (lo que busca), no para
// cómo están cargados los datos. Un producto puede estar en más de una. Los
// que no estén en ninguna se ven igual en "Todo". El `id` es el que va en la
// URL (`/catalogo?cat=agendas`).
import type { Product } from '@/types/product';

export type Collection = { id: string; label: string; slugs: string[] };

export const COLLECTIONS: Collection[] = [
  {
    id: 'agendas',
    label: 'Agendas 2027',
    slugs: [
      'kit-mi-ano-2027',
      'agenda-semanal-a5',
      'agenda-diaria-a5',
      'agenda-perpetua-pocket-a6',
      'agenda-universitaria',
    ],
  },
  {
    id: 'cuadernos',
    label: 'Cuadernos',
    slugs: [
      'cuaderno-A4-tapa-blanda',
      'cuaderno-A5-tapa-dura',
      'cuaderno-de-pedidos',
      'cuaderno-con-planner-perpetuo',
    ],
  },
  {
    id: 'regalos',
    label: 'Para regalar',
    slugs: ['kit-mi-ano-2027', 'combo-premium', 'cuaderno-a4-libreta-a6'],
  },
  {
    id: 'docentes',
    label: 'Docentes',
    slugs: [
      'agenda-docente-nivel-inicial',
      'agenda-docente-nivel-primario',
      'agenda-docente-nivel-secundario-universitario',
      'cuaderno-docente-secundaria-perpetuo',
    ],
  },
  {
    id: 'libretas-planners',
    label: 'Libretas y planners',
    slugs: ['libretas-a6', 'planner-semanal-perpetuo-con-horarios', 'cuaderno-a4-libreta-a6'],
  },
  { id: 'recetarios', label: 'Recetarios', slugs: ['recetario'] },
];

export const inCollection = (collectionId: string, product: Pick<Product, 'slug'>) =>
  COLLECTIONS.find((c) => c.id === collectionId)?.slugs.includes(product.slug) ?? false;
