// src/components/cyber/CyberHero.tsx
//
// Portada durante la Cyber Week. Mobile primero: arriba de todo la oferta
// completa (los tres beneficios), un ejemplo con precios reales calculado
// por el mismo motor del carrito, cuándo termina y un único botón.
// La foto de fondo es la misma imagen LCP de la portada habitual.
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CuentaDniHint } from '@/components/promos/CuentaDniHint';
import { getProductBySlug } from '@/data/products';
import { formatARS } from '@/lib/currency';
import { calculateCartPricing } from '@/lib/pricing/calc-cart-pricing';
import { cyberWeek } from '@/config/cyberweek';
import type { CartItem } from '@/types/cart';
import { useCyberClock } from './useCyberClock';

const POSTER = 'assets/hero/hero-2027-poster.webp';
const POSTER_SRCSET =
  'assets/hero/hero-2027-poster-480.webp 480w, assets/hero/hero-2027-poster.webp 720w';

/** Ejemplo del 3x2 con tres productos reales del catálogo. */
const EXAMPLE_SLUGS = ['agenda-semanal-a5', 'agenda-diaria-a5', 'agenda-perpetua-pocket-a6'];

function useExample() {
  const products = EXAMPLE_SLUGS.map(getProductBySlug).filter((p) => p && p.inStock);
  if (products.length < 3) return null;
  const items: CartItem[] = products.map((p) => ({
    product: {
      id: p!.id,
      name: p!.name,
      basePrice: p!.basePrice,
      images: p!.images,
      category: p!.category,
    },
    quantity: 1,
    price: p!.basePrice,
  }));
  const pricing = calculateCartPricing(items);
  return {
    names: products.map((p) => p!.shortName ?? p!.name.replace(/ 2027$/, '')),
    list: pricing.subtotalList,
    total: pricing.total,
  };
}

const BENEFITS = [
  { big: `${cyberWeek.percentage}%`, small: 'OFF en toda la web' },
  ...(cyberWeek.threeForTwo ? [{ big: '3x2', small: 'Llevás 3, pagás los 2 de mayor valor' }] : []),
  { big: '🎁', small: 'Regalito en todas las compras' },
];

export function CyberHero() {
  const clock = useCyberClock();
  const example = useExample();

  return (
    <section
      className="relative isolate min-h-[88svh] flex items-end md:items-center overflow-hidden bg-announcement"
      aria-label={`${cyberWeek.name}: ${cyberWeek.rangeLabel}`}
    >
      <div className="absolute inset-0 -z-10">
        <img
          src={POSTER}
          srcSet={POSTER_SRCSET}
          sizes="100vw"
          alt=""
          width={720}
          height={1280}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover opacity-70 md:object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30 md:bg-gradient-to-r md:from-black md:via-black/80 md:to-black/20" />
      </div>

      <div className="container relative z-10 px-4 pb-10 pt-20 md:py-16">
        <div className="max-w-xl text-white space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-promo px-2 py-1 text-xs font-extrabold tracking-widest text-promo-foreground">
              {cyberWeek.badge}
            </span>
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                clock.lastDay ? 'text-promo' : 'text-white/85'
              }`}
              aria-live="polite"
            >
              {clock.text}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.05]">{cyberWeek.name}</h1>
            <p className="text-base sm:text-lg text-white/85">
              Agendas 2027 y cuadernos hechos a mano, {cyberWeek.rangeLabel}.
            </p>
          </div>

          {/* Los tres beneficios: se leen de un vistazo */}
          <ul className="grid grid-cols-3 gap-2 sm:gap-3">
            {BENEFITS.map((b) => (
              <li
                key={b.small}
                className="rounded-xl border border-white/15 bg-white/10 p-2.5 sm:p-3 text-center backdrop-blur-sm"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-promo leading-none">
                  {b.big}
                </p>
                <p className="mt-1.5 text-[11px] sm:text-xs leading-tight text-white/90">
                  {b.small}
                </p>
              </li>
            ))}
          </ul>

          {/* Ejemplo concreto con precios reales: el ahorro en pesos convence más que el % */}
          {example && (
            <p className="rounded-xl bg-white/10 px-3 py-2.5 text-sm text-white/90">
              Ej.: {example.names.join(' + ')}:{' '}
              <span className="line-through text-white/60">{formatARS(example.list)}</span>{' '}
              <span className="font-bold text-white">{formatARS(example.total)}</span>
              <span className="font-semibold text-promo">
                {' '}
                · ahorrás {formatARS(example.list - example.total)}
              </span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <Button
              asChild
              size="lg"
              className="px-8 text-base bg-promo text-promo-foreground hover:bg-promo/90"
            >
              <Link to="/catalogo">Ver ofertas</Link>
            </Button>
            <WhatsAppButton
              className="px-7"
              message={`¡Hola! Quiero aprovechar la ${cyberWeek.name} (${cyberWeek.campaignCode}). ¿Me ayudás a armar mi pedido?`}
            />
          </div>

          <div className="space-y-2 text-xs text-white/75">
            <CuentaDniHint />
            <p>
              Los descuentos se aplican solos en el carrito. Se suman entre sí. No aplica al Kit Mi
              Año 2027.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
