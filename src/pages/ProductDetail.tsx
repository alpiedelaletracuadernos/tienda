// src/pages/ProductDetail.tsx
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { getProductBySlug, productoImagenes } from '@/data/products';
import { modeloOptions } from '@/data/options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import {
  ArrowLeft, ShoppingCart, Wand2, Maximize2,
  LayoutGrid, Sparkles, Timer
} from 'lucide-react';
import { ProductSize, InteriorType, CoverType } from '@/types/product';
import AppVars from '@/data/data';
import { buildPdpMessage, buildWaLink } from '@/lib/whatsapp';

import { AgendaModelSelector } from '@/components/products/AgendaModelOption';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import FullscreenModelDialog from '@/components/products/FullscreenModelDialog';
import { safeStorage } from '@/lib/safe-storage';

// ————————————————————————————————————————————————
// Config Promo Escalera (Ladder)
const LADDER = [
  { qty: 1, off: 0.15, label: '15% OFF' },
  { qty: 2, off: 0.20, label: '20% OFF' },
  { qty: 3, off: 0.30, label: '30% OFF' },
] as const;

type LadderTier = typeof LADDER[number];

const LADDER_LABEL = '15% en 1u • 20% en 2u • 30% en 3+u';

// —— Config Black Friday (opcional) ————————————————
const BLACK_FRIDAY_ACTIVE = false;
const BLACK_FRIDAY_END_ISO = '2025-12-02T02:59:59-03:00';

// —— WhatsApp ————————————————————————————————————————
const WHATSAPP_NUMBER = AppVars.phoneNumber;

const PERSONALIZATION_STYLES = [
  { id: 'nombre', label: 'Nombre/Iniciales' },
  { id: 'frase', label: 'Frase/Versículo' },
  { id: 'foto', label: 'Foto/Imagen' },
  { id: 'trama', label: 'Trama/Patrón' },
  { id: 'logo', label: 'Logo/Marca' },
] as const;
type PersonalizationStyleId = typeof PERSONALIZATION_STYLES[number]['id'];
type Mode = 'ready' | 'custom';

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

// Tipado explícito (evita el error de asignación dentro del bucle)
const getLadderTier = (qty: number): LadderTier => {
  let tier: LadderTier = LADDER[0];
  for (const t of LADDER) {
    if (qty >= t.qty) tier = t;
  }
  return tier;
};
const getNextTier = (qty: number): LadderTier | null =>
  LADDER.find(t => t.qty > qty) ?? null;

