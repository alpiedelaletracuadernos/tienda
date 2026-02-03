// src/pages/Shop.tsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { products } from '@/data/products';
import AppVars from '@/data/data';
import { buildShopMessage } from '@/lib/whatsapp';
import { useCart } from '@/hooks/use-cart';

import { ProductCategory, ProductSize, InteriorType } from '@/types/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Sparkles, ShoppingCart } from 'lucide-react';
import { DESCUENTOS, PROMO_2X1 } from '@/config/promotions';

// ———————————————————————————————————————————————————————————————
// Escalera de descuentos (comunicación en catálogo)
// 1u: -15%  |  2u: -20%  |  3u+: -30%
const DISCOUNT_LADDER = [
  { qty: 1, off: 15 },
  { qty: 2, off: 20 },
  { qty: 3, off: 30 },
] as const;

const LADDER_LABEL = '1u -15% · 2u -20% · 3u -30%';
const PROMO_2X1_LABEL = '2X1 en agendas con diseños en stock, por tiempo limitado'; // usado en varios lados

// (Opcional) mismo set de estilos de personalización para contexto visual
const PERSONALIZATION_STYLES = [
  { id: 'nombre', label: 'Nombre/Iniciales' },
  { id: 'frase', label: 'Frase/Versículo' },
  { id: 'foto', label: 'Foto/Imagen' },
  { id: 'trama', label: 'Trama/Patrón' },
  { id: 'logo', label: 'Logo/Marca' },
] as const;
type PersonalizationStyleId = (typeof PERSONALIZATION_STYLES)[number]['id'];
// ———————————————————————————————————————————————————————————————

