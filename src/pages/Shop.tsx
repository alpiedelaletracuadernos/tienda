// src/pages/Shop.tsx
import { useState, useMemo } from 'react';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// ———————————————————————————————————————————————————————————————
// (Opcional) mismo set de estilos de personalización para contexto visual
const PERSONALIZATION_STYLES = [
  { id: 'nombre', label: 'Nombre/Iniciales' },
  { id: 'frase', label: 'Frase/Versículo' },
  { id: 'foto', label: 'Foto/Imagen' },
  { id: 'trama', label: 'Trama/Patrón' },
  { id: 'logo', label: 'Logo/Marca' },
] as const;
type PersonalizationStyleId = typeof PERSONALIZATION_STYLES[number]['id'];
// ———————————————————————————————————————————————————————————————

const Shop = () => {
  // Filtros catálogo (como estaban)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<ProductSize | 'all'>('all');
  const [selectedInterior, setSelectedInterior] = useState<InteriorType | 'all'>('all');

  // Datos del comprador (para el mensaje final)
  const [buyerName, setBuyerName] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'retiro' | 'envio'>('retiro');
  const [deliveryAddress, setDeliveryAddress] = useState(''); // solo si envio
  const [buyerNotes, setBuyerNotes] = useState('');

  // (Opcional visual) estilo preferido para guiar la charla (no pisa lo del carrito)
  const [styleId, setStyleId] = useState<PersonalizationStyleId>('nombre');

  // Carrito: trae los items agregados desde ProductDetail (incluye personalization y selectedModel)
  const { items, getTotalPrice } = useCart();

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const sizeMatch = selectedSize === 'all' || product.sizes.includes(selectedSize as ProductSize);
    const interiorMatch = selectedInterior === 'all' || product.interiors.includes(selectedInterior as InteriorType);
    return categoryMatch && sizeMatch && interiorMatch;
  });

  // Construcción del mensaje de WhatsApp (centralizado)
  const whatsappMessage = useMemo(() => {
    const filters = { category: selectedCategory, size: selectedSize, interior: selectedInterior } as const;
    const personalization = { styleId, buyerName, buyerCity, deliveryMethod, deliveryAddress, buyerNotes } as const;
    return buildShopMessage(filters, personalization);
  }, [selectedCategory, selectedSize, selectedInterior, styleId, buyerName, buyerCity, deliveryMethod, deliveryAddress, buyerNotes]);

  const waNumber = AppVars.phoneNumber; // ej.: 549336XXXXXXX

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-soft/30 py-16">
          <div className="container px-4">
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold break-words">Nuestro Catálogo</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explorá nuestra colección completa de agendas y cuadernos artesanales
              </p>
              <Badge variant="outline" className="px-4 py-2 text-sm">
                ✨ 15 cupos disponibles esta semana
              </Badge>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b bg-background lg:sticky top-16 z-40 ">
          <div className="container px-4 w-full max-w-full">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-full">
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ProductCategory | 'all')}>
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

              <Select value={selectedSize} onValueChange={(v) => setSelectedSize(v as ProductSize | 'all')}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tamaños</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedInterior} onValueChange={(v) => setSelectedInterior(v as InteriorType | 'all')}>
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

            

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container px-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
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

      {/* Botón flotante: FINALIZAR COMPRA (usa carrito + datos comprador) */}
      <WhatsAppButton
        variant="floating"
        message={whatsappMessage}
        // Si tu WhatsAppButton permite número destino, podrías pasar phoneNumber={AppVars.phoneNumber}
        // En caso contrario, tu botón ya debería construir con ese número internamente.
      />
    </div>
  );
};

export default Shop;
