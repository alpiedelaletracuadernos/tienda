// src/components/presale/PresaleCompareBox.tsx
// En la ficha de la agenda suelta: el kit con esa misma agenda sale menos que
// la agenda sola. Es el ancla más fuerte y aparece justo al decidir.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getProductBySlug } from '@/data/products';
import { formatARS } from '@/lib/currency';
import { kitPricingFor } from '@/lib/pricing/kit';
import { isPresaleActive, presale } from '@/config/presale';
import type { Product } from '@/types/product';

export function PresaleCompareBox({ product }: { product: Pick<Product, 'slug' | 'basePrice'> }) {
  const interior = presale.compareFrom[product.slug];
  const kitProduct = getProductBySlug(presale.slug);
  if (!interior || !kitProduct || !isPresaleActive()) return null;
  const kit = kitPricingFor(kitProduct, interior);
  if (!kit || kit.price >= product.basePrice) return null;

  return (
    <aside className="rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-2">
      <p className="text-xs font-bold tracking-wide text-primary">{presale.badge}</p>
      <p className="text-sm">
        Esta agenda sale <strong>{formatARS(product.basePrice)}</strong>. El{' '}
        <strong>{presale.name}</strong> con esta misma agenda sale{' '}
        <strong className="text-primary">{formatARS(kit.price)}</strong> y suma cuaderno, libreta,
        señalador y tarjeta.
      </p>
      <Link
        to={`/producto/${presale.slug}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4"
      >
        Ver el kit <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
