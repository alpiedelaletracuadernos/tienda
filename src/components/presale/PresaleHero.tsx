// src/components/presale/PresaleHero.tsx
//
// Portada mientras dura la preventa. Mobile primero (casi todo el tráfico
// viene de Instagram): foto del kit de fondo con oscurecido, y arriba de todo
// lo que decide la compra: fecha, título, valor → precio → ahorro y el botón.
// La foto es la imagen LCP (eager + fetchPriority alta).
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/data/products';
import { formatARS } from '@/lib/currency';
import { kitPricingFor } from '@/lib/pricing/kit';
import { stillOf, responsiveSrcSet } from '@/lib/media';
import { presale, presaleDeadlineText } from '@/config/presale';

export function PresaleHero() {
  const product = getProductBySlug(presale.slug);
  const semanal = product && kitPricingFor(product, 'semanal');
  const diaria = product && kitPricingFor(product, 'diaria');
  if (!product || !semanal) return null;
  const image = product.images[0];

  const scrollToIncludes = () =>
    document.getElementById('que-incluye')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      className="relative isolate min-h-[88svh] flex items-end md:items-center overflow-hidden"
      aria-label={`${presale.name} en preventa`}
    >
      <div className="absolute inset-0 -z-10">
        <img
          src={stillOf(image)}
          srcSet={responsiveSrcSet(image)}
          sizes="100vw"
          alt={`${presale.name}: agenda, cuaderno, libreta, señalador y tarjeta`}
          width={800}
          height={1200}
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover md:object-[center_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/10 md:bg-gradient-to-r md:from-black/80 md:via-black/50 md:to-black/0" />
      </div>

      <div className="container relative z-10 px-4 pb-10 pt-24 md:py-16">
        <div className="max-w-xl text-white space-y-4">
          <p className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold tracking-wide text-primary-foreground">
            {presaleDeadlineText().toUpperCase()}
          </p>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">{presale.name}</h1>
          <p className="text-lg sm:text-xl text-white/90">
            El kit completo por menos de lo que sale la agenda sola.
          </p>

          {/* Referencia primero, después el precio, después el ahorro */}
          <div className="space-y-1">
            <p className="text-sm text-white/80">
              Valor por separado{' '}
              <span className="line-through">{formatARS(semanal.separateTotal)}</span>
            </p>
            <p className="text-4xl font-bold">
              {formatARS(semanal.price)}{' '}
              <span className="text-base font-medium text-white/85">con agenda semanal</span>
            </p>
            <p className="text-sm text-white/90">
              Ahorrás {formatARS(semanal.savings)}
              {diaria && <> · Con agenda diaria: {formatARS(diaria.price)}</>}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <Button asChild size="lg" className="px-8 text-base">
              <Link to={`/producto/${presale.slug}`}>{presale.ctaLabel}</Link>
            </Button>
            <button
              type="button"
              onClick={scrollToIncludes}
              className="text-sm font-medium text-white underline underline-offset-4 self-center sm:self-auto"
            >
              Ver qué incluye
            </button>
          </div>

          <p className="text-xs text-white/75">{presale.delivery}.</p>
        </div>
      </div>
    </section>
  );
}
