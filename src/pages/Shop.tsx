// src/pages/Shop.tsx
//
// Catálogo. Prioridades (ver plan-catalogo-ui-ux.md):
//  · Productos primero: encabezado compacto y una sola barra de filtros fija
//    y finita (chips de categoría deslizables + botón "Filtros").
//  · Un solo patrón de filtro: lo que más se usa (categoría) a la vista; el
//    resto (disponibilidad, tamaño, interior, orden) en un panel inferior con
//    el conteo de resultados antes de aplicar.
//  · El estado vive en la URL (?cat=&size=&interior=&disp=1&orden=): se puede
//    compartir, el botón "atrás" lo respeta y al volver de una ficha el
//    catálogo regresa a la misma posición.
import { useLayoutEffect, useMemo, useState } from 'react';
import { useNavigationType, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { PromoBar } from '@/components/promos/PromoBar';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import HotSaleBanner from '@/components/promos/HotSaleBanner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { isPurchasable } from '@/lib/availability';
import { isPresaleProduct } from '@/config/presale';
import { interiorFamily } from '@/data/interiors';
import { COLLECTIONS, inCollection } from '@/data/collections';
import { products } from '@/data/products';
import AppVars from '@/data/data';
import { buildShopMessage } from '@/lib/whatsapp';
import { calculateProductPricing } from '@/lib/pricing/calc-product-pricing';
import { safeStorage } from '@/lib/safe-storage';
import { cn } from '@/lib/utils';
import type { InteriorType, Product, ProductSize } from '@/types/product';

const PROMO_2X1_LABEL = '2X1 en agendas con diseños en stock, por tiempo limitado'; // usado en varios lados

// Etiquetas legibles. `Record` exhaustivo sobre InteriorType: si se agrega un
// interior al tipo, TypeScript obliga a ponerle etiqueta acá.
const INTERIOR_LABELS: Record<InteriorType, string> = {
  semanal: 'Semanal',
  'semanal sin horarios': 'Semanal sin horarios',
  'semanal con horarios': 'Semanal con horarios',
  diaria: 'Diaria',
  'dos-por-hoja': '2 días por hoja',
  universitaria: 'Universitaria',
  docente: 'Docente',
  perpetua: 'Perpetua',
  rayado: 'Rayado',
  liso: 'Liso',
  cuadriculado: 'Cuadriculado',
  recetas: 'Recetas',
  'Docente nivel inicial': 'Docente · Inicial',
  'Docente nivel primario': 'Docente · Primario',
  'Docente nivel secundario/universitario': 'Docente · Secundario/Universitario',
  'Cuaderno con planner': 'Con planner',
  'Cuaderno hojas rayadas': 'Hojas rayadas',
  'Cuaderno hojas cuadriculadas': 'Hojas cuadriculadas',
  'Cuaderno hojas lisas': 'Hojas lisas',
  'Cuaderno hojas puntilladas': 'Hojas puntilladas',
  'Cuaderno emprendedor': 'Emprendedor',
  '2 pedidos por hoja': '2 pedidos por hoja',
  '3 pedidos por hoja': '3 pedidos por hoja',
  '6 pedidos por hoja': '6 pedidos por hoja',
  'Cuaderno docente inicial perpetuo': 'Docente inicial perpetuo',
  'Cuaderno docente primaria perpetuo': 'Docente primaria perpetuo',
  'Cuaderno docente secundaria perpetuo': 'Docente secundaria perpetuo',
  'Planner semanal perpetuo con horarios': 'Semanal perpetuo con horarios',
};

type SortId = 'destacados' | 'precio-asc' | 'precio-desc';
const SORTS: { id: SortId; label: string }[] = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'precio-asc', label: 'Menor precio' },
  { id: 'precio-desc', label: 'Mayor precio' },
];

type Filters = {
  cat: string;
  size: ProductSize | 'all';
  interior: InteriorType | 'all';
  onlyAvailable: boolean;
  sort: SortId;
};