const Shop = () => {
  const [searchParams] = useSearchParams();

  // Filtros catálogo
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<ProductSize | 'all'>('all');
  const [selectedInterior, setSelectedInterior] = useState<InteriorType | 'all'>('all');

  // Datos del comprador (para el mensaje final)
  const [buyerName, setBuyerName] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'retiro' | 'envio'>('retiro');
  const [deliveryAddress, setDeliveryAddress] = useState(''); // solo si envio
  const [buyerNotes, setBuyerNotes] = useState('');

  // (Opcional visual) estilo preferido
  const [styleId, setStyleId] = useState<PersonalizationStyleId>('nombre');

  // Carrito
  const { items, getTotalPrice } = useCart();

  // Leer query params y setear filtros iniciales / cuando cambie la URL
  useEffect(() => {
    const catParam = searchParams.get('cat'); // ej: agendas
    const sizeParam = searchParams.get('size'); // ej: A5
    const interiorParam = searchParams.get('interior'); // ej: semanal

    // Categoría
    if (catParam) {
      const validCategories: ProductCategory[] = [
        'agendas',
        'agendas docentes',
        'especiales',
        'cuadernos',
        'libretas',
      ];
      if (validCategories.includes(catParam as ProductCategory)) {
        setSelectedCategory(catParam as ProductCategory);
      }
    }

    // Tamaño
    if (sizeParam) {
      const validSizes: ProductSize[] = ['A5', 'A4'];
      if (validSizes.includes(sizeParam as ProductSize)) {
        setSelectedSize(sizeParam as ProductSize);
      }
    }

    // Interior
    if (interiorParam) {
      const validInteriors: InteriorType[] = [
        'semanal',
        'dos-por-hoja',
        'universitaria',
        'docente',
        'perpetua',
        'rayado',
        'liso',
        'cuadriculado',
      ];
      if (validInteriors.includes(interiorParam as InteriorType)) {
        setSelectedInterior(interiorParam as InteriorType);
      }
    }
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const sizeMatch = selectedSize === 'all' || product.sizes.includes(selectedSize as ProductSize);
    const interiorMatch =
      selectedInterior === 'all' || product.interiors.includes(selectedInterior as InteriorType);
    return categoryMatch && sizeMatch && interiorMatch;
  });

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

  // ——— Helpers de UI ———
  const ladderList = useMemo(
    () =>
      DISCOUNT_LADDER.map((t) => `${t.qty} ${t.qty === 1 ? 'unidad' : 'unidades'} — ${t.off}% OFF`),
    []
  );

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />

      {DESCUENTOS.enabled && (
        <>
          {/* Descuentos */}
          <div className="sticky top-16 z-40 bg-black text-white">
            <div className="container px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-black hover:bg-amber-400">PROMO</Badge>
                <span className="text-sm sm:text-base font-semibold">{DESCUENTOS.label}</span>
              </div>
            </div>
          </div>
        </>
      )}
      {PROMO_2X1.enabled && (
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

      {/* Barra informativa sticky: escalera de descuentos */}
      {/* <div className="sticky top-16 z-40 bg-black text-white">
        <div className="container px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-400 text-black hover:bg-amber-400">Escalera de Descuentos</Badge>
            <span className="text-sm sm:text-base font-semibold">{LADDER_LABEL}</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-white/90">
                <Info className="h-4 w-4 mr-1" />
                ¿Cómo funciona?
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cómo funciona la escalera</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p>El descuento se aplica automáticamente según la cantidad total de unidades en tu carrito:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {ladderList.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
                <p className="text-muted-foreground">
                  Tip: combiná modelos/colores para llegar a 2 o 3 unidades y obtener más descuento.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div> */}

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
                {/* Escalera de descuentos */}
                {/* <Badge
                  className="bg-amber-400 text-black hover:bg-amber-400 px-3 py-1.5 text-xs sm:text-sm whitespace-normal break-words leading-snug max-w-full sm:max-w-[480px]"
                >
                  <span className="[text-wrap:balance]">{LADDER_LABEL}</span>
                </Badge> */}
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b bg-background lg:sticky top-16 z-30">
          <div className="container px-4 w-full max-w-full">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-full">
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v as ProductCategory | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="agendas">Agendas</SelectItem>
                  <SelectItem value="agendas docentes">Agendas Docentes</SelectItem>
                  <SelectItem value="especiales">Especiales</SelectItem>
                  <SelectItem value="cuadernos">Cuadernos</SelectItem>
                  <SelectItem value="libretas">Libretas</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedSize}
                onValueChange={(v) => setSelectedSize(v as ProductSize | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tamaños</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedInterior}
                onValueChange={(v) => setSelectedInterior(v as InteriorType | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Interior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los interiores</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="dos-por-hoja">2 días por hoja</SelectItem>
                  <SelectItem value="universitaria">Universitaria</SelectItem>
                  <SelectItem value="docente">Docente</SelectItem>
                  <SelectItem value="perpetua">Perpetua</SelectItem>
                  <SelectItem value="rayado">Rayado</SelectItem>
                  <SelectItem value="liso">Liso</SelectItem>
                  <SelectItem value="cuadriculado">Cuadriculado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex flex-col md:flex-row items-center justify-between ">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
              {/* Escalera de descuentos */}
              {/* <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {LADDER_LABEL} — ver detalles
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Descuentos por cantidad</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 text-sm">
                    <ul className="list-disc pl-5 space-y-1">
                      {DISCOUNT_LADDER.map((t, i) => (
                        <li key={i}>{t.qty} {t.qty === 1 ? 'unidad' : 'unidades'} — {t.off}% OFF</li>
                      ))}
                    </ul>
                    <p className="text-muted-foreground">
                      Se calcula automáticamente al avanzar con la compra. Aplica a toda la tienda.
                    </p>
                  </div>
                </DialogContent>
              </Dialog> */}
            </div>
          </div>
        </section>
        {/* Products Grid + Card educativa inserta */}
        <section className="py-12">
          <div className="container px-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, idx) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    {/* Badge pequeño en esquina (refuerzo visual sin invadir) */}
                    {product.name.includes('Agenda') || product.name.includes('Agenda Docente') ? (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-400 text-black text-[11px] font-semibold px-2 py-0.5 shadow">
                        Promo 40% OFF
                      </span>
                    ) : null}
                    {/* Badge pequeño en esquina (refuerzo visual sin invadir) */}
                    {/* <span className="absolute left-2 top-2 rounded-full bg-amber-400 text-black text-[11px] font-semibold px-2 py-0.5 shadow">
                      hasta -30%
                    </span> */}
                    {/* Insertar una card educativa a mitad de la primera “pantalla” */}
                    {
                      (idx === 1 && filteredProducts.length > 2) || // mobile 2col
                        (idx === 3 && filteredProducts.length > 4) // desktop 4col
                    }
                  </div>
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
