// src/config/cyberweek.ts
//
// Estado de la Cyber Week APL según la fecha (vars.promotions.cyberWeek).
// Precios, barra, portada, cards, carrito, checkout y WhatsApp consultan acá:
// el 2/11 a las 00:00 (hora de Argentina) se prende todo junto y el 7/11 a
// las 23:59 se apaga, sin tocar código.
//
// Vista previa: con `VITE_PROMO_NOW=2026-11-03T10:00:00-03:00` al compilar,
// la web se comporta como si fuera ese momento. Sólo para probar localmente:
// el build de producción no la define.
import vars from '@/data/data';

const cfg = vars.promotions.cyberWeek;

const fakeNow = import.meta.env.VITE_PROMO_NOW as string | undefined;
const offsetMs = fakeNow ? new Date(fakeNow).getTime() - Date.now() : 0;

/** "Ahora" de la promo (real, o el de la vista previa). */
export const promoNow = (): Date => new Date(Date.now() + offsetMs);

// Fechas fijas en hora de Argentina (UTC-3, sin horario de verano), así la
// promo arranca y termina igual para quien mira desde otro huso.
const start = () => new Date(`${cfg.startDate}T00:00:00-03:00`);
export const cyberWeekEnd = () => new Date(`${cfg.endDate}T23:59:59-03:00`);

export const isCyberWeekActive = (now: Date = promoNow()): boolean =>
  cfg.enabled && now >= start() && now <= cyberWeekEnd();

/** Días que quedan contando hoy (el último día devuelve 1), en hora AR. */
export const cyberDaysLeft = (now: Date = promoNow()): number => {
  const day = (d: Date) => Math.floor((d.getTime() - 3 * 3_600_000) / 86_400_000);
  return day(cyberWeekEnd()) - day(now) + 1;
};

/** Frase de cierre honesta: fecha, "Quedan X días" o "Último día". */
export const cyberDeadlineText = (now: Date = promoNow()): string => {
  const left = cyberDaysLeft(now);
  if (left <= 1) return 'Último día: termina hoy a las 23:59';
  if (left <= 3) return `Quedan ${left} días`;
  return `Hasta ${cfg.endLabel}`;
};

/** "15% OFF o 3x2 + regalito" (titular corto). El % y el 3x2 no se suman. */
export const cyberHeadline = () =>
  `${cfg.percentage}% OFF${cfg.threeForTwo ? ' o 3x2' : ''} + regalito`;

export const cyberWeek = cfg;
