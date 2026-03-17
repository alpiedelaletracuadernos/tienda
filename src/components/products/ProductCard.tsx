// ProductCard.tsx
import { Product } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { isEligibleForDiscount } from '@/config/promotions';
import vars from '@/data/data';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(product.basePrice);

  const mockCartItemCheck = {
    product: { category: product.category },
    personalization: undefined
  };
  const eligibleForDiscount = isEligibleForDiscount(mockCartItemCheck as any);

  let formattedDiscountedPrice = null;
  if (eligibleForDiscount) {
    const discountPercentage = vars.promotions.discount.percentage || 0;
    const discountedPrice = product.basePrice * (1 - discountPercentage / 100);
    formattedDiscountedPrice = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(discountedPrice);
  }
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/producto/${product.slug}`}>
        {/* 👇 Hacemos el wrapper RELATIVE para anclar el badge */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/producto/${product.slug}`}>
            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.remainingQuota <= 5 && (
            <Badge variant="destructive" className="shrink-0 text-xs">
              ¡Últimos {product.remainingQuota}!
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        {eligibleForDiscount ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">Desde</span>

              <span className="text-sm text-muted-foreground line-through">{formattedPrice}</span>
              <span className="text-2xl font-bold text-primary">{formattedDiscountedPrice}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">Desde</span>
              <span className="text-sm text-muted-foreground">{formattedPrice}</span>
            </div>
          </>
        )}

        {/* {twoForOne && (
          <p className="text-xs text-amber-700 mt-1">
            2×1: llevás 2 y pagás 1
          </p>
        )} */}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" size="sm">
          <Link to={`/producto/${product.slug}`}>Ver Producto</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
