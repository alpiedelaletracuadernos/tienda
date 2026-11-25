// src/config/cyberweek.ts
//
// Estado de la campaña "Cyber Week" reutilizable (vars.promotions.cyberWeek).
// Hoy es el Black Friday APL: del 26/11 a las 00:00 al 30/11 a las 23:59
// (hora de Argentina), 15% OFF + libreta A6 de regalo por producto.
// Precios, barra, portada, cards, carrito, checkout y WhatsApp consultan acá:
// se prende y se apaga sola, sin tocar código.
//
// Vista previa: con `VITE_PROMO_NOW=2026-11-27T10:00:00-03:00` al compilar,
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

const AR_OFFSET_MS = 3 * 3_600_000;
/** Día de la semana en Argentina (0 = domingo ... 6 = sábado). */
const arWeekday = (d: Date): number => new Date(d.getTime() - AR_OFFSET_MS).getUTCDay();

/** ¿Estamos en la previa ("mañana arranca"): desde teaserFrom hasta el inicio? */
export const isTeaserActive = (now: Date = promoNow()): boolean =>
  cfg.enabled &&
  !!cfg.teaserFrom &&
  now >= new Date(`${cfg.teaserFrom}T00:00:00-03:00`) &&
  now < start();

/** Cuenta DNI reintegra sólo de lunes a viernes (hora AR). */
export const isCuentaDniDay = (now: Date = promoNow()): boolean => {
  const wd = arWeekday(now);
  return !!vars.cuentaDni?.enabled && wd >= 1 && wd <= 5;
};

/** Frase de cierre honesta: fecha, "Quedan X días" o "Último día". */
export const cyberDeadlineText = (now: Date = promoNow()): string => {
  const left = cyberDaysLeft(now);
  if (left <= 1) {
    return (
      'Último día: termina hoy a las 23:59' +
      (isCuentaDniDay(now) ? ' · con reintegro Cuenta DNI' : '')
    );
  }
  if (cfg.extendedText) return cfg.extendedText;
  if (arWeekday(now) === 5) return 'Hoy, último día de la semana con Cuenta DNI';
  if (left <= 3) return `Quedan ${left} días`;
  return `Hasta ${cfg.endLabel}`;
};

/** Titular corto: "15% OFF + Libreta A6 de regalo" (o % / 3x2 + regalito). */
export const cyberHeadline = () =>
  cfg.giftPerUnit?.enabled
    ? `${cfg.percentage}% OFF + ${cfg.giftPerUnit.productName} de regalo`
    : `${cfg.percentage}% OFF${cfg.threeForTwo ? ' o 3x2' : ''} + regalito`;

export const cyberWeek = cfg;
export const giftPerUnit = cfg.giftPerUnit;
export const giftEnabled = !!cfg.giftPerUnit?.enabled;
