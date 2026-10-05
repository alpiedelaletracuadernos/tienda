// src/pages/ProductDetail.tsx
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { getProductBySlug } from '@/data/products';
import { modeloOptions } from '@/data/options';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Product, ProductSize, InteriorType, CoverType, ProductColor } from '@/types/product';
import AppVars from '@/data/data';
import { buildPdpMessage, buildWaLink, type PersonalizationStyleId } from '@/lib/whatsapp';

import { DesignPicker } from '@/components/products/DesignPicker';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import FullscreenModelDialog from '@/components/products/FullscreenModelDialog';
import { VariantSelector } from '@/components/products/VariantSelector';
import { ColorSwatchSelector } from '@/components/products/ColorSwatchSelector';
import { StepSection } from '@/components/products/StepSection';
import { StickyBuyBar } from '@/components/products/StickyBuyBar';
import { ProductSpecs } from '@/components/products/ProductSpecs';
import { ProductComingSoon } from '@/components/products/ProductComingSoon';
import { isPurchasable } from '@/lib/availability';
import { ShareButton } from '@/components/products/ShareButton';
import { PromoBar } from '@/components/promos/PromoBar';
import { KitPriceBox } from '@/components/presale/KitPriceBox';
import { KitValueBreakdown } from '@/components/presale/KitValueBreakdown';
import { KitFaq } from '@/components/presale/KitFaq';
import { PresaleCompareBox } from '@/components/presale/PresaleCompareBox';
import { kitPricingFor, listPriceFor } from '@/lib/pricing/kit';
import { presale } from '@/config/presale';
import { PersonalizationStep } from '@/components/products/pdp/PersonalizationStep';
import { QuantityStepper } from '@/components/products/pdp/QuantityStepper';
import { safeStorage } from '@/lib/safe-storage';

//PROMOCIONES
import { isHotSaleActive, formatHotSaleDateRange } from '@/config/promotions';
import { calculateProductPricing } from '@/lib/pricing/calc-product-pricing';
import { formatARS } from '@/lib/currency';
import { personalizationSurchargeFor } from '@/lib/pricing/personalization';

// —— WhatsApp ————————————————————————————————————————
const WHATSAPP_NUMBER = AppVars.phoneNumber;

const MODEL_CATEGORIES = new Set(['agendas', 'agendas docentes', 'cuadernos']);

const normalizeCategory = (c?: string) => (c ?? '').trim().toLowerCase();

// ——— Componente exterior: SIN hooks más allá de useParams. ———————————
// Motivo (B1): garantiza que el guard de "producto no encontrado" pueda
// ejecutarse antes de cualquier cálculo derivado de `product`, sin violar
// las reglas de hooks (que exigen que nunca haya un return condicional
// antes de un hook). Todos los hooks viven en ProductDetailContent, que
// solo se monta cuando `product` ya está garantizado no-nulo.
const ProductDetail = () => {
  const { slug } = useParams();
  const product = getProductBySlug(slug ?? '');

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Producto no encontrado</h1>
          <Button asChild>
            <Link to="/catalogo">Volver al catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isPurchasable(product)) {
    return <ProductComingSoon key={product.slug} product={product} />;
  }

  // `key` por slug: sin esto React reusa la misma instancia al navegar de un
  // producto a otro sin recargar, y el estado del PDP (diseño elegido, toggle
  // de personalización, cantidad) se arrastra al producto siguiente.
  return <ProductDetailContent key={product.slug} product={product} />;
};

