// src/components/cyber/CyberHero.tsx
//
// Portada durante el Black Friday. Mobile primero: oferta, ejemplo con
// precios reales calculados desde la config, cuándo termina y un único botón.
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/data/products';
import vars from '@/data/data';
import { formatARS } from '@/lib/currency';
import { cyberWeek } from '@/config/cyberweek';
import { useCyberClock } from './useCyberClock';

const EXAMPLE_SLUG = 'agenda-semanal-a5';
/** Foto de campaña: agenda + libreta en composé (1200x900 y 640x480). */
const HERO_PHOTO = 'assets/bf/bf26-agenda-libreta.webp';
const HERO_PHOTO_SM = 'assets/bf/bf26-agenda-libreta-640.webp';

function useExample() {
  const agenda = getProductBySlug(EXAMPLE_SLUG);
  if (!agenda) return null;
  const giftValue = cyberWeek.giftPerUnit?.value ?? 0;
  const final = Math.round(agenda.basePrice * (1 - cyberWeek.percentage / 100));
  const dniPct = parseInt(vars.cuentaDni?.benefit ?? '', 10) || 20;
  return {
    list: agenda.basePrice + giftValue,
    final,
    dni: vars.cuentaDni?.enabled ? Math.round(final * (1 - dniPct / 100)) : null,
  };
}

export function CyberHero() {
  const clock = useCyberClock();
  const ex = useExample();
  const label = `${cyberWeek.badge} · ${cyberWeek.rangeLabel.replace(/ de noviembre$/, '/11').toUpperCase()}`;

  return (
    <section
      className="relative isolate overflow-hidden bg-black text-white"
      aria-label={`${cyberWeek.name}: ${cyberWeek.rangeLabel}`}
    >
      <div className="container px-4 py-8 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-xs font-extrabold tracking-widest text-promo">{label}</p>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.05]">
              Tu agenda + libreta en composé
            </h1>
            <p className="text-base sm:text-lg text-white/85">
              {cyberWeek.percentage}% OFF en toda la web y, con cada producto, una Libreta A6 en
              composé de regalo:{' '}
              <span className="whitespace-nowrap">
                <span className="text-white/60 line-through">
                  {formatARS(cyberWeek.giftPerUnit?.value ?? 0)}
                </span>{' '}
                <span className="rounded-full bg-success px-2 py-0.5 text-sm font-extrabold text-success-foreground">
                  GRATIS
                </span>
              </span>
            </p>

            {ex && (
              <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                {/* Jerarquía: 1 solo precio protagonista (blanco, grande). Verde =
                    ahorro. Amarillo queda reservado a la marca de la campaña y al
                    botón. Cuenta DNI va aparte, chico y neutro: es un reintegro
                    posterior según el medio de pago, no el precio de la web. */}
                <p className="text-xs text-white/60">
                  Precio regular del combo{' '}
                  <span className="line-through">{formatARS(ex.list)}</span>
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-4xl font-extrabold leading-none text-white">
                    {formatARS(ex.final)}
                  </span>
                  <span className="rounded-full bg-success px-2.5 py-1 text-sm font-bold text-success-foreground">
                    Ahorrás {formatARS(ex.list - ex.final)}
                  </span>
                </p>
                <p className="mt-1.5 text-xs text-white/70">
                  Agenda Semanal 2027 + Libreta A6 en composé de regalo
                </p>
                {ex.dni !== null && (
                  <p className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/70">
                    <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {vars.cuentaDni.label}
                    </span>
                    <span>
                      {vars.cuentaDni.benefit} (lun. a vie.): te queda en{' '}
                      <span className="font-semibold text-white/90">{formatARS(ex.dni)}</span>
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 pt-1">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 text-base bg-promo text-promo-foreground hover:bg-promo/90"
              >
                <Link to="/catalogo">Elegí tu diseño</Link>
              </Button>
              <p className="text-xs text-white/75" aria-live="polite">
                {clock.lastDay ? clock.text : `Termina ${cyberWeek.endLabel} a las 23:59`}
              </p>
            </div>
          </div>

          <figure className="relative mx-auto w-full max-w-md md:max-w-none">
            <img
              src={HERO_PHOTO}
              srcSet={`${HERO_PHOTO_SM} 640w, ${HERO_PHOTO} 1200w`}
              sizes="(min-width: 768px) 50vw, 100vw"
              alt="Agenda 2027 y Libreta A6 en composé sobre un escritorio"
              width={1200}
              height={900}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              🎁 La libreta va de regalo
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
