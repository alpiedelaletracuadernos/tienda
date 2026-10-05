// ProductCard.tsx
import { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import vars from '@/data/data';
import { formatARS } from '@/lib/currency';
import { calculateProductPricing } from '@/lib/pricing/calc-product-pricing';
import { isEligibleForDiscount } from '@/config/promotions';
import { availabilityLabel, availabilityNote, isPurchasable } from '@/lib/availability';
import { kitPricingFor } from '@/lib/pricing/kit';
import { presale } from '@/config/presale';
import { cn } from '@/lib/utils';
import { responsiveSrcSet, stillOf } from '@/lib/media';

interface ProductCardProps {
  product: Product;
  /** Card destacada: ocupa dos columnas y se vuelve horizontal en sm+. */
  featured?: boolean;
}

export const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const pricing = calculateProductPricing({ product, quantity: 1 });
  const formattedPrice = formatARS(pricing.listUnit);
  const formattedFinalPrice = formatARS(pricing.finalUnit);
  const purchasable = isPurchasable(product);
  // Kit: valor por separado y ahorro de la versión de entrada (la del "Desde").
  const kit = purchasable ? kitPricingFor(product, product.interiors[0]) : null;
  const showBadge = purchasable && !!product.badge;

  // El badge Hot Sale es un caso particular pedido por el negocio: se resalta
  // en la card aunque haya otras promos acumuladas, así que se detecta aparte
  // de `pricing.discounts` (que trae todas las que aplicaron).
  const hsEligible = pricing.discounts.some((d) =>
    d.label.startsWith(vars.promotions.hotSale.label)
  );

  // Badge de promo genérica (no Hot Sale): usa la misma función de
  // elegibilidad que decide el precio (categoría + personalización), no un
  // match de texto sobre el nombre del producto.
  const discountEligible =
    !hsEligible && isEligibleForDiscount({ product: { category: product.category } });

  return (
    <Card
      className={cn(
        'group overflow-hidden hover:shadow-lg transition-all duration-300',
        featured && 'sm:col-span-2 sm:flex sm:flex-row ring-2 ring-primary/40'
      )}
    >
      <Link to={`/producto/${product.slug}`} className={cn(featured && 'sm:w-1/2 sm:shrink-0')}>
        {/* 👇 Hacemos el wrapper RELATIVE para anclar el badge */}
        <div
          className={cn(
            'relative aspect-square overflow-hidden bg-muted',
            featured && 'sm:aspect-auto sm:h-full sm:min-h-[22rem]'
          )}
        >
          <img
            src={stillOf(product.images[0])}
            srcSet={responsiveSrcSet(product.images[0])}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            width={1200}
            height={1200}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
              !purchasable && 'grayscale opacity-70'
            )}
            loading="lazy"
            decoding="async"
          />
          {!purchasable ? (
            <span className="absolute left-2 top-2 rounded-full bg-foreground text-background text-[11px] font-semibold px-2.5 py-0.5 shadow-sm">
              {availabilityLabel(product)}
            </span>
          ) : showBadge ? (
            <span className="absolute left-2 top-2 rounded-full bg-primary text-primary-foreground text-[11px] font-bold tracking-wide px-2.5 py-0.5 shadow-sm">
              {product.badge}
            </span>
          ) : hsEligible ? (
            <span className="absolute left-2 top-2 rounded-full bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-0.5 shadow-sm">
              HOT SALE -{vars.promotions.hotSale.percentage}%
            </span>
          ) : discountEligible ? (
            <span className="absolute left-2 top-2 rounded-full bg-promo text-promo-foreground text-[11px] font-semibold px-2 py-0.5 shadow-sm">
              Promo {vars.promotions.discount.percentage}% OFF
            </span>
          ) : null}
        </div>
      </Link>

      <div className={cn(featured && 'sm:flex sm:flex-col sm:justify-center sm:flex-1')}>
        <CardContent className={cn('p-4 space-y-2', featured && 'sm:p-6 sm:space-y-3')}>
          <div className="flex items-start justify-between gap-2">
            <Link to={`/producto/${product.slug}`}>
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
          </div>

          <p
            className={cn(
              'text-sm text-muted-foreground line-clamp-2',
              featured && 'sm:line-clamp-4'
            )}
          >
            {product.description}
          </p>

          {!purchasable ? (
            <p className="text-sm font-medium text-muted-foreground">{availabilityNote(product)}</p>
          ) : kit ? (
            // Referencia primero, después el precio y el ahorro (en pesos).
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">
                Valor por separado{' '}
                <span className="line-through">{formatARS(kit.separateTotal)}</span>
              </p>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-sm text-muted-foreground">Desde</span>
                <span className="text-2xl font-bold text-primary">{formatARS(kit.price)}</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                Ahorrás {formatARS(kit.savings)}
              </p>
            </div>
          ) : pricing.hasDiscount ? (
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-sm text-muted-foreground">Desde</span>
              <span className="text-sm text-muted-foreground line-through">{formattedPrice}</span>
              <span className={`text-2xl font-bold ${hsEligible ? 'text-accent' : 'text-primary'}`}>
                {formattedFinalPrice}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">Desde</span>
              <span className="text-sm text-muted-foreground">{formattedPrice}</span>
            </div>
          )}

          {/* {twoForOne && (
          <p className="text-xs text-notice-foreground mt-1">
            2×1: llevás 2 y pagás 1
          </p>
        )} */}
        </CardContent>

        <CardFooter className={cn('p-4 pt-0', featured && 'sm:px-6 sm:pb-6')}>
          <Button
            asChild
            className="w-full"
            size="sm"
            variant={purchasable ? 'default' : 'outline'}
          >
            <Link to={`/producto/${product.slug}`}>
              {!purchasable ? 'Ver detalle' : kit ? presale.ctaLabel : 'Ver Producto'}
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};