const ProductDetailContent = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  // El producto puede forzarlo con `coverDesigns`; si no, decide la categoría.
  const hasModels =
    product.coverDesigns ?? MODEL_CATEGORIES.has(normalizeCategory(product.category));
  // Decisión del dueño de la tienda: los productos con `colors` definido
  // (hoy el Box premium regalo) no usan los diseños de tapa del catálogo de
  // agendas; se eligen por color. Es una decisión por datos, no por categoría.
  const usesColors = !!product.colors?.length;
  // El diseño de tapa sólo viaja al pedido si su selector estuvo a la vista.
  const usesModels = hasModels && !usesColors;

  // ——— Estado base PDP
  // B2: sin fallbacks inventados — si el producto no tiene tamaños/interiores/
  // tapas (arrays vacíos), el estado queda undefined y esos bloques no se
  // renderizan ni se envían al pedido.
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(product.sizes[0]);
  const [selectedInterior, setSelectedInterior] = useState<InteriorType | undefined>(
    product.interiors[0]
  );
  const [selectedCover, setSelectedCover] = useState<CoverType | undefined>(product.coverTypes[0]);
  const [personalization, setPersonalization] = useState('');
  const [quantity, setQuantity] = useState(1);
  const PROMO_2X1_LABEL_DETAIL = 'Consultá diseños en stock por WhatsApp'; // usado en varios lados

  // ——— Personalización (paso ③): flujo único, un solo camino de JSX.
  // Reemplaza al viejo estado `mode` ('ready' | 'custom'); ya no hay dos
  // ramas de render que puedan divergir ni quedar "pisadas" al navegar
  // entre productos sin recargar.
  const [isCustom, setIsCustom] = useState(false);

  // Qué se elige en el paso ①, decidido por datos:
  //  · con `colors`  → círculos de color (hoy: Box premium regalo)
  //  · con modelos   → grilla de diseños de tapa (agendas, agendas docentes, cuadernos)
  //  · ninguno       → no hay paso ① (las libretas no tienen selector de tapa;
  //                    sus diseños se ven en la galería)
  const showDesignStep = usesColors || hasModels;

  const hasRealChoices = [product.sizes, product.interiors, product.coverTypes].some(
    (a) => a.length >= 2
  );

  // Kit (preventa): primero se elige la agenda (cambia el precio), después
  // el diseño; no hay paso de configuración ni de personalización.
  const isKit = !!product.kitItems?.length;
  const showPersonalization = product.personalizable !== false;

  // Numeración corrida: los pasos que no se muestran no dejan un hueco.
  let stepCounter = 0;
  const versionStepNumber = isKit ? ++stepCounter : 0;
  const designStepNumber = showDesignStep ? ++stepCounter : 0;
  const configStepNumber = !isKit && hasRealChoices ? ++stepCounter : 0;
  const personalizationStepNumber = showPersonalization ? ++stepCounter : 0;

  // ——— Modelo (unificado por ID)
  // B9: la clave de persistencia se namespacea por producto (`pdp:selectedModelId:${slug}`)
  // para que el diseño elegido en un producto no se filtre a otro.
  const modelStorageKey = `pdp:selectedModelId:${product.slug}`;
  const [selectedModelId, setSelectedModelId] = useState<string>(modeloOptions[0]?.id ?? '');
  const [previewModelImage, setPreviewModelImage] = useState<string | null>(null);
  const [fsModelOpen, setFsModelOpen] = useState(false);

  // ——— Color (Box premium y futuros productos que se eligen por color)
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product.colors?.[0]);

  useEffect(() => {
    try {
      const saved = safeStorage.get<string>(modelStorageKey, null);
      if (!saved) return;
      // B9: sólo restauramos si el id sigue existiendo en las opciones vigentes;
      // si es un dato viejo de una colección retirada, lo ignoramos.
      // La colección a mostrar la resuelve DesignPicker (regla de "el
      // seleccionado siempre visible" en la grilla colapsada, y el sheet abre
      // en la colección del diseño elegido).
      const match = modeloOptions.find((m) => m.id === saved);
      if (match) {
        setSelectedModelId(saved);
      }
    } catch {
      /* no-op */
    }
  }, [modelStorageKey]);
  useEffect(() => {
    try {
      safeStorage.set(modelStorageKey, selectedModelId);
    } catch {
      /* no-op */
    }
  }, [modelStorageKey, selectedModelId]);

  const selectedModelDef = useMemo(
    () => modeloOptions.find((m) => m.id === selectedModelId),
    [selectedModelId]
  );
  const selectedModelLabel = selectedModelDef?.modelo ?? 'a confirmar';

  const selectedModelImage = selectedModelDef?.image ?? product.images?.[0] ?? '';

  // B6: la galería principal debe reflejar el diseño elegido. Si el producto
  // tiene modelos, la imagen del modelo seleccionado va primero; el resto de
  // las imágenes del producto siguen después, sin duplicar.
  const galleryImages = useMemo(() => {
    if (!hasModels || !selectedModelImage) return product.images ?? [];
    const rest = (product.images ?? []).filter((src) => src !== selectedModelImage);
    // En el kit la primera foto es el kit completo; la tapa elegida va segunda.
    if (isKit && rest.length) return [rest[0], selectedModelImage, ...rest.slice(1)];
    return [selectedModelImage, ...rest];
  }, [hasModels, isKit, selectedModelImage, product.images]);

  // B5: la lupa de una miniatura abre ESE diseño en pantalla completa,
  // no necesariamente el seleccionado.
  const openModelPreview = useCallback((id: string) => {
    const found = modeloOptions.find((m) => m.id === id);
    setPreviewModelImage(found?.image ?? null);
    setFsModelOpen(true);
  }, []);

  // ——— Mensajes WA
  const [styleId, setStyleId] = useState<PersonalizationStyleId>('nombre');

  const waReadyMessage2 = useMemo(() => {
    return buildPdpMessage(
      product,
      {
        size: selectedSize,
        interior: selectedInterior,
        cover: selectedCover,
        modelLabel: usesModels ? selectedModelLabel : undefined,
        color: usesColors ? selectedColor?.name : undefined,
        quantity,
      },
      personalization ? { text: personalization } : undefined
    );
  }, [
    product,
    usesModels,
    usesColors,
    selectedModelLabel,
    selectedColor,
    selectedSize,
    selectedInterior,
    selectedCover,
    personalization,
    quantity,
  ]);

  const waPersonalizationMessage2 = useMemo(() => {
    return buildPdpMessage(
      product,
      {
        size: selectedSize,
        interior: selectedInterior,
        cover: selectedCover,
        modelLabel: usesModels ? selectedModelLabel : undefined,
        color: usesColors ? selectedColor?.name : undefined,
        quantity,
      },
      { text: personalization || undefined, styleId }
    );
  }, [
    product,
    usesModels,
    usesColors,
    selectedModelLabel,
    selectedColor,
    selectedSize,
    selectedInterior,
    selectedCover,
    personalization,
    styleId,
    quantity,
  ]);

  const modeSpecificMessage = isCustom ? waPersonalizationMessage2 : waReadyMessage2;

  // ——— Precios ————————————————————————————————————————
  // Única fuente: calculateProductPricing delega en el motor del carrito
  // (calc-cart-pricing), así que lo que se muestra acá es exactamente lo
  // que va a cobrar el carrito para esta misma cantidad/personalización.
  const hotSaleActive = isHotSaleActive();

  const pricing = useMemo(
    () => calculateProductPricing({ product, interior: selectedInterior, quantity, isCustom }),
    [product, selectedInterior, quantity, isCustom]
  );
  const kit = useMemo(() => kitPricingFor(product, selectedInterior), [product, selectedInterior]);

  const formattedListUnit = formatARS(pricing.listUnit);
  const formattedFinalUnit = formatARS(pricing.finalUnit);
  const formattedFinalTotal = formatARS(pricing.finalTotal);

  // ——— Agregar al carrito (SIN DESCUENTOS) ——————————————
  // ✅ CHANGE: al carrito se guarda SIEMPRE precio de lista.
  // Motivo: evita que el precio quede “cocinado” si cambia la promo.
  // El carrito decide si aplica descuento según categoría.
  const handleAddToCart = () => {
    addItem({
      product: {
        id: product.id,
        name: product.name,
        basePrice: pricing.listUnit, // ✅ guardamos con el recargo ya sumado si aplica
        images: product.images,
        category: product.category, // ✅ importante: el carrito necesita la categoría para decidir
      },
      quantity,
      price: pricing.listUnit, // ✅ siempre lista
      selectedSize,
      selectedInterior,
      selectedCover,
      personalization: personalization || undefined,
      // El selector de diseño (paso ①) se muestra siempre salvo que el
      // producto use colores (libretas), en cuyo caso el modelo no aplica
      // y viaja el color elegido en su lugar.
      selectedModel: usesModels ? selectedModelLabel : undefined,
      selectedColor: usesColors ? selectedColor?.name : undefined,
      // B4: distingue la personalización del estándar aunque el texto quede vacío.
      isCustom,
    });

    toast.success('¡Producto agregado al carrito!', {
      description: `${product.name} ${personalization ? `- "${personalization}"` : ''}`,
    });
  };

  // ——— Barra sticky de compra (sólo mobile) ——————————————
  // Aparece recién cuando el botón principal "Agregar al carrito" sale de
  // viewport, para no duplicar la CTA mientras está a la vista.
  const addToCartRef = useRef<HTMLButtonElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = addToCartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      {
        threshold: 0,
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stickyUnitPrice = formattedFinalUnit;
  const stickyOriginalPrice = kit
    ? formatARS(kit.separateTotal)
    : pricing.hasDiscount
      ? formattedListUnit
      : undefined;
  const ctaLabel = isKit ? presale.ctaLabel : 'Agregar al Carrito';
  // "48" solo no dice nada al cliente; con diseño se antepone "Diseño".
  // Con colores, el summary usa el nombre del color en su lugar.
  const stickySummary = [
    isKit && selectedInterior ? `Agenda ${selectedInterior}` : null,
    usesColors ? selectedColor?.name : usesModels ? `Diseño ${selectedModelLabel}` : null,
    isKit ? null : selectedSize,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />
      {(hotSaleActive ||
        AppVars.promotions.twoForOne.enabled ||
        AppVars.promotions.discount.enabled) && (
        // Item 6 (Fase 2a): las tres barras de promo comparten un único
        // contenedor sticky en vez de tener `sticky top-16 z-40` cada una,
        // así se apilan en vez de pisarse cuando hay más de una activa.
        <div className="sticky top-16 z-40">
          {hotSaleActive && (
            <PromoBar badge="HOT SALE" tone="accent">
              {AppVars.promotions.hotSale.percentage}% OFF en toda la tienda ·{' '}
              {formatHotSaleDateRange()}
            </PromoBar>
          )}
          {AppVars.promotions.twoForOne.enabled && (
            <PromoBar badge="2X1">{PROMO_2X1_LABEL_DETAIL}</PromoBar>
          )}
          {AppVars.promotions.discount.enabled && (
            <PromoBar badge="PROMO">
              Descuento del {AppVars.promotions.discount.percentage}% en diseños seleccionados
            </PromoBar>
          )}
        </div>
      )}

      <main className="py-8 w-full max-w-full pb-24 lg:pb-0">
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
                key={selectedModelImage}
                images={galleryImages}
                altBase={product?.name ?? 'Producto'}
                onOpenFullscreen={(src) => setPreviewModelImage(src)}
              />
            </div>

            {/* Info */}
            <div className="space-y-8 min-w-0">
              {/* Título + compartir */}
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-bold break-words">{product.name}</h1>
                  <ShareButton slug={product.slug} name={product.name} className="shrink-0" />
                </div>

                {product.badge && (
                  <Badge className="mb-1 bg-primary text-primary-foreground hover:bg-primary tracking-wide">
                    {product.badge}
                  </Badge>
                )}

                {kit ? (
                  <KitPriceBox kit={kit} deliveryNote={product.deliveryNote} />
                ) : (
                  <>
                    {/* Precio: única fuente (calculateProductPricing). Si hay
                    promos activas se acumulan todas — no es un "o" entre
                    Hot Sale y descuento, es la suma que aplicaría el motor
                    del carrito. */}
                    <div className="mt-3 sm:mt-4 space-y-1">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        {pricing.hasDiscount && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formattedListUnit}
                          </span>
                        )}
                        <span
                          className={`text-2xl sm:text-3xl font-bold ${
                            pricing.hasDiscount ? 'text-accent' : 'text-primary'
                          }`}
                        >
                          {formattedFinalUnit}
                        </span>
                        <span className="text-sm text-muted-foreground">por unidad</span>
                      </div>

                      {pricing.discounts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {pricing.discounts.map((d) => (
                            <Badge
                              key={d.label}
                              className="bg-accent text-accent-foreground font-semibold"
                            >
                              {d.label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground">
                        Total por {quantity} unidad{quantity > 1 ? 'es' : ''}:{' '}
                        <span className="font-semibold text-foreground">{formattedFinalTotal}</span>
                      </p>
                    </div>
                  </>
                )}

                <p className="text-muted-foreground mt-3 break-words">{product.description}</p>
              </div>

              {/* Agenda suelta: el kit con esta agenda sale menos (sólo en preventa) */}
              <PresaleCompareBox product={product} />

              {/* Kit: qué incluye, con el valor de cada pieza */}
              {kit && <KitValueBreakdown kit={kit} />}

              {/* ——— Kit · Paso ①: Elegí tu agenda (define el precio) ——— */}
              {isKit && (
                <StepSection step={versionStepNumber} title="Elegí tu agenda">
                  <VariantSelector
                    label="Agenda"
                    options={product.interiors}
                    value={selectedInterior}
                    onChange={setSelectedInterior}
                    formatOption={(i) =>
                      `${i.charAt(0).toUpperCase()}${i.slice(1)} · ${formatARS(listPriceFor(product, i))}`
                    }
                  />
                </StepSection>
              )}

              {/* ——— Paso ①: Elegí tu diseño / color ——— */}
              {usesColors ? (
                <StepSection step={designStepNumber} title="Elegí el color">
                  <ColorSwatchSelector
                    options={product.colors ?? []}
                    value={selectedColor?.id}
                    onChange={(id) => setSelectedColor(product.colors?.find((c) => c.id === id))}
                  />
                </StepSection>
              ) : hasModels ? (
                <StepSection step={designStepNumber} title="Elegí tu diseño">
                  <DesignPicker
                    options={modeloOptions}
                    value={selectedModelId}
                    onChange={setSelectedModelId}
                    onExpand={openModelPreview}
                  />

                  <FullscreenModelDialog
                    src={previewModelImage || selectedModelImage}
                    alt={product.name}
                    open={fsModelOpen}
                    onOpenChange={setFsModelOpen}
                  />
                </StepSection>
              ) : null}

              {/* ——— Paso ②: Configurá (sólo si hay variantes reales) ——— */}
              {isKit ? null : hasRealChoices ? (
                <StepSection step={configStepNumber} title="Configurá">
                  <div className="space-y-4">
                    <VariantSelector
                      label="Tamaño"
                      options={product.sizes}
                      value={selectedSize}
                      onChange={setSelectedSize}
                    />

                    <VariantSelector
                      label="Tipo de Interior"
                      options={product.interiors}
                      value={selectedInterior}
                      onChange={setSelectedInterior}
                    />

                    <VariantSelector
                      label="Tipo de Tapa"
                      options={product.coverTypes}
                      value={selectedCover}
                      onChange={setSelectedCover}
                      formatOption={(cover) => `Tapa ${cover}`}
                    />
                  </div>
                </StepSection>
              ) : (
                <div className="space-y-1">
                  <VariantSelector
                    label="Tamaño"
                    options={product.sizes}
                    value={selectedSize}
                    onChange={setSelectedSize}
                  />

                  <VariantSelector
                    label="Tipo de Interior"
                    options={product.interiors}
                    value={selectedInterior}
                    onChange={setSelectedInterior}
                  />

                  <VariantSelector
                    label="Tipo de Tapa"
                    options={product.coverTypes}
                    value={selectedCover}
                    onChange={setSelectedCover}
                    formatOption={(cover) => `Tapa ${cover}`}
                  />
                </div>
              )}

              {/* ——— Paso ③ (o ②): ¿Lo querés personalizado? ——— */}
              {showPersonalization && (
                <PersonalizationStep
                  step={personalizationStepNumber}
                  surcharge={personalizationSurchargeFor(product)}
                  isCustom={isCustom}
                  onCustomChange={setIsCustom}
                  styleId={styleId}
                  onStyleChange={setStyleId}
                  text={personalization}
                  onTextChange={setPersonalization}
                />
              )}

              <QuantityStepper value={quantity} onChange={setQuantity} max={10} />

              {/* CTAs: "Agregar al carrito" es la primaria (habilita el 2x1,
                  que poolea unidades entre líneas del carrito); WhatsApp
                  queda secundario salvo cuando la personalización está
                  activa, donde la consulta previa es indispensable. */}
              <div className="space-y-3">
                <Button ref={addToCartRef} size="lg" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {ctaLabel}
                </Button>
                <Button asChild variant={isCustom ? 'outline' : 'ghost'} className="w-full">
                  <a
                    href={buildWaLink(WHATSAPP_NUMBER, modeSpecificMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {isCustom ? 'Definir personalización por WhatsApp' : 'Consultar por WhatsApp'}
                  </a>
                </Button>
              </div>

              <ProductSpecs product={product} />

              {isKit && <KitFaq />}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Botón flotante con mensaje acorde al modo activo. Se corre hacia
          arriba en mobile cuando la barra sticky de compra está visible,
          para no superponerse con ella. */}
      <WhatsAppButton
        message={modeSpecificMessage}
        variant="floating"
        className={showStickyBar ? 'bottom-24 lg:bottom-6' : undefined}
      />

      <StickyBuyBar
        visible={showStickyBar}
        price={stickyUnitPrice}
        originalPrice={stickyOriginalPrice}
        summary={stickySummary}
        onAddToCart={handleAddToCart}
        addLabel={isKit ? presale.ctaLabel : undefined}
      />
    </div>
  );
};

export default ProductDetail;
