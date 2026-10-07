// src/data/interiors.ts
//
// Interiores que se eligen con foto (InteriorPicker): nombre, la diferencia en
// una línea y las fotos curadas que se ven en "Ver por dentro". Lo comparten
// la Agenda Semanal y el Kit Mi Año 2027. Las fotos siguen la convención de
// src/lib/media.ts (`_thumb.webp` para las tarjetas).
import type { InteriorType } from '@/types/product';

const base = 'assets/productos/';

export type InteriorPhoto = { src: string; label: string };

export type InteriorInfo = {
  label: string;
  short: string;
  badge?: string;
  /** Recorte 4:3 de la zona que cambia (los días), para la tarjeta. */
  card?: string;
  /** La primera es la que muestra la diferencia (la semana / el día). */
  photos: InteriorPhoto[];
};

const con = (n: number) => `${base}agenda-semanal-con-horarios_${String(n).padStart(4, '0')}.webp`;
const sin = (n: number) => `${base}agenda-semanal-sin-horarios_${String(n).padStart(4, '0')}.webp`;
const dia = (n: number) => `${base}agenda-diaria-interior_${String(n).padStart(4, '0')}.webp`;

export const INTERIOR_INFO: Partial<Record<InteriorType, InteriorInfo>> = {
  'semanal sin horarios': {
    label: 'Semanal sin horarios',
    short: 'Cada día con renglones libres, para listas y pendientes.',
    card: `${base}agenda-semanal-sin-horarios_card.webp`,
    photos: [
      { src: sin(8), label: 'Vista semanal' },
      { src: sin(6), label: 'Planner mensual' },
      { src: sin(2), label: 'Calendario 2027 y 2028' },
      { src: sin(7), label: 'Balance mensual' },
      { src: sin(5), label: 'Objetivos y portada del mes' },
      { src: sin(10), label: 'Contraseñas y stickers' },
    ],
  },
  'semanal con horarios': {
    label: 'Semanal con horarios',
    short: 'Cada día dividido por hora, de 7 a 21 h. Para turnos, clases y reuniones.',
    card: `${base}agenda-semanal-con-horarios_card.webp`,
    photos: [
      { src: con(7), label: 'Vista semanal' },
      { src: con(6), label: 'Planner mensual' },
      { src: con(4), label: 'Calendario 2027 y 2028' },
      { src: con(5), label: 'Balance mensual' },
      { src: con(2), label: 'Contraseñas y portada del mes' },
      { src: con(9), label: 'Plancha de stickers' },
    ],
  },
  diaria: {
    label: 'Diaria',
    short: 'Una página por día, con horario de 7 a 21 h, «Por hacer» y notas.',
    card: `${base}agenda-diaria-interior_card.webp`,
    photos: [
      { src: dia(9), label: 'Vista diaria' },
      { src: dia(8), label: 'Sábado y domingo' },
      { src: dia(6), label: 'Planner mensual' },
      { src: dia(2), label: 'Calendario 2027 y 2028' },
      { src: dia(7), label: 'Balance mensual' },
      { src: dia(10), label: 'Contraseñas y stickers' },
    ],
  },
};

/** Nombre legible de un interior (carrito, WhatsApp, resumen). */
export const interiorLabel = (interior?: string): string => {
  if (!interior) return '';
  const info = INTERIOR_INFO[interior as InteriorType];
  return info?.label ?? interior.charAt(0).toUpperCase() + interior.slice(1);
};

/**
 * Familia del interior para los filtros del catálogo: las dos semanales son
 * "semanal" (así siguen andando los links `?interior=semanal`).
 */
export const interiorFamily = (interior: InteriorType): InteriorType =>
  interior.startsWith('semanal') ? 'semanal' : interior;

/** Slug corto para la URL (`?interior=con-horarios`). */
export const interiorSlug = (interior: string) =>
  interior.replace(/^semanal /, '').replace(/\s+/g, '-');
