import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { formatARS } from '@/lib/currency';

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  
  const total = getTotalPrice();
  const formattedTotal = formatARS(total);

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
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                const formattedPrice = formatARS(itemTotal);

                return (
                  <Card key={`${item.product.id}-${item.selectedSize}-${item.selectedInterior}-${item.selectedCover}`}>
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
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{item.product.name}</h3>
                              {item.personalization && (
                                <p className="text-sm text-primary">
                                  "{item.personalization}"
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(
                                item.product.id,
                                item.selectedSize,
                                item.selectedInterior,
                                item.selectedCover
                              )}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Tamaño: {item.selectedSize}</p>
                            <p>Interior: {item.selectedInterior}</p>
                            <p>Tapa: {item.selectedCover}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedInterior,
                                  item.selectedCover,
                                  Math.max(1, item.quantity - 1)
                                )}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedInterior,
                                  item.selectedCover,
                                  item.quantity + 1
                                )}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Price */}
                            <p className="text-lg font-bold text-primary">{formattedPrice}</p>
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
                      <span>Subtotal</span>
                      <span>{formattedTotal}</span>
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
};

export default Cart;
