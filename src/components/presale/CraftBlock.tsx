// src/components/presale/CraftBlock.tsx
// "Por qué preventa": el oficio explica la fecha. Una fecha con motivo se
// respeta más que una fecha sola.
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/data/products';
import { thumbOf } from '@/lib/media';
import { presale, presaleDeadlineText } from '@/config/presale';

export function CraftBlock() {
  const image = getProductBySlug(presale.slug)?.images[12];
  return (
    <section className="py-12 md:py-20 bg-soft/30">
      <div className="container px-4 grid gap-8 md:grid-cols-2 md:items-center">
        {image && (
          <img
            src={image}
            srcSet={`${thumbOf(image)} 400w, ${image} 1200w`}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt="Kit Mi Año 2027 sobre un escritorio"
            width={800}
            height={1200}
            loading="lazy"
            decoding="async"
            className="w-full max-h-[28rem] rounded-2xl object-cover"
          />
        )}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Por qué es una preventa</h2>
          <p className="text-lg text-muted-foreground">
            Cada agenda la armamos a mano, una por una, acá en San Nicolás. La preventa nos deja
            saber cuántas hacer y hacerlas bien, sin apuro. Por eso tiene fecha.
          </p>
          <p className="font-medium">{presaleDeadlineText()}.</p>
          <Button asChild size="lg">
            <Link to={`/producto/${presale.slug}`}>{presale.ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
