// src/pages/Cart.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatARS } from '@/lib/currency';
import clsx from 'clsx';

// Escalera informativa (no se aplica de nuevo al total)
const DISCOUNT_LADDER = [
  { minQty: 3, rate: 0.30, label: '30% OFF' },
  { minQty: 2, rate: 0.20, label: '20% OFF' },
  { minQty: 1, rate: 0.15, label: '15% OFF' },
] as const;

function getRateForQty(totalQty: number) {
  for (const tier of DISCOUNT_LADDER) {
    if (totalQty >= tier.minQty) return tier;
  }
  return { minQty: 0, rate: 0, label: '0% OFF' };
}

function getNextTier(totalQty: number) {
  const remaining = DISCOUNT_LADDER
    .filter(t => totalQty < t.minQty)
    .sort((a, b) => a.minQty - b.minQty);
  return remaining[0] ?? null;
}

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  // Subtotal = suma de líneas. Cada línea ya viene con el precio final desde PDP/store.
  const subtotal = getTotalPrice();
  const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);

  // Escalón actual (solo informativo)
  const currentTier = getRateForQty(totalQty);
  const nextTier = getNextTier(totalQty);

  // —— Ahorro estimado (solo visual) ————————————————————————
  // Estimamos el precio "lista" dividiendo el final por (1 - rate) para mostrar diferencia.
  // No modificamos el total (evitamos doble descuento).
  let estimatedListTotal = 0;
  if (currentTier.rate > 0) {
    const divisor = 1 - currentTier.rate;
    estimatedListTotal = Math.round(subtotal / divisor);
  }
  const estimatedSavings = Math.max(0, estimatedListTotal - subtotal);

  // Total mostrado = subtotal (sin volver a descontar)
  const total = subtotal;

  const formattedSubtotal = formatARS(subtotal);
  const formattedSavings = estimatedSavings > 0 ? `- ${formatARS(estimatedSavings)}` : formatARS(0);
  const formattedTotal = formatARS(total);

  // Progreso hacia el próximo escalón (educativo)
  let progressPct = 100;
  let nextMsg = '';
  if (nextTier) {
    const prevThreshold = currentTier.minQty;
    const span = nextTier.minQty - prevThreshold || 1;
    const progressed = Math.max(0, totalQty - prevThreshold);
    progressPct = Math.min(100, Math.round((progressed / span) * 100));
    const missing = Math.max(0, nextTier.minQty - totalQty);
    nextMsg = `Sumá ${missing} ${missing === 1 ? 'unidad' : 'unidades'} y pasás a ${nextTier.label}`;
  } else {
    progressPct = 100;
    nextMsg = '¡Tenés el máximo descuento aplicado!';
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="container px-4 text-center space-y-6">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
            <h1 className="text-4xl font-bold">Tu carrito está vacío</h1>
            <p className="text-xl text-muted-foreground">
              Explorá nuestro catálogo y encontrá tu agenda o cuaderno perfecto
            </p>
            <Button asChild size="lg">
              <Link to="/catalogo">Ver Productos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4">
          <h1 className="text-4xl font-bold mb-3">Tu Carrito</h1>

          {/* Cinta informativa (educativa) */}
          <div className="mb-8 rounded-xl border bg-amber-50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm sm:text-base font-medium text-amber-900">
                Descuento por cantidad: <span className="font-bold">{currentTier.label}</span> en {totalQty} {totalQty === 1 ? 'unidad' : 'unidades'}.
              </p>
              <p className="text-sm text-amber-900/90">{nextMsg}</p>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-amber-200/60">
              <div
                className="h-2 rounded-full bg-amber-500 transition-all"
                style={{ width: `${progressPct}%` }}
                aria-label="Progreso hacia el próximo descuento"
              />
            </div>
            <p className="mt-2 text-[12px] text-amber-900/80">
              Escalones: 1u <strong>15%</strong> · 2u <strong>20%</strong> · 3u <strong>30%</strong> (ya reflejados en los precios).
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const lineSubtotal = item.price * item.quantity; // precio final ya con descuento
                const formattedLine = formatARS(lineSubtotal);

                return (
                  <Card
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedInterior}-${item.selectedCover}`}
                    className="overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold break-words">{item.product.name}</h3>
                              {item.personalization && (
                                <p className="text-sm text-primary break-words">"{item.personalization}"</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Precio final con descuento por cantidad ya aplicado.
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeItem(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedInterior,
                                  item.selectedCover
                                )
                              }
                              aria-label="Eliminar ítem"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Tamaño: {item.selectedSize}</p>
                            <p>Interior: {item.selectedInterior}</p>
                            <p>Tapa: {item.selectedCover}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedInterior,
                                    item.selectedCover,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                aria-label="Restar una unidad"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedInterior,
                                    item.selectedCover,
                                    item.quantity + 1
                                  )
                                }
                                aria-label="Sumar una unidad"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Line Subtotal */}
                            <p className="text-lg font-bold text-primary">{formattedLine}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button variant="ghost" onClick={clearCart} className="w-full">
                Vaciar Carrito
              </Button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold">Resumen</h2>

                  <div className="space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({totalQty} {totalQty === 1 ? 'unidad' : 'unidades'})</span>
                      <span>{formattedSubtotal}</span>
                    </div>

                    {/* Ahorro informativo (NO se resta del total) */}
                    <div className={clsx(
                      "flex justify-between",
                      estimatedSavings > 0 ? "text-emerald-700" : "text-muted-foreground"
                    )}>
                      <span>Ahorro (ya incluido)</span>
                      <span>{formattedSavings}</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Envío</span>
                      <span>A calcular</span>
                    </div>

                    <div className="border-t pt-2 flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formattedTotal}</span>
                    </div>
                  </div>

                  {/* Incentivo siguiente escalón */}
                  {nextTier && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                      {nextMsg}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button asChild size="lg" className="w-full">
                      <Link to="/checkout">Finalizar Compra</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <Link to="/catalogo">Seguir Comprando</Link>
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                    <p>✓ Envíos a todo el país</p>
                    <p>✓ Retiro sin cargo en San Nicolás</p>
                    <p>✓ Pago seguro con Mercado Pago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
