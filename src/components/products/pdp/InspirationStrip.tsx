// src/components/products/pdp/InspirationStrip.tsx
// Carrusel "Inspirate" con ejemplos de personalizaciones hechas.
import { thumbOf } from '@/lib/media';

export function InspirationStrip({ images }: { images: string[] }) {
  return (
    <div id="inspirate" className="space-y-3 w-full max-w-full scroll-mt-24">
      <h3 className="font-semibold">Inspirate</h3>
      <div
        className="w-full max-w-full flex flex-nowrap gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth px-2 py-1 scrollbar-soft"
        aria-label="Ejemplos de personalización"
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="snap-center flex-none w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden ring-1 ring-border bg-background"
          >
            <img
              src={thumbOf(src)}
              alt={`Ejemplo ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        ¿Tenés una foto o idea? Enviámela por WhatsApp y armamos el boceto.
      </p>
    </div>
  );
}
