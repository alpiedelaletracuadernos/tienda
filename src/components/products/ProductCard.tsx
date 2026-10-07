// ProductCard.tsx
//
// Card del catálogo y de "Destacados". Toda la card es el link a la ficha
// (no hay botón aparte que sume alto). Compacta para 2 columnas en mobile:
// foto, nombre corto, una línea de datos (tamaño · interiores) y el precio
// destacado. "Desde" sólo cuando el precio depende de la opción elegida.
// La card `featured` (el kit en preventa) ocupa dos columnas, se vuelve
// horizontal en sm+ y suma descripción, valor por separado y su CTA.
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import vars from '@/data/data';
import { formatARS } from '@/lib/currency';
import { calculateProductPricing } from '@/lib/pricing/calc-product-pricing';
import { isEligibleForDiscount } from '@/config/promotions';
import { availabilityLabel, availabilityNote, isPurchasable } from '@/lib/availability';
import { kitPricingFor } from '@/lib/pricing/kit';
import { presale } from '@/config/presale';
import { cn } from '@/lib/utils';
import { isVideo, responsiveSrcSet, stillOf } from '@/lib/media';
import { CuentaDniHint } from '@/components/promos/CuentaDniHint';

interface ProductCardProps {
  product: Product;
  /** Card destacada: ocupa dos columnas y se vuelve horizontal en sm+. */
  featured?: boolean;
}

/** "A5 · 2 interiores", "A4 · 4 interiores", "A5 · 3 versiones"… */
const attributesLine = (product: Product) => {
  const parts: string[] = [];
  if (product.sizes.length) parts.push(product.sizes.join(' / '));
  const n = product.interiors.length;
  // Con un solo interior se omite: suele repetir el nombre del producto.
  if (n > 1) parts.push(product.kitItems?.length ? `${n} versiones` : `${n} interiores`);
  return parts.join(' · ');
};

/** Hay precios distintos según la opción (p. ej. kit semanal / diaria). */
const hasPriceRange = (product: Product) =>
  new Set(Object.values(product.priceByInterior ?? {})).size > 1;

export const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const pricing = calculateProductPricing({ product, quantity: 1 });
  const purchasable = isPurchasable(product);
  // Kit: valor por separado y ahorro de la versión de entrada (la del "Desde").
  const kit = purchasable ? kitPricingFor(product, product.interiors[0]) : null;
  const showBadge = purchasable && !!product.badge;
  const fromPrefix = hasPriceRange(product) ? 'Desde ' : '';
  const attrs = attributesLine(product);
  const hoverImage =
    !featured && product.images[1] && !isVideo(product.images[1]) ? product.images[1] : null;

  // El badge Hot Sale se resalta aunque haya otras promos acumuladas.
  const hsEligible = pricing.discounts.some((d) =>
    d.label.startsWith(vars.promotions.hotSale.label)
  );
  const discountEligible =
    !hsEligible &&
    isEligibleForDiscount({ product: { category: product.category, id: product.id } });

  return (
    <Link
      to={`/producto/${product.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        featured && 'col-span-2 sm:flex-row ring-2 ring-primary/40'
      )}
    >
      <div
        className={cn(
          'relative aspect-square overflow-hidden bg-muted',
          featured && 'sm:aspect-auto sm:w-1/2 sm:shrink-0 sm:min-h-[22rem]'
        )}
      >
        <img
          src={stillOf(product.images[0])}
          srcSet={responsiveSrcSet(product.images[0])}
          sizes={
            featured
              ? '(min-width: 640px) 50vw, 100vw'
              : '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw'
          }
          width={1200}
          height={1200}
          alt={product.name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
            !purchasable && 'grayscale opacity-70'
          )}
          loading="lazy"
          decoding="async"
        />
        {/* Escritorio: al pasar el mouse se ve la segunda foto */}
        {hoverImage && (
          <img
            src={stillOf(hoverImage)}
            srcSet={responsiveSrcSet(hoverImage)}
            sizes="(min-width: 1280px) 25vw, 33vw"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className={cn(
              'absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-300 md:block md:group-hover:opacity-100',
              !purchasable && 'grayscale'
            )}
          />
        )}
        {!purchasable ? (
          <Badge className="bg-foreground text-background">{availabilityLabel(product)}</Badge>
        ) : showBadge ? (
          <Badge className="bg-primary text-primary-foreground">{product.badge}</Badge>
        ) : hsEligible ? (
          <Badge className="bg-accent text-accent-foreground">
            HOT SALE -{vars.promotions.hotSale.percentage}%
          </Badge>
        ) : discountEligible ? (
          <Badge className="bg-promo text-promo-foreground">
            Promo {vars.promotions.discount.percentage}% OFF
          </Badge>
        ) : null}
      </div>

      <div
        className={cn(
          'flex flex-1 flex-col gap-1 p-3 sm:p-4',
          featured && 'gap-2 p-4 sm:justify-center sm:p-6'
        )}
      >
        <h3
          className={cn(
            'font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-primary',
            featured ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
          )}
        >
          {featured ? product.name : (product.shortName ?? product.name)}
        </h3>

        {attrs && <p className="text-xs text-muted-foreground">{attrs}</p>}

        {featured && (
          <p className="text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-1">
          {!purchasable ? (
            <p className="text-sm font-medium text-muted-foreground">{availabilityNote(product)}</p>
          ) : kit ? (
            // Referencia primero, después el precio y el ahorro (en pesos).
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">
                Valor por separado{' '}
                <span className="line-through">{formatARS(kit.separateTotal)}</span>
              </p>
              <p className="text-2xl font-bold text-primary">
                <span className="text-sm font-normal text-muted-foreground">Desde </span>
                {formatARS(kit.price)}
              </p>
              <p className="text-sm font-medium">Ahorrás {formatARS(kit.savings)}</p>
            </div>
          ) : pricing.hasDiscount ? (
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-xs text-muted-foreground line-through">
                {formatARS(pricing.listUnit)}
              </span>
              <span className={cn('text-lg font-bold', hsEligible ? 'text-accent' : 'text-primary')}>
                {formatARS(pricing.finalUnit)}
              </span>
            </p>
          ) : (
            <p className="text-base sm:text-lg font-bold">
              {fromPrefix && (
                <span className="text-xs font-normal text-muted-foreground">{fromPrefix}</span>
              )}
              {formatARS(pricing.listUnit)}
            </p>
          )}
          {/* Beneficio de pago, en una línea que no cambia el alto de la card */}
          {purchasable && <CuentaDniHint variant="card" className="mt-1" />}
        </div>

        {featured && purchasable && (
          <span className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors group-hover:bg-primary/90">
            {kit ? presale.ctaLabel : 'Ver producto'}
          </span>
        )}
      </div>
    </Link>
  );
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide shadow-sm',
        className
      )}
    >
      {children}
    </span>
  );
}
