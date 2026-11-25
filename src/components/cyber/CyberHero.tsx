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

// TODO: reemplazar por foto agenda + libreta del mismo modelo
const EXAMPLE_SLUG = 'agenda-semanal-a5';
const GIFT_SLUG = 'libretas-a6';

function useExample() {
  const agenda = getProductBySlug(EXAMPLE_SLUG);
  if (!agenda) return null;
  const giftValue = cyberWeek.giftPerUnit?.value ?? 0;
  const final = Math.round(agenda.basePrice * (1 - cyberWeek.percentage / 100));
  const dniPct = parseInt(vars.cuentaDni?.benefit ?? '', 10) || 20;
  return {
    agendaImg: agenda.images[0],
    giftImg: getProductBySlug(GIFT_SLUG)?.images[0],
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
              {cyberWeek.percentage}% OFF en toda la web y, con cada producto, te regalamos una
              Libreta A6 con el mismo diseño. No la pagás: su precio regular es{' '}
              {formatARS(cyberWeek.giftPerUnit?.value ?? 0)}.
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

          {ex?.agendaImg && (
            <div className="relative mx-auto w-full max-w-xs md:max-w-sm">
              <img
                src={ex.agendaImg}
                alt="Agenda Semanal 2027"
                width={480}
                height={480}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="aspect-square w-4/5 rounded-2xl object-cover"
              />
              {ex.giftImg && (
                <img
                  src={ex.giftImg}
                  alt="Libreta A6 de regalo"
                  width={240}
                  height={240}
                  loading="eager"
                  decoding="async"
                  className="absolute bottom-0 right-0 aspect-square w-2/5 rounded-xl border-4 border-black object-cover shadow-xl"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
