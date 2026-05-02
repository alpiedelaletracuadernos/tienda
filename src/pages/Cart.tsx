// src/pages/Cart.tsx
import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatARS } from '@/lib/currency';
import { calculateCartPricing } from '@/lib/pricing/calc-cart-pricing';

function getLineKey(item: any) {
  return [
    item.product.id,
    item.selectedSize ?? '',
    item.selectedInterior ?? '',
    item.selectedCover ?? '',
    item.personalization ?? '',
  ].join('|');
}

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const pricing = useMemo(() => calculateCartPricing(items), [items]);

  const totalQty = pricing.totalQty ?? 0;
  const formattedSubtotal = formatARS(pricing.subtotalList ?? 0);

  // ✅ CHANGE: el total final YA viene calculado por el motor
  const formattedTotal = formatARS(pricing.total ?? 0);

  const has2x1 = (pricing.promo?.amount ?? 0) > 0;
  const hasPercent = (pricing.percent?.amount ?? 0) > 0;
  const hasHotSale = (pricing.hotSale?.amount ?? 0) > 0;

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
          <h1 className="text-4xl font-bold mb-8">Tu Carrito</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const key = getLineKey(item);
                const line = pricing.lines?.[key];

                const unitPrice = item.product?.basePrice ?? 0;
                const listLineSubtotal = unitPrice * (item.quantity ?? 0);

                // ✅ CHANGE: total final por línea sale del motor
                const lineFinal = line?.total ?? listLineSubtotal;

                const formattedLineList = formatARS(listLineSubtotal);
                const formattedLineFinal = formatARS(lineFinal);

                const hasAnyPromo =
                  (line?.discount ?? 0) > 0 ||
                  (line?.freeUnits ?? 0) > 0 ||
                  (line?.percentDiscount ?? 0) > 0;

                return (
                  <Card key={key} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold break-words">{item.product.name}</h3>
                              {item.personalization && (
                                <p className="text-sm text-primary break-words">
                                  "{item.personalization}"
                                </p>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeItem(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedInterior,
                                  item.selectedCover,
                                  item.personalization
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
                                    Math.max(1, item.quantity - 1),
                                    item.personalization
                                  )
                                }
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
                                    item.quantity + 1,
                                    item.personalization
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="text-right">
                              {hasAnyPromo ? (
                                <>
                                  <p className="text-sm text-muted-foreground line-through">
                                    {formattedLineList}
                                  </p>
                                  <p className="text-lg font-bold text-primary">
                                    {formattedLineFinal}
                                  </p>

                                  {line?.freeUnits > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      2x1 aplicado: {line.freeUnits} gratis
                                    </p>
                                  )}

                                  {line?.percentDiscount > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Descuento aplicado: -{formatARS(line.percentDiscount)}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-lg font-bold text-primary">
                                  {formattedLineList}
                                </p>
                              )}
                            </div>
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
                      <span>
                        Subtotal ({totalQty} {totalQty === 1 ? 'unidad' : 'unidades'})
                      </span>
                      <span>{formattedSubtotal}</span>
                    </div>

                    {has2x1 && pricing.promo && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>{pricing.promo.label}</span>
                        <span>-{formatARS(pricing.promo.amount)}</span>
                      </div>
                    )}

                    {hasPercent && pricing.percent && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>{pricing.percent.label}</span>
                        <span>-{formatARS(pricing.percent.amount)}</span>
                      </div>
                    )}

                    {hasHotSale && pricing.hotSale && (
                      <div className="flex justify-between text-accent font-medium">
                        <span>{pricing.hotSale.label}</span>
                        <span>-{formatARS(pricing.hotSale.amount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>Envío</span>
                      <span>A calcular</span>
                    </div>

                    <div className="border-t pt-2 flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formattedTotal}</span>
                    </div>
                  </div>

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