const ProductDetail = () => {
  const { slug } = useParams();
  const product = getProductBySlug(slug || '');
  const { addItem } = useCart();

  // ——— Estado base PDP
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product?.sizes?.[0] || 'A5');
  const [selectedInterior, setSelectedInterior] = useState<InteriorType>(product?.interiors?.[0] || 'semanal');
  const [selectedCover, setSelectedCover] = useState<CoverType>(product?.coverTypes?.[0] || 'dura');
  const [personalization, setPersonalization] = useState('');
  const [quantity, setQuantity] = useState(1);

  // ——— Modo (modelos listos | personalizar)
  const [mode, setMode] = useState<Mode>('ready');

  // ——— Modelo (unificado por ID)
  const [selectedModelId, setSelectedModelId] = useState<string>(modeloOptions[0]?.id ?? '');
  useEffect(() => {
    try {
      const saved = safeStorage.get<string>('pdp:selectedModelId', null);
      if (saved) setSelectedModelId(saved);
    } catch { /* no-op */ }
  }, []);
  useEffect(() => {
    try {
      safeStorage.set('pdp:selectedModelId', selectedModelId);
    } catch { /* no-op */ }
  }, [selectedModelId]);

  const selectedModelDef = useMemo(
    () => modeloOptions.find(m => m.id === selectedModelId),
    [selectedModelId]
  );
  const selectedModelLabel = selectedModelDef?.modelo ?? 'a confirmar';
  const [fsImage, setFsImage] = useState<string | null>(null);

  // ——— Colecciones
  const collections = useMemo(
    () => Array.from(new Set(modeloOptions.map(m => m.collection ?? 'otras'))),
    []
  );
  const [selectedCollection, setSelectedCollection] = useState<string>(collections[0] ?? 'todas');
  const filteredModels = useMemo(
    () =>
      modeloOptions.filter(m =>
        !selectedCollection || selectedCollection === 'todas' ? true : m.collection === selectedCollection
      ),
    [selectedCollection]
  );
  const todasCollections = useMemo(
    () => modeloOptions.filter(m => m.collection === 'Edicion-2026'),
    []
  );
  const selectedModelImage = selectedModelDef?.image ?? product?.images?.[0] ?? '';

  // ——— Mensajes WA
  const [styleId, setStyleId] = useState<PersonalizationStyleId>('nombre');

  const waReadyMessage2 = useMemo(() => {
    if (!product) return '';
    return buildPdpMessage(
      product,
      { size: selectedSize, interior: selectedInterior, cover: selectedCover, modelLabel: selectedModelLabel, quantity },
      personalization ? { text: personalization } : undefined,
    );
  }, [product, selectedModelLabel, selectedSize, selectedInterior, selectedCover, personalization, quantity]);

  const waPersonalizationMessage2 = useMemo(() => {
    if (!product) return '';
    return buildPdpMessage(
      product,
      { size: selectedSize, interior: selectedInterior, cover: selectedCover, modelLabel: selectedModelLabel, quantity },
      { text: personalization || undefined, styleId },
    );
  }, [product, selectedModelLabel, selectedSize, selectedInterior, selectedCover, personalization, styleId, quantity]);

  const modeSpecificMessage = mode === 'custom' ? waPersonalizationMessage2 : waReadyMessage2;

  // ——— Countdown BF (si se activa)
  const [countdown, setCountdown] = useState<string>('');
  useEffect(() => {
    if (!BLACK_FRIDAY_ACTIVE || !BLACK_FRIDAY_END_ISO) return;
    const end = new Date(BLACK_FRIDAY_END_ISO).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(end - now, 0);
      const dd = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hh = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mm = Math.floor((diff / (1000 * 60)) % 60);
      const ss = Math.floor((diff / 1000) % 60);
      setCountdown(`${dd}d ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  // ——— Precios visuales (PDP) con “mejor descuento” (BF vs Ladder)
  const basePrice = product?.basePrice ?? 0;
  const ladder = getLadderTier(quantity);
  const bfOff = BLACK_FRIDAY_ACTIVE ? 0.15 : 0;
  const appliedOff = Math.max(ladder.off, bfOff);
  const unitAfterOff = Math.round(basePrice * (1 - appliedOff));
  const totalAfterOff = unitAfterOff * quantity;
  const totalBefore = basePrice * quantity;
  const totalSavings = totalBefore - totalAfterOff;

  const formattedDiscounted = formatARS(totalAfterOff);
  const formattedBaseTotal = formatARS(totalBefore);
  const formattedSavings = formatARS(totalSavings);

  // ——— Agregar al carrito (SIEMPRE con precio base; el Cart calcula el descuento)
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      product: {
        id: product.id,
        name: product.name,
        basePrice: product.basePrice, // ← guardamos el base unitario
        images: product.images,
      },
      quantity,
      price: product.basePrice,        // ← idem, base unitario; Cart aplica la escalera
      selectedSize,
      selectedInterior,
      selectedCover,
      personalization: personalization || undefined,
      selectedModel: selectedModelLabel,
    });
    toast.success('¡Producto agregado al carrito!', {
      description: `${product.name} ${personalization ? `- "${personalization}"` : ''}`,
    });
  };

  // ——— Ayuda: “sumá X unidades” para próximo escalón
  const nextTier = getNextTier(quantity);
  const unitsToNext = nextTier ? Math.max(nextTier.qty - quantity, 0) : 0;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Producto no encontrado</h1>
          <Button asChild><Link to="/catalogo">Volver al catálogo</Link></Button>
        </div>
      </div>
    );
  }

  // Scroll suave al bloque “inspirate”
  const handleScrollToInspire = () => {
    const el = document.getElementById('inspirate');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />

      {BLACK_FRIDAY_ACTIVE && (
        <div className="sticky top-16 z-40 bg-black text-white">
          <div className="container px-4 py-2 flex items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Badge className="bg-amber-400 text-black hover:bg-amber-400">-15% Black Friday</Badge>
              Solo por tiempo limitado
            </span>
            {BLACK_FRIDAY_END_ISO && (
              <span className="text-xs sm:text-sm flex items-center gap-1 opacity-90">
                <Timer className="h-4 w-4" />
                Termina en: {countdown}
              </span>
            )}
          </div>
        </div>
      )}

      <main className="py-8 w-full max-w-full">
        <div className="container px-4">
          {/* Breadcrumb */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/catalogo" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al catálogo
            </Link>
          </Button>

          <div className="w-full max-w-full min-w-0 grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Galería */}
            <div className="space-y-4 min-w-0">
              <ProductImageGallery
                images={product?.images ?? []}
                altBase={product?.name ?? 'Producto'}
                onOpenFullscreen={(src) => setFsImage(src)}
              />
            </div>

            {/* Info */}
            <div className="space-y-8 min-w-0">
              {/* Título + stock */}
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold break-words">{product.name}</h1>
                  {product.remainingQuota <= 5 && (
                    <Badge variant="destructive" className="shrink-0">¡Solo {product.remainingQuota} disponibles!</Badge>
                  )}
                </div>

                {/* Precio claro (descuento + tachado + ahorro) */}
                <div className="mt-3 sm:mt-4 space-y-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      {formattedDiscounted}
                    </span>
                    <span className="text-lg line-through text-muted-foreground">
                      {formattedBaseTotal}
                    </span>
                    <Badge variant="outline" className="font-semibold">
                      {Math.round(appliedOff * 100)}% OFF
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Ahorro: {formattedSavings} (aplicado automáticamente).
                  </p>
                </div>

                <p className="text-muted-foreground mt-3 break-words">{product.description}</p>
              </div>

              {/* Escalera de descuentos (chips + progreso) */}
              <div className="space-y-3 rounded-xl border p-3 sm:p-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {LADDER.map(t => {
                    const active = appliedOff === t.off;
                    return (
                      <span
                        key={t.qty}
                        className={[
                          "px-3 py-1.5 rounded-full text-sm font-medium",
                          active ? "bg-amber-400 text-black" : "bg-slate-100 text-slate-700"
                        ].join(" ")}
                        title={`Desde ${t.qty} unidad${t.qty > 1 ? 'es' : ''}`}
                      >
                        {t.qty}{t.qty >= 3 ? '+' : ''} u • {t.label}
                      </span>
                    );
                  })}
                </div>

                {/* Hint para subir de escalón */}
                {nextTier && unitsToNext > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-sm text-slate-600 text-center sm:text-left">
                      Sumá <strong>{unitsToNext}</strong> unidad{unitsToNext > 1 ? 'es' : ''} y pasás a <strong>{Math.round(nextTier.off * 100)}% OFF</strong>.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setQuantity(q => q + 1)}
                      >
                        Agregar 1 y ahorrar más
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(nextTier.qty)}
                        className="hidden sm:inline-flex"
                      >
                        Ir a {nextTier.qty} u
                      </Button>
                    </div>
                  </div>
                )}

                {/* Etiqueta responsive con detalle compacto */}
                <div className="flex items-center justify-center gap-2 text-center">
                  <Badge variant="outline" className="px-3 py-1.5 text-[0.8rem] leading-snug whitespace-normal break-words">
                    {LADDER_LABEL}
                  </Badge>
                </div>
              </div>

              {/* —— Segmented Control —— */}
              <div className="w-full">
                <div
                  className="inline-flex rounded-xl border bg-white p-1 shadow-sm"
                  role="tablist"
                  aria-label="Modo de compra"
                >
                  <button
                    role="tab"
                    aria-selected={mode === 'ready'}
                    onClick={() => setMode('ready')}
                    className={[
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                      mode === 'ready' ? "bg-primary text-primary-foreground shadow" : "text-slate-700 hover:bg-slate-50"
                    ].join(" ")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Modelos listos
                  </button>
                  <button
                    role="tab"
                    aria-selected={mode === 'custom'}
                    onClick={() => setMode('custom')}
                    className={[
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                      mode === 'custom' ? "bg-primary text-primary-foreground shadow" : "text-slate-700 hover:bg-slate-50"
                    ].join(" ")}
                  >
                    <Sparkles className="h-4 w-4" />
                    Personalizar
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ¿Querés nombre, foto o frase? Tocá <strong>Personalizar</strong>. Si preferís un diseño ya listo, quedate en <strong>Modelos listos</strong>.
                </p>
              </div>

              {/* ——— Vista: Modelos listos ——— */}
              {mode === 'ready' && (
                <div className="space-y-6 border-y py-6 w-full max-w-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Modelo de Agenda</Label>
                      <Button variant="link" className="px-0 text-xs" onClick={() => setMode('custom')}>
                        ¿Querés personalizar? Ver opciones →
                      </Button>
                    </div>

                    {/* Filtros colección */}
                    <div className="flex flex-wrap gap-2">
                      {['todas', ...collections].map((col) => {
                        const isActive = selectedCollection === col;
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setSelectedCollection(col)}
                            className={[
                              "px-3 py-1.5 rounded-full text-sm transition-colors",
                              isActive ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                            ].join(" ")}
                          >
                            {col === 'todas' ? 'Todas' : col.charAt(0).toUpperCase() + col.slice(1)}
                          </button>
                        );
                      })}
                    </div>

                    <AgendaModelSelector
                      options={filteredModels}
                      value={selectedModelId}
                      onChange={setSelectedModelId}
                    />
                  </div>

                  <FullscreenModelDialog
                    src={fsImage || selectedModelImage}
                    alt={product.name}
                    openModel={selectedModelId}
                    trigger={
                      <Button variant="outline" className="w-full">
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Ver modelo en pantalla completa
                      </Button>
                    }
                  />

                  {/* Tamaño / Interior / Tapa / Cantidad */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tamaño</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <Button key={size} variant={selectedSize === size ? 'default' : 'outline'} onClick={() => setSelectedSize(size)}>
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Interior</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.interiors.map((interior) => (
                          <Button
                            key={interior}
                            variant={selectedInterior === interior ? 'default' : 'outline'}
                            onClick={() => setSelectedInterior(interior)}
                            className="capitalize"
                          >
                            {interior}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de Tapa</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.coverTypes.map((cover) => (
                          <Button
                            key={cover}
                            variant={selectedCover === cover ? 'default' : 'outline'}
                            onClick={() => setSelectedCover(cover)}
                            className="capitalize"
                          >
                            Tapa {cover}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max="10"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-24"
                        />
                        {nextTier && (
                          <Button variant="secondary" size="sm" onClick={() => setQuantity(q => Math.max(q, nextTier.qty))}>
                            Ir a {nextTier.qty} u ({Math.round(nextTier.off * 100)}% OFF)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CTAs modo ready */}
                  <div className="space-y-3">
                    <Button size="lg" className="w-full" onClick={handleAddToCart}>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Agregar al Carrito
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href={buildWaLink(WHATSAPP_NUMBER, waReadyMessage2)} target="_blank" rel="noopener noreferrer">
                        Consultar por WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* ——— Vista: Personalizar ——— */}
              {mode === 'custom' && (
                <div className="space-y-6 border-y py-6 w-full max-w-full">
                  <div className="space-y-4 rounded-2xl border p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Personalizá tu agenda</h3>
                      </div>
                      <Button variant="link" className="px-0 text-xs" onClick={() => setMode('ready')}>
                        Ver modelos listos →
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Portada o interior: <strong>foto</strong>, <strong>frase</strong>, <strong>nombre</strong> o <strong>trama</strong>. Lo definimos por WhatsApp con <em>boceto previo</em>.
                    </p>

                    {/* Estilos */}
                    <div role="radiogroup" aria-label="Estilos de personalización" className="flex flex-wrap gap-2">
                      {PERSONALIZATION_STYLES.map((s) => {
                        const selected = styleId === s.id;
                        return (
                          <button
                            key={s.id}
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setStyleId(s.id)}
                            className={[
                              "px-3 py-1.5 rounded-full text-sm transition-colors",
                              "ring-1 ring-slate-300/60",
                              selected ? "bg-primary text-primary-foreground ring-primary" : "bg-white hover:bg-slate-50"
                            ].join(" ")}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Texto opcional */}
                    <div className="space-y-2">
                      <Label htmlFor="personalization">Texto (opcional)</Label>
                      <Input
                        id="personalization"
                        placeholder='Ej.: "María" o "¡Vamos por más!"'
                        value={personalization}
                        onChange={(e) => setPersonalization(e.target.value)}
                        maxLength={40}
                      />
                      <p className="text-xs text-muted-foreground">
                        Si elegís “Foto/Logo”, te pediremos el archivo por WhatsApp.
                      </p>
                    </div>

                    {/* CTA principal custom */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Button asChild className="w-full">
                        <a href={buildWaLink(WHATSAPP_NUMBER, waPersonalizationMessage2)} target="_blank" rel="noopener noreferrer">
                          Definir personalización por WhatsApp
                        </a>
                      </Button>
                      {/* Botón corregido: hace scroll confiable al bloque "inspirate" */}
                      <Button variant="outline" className="w-full" onClick={handleScrollToInspire}>
                        Ver ideas e inspiración
                      </Button>
                    </div>

                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Boceto incluido (1 revisión). Producción: 8–10 h. Entrega rápida 24–48 h (con recargo).</li>
                      <li>• Para fotos: luz natural y al menos ~1500 px del lado más corto.</li>
                    </ul>
                  </div>

                  {/* Base para custom */}
                  <div className="space-y-3">
                    <Label>Elegí una base para personalizar</Label>
                    <AgendaModelSelector options={todasCollections} value={selectedModelId} onChange={setSelectedModelId} />
                    <FullscreenModelDialog
                      src={fsImage || selectedModelImage}
                      alt={product.name}
                      openModel={selectedModelId}
                      trigger={
                        <Button variant="outline" className="w-full">
                          <Maximize2 className="w-4 h-4 mr-2" />
                          Ver base en pantalla completa
                        </Button>
                      }
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tamaño</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <Button key={size} variant={selectedSize === size ? 'default' : 'outline'} onClick={() => setSelectedSize(size)}>
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Interior</Label>
                      <div className="space-y-2">
                      <Label>Interior</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.interiors.map((interior) => (
                          <Button
                            key={interior}
                            variant={selectedInterior === interior ? 'default' : 'outline'}
                            onClick={() => setSelectedInterior(interior)}
                            className="capitalize"
                          >
                            {interior}
                          </Button>
                        ))}
                      </div>
                    </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tapa</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.coverTypes.map((cover) => (
                          <Button
                            key={cover}
                            variant={selectedCover === cover ? 'default' : 'outline'}
                            onClick={() => setSelectedCover(cover)}
                            className="capitalize"
                          >
                            Tapa {cover}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA secundaria */}
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full">
                      <a href={buildWaLink(WHATSAPP_NUMBER, waPersonalizationMessage2)} target="_blank" rel="noopener noreferrer">
                        Enviar detalles por WhatsApp
                      </a>
                    </Button>
                    <Button className="w-full" onClick={() => setMode('ready')}>
                      Ver modelos listos
                    </Button>
                  </div>
                </div>
              )}

              {/* Inspirate */}
              <div id="inspirate" className="space-y-3 w-full max-w-full scroll-mt-24">
                <h3 className="font-semibold">Inspirate</h3>
                <div
                  className="
                    w-full max-w-full
                    flex flex-nowrap gap-3
                    overflow-x-auto overflow-y-hidden
                    snap-x snap-mandatory scroll-smooth
                    px-2 py-1
                    [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent]
                    [&::-webkit-scrollbar]:h-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-slate-400/60
                    hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/70
                    [&::-webkit-scrollbar-thumb]:rounded-full
                  "
                  aria-label="Ejemplos de personalización"
                >
                  {productoImagenes["personalizados"].map((src, i) => (
                    <div
                      key={i}
                      className="snap-center flex-none w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden ring-1 ring-slate-200 bg-white"
                    >
                      <img src={src} alt={`Ejemplo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  ¿Tenés una foto o idea? Enviámela por WhatsApp y armamos el boceto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Botón flotante con mensaje acorde al modo activo */}
      <WhatsAppButton message={modeSpecificMessage} variant="floating" />
    </div>
  );
};

export default ProductDetail;
