// src/pages/Checkout.tsx
import { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/use-cart';
import AppVars from '@/data/data';
import { formatARS } from '@/lib/currency';
import { buildCheckoutMessage, buildWaLink } from '@/lib/whatsapp';
import type { BuyerInfo } from '@/types/cart';

type DeliveryMethod = 'retiro' | 'envio';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();

  // Datos del comprador
  const [buyerName, setBuyerName] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('retiro');
  const [deliveryAddress, setDeliveryAddress] = useState(''); // si envío
  const [buyerNotes, setBuyerNotes] = useState('');

  // (Opcional) método de pago para informar en el mensaje
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'mercado-pago'>('efectivo');

  const whatsappMessage = useMemo(() => {
    const buyer: BuyerInfo = {
      name: buyerName,
      city: buyerCity,
      deliveryMethod,
      address: deliveryAddress,
      notes: buyerNotes,
      paymentMethod,
    };
    return buildCheckoutMessage(items, buyer);
  }, [items, buyerName, buyerCity, deliveryMethod, deliveryAddress, buyerNotes, paymentMethod]);

  const phoneNumber = AppVars.phoneNumber; // ej.: 549336XXXXXXX
  const waHref = buildWaLink(phoneNumber, whatsappMessage);

  const canContinue =
    (items?.length ?? 0) > 0 &&
    buyerName.trim().length > 1 &&
    buyerCity.trim().length > 1 &&
    (deliveryMethod === 'retiro' || (deliveryMethod === 'envio' && deliveryAddress.trim().length > 3));

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />
      <main className="py-8 w-full max-w-full">
        <div className="container px-4">
          {/* Breadcrumb */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/catalogo" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Seguir comprando
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Datos del comprador */}
            <section className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Finalizar compra</h1>
                <p className="text-sm text-muted-foreground">
                  Completá tus datos para enviarnos el pedido por WhatsApp y coordinar el pago/envío.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="buyerName">Nombre y apellido</Label>
                  <Input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ej.: María López"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerCity">Ciudad / Localidad</Label>
                  <Input
                    id="buyerCity"
                    value={buyerCity}
                    onChange={(e) => setBuyerCity(e.target.value)}
                    placeholder="Ej.: San Nicolás de los Arroyos"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Entrega</Label>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="retiro" id="retiro" />
                      <Label htmlFor="retiro">Retiro en punto de entrega</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="envio" id="envio" />
                      <Label htmlFor="envio">Envío a domicilio</Label>
                    </div>
                  </RadioGroup>
                </div>

                {deliveryMethod === 'envio' && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="deliveryAddress">Dirección</Label>
                    <Input
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Calle, número, barrio, referencias"
                    />
                  </div>
                )}

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="buyerNotes">Notas (opcional)</Label>
                  <Textarea
                    id="buyerNotes"
                    value={buyerNotes}
                    onChange={(e) => setBuyerNotes(e.target.value)}
                    placeholder="Aclaraciones, horarios para recibir, color favorito, etc."
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Método de pago preferido</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as 'efectivo' | 'transferencia' | 'mercado-pago')}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="efectivo" id="p-efectivo" />
                      <Label htmlFor="p-efectivo">Efectivo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transferencia" id="p-transf" />
                      <Label htmlFor="p-transf">Transferencia</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mercado-pago" id="p-mp" />
                      <Label htmlFor="p-mp">Mercado Pago</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </section>

            {/* Resumen */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="rounded-2xl border p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">Tu carrito</h2>
                  <Badge variant="outline">{items?.length ?? 0} ítems</Badge>
                </div>

                <div className="space-y-3 max-h-[40svh] overflow-auto pr-1
                  [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent]
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:bg-slate-400/60
                  hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/70
                  [&::-webkit-scrollbar-thumb]:rounded-full">
                  {(!items || items.length === 0) && (
                    <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
                  )}
                  {items?.map((it, i) => {
                    const unit = it.price ?? it.product?.basePrice ?? 0;
                    return (
                      <div key={i} className="border rounded-xl p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium break-words">{it.product?.name ?? 'Producto'}</p>
                            <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                              {it.selectedModel && <p>Modelo: {it.selectedModel}</p>}
                              {it.selectedSize && <p>Tamaño: {it.selectedSize}</p>}
                              {it.selectedInterior && <p>Interior: {it.selectedInterior}</p>}
                              {it.selectedCover && <p>Tapa: {it.selectedCover}</p>}
                              {it.personalization && <p>Personalización: “{it.personalization}”</p>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm">x{it.quantity ?? 1}</p>
                            <p className="text-sm text-muted-foreground">{formatARS(unit)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="font-semibold">Total</p>
                  <p className="font-semibold">{formatARS(getTotalPrice())}</p>
                </div>


                {/* Continuar al pago -> WhatsApp + limpiar carrito + gracias */}
                <Button
                  size="lg"
                  className="w-full mt-4"
                  disabled={!canContinue}
                  onClick={() => {
                    const href = buildWaLink(AppVars.phoneNumber, whatsappMessage);
                    // Abrir WhatsApp en nueva pestaña
                    window.open(href, '_blank', 'noopener,noreferrer');
                    // Limpiar carrito y redirigir
                    clearCart();
                    navigate('/gracias');
                  }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Continuar al pago por WhatsApp
                </Button>


                {!canContinue && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Completá nombre, ciudad y {deliveryMethod === 'envio' ? 'dirección' : 'método de entrega'} para continuar.
                  </p>
                )}

                <Button variant="ghost" asChild className="w-full mt-2">
                  <Link to="/catalogo">Seguir comprando</Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
