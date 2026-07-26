// src/components/products/DesignPicker.tsx
//
// Fase 2c: reemplaza al carrusel horizontal de diseños (AgendaModelOption /
// AgendaModelSelector) por una grilla + sheet. Motivo (ver research citada
// en el pedido): la gente pasa de largo los carruseles, y recortar el set de
// opciones sin dejar ver el total hace pensar al usuario que no hay más.
//
// Decisión del dueño de la tienda: la colección actual (Edicion-2026) es la
// preseleccionada y la única visible sin abrir nada; las anteriores siguen
// disponibles pero con menos peso visual, alcanzables desde el sheet.
import { useCallback, useMemo, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { DesignOption } from '@/types/product';

// El tipo vive en @/types/product (los datos no dependen de la UI).
export type { DesignOption };

// Orden de recencia pedido por el dueño de la tienda. No es alfabético ni el
// orden crudo del array de datos: Edicion-2026 (actual) > Edicion-2025 >
// capsula-Arg > Edicion-2024.
const COLLECTION_ORDER = ['Edicion-2026', 'Edicion-2025', 'capsula-Arg', 'Edicion-2024'] as const;
const CURRENT_COLLECTION: string = COLLECTION_ORDER[0];
const COLLAPSED_COUNT = 6;

const COLLECTION_LABELS: Record<string, string> = {
  'Edicion-2026': 'Edición 2026',
  'Edicion-2025': 'Edición 2025',
  'capsula-Arg': 'Cápsula Arg',
  'Edicion-2024': 'Edición 2024',
};

const collectionLabel = (collection: string) => COLLECTION_LABELS[collection] ?? collection;

const sortByRecency = (collections: string[]) =>
  [...collections].sort((a, b) => {
    const ia = COLLECTION_ORDER.indexOf(a as (typeof COLLECTION_ORDER)[number]);
    const ib = COLLECTION_ORDER.indexOf(b as (typeof COLLECTION_ORDER)[number]);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

// ——— Miniatura individual ——————————————————————————————
// Conserva de AgendaModelOption.tsx: aria-label legible, y la lupa (h-7 w-7,
// esquina inferior derecha, after:-inset-2 para ~44px táctiles) que amplía
// SIN tocar la selección.
type DesignThumbProps = {
  option: DesignOption;
  checked: boolean;
  tabIndex: number;
  onSelect: (id: string) => void;
  onExpand: (id: string) => void;
  registerRef: (el: HTMLButtonElement | null) => void;
};

function DesignThumb({ option, checked, tabIndex, onSelect, onExpand, registerRef }: DesignThumbProps) {
  return (
    <div className="relative">
      <button
        ref={registerRef}
        type="button"
        role="radio"
        aria-checked={checked}
        aria-label={`Diseño ${option.modelo}`}
        onClick={() => onSelect(option.id)}
        tabIndex={tabIndex}
        className={cn(
          'group relative block w-full overflow-hidden rounded-xl aspect-[3/4]',
          'bg-white ring-1 ring-slate-300/60',
          checked
            ? 'ring-4 ring-primary ring-offset-2'
            : 'hover:ring-2 hover:ring-slate-400/60',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'
        )}
      >
        <img
          src={option.image}
          alt={`Modelo ${option.modelo}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExpand(option.id);
        }}
        aria-label={`Ver diseño ${option.modelo} en pantalla completa`}
        className={cn(
          'absolute bottom-1.5 right-1.5 z-10 h-7 w-7 rounded-full',
          'bg-black/40 text-white backdrop-blur-sm flex items-center justify-center',
          'hover:bg-black/60',
          // Amplía el área clickeable a ~44px sin agrandar el círculo visible.
          "after:absolute after:-inset-2 after:content-['']",
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1'
        )}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ——— Grilla reutilizable (grilla colapsada + grilla del sheet) ———————
// `onCommit` es opcional y sólo se dispara por click/activación (no por
// navegación con flechas): en el sheet cierra; en la grilla colapsada no se
// pasa, así que no hace nada.
type DesignGridProps = {
  label: string;
  options: DesignOption[];
  value?: string | null;
  onChange: (id: string) => void;
  onCommit?: (id: string) => void;
  onExpand: (id: string) => void;
  columnsClassName?: string;
};

function DesignGrid({
  label,
  options,
  value,
  onChange,
  onCommit,
  onExpand,
  columnsClassName,
}: DesignGridProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      onCommit?.(id);
    },
    [onChange, onCommit]
  );

  // Navegación con flechas (ARIA radios). El findIndex compara contra `id`,
  // el mismo campo que se guarda como valor (evita el desfasaje que tenía
  // AgendaModelSelector). No dispara onCommit: mover el foco con flechas no
  // debe cerrar el sheet.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (options.length === 0) return;
      const currentIndex = options.findIndex((o) => o.id === value);
      const focusAt = (idx: number) => refs.current[idx]?.focus();

      if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const next = (currentIndex + 1 + options.length) % options.length;
        onChange(options[next].id);
        focusAt(next);
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        const prev = (currentIndex - 1 + options.length) % options.length;
        onChange(options[prev].id);
        focusAt(prev);
      }
    },
    [options, value, onChange]
  );

  if (options.length === 0) return null;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('grid grid-cols-3 gap-2 sm:gap-3', columnsClassName)}
    >
      {options.map((opt, idx) => {
        const checked = opt.id === value;
        return (
          <DesignThumb
            key={opt.id}
            option={opt}
            checked={checked}
            tabIndex={checked || (!value && idx === 0) ? 0 : -1}
            onSelect={handleSelect}
            onExpand={onExpand}
            registerRef={(el) => (refs.current[idx] = el)}
          />
        );
      })}
    </div>
  );
}

// ——— Componente principal ——————————————————————————————
type Props = {
  options: DesignOption[];
  value: string;
  onChange: (id: string) => void;
  onExpand: (id: string) => void;
  className?: string;
};

export function DesignPicker({ options, value, onChange, onExpand, className }: Props) {
  const [open, setOpen] = useState(false);
  // Gatea el montaje de la grilla de 65 imágenes: recién se monta la primera
  // vez que el sheet se abre, y sigue montada después (para no perder el
  // contenido durante la animación de cierre).
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [sheetCollection, setSheetCollection] = useState<string>(CURRENT_COLLECTION);

  const selectedOption = useMemo(() => options.find((o) => o.id === value), [options, value]);

  const currentCollectionOptions = useMemo(
    () => options.filter((o) => o.collection === CURRENT_COLLECTION),
    [options]
  );

  // El diseño elegido siempre tiene que estar visible en la grilla colapsada
  // (viene del sheet o de localStorage): si no está entre las primeras 6,
  // va primero y se completan 5 más.
  const collapsedOptions = useMemo(() => {
    const base = currentCollectionOptions.slice(0, COLLAPSED_COUNT);
    if (!selectedOption || base.some((o) => o.id === selectedOption.id)) {
      return base;
    }
    const rest = base.filter((o) => o.id !== selectedOption.id).slice(0, COLLAPSED_COUNT - 1);
    return [selectedOption, ...rest];
  }, [currentCollectionOptions, selectedOption]);

  const collectionsPresent = useMemo(
    () => sortByRecency(Array.from(new Set(options.map((o) => o.collection)))),
    [options]
  );

  const countByCollection = useMemo(() => {
    const map = new Map<string, number>();
    options.forEach((o) => map.set(o.collection, (map.get(o.collection) ?? 0) + 1));
    return map;
  }, [options]);

  const sheetOptions = useMemo(
    () => (sheetCollection === 'todas' ? options : options.filter((o) => o.collection === sheetCollection)),
    [options, sheetCollection]
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) {
        setHasOpenedOnce(true);
        // El sheet abre mostrando la colección del diseño actualmente
        // elegido, no siempre la 2026.
        setSheetCollection(selectedOption?.collection ?? CURRENT_COLLECTION);
      }
    },
    [selectedOption]
  );

  // Tocar un diseño en el sheet: se selecciona y el sheet se cierra (es la
  // acción que el usuario vino a hacer). La lupa sigue ampliando sin cerrar.
  const handleSheetCommit = useCallback(() => setOpen(false), []);

  return (
    <div className={cn('space-y-3', className)}>
      <DesignGrid
        label="Diseño de tapa"
        options={collapsedOptions}
        value={value}
        onChange={onChange}
        onExpand={onExpand}
      />

      <p className="text-xs text-muted-foreground">
        {selectedOption ? `Diseño ${selectedOption.modelo} elegido` : 'Elegí un diseño'}
      </p>

      <Button type="button" variant="outline" className="w-full" onClick={() => handleOpenChange(true)}>
        Ver los {options.length} diseños
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[90svh] flex flex-col gap-0 p-0">
          <SheetHeader className="sticky top-0 z-10 shrink-0 space-y-3 border-b bg-background px-4 pb-3 pt-4 text-left">
            <SheetTitle>Elegí tu diseño</SheetTitle>
            <div className="flex flex-wrap gap-2">
              {collectionsPresent.map((col) => {
                const isCurrent = col === CURRENT_COLLECTION;
                const isActive = sheetCollection === col;
                return (
                  <Button
                    key={col}
                    type="button"
                    size="sm"
                    variant={isActive ? (isCurrent ? 'default' : 'secondary') : 'outline'}
                    className={cn(
                      'h-auto rounded-full',
                      isCurrent ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs text-muted-foreground'
                    )}
                    onClick={() => setSheetCollection(col)}
                  >
                    {collectionLabel(col)} · {countByCollection.get(col) ?? 0}
                  </Button>
                );
              })}
              <Button
                type="button"
                size="sm"
                variant={sheetCollection === 'todas' ? 'secondary' : 'outline'}
                className="h-auto rounded-full px-2.5 py-1 text-xs text-muted-foreground"
                onClick={() => setSheetCollection('todas')}
              >
                Todas · {options.length}
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {hasOpenedOnce && (
              <DesignGrid
                label="Todos los diseños"
                options={sheetOptions}
                value={value}
                onChange={onChange}
                onCommit={handleSheetCommit}
                onExpand={onExpand}
                columnsClassName="grid-cols-3 sm:grid-cols-4"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default DesignPicker;
