// ProductCard.tsx
import { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import vars from '@/data/data';
import { formatARS } from '@/lib/currency';
import { calculateProductPricing } from '@/lib/pricing/calc-product-pricing';
import { isEligibleForDiscount } from '@/config/promotions';
import { COMING_SOON_LABEL, availabilityNote, isPurchasable } from '@/lib/availability';
import { cn } from '@/lib/utils';
import { responsiveSrcSet, stillOf } from '@/lib/media';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const pricing = calculateProductPricing({ product, quantity: 1 });
  const formattedPrice = formatARS(pricing.listUnit);
  const formattedFinalPrice = formatARS(pricing.finalUnit);
  const purchasable = isPurchasable(product);

  // El badge Hot Sale es un caso particular pedido por el negocio: se resalta
  // en la card aunque haya otras promos acumuladas, así que se detecta aparte
  // de `pricing.discounts` (que trae todas las que aplicaron).
  const hsEligible = pricing.discounts.some((d) => d.label.startsWith(vars.promotions.hotSale.label));

  // Badge de promo genérica (no Hot Sale): usa la misma función de
  // elegibilidad que decide el precio (categoría + personalización), no un
  // match de texto sobre el nombre del producto.
  const discountEligible =
    !hsEligible && isEligibleForDiscount({ product: { category: product.category } });

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/producto/${product.slug}`}>
        {/* 👇 Hacemos el wrapper RELATIVE para anclar el badge */}
        <div className="relative aspect-square overflow-hidden bg-muted">
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
              {COMING_SOON_LABEL}
            </span>
          ) : hsEligible ? (
            <span className="absolute left-2 top-2 rounded-full bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-0.5 shadow-sm">
              HOT SALE -{vars.promotions.hotSale.percentage}%
            </span>
          ) : discountEligible ? (
            <span className="absolute left-2 top-2 rounded-full bg-amber-400 text-black text-[11px] font-semibold px-2 py-0.5 shadow-sm">
              Promo {vars.promotions.discount.percentage}% OFF
            </span>
          ) : null}
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/producto/${product.slug}`}>
            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        {!purchasable ? (
          <p className="text-sm font-medium text-muted-foreground">{availabilityNote(product)}</p>
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
          <p className="text-xs text-amber-700 mt-1">
            2×1: llevás 2 y pagás 1
          </p>
        )} */}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" size="sm" variant={purchasable ? 'default' : 'outline'}>
          <Link to={`/producto/${product.slug}`}>{purchasable ? 'Ver Producto' : 'Ver detalle'}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