const SCROLL_KEY = 'catalogo:scroll';

const priceOf = (p: Product) => calculateProductPricing({ product: p }).finalUnit;

function applyFilters(list: Product[], f: Filters): Product[] {
  const out = list.filter(
    (p) =>
      (f.cat === 'all' || inCollection(f.cat, p)) &&
      (f.size === 'all' || p.sizes.includes(f.size)) &&
      (f.interior === 'all' || p.interiors.some((i) => interiorFamily(i) === f.interior)) &&
      (!f.onlyAvailable || isPurchasable(p))
  );
  if (f.sort === 'destacados') return out; // orden de catálogo (catalog-order.ts)
  // Por precio: primero lo que se puede comprar; "Próximamente" al final.
  const dir = f.sort === 'precio-asc' ? 1 : -1;
  return [...out].sort(
    (a, b) =>
      Number(isPurchasable(b)) - Number(isPurchasable(a)) || dir * (priceOf(a) - priceOf(b))
  );
}

/** Chip de filtro con área táctil ≥44px. */
function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-[40px] inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap ring-1 transition-colors',
        active
          ? 'bg-primary text-primary-foreground ring-primary'
          : 'bg-background text-foreground ring-border hover:bg-muted',
        className
      )}
    >
      {children}
    </button>
  );
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();

  // ——— Opciones derivadas del catálogo real ———
  const collections = useMemo(
    () =>
      COLLECTIONS.map((c) => {
        const items = products.filter((p) => inCollection(c.id, p));
        return { ...c, count: items.length, available: items.some(isPurchasable) };
      })
        .filter((c) => c.count > 0)
        // Las categorías sin nada para comprar van al final de la fila.
        .sort((a, b) => Number(b.available) - Number(a.available)),
    []
  );
  const sizeOptions = useMemo(() => {
    const set = new Set<ProductSize>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, []);
  const interiorOptions = useMemo(() => {
    const set = new Set<InteriorType>();
    products.forEach((p) => p.interiors.forEach((i) => set.add(interiorFamily(i))));
    return Array.from(set).sort((a, b) =>
      INTERIOR_LABELS[a].localeCompare(INTERIOR_LABELS[b], 'es')
    );
  }, []);

  // ——— Estado = URL (valores inválidos se ignoran) ———
  const filters: Filters = useMemo(() => {
    const cat = searchParams.get('cat') ?? 'all';
    const size = searchParams.get('size') as ProductSize | null;
    const interior = searchParams.get('interior') as InteriorType | null;
    const sort = searchParams.get('orden') as SortId | null;
    return {
      cat: collections.some((c) => c.id === cat) ? cat : 'all',
      size: size && sizeOptions.includes(size) ? size : 'all',
      interior: interior && interiorOptions.includes(interior) ? interior : 'all',
      onlyAvailable: searchParams.get('disp') === '1',
      sort: sort && SORTS.some((s) => s.id === sort) ? sort : 'destacados',
    };
  }, [searchParams, collections, sizeOptions, interiorOptions]);

  const setFilters = (next: Partial<Filters>) => {
    const f = { ...filters, ...next };
    const params = new URLSearchParams();
    if (f.cat !== 'all') params.set('cat', f.cat);
    if (f.size !== 'all') params.set('size', f.size);
    if (f.interior !== 'all') params.set('interior', f.interior);
    if (f.onlyAvailable) params.set('disp', '1');
    if (f.sort !== 'destacados') params.set('orden', f.sort);
    setSearchParams(params, { replace: true });
  };

  const results = useMemo(() => applyFilters(products, filters), [filters]);

  // ——— Volver a la misma posición al regresar de una ficha ———
  // Se guarda al tocar un producto (no en cada scroll: al salir de la página
  // el reseteo de scroll de la navegación pisaría el valor).
  const rememberScroll = () => safeStorage.set(SCROLL_KEY, window.scrollY);
  useLayoutEffect(() => {
    if (navigationType !== 'POP') return;
    const y = safeStorage.get<number>(SCROLL_KEY, 0) ?? 0;
    if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
    // Sólo al montar: después el scroll es del usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ——— Panel "Filtros": se edita un borrador y se aplica con el botón ———
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const openSheet = () => {
    setDraft(filters);
    setSheetOpen(true);
  };
  const draftCount = useMemo(() => applyFilters(products, draft).length, [draft]);
  const panelFilterCount =
    Number(filters.onlyAvailable) +
    Number(filters.size !== 'all') +
    Number(filters.interior !== 'all');

  const activePills = [
    filters.onlyAvailable && {
      key: 'disp',
      label: 'Solo disponibles',
      onRemove: () => setFilters({ onlyAvailable: false }),
    },
    filters.size !== 'all' && {
      key: 'size',
      label: `Tamaño ${filters.size}`,
      onRemove: () => setFilters({ size: 'all' }),
    },
    filters.interior !== 'all' && {
      key: 'interior',
      label: INTERIOR_LABELS[filters.interior],
      onRemove: () => setFilters({ interior: 'all' }),
    },
    filters.sort !== 'destacados' && {
      key: 'orden',
      label: SORTS.find((s) => s.id === filters.sort)!.label,
      onRemove: () => setFilters({ sort: 'destacados' }),
    },
  ].filter((f): f is { key: string; label: string; onRemove: () => void } => !!f);

  const clearAll = () =>
    setFilters({ cat: 'all', size: 'all', interior: 'all', onlyAvailable: false, sort: 'destacados' });

  const categoryLabel = collections.find((c) => c.id === filters.cat)?.label;
  const whatsappMessage = useMemo(
    () =>
      buildShopMessage(
        {
          category: categoryLabel ?? 'all',
          size: filters.size,
          interior: filters.interior === 'all' ? 'all' : filters.interior,
        },
        {}
      ),
    [categoryLabel, filters.size, filters.interior]
  );

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />
      <HotSaleBanner />

      {(AppVars.promotions.discount.enabled || AppVars.promotions.twoForOne.enabled) && (
        <div className="sticky top-16 z-40">
          {AppVars.promotions.discount.enabled && (
            <PromoBar badge="PROMO">
              Descuento del {AppVars.promotions.discount.percentage}% en diseños seleccionados
            </PromoBar>
          )}
          {AppVars.promotions.twoForOne.enabled && (
            <PromoBar badge="PROMO">{PROMO_2X1_LABEL}</PromoBar>
          )}
        </div>
      )}

      <main>
        {/* Encabezado compacto: productos primero */}
        <section className="container px-4 pt-6 pb-3 md:pt-10 md:pb-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">
                {categoryLabel ?? 'Catálogo 2027'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Hecho a mano en San Nicolás · Envíos a todo el país
              </p>
            </div>
            <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
              {results.length} {results.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </section>

        {/* Barra fija: categorías + Filtros (y Ordenar en escritorio) */}
        <div className="sticky top-16 z-30 border-y bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container px-4 flex items-center gap-2 py-2">
            <Button
              type="button"
              variant="outline"
              onClick={openSheet}
              className="h-10 shrink-0 rounded-full px-3"
              aria-label={`Filtros${panelFilterCount ? ` (${panelFilterCount} activos)` : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">Filtros</span>
              {panelFilterCount > 0 && (
                <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {panelFilterCount}
                </span>
              )}
            </Button>

            <div
              role="group"
              aria-label="Categorías"
              className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <FilterChip active={filters.cat === 'all'} onClick={() => setFilters({ cat: 'all' })}>
                Todo
              </FilterChip>
              {collections.map((c) => (
                <FilterChip
                  key={c.id}
                  active={filters.cat === c.id}
                  onClick={() => setFilters({ cat: c.id })}
                  className={cn(!c.available && filters.cat !== c.id && 'text-muted-foreground')}
                >
                  {c.label}
                  <span className="text-xs opacity-70">{c.count}</span>
                </FilterChip>
              ))}
            </div>

            <label className="hidden md:flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
              Ordenar
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ sort: e.target.value as SortId })}
                className="h-10 rounded-full border bg-background px-3 text-sm text-foreground"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Filtros activos del panel (la categoría ya se ve en los chips) */}
        {activePills.length > 0 && (
          <div className="container px-4 pt-3 flex flex-wrap items-center gap-2">
            {activePills.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.onRemove}
                aria-label={`Quitar filtro ${f.label}`}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-full bg-secondary/15 px-3 text-sm text-foreground ring-1 ring-secondary/30 hover:bg-secondary/25"
              >
                {f.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {/* Grilla: 2 columnas en mobile; el kit en preventa a todo el ancho */}
        <section className="container px-4 py-4 md:py-8" onClickCapture={rememberScroll}>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  featured={isPresaleProduct(product.slug) && isPurchasable(product)}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-4">
              <p className="text-lg font-medium">No hay productos con estos filtros</p>
              <p className="text-sm text-muted-foreground">
                Probá quitar alguno o mirá todo el catálogo.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {activePills.map((f) => (
                  <Button key={f.key} variant="outline" size="sm" onClick={f.onRemove}>
                    Sin «{f.label}»
                  </Button>
                ))}
                <Button size="sm" onClick={clearAll}>
                  Ver todo
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Panel de filtros */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85svh] flex flex-col gap-0 p-0">
          <SheetHeader className="border-b px-4 py-4 text-left">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="only-available" className="text-base">
                Solo disponibles
                <span className="block text-xs font-normal text-muted-foreground">
                  Oculta los productos «Próximamente»
                </span>
              </Label>
              <Switch
                id="only-available"
                checked={draft.onlyAvailable}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, onlyAvailable: v }))}
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold mb-2">Ordenar por</legend>
              <div className="flex flex-wrap gap-2">
                {SORTS.map((s) => (
                  <FilterChip
                    key={s.id}
                    active={draft.sort === s.id}
                    onClick={() => setDraft((d) => ({ ...d, sort: s.id }))}
                  >
                    {s.label}
                  </FilterChip>
                ))}
              </div>
            </fieldset>

            {sizeOptions.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold mb-2">Tamaño</legend>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={draft.size === 'all'}
                    onClick={() => setDraft((d) => ({ ...d, size: 'all' }))}
                  >
                    Todos
                  </FilterChip>
                  {sizeOptions.map((s) => (
                    <FilterChip
                      key={s}
                      active={draft.size === s}
                      onClick={() => setDraft((d) => ({ ...d, size: s }))}
                    >
                      {s}
                    </FilterChip>
                  ))}
                </div>
              </fieldset>
            )}

            {interiorOptions.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold mb-2">Interior</legend>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    active={draft.interior === 'all'}
                    onClick={() => setDraft((d) => ({ ...d, interior: 'all' }))}
                  >
                    Todos
                  </FilterChip>
                  {interiorOptions.map((i) => (
                    <FilterChip
                      key={i}
                      active={draft.interior === i}
                      onClick={() => setDraft((d) => ({ ...d, interior: i }))}
                    >
                      {INTERIOR_LABELS[i]}
                    </FilterChip>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <SheetFooter className="flex-row gap-2 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  size: 'all',
                  interior: 'all',
                  onlyAvailable: false,
                  sort: 'destacados',
                }))
              }
            >
              Limpiar
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={draftCount === 0}
              onClick={() => {
                setFilters(draft);
                setSheetOpen(false);
              }}
            >
              {draftCount === 0
                ? 'Sin resultados'
                : `Ver ${draftCount} ${draftCount === 1 ? 'producto' : 'productos'}`}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Footer />
      <WhatsAppButton variant="floating" message={whatsappMessage} />
    </div>
  );
};

export default Shop;
