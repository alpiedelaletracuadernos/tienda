// src/components/presale/PresaleValueBlock.tsx
// Bloque de la portada con la descomposición de valor del kit (versión
// semanal, la del precio de entrada) y el botón principal.
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/data/products';
import { kitPricingFor } from '@/lib/pricing/kit';
import { presale } from '@/config/presale';
import { KitValueBreakdown } from './KitValueBreakdown';

export function PresaleValueBlock() {
  const product = getProductBySlug(presale.slug);
  const kit = product && kitPricingFor(product, 'semanal');
  if (!kit) return null;
  return (
    <section id="que-incluye" className="scroll-mt-20 py-12 md:py-16">
      <div className="container px-4 max-w-2xl space-y-4">
        <KitValueBreakdown kit={kit} title="Qué incluye el kit (con agenda semanal)" />
        <Button asChild size="lg" className="w-full">
          <Link to={`/producto/${presale.slug}`}>{presale.ctaLabel}</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          También con agenda diaria. Elegís la versión y el diseño en el paso siguiente.
        </p>
      </div>
    </section>
  );
}
