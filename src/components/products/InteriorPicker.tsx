// src/components/products/InteriorPicker.tsx
//
// Elegir el interior con foto en lugar de botones de texto. La diferencia se
// ve en la tarjeta (la página que cambia: la semana o el día) y el detalle
// queda a pedido en "Ver por dentro": una hoja con pestañas para comparar los
// interiores sin salir de la ficha, fotos etiquetadas con zoom y un botón para
// elegir desde ahí. Las fotos de la hoja se descargan recién al abrirla.
//
// Con 2 opciones se muestran como tarjetas lado a lado; con más (Kit: dos
// semanales + diaria) como filas, que en mobile se leen mejor.
import { useCallback, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import FullscreenModelDialog from '@/components/products/FullscreenModelDialog';
import { INTERIOR_INFO, interiorLabel } from '@/data/interiors';
import { formatARS } from '@/lib/currency';
import { thumbOf } from '@/lib/media';
import { cn } from '@/lib/utils';
import type { InteriorType } from '@/types/product';

type Props = {
  options: InteriorType[];
  value?: InteriorType;
  onChange: (v: InteriorType) => void;
  /** Precio por opción (Kit); sin esto no se muestra precio en las tarjetas. */
  priceFor?: (v: InteriorType) => number;
};

export function InteriorPicker({ options, value, onChange, priceFor }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<InteriorType | undefined>(value);
  const rows = options.length > 2;

  const openViewer = (interior?: InteriorType) => {
    setTab(interior ?? value ?? options[0]);
    setOpen(true);
  };

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="Interior de la agenda"
        className={cn(rows ? 'space-y-2' : 'grid grid-cols-2 gap-3')}
      >
        {options.map((opt) => {
          const info = INTERIOR_INFO[opt];
          const checked = opt === value;
          const cover = info?.photos[0];
          const cardSrc = info?.card ?? (cover ? thumbOf(cover.src) : undefined);
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(opt)}
              className={cn(
                'relative w-full overflow-hidden rounded-2xl border bg-card text-left transition-shadow',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                checked ? 'border-primary ring-2 ring-primary' : 'hover:border-muted-foreground/40',
                rows && 'flex items-center gap-3 p-2'
              )}
            >
              {cardSrc && (
                <img
                  src={cardSrc}
                  alt={`${interiorLabel(opt)}: detalle de la vista semanal`}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    'object-cover bg-muted',
                    rows ? 'h-20 w-20 shrink-0 rounded-xl' : 'aspect-[4/3] w-full'
                  )}
                />
              )}
              <div className={cn('min-w-0', rows ? 'flex-1 pr-8' : 'p-3 space-y-1')}>
                <p className="font-semibold leading-tight">{interiorLabel(opt)}</p>
                {info?.short && (
                  <p className="text-xs text-muted-foreground leading-snug">{info.short}</p>
                )}
                {priceFor && (
                  <p className="text-sm font-semibold text-primary">{formatARS(priceFor(opt))}</p>
                )}
              </div>
              <span
                aria-hidden
                className={cn(
                  'absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full border-2',
                  checked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/40 bg-background'
                )}
              >
                {checked && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          );
        })}
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={() => openViewer()}>
        <Eye className="mr-2 h-4 w-4" />
        Ver por dentro
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[90svh] flex flex-col gap-0 p-0">
          <SheetHeader className="shrink-0 space-y-3 border-b px-4 pb-3 pt-4 text-left">
            <SheetTitle>Así es por dentro</SheetTitle>
            <div role="tablist" aria-label="Interiores" className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  role="tab"
                  aria-selected={tab === opt}
                  size="sm"
                  variant={tab === opt ? 'default' : 'outline'}
                  className="h-auto rounded-full px-3 py-1.5"
                  onClick={() => setTab(opt)}
                >
                  {interiorLabel(opt)}
                </Button>
              ))}
            </div>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
            {tab && <InteriorViewer key={tab} interior={tab} />}
          </div>

          {tab && (
            <div className="shrink-0 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => {
                  onChange(tab);
                  setOpen(false);
                }}
              >
                {tab === value ? 'Seguir con' : 'Elegir'} {interiorLabel(tab).toLowerCase()}
                {priceFor && ` · ${formatARS(priceFor(tab))}`}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Carrusel de fotos de un interior: deslizar, flechas, contador y zoom. */
function InteriorViewer({ interior }: { interior: InteriorType }) {
  const info = INTERIOR_INFO[interior];
  const photos = info?.photos ?? [];
  const [index, setIndex] = useState(0);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }, []);

  const onScroll = () => {
    const el = trackRef.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  if (!photos.length) return null;
  const current = photos[Math.min(index, photos.length - 1)];

  return (
    <div className="space-y-3">
      {info?.short && <p className="text-sm text-muted-foreground">{info.short}</p>}

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setZoomSrc(p.src)}
              aria-label={`Ampliar: ${p.label}`}
              className="w-full shrink-0 snap-center"
            >
              <img
                src={p.src}
                srcSet={`${thumbOf(p.src)} 400w, ${p.src} 1200w`}
                sizes="(min-width: 768px) 600px, 100vw"
                alt={`${interiorLabel(interior)}: ${p.label.toLowerCase()}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="mx-auto max-h-[52svh] w-full object-contain"
              />
            </button>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(Math.max(0, index - 1))}
              disabled={index === 0}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/90 shadow disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(Math.min(photos.length - 1, index + 1))}
              disabled={index === photos.length - 1}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/90 shadow disabled:opacity-0"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <p className="flex items-center justify-between text-sm" aria-live="polite">
        <span className="font-medium">{current.label}</span>
        <span className="text-muted-foreground">
          {index + 1} de {photos.length} · tocá para ampliar
        </span>
      </p>

      {/* Miniaturas con etiqueta: saltar directo a la página que interesa */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-soft">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={p.label}
            className={cn(
              'w-20 shrink-0 space-y-1 text-left',
              i === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            )}
          >
            <img
              src={thumbOf(p.src)}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                'h-16 w-20 rounded-lg object-cover',
                i === index && 'ring-2 ring-primary'
              )}
            />
            <span className="block text-[11px] leading-tight text-muted-foreground line-clamp-2">
              {p.label}
            </span>
          </button>
        ))}
      </div>

      <FullscreenModelDialog
        src={zoomSrc ?? current.src}
        alt={current.label}
        open={!!zoomSrc}
        onOpenChange={(o) => !o && setZoomSrc(null)}
      />
    </div>
  );
}
