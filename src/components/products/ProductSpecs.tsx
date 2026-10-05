// src/components/products/ProductSpecs.tsx
//
// "Qué incluye" y "Características" del producto (`includes` / `materials`).
// En acordeón para que la lista larga de contenidos no empuje hacia abajo el
// flujo de compra; "Qué incluye" arranca abierto porque es lo que más se
// consulta antes de comprar una agenda.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Product } from '@/types/product';

type Props = {
  product: Pick<Product, 'includes' | 'materials' | 'sizes' | 'productionTime'>;
};

export function ProductSpecs({ product }: Props) {
  const hasIncludes = product.includes.length > 0;
  const hasMaterials = product.materials.length > 0;
  if (!hasIncludes && !hasMaterials) return null;

  return (
    <Accordion type="multiple" defaultValue={hasIncludes ? ['includes'] : []} className="w-full">
      {hasIncludes && (
        <AccordionItem value="includes">
          <AccordionTrigger className="text-base font-semibold">Qué incluye</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {product.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-primary">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}
      {hasMaterials && (
        <AccordionItem value="materials">
          <AccordionTrigger className="text-base font-semibold">Características</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {product.sizes.length > 0 && <li>Tamaño: {product.sizes.join(' / ')}</li>}
              {product.materials.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>Tiempo de producción: {product.productionTime}</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
