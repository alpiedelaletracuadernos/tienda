// src/pages/Shop.tsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { products } from '@/data/products';
import AppVars from '@/data/data';
import { buildShopMessage, type PersonalizationStyleId } from '@/lib/whatsapp';
import { useCart } from '@/hooks/use-cart';
import HotSaleBanner from '@/components/promos/HotSaleBanner';

import { ProductCategory, ProductSize, InteriorType } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROMO_2X1_LABEL = '2X1 en agendas con diseños en stock, por tiempo limitado'; // usado en varios lados

// ———————————————————————————————————————————————————————————————
// Etiquetas legibles. Son `Record` exhaustivos sobre los tipos declarados en
// `types/product.ts`: si se agrega una categoría o un interior nuevo al tipo,
// TypeScript obliga a agregarle acá una etiqueta, así los filtros del
// catálogo nunca quedan con un valor sin traducir.
const CATEGORY_LABELS: Record<ProductCategory, string> = {
  agendas: 'Agendas',
  'agendas docentes': 'Agendas Docentes',
  cuadernos: 'Cuadernos',
  recetarios: 'Recetarios',
  libretas: 'Libretas',
  especiales: 'Especiales',
  planners: 'Planners',
};

const INTERIOR_LABELS: Record<InteriorType, string> = {
  semanal: 'Semanal',
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

/** Chip de filtro con área táctil ≥44px (Baymard: controles visibles > desplegables). */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-[44px] inline-flex items-center px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors ring-1',
        active
          ? 'bg-primary text-primary-foreground ring-primary'
          : 'bg-background text-foreground ring-border hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

const Shop = () => {
  const [searchParams] = useSearchParams();

  // Filtros catálogo
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<ProductSize | 'all'>('all');
  const [selectedInterior, setSelectedInterior] = useState<InteriorType | 'all'>('all');
  const [interiorSheetOpen, setInteriorSheetOpen] = useState(false);

  // Datos del comprador (para el mensaje final)
  const [buyerName, setBuyerName] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'retiro' | 'envio'>('retiro');
  const [deliveryAddress, setDeliveryAddress] = useState(''); // solo si envio
  const [buyerNotes, setBuyerNotes] = useState('');

  // (Opcional visual) estilo preferido
  const [styleId] = useState<PersonalizationStyleId>('nombre');

  // Carrito
  const { items, getTotalPrice } = useCart();

  // Opciones de filtro derivadas del catálogo real (no hardcodeadas): así no
  // pueden desincronizarse cuando se agregue o saque un producto. Se ordenan
  // por la etiqueta legible (localeCompare en es) para que la lista quede en
  // orden alfabético "humano" y no en el orden crudo del valor interno.
  const categoryOptions = useMemo(() => {
    const set = new Set<ProductCategory>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set).sort((a, b) =>
      CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b], 'es')
    );
  }, []);

  const sizeOptions = useMemo(() => {
    const set = new Set<ProductSize>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, []);

  const interiorOptions = useMemo(() => {
    const set = new Set<InteriorType>();
    products.forEach((p) => p.interiors.forEach((i) => set.add(i)));
    return Array.from(set).sort((a, b) =>
      INTERIOR_LABELS[a].localeCompare(INTERIOR_LABELS[b], 'es')
    );
  }, []);

  // Leer query params y setear filtros iniciales / cuando cambie la URL.
  // Se valida contra las opciones derivadas del catálogo (arriba), no contra
  // listas hardcodeadas: un ?interior=... con un valor real del catálogo ya
  // no se ignora.
  useEffect(() => {
    const catParam = searchParams.get('cat'); // ej: agendas
    const sizeParam = searchParams.get('size'); // ej: A5
    const interiorParam = searchParams.get('interior'); // ej: semanal

    if (catParam && categoryOptions.includes(catParam as ProductCategory)) {
      setSelectedCategory(catParam as ProductCategory);
    }
    if (sizeParam && sizeOptions.includes(sizeParam as ProductSize)) {
      setSelectedSize(sizeParam as ProductSize);
    }
    if (interiorParam && interiorOptions.includes(interiorParam as InteriorType)) {
      setSelectedInterior(interiorParam as InteriorType);
    }
  }, [searchParams, categoryOptions, sizeOptions, interiorOptions]);

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const sizeMatch = selectedSize === 'all' || product.sizes.includes(selectedSize as ProductSize);
    const interiorMatch =
      selectedInterior === 'all' || product.interiors.includes(selectedInterior as InteriorType);
    return categoryMatch && sizeMatch && interiorMatch;
  });

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedSize !== 'all' || selectedInterior !== 'all';

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedInterior('all');
  };

  // Pills de filtros activos, mostradas sobre la grilla (Baymard: el usuario
  // necesita ver el resumen de filtros activos mientras navega).
  const activeFilterPills = [
    selectedCategory !== 'all' && {
      key: 'category',
      label: CATEGORY_LABELS[selectedCategory],
      onRemove: () => setSelectedCategory('all'),
    },
    selectedSize !== 'all' && {
      key: 'size',
      label: selectedSize,
      onRemove: () => setSelectedSize('all'),
    },
    selectedInterior !== 'all' && {
      key: 'interior',
      label: INTERIOR_LABELS[selectedInterior],
      onRemove: () => setSelectedInterior('all'),
    },
  ].filter((f): f is { key: string; label: string; onRemove: () => void } => !!f);

  // Construcción del mensaje de WhatsApp (centralizado)
  const whatsappMessage = useMemo(() => {
    const filters = {
      category: selectedCategory,
      size: selectedSize,
      interior: selectedInterior,
    } as const;
    const personalization = {
      styleId,
      buyerName,
      buyerCity,
      deliveryMethod,
      deliveryAddress,
      buyerNotes,
    } as const;
    return buildShopMessage(filters, personalization);
  }, [
    selectedCategory,
    selectedSize,
    selectedInterior,
    styleId,
    buyerName,
    buyerCity,
    deliveryMethod,
    deliveryAddress,
    buyerNotes,
  ]);

  const waNumber = AppVars.phoneNumber; // ej.: 549336XXXXXXX

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />
      <HotSaleBanner />

      {AppVars.promotions.discount.enabled && (
        <>
          {/* Descuentos */}
          <div className="sticky top-16 z-40 bg-black text-white">
            <div className="container px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-black hover:bg-amber-400">PROMO</Badge>
                <span className="text-sm sm:text-base font-semibold">Descuento del {AppVars.promotions.discount.percentage}% en diseños seleccionados</span>
              </div>
            </div>
          </div>
        </>
      )}
      {AppVars.promotions.twoForOne.enabled && (
        <>
          {/* Barra informativa sticky: 2X1 */}
          <div className="sticky top-16 z-40 bg-black text-white">
            <div className="container px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-black hover:bg-amber-400">PROMO</Badge>
                <span className="text-sm sm:text-base font-semibold">{PROMO_2X1_LABEL}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <main>
        {/* Hero Section (catálogo) */}
        <section className="bg-soft/30 py-16">
          <div className="container px-4">
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold break-words">Nuestro Catálogo</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explorá nuestra colección completa de agendas y cuadernos artesanales
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-xs sm:text-sm whitespace-normal break-words leading-snug"
                >
                  ✨ 15 cupos disponibles esta semana
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b bg-background lg:sticky top-16 z-30">
          <div className="container px-4 w-full max-w-full space-y-4">
            {/* Categoría: chips siempre visibles, "Todas" primero */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Categoría
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>
                  Todas
                </FilterChip>
                {categoryOptions.map((cat) => (
                  <FilterChip
                    key={cat}
                    active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </FilterChip>
                ))}
              </div>
            </div>

            {/* Tamaño: chips */}
            {sizeOptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Tamaño
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={selectedSize === 'all'} onClick={() => setSelectedSize('all')}>
                    Todos
                  </FilterChip>
                  {sizeOptions.map((size) => (
                    <FilterChip
                      key={size}
                      active={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </FilterChip>
                  ))}
                </div>
              </div>
            )}

            {/* Interior: son ~25 valores con textos largos (ej. "Docente nivel
                secundario/universitario"). Un chip por opción no entra en
                390px, así que en vez de un <Select> (que esconde todo el set
                hasta tocarlo) usamos un botón que abre un Sheet inferior con
                la lista completa como opciones grandes y tocables. */}
            {interiorOptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Interior
                </p>
                <Sheet open={interiorSheetOpen} onOpenChange={setInteriorSheetOpen}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInteriorSheetOpen(true)}
                    className="min-h-[44px] w-full sm:w-auto justify-between gap-2"
                  >
                    {selectedInterior === 'all' ? 'Interior' : INTERIOR_LABELS[selectedInterior]}
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                  <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Elegí el interior</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
                      <SheetClose asChild>
                        <button
                          type="button"
                          onClick={() => setSelectedInterior('all')}
                          aria-pressed={selectedInterior === 'all'}
                          className={cn(
                            'min-h-[44px] w-full text-left px-4 rounded-lg text-sm font-medium transition-colors ring-1',
                            selectedInterior === 'all'
                              ? 'bg-primary text-primary-foreground ring-primary'
                              : 'bg-background text-foreground ring-border hover:bg-muted'
                          )}
                        >
                          Todos los interiores
                        </button>
                      </SheetClose>
                      {interiorOptions.map((interior) => (
                        <SheetClose asChild key={interior}>
                          <button
                            type="button"
                            onClick={() => setSelectedInterior(interior)}
                            aria-pressed={selectedInterior === interior}
                            className={cn(
                              'min-h-[44px] w-full text-left px-4 rounded-lg text-sm font-medium transition-colors ring-1',
                              selectedInterior === interior
                                ? 'bg-primary text-primary-foreground ring-primary'
                                : 'bg-background text-foreground ring-border hover:bg-muted'
                            )}
                          >
                            {INTERIOR_LABELS[interior]}
                          </button>
                        </SheetClose>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}

            {/* Filtros activos: pills removibles + limpiar todo */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilterPills.map((f) => (
                  <Badge
                    key={f.key}
                    variant="secondary"
                    className="pl-3 pr-1 py-1 flex items-center gap-1"
                  >
                    {f.label}
                    <button
                      type="button"
                      onClick={f.onRemove}
                      aria-label={`Quitar filtro ${f.label}`}
                      className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
        </section>
        {/* Products Grid */}
        <section className="py-12">
          <div className="container px-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  No se encontraron productos con los filtros seleccionados
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Botón flotante: FINALIZAR COMPRA */}
      <WhatsAppButton variant="floating" message={whatsappMessage} />
    </div>
  );
};

export default Shop;
