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

// ✅ CHANGE: Checkout ya no debe recalcular descuentos.
// Motivo: evitamos solapes. Todo sale del motor.
import { calculateCartPricing } from '@/lib/pricing/calc-cart-pricing';

type DeliveryMethod = 'retiro' | 'envio';

// ✅ CHANGE: misma key que Cart y calc-cart-pricing para mapear líneas
function getLineKey(it: any) {
  return [
    it.product?.id ?? '',
    it.selectedSize ?? '',
    it.selectedInterior ?? '',
    it.selectedCover ?? '',
    it.personalization ?? '',
  ].join('|');
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();

  // ✅ CHANGE: usamos el motor para total + breakdown
  // Motivo: total consistente con Cart y sin doble descuento.
  const pricing = useMemo(() => calculateCartPricing(items), [items]);

  // Datos del comprador
  const [buyerName, setBuyerName] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('retiro');
  const [deliveryAddress, setDeliveryAddress] = useState(''); // si envío
  const [buyerNotes, setBuyerNotes] = useState('');

  // (Opcional) método de pago para informar en el mensaje
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'mercado-pago'>(
    'efectivo'
  );

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

  const phoneNumber = AppVars.phoneNumber;
  const waHref = buildWaLink(phoneNumber, whatsappMessage);

  const canContinue =
    (items?.length ?? 0) > 0 &&
    buyerName.trim().length > 1 &&
    buyerCity.trim().length > 1 &&
    (deliveryMethod === 'retiro' ||
      (deliveryMethod === 'envio' && deliveryAddress.trim().length > 3));

  // ✅ CHANGE: totales salen del motor
  const totalQty = pricing.totalQty ?? 0;
  const subtotalList = pricing.subtotalList ?? 0;
  const totalFinal = pricing.total ?? 0;

  const has2x1 = (pricing.promo?.amount ?? 0) > 0;
  const hasPercent = (pricing.percent?.amount ?? 0) > 0;
  const hasHotSale = (pricing.hotSale?.amount ?? 0) > 0;

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
                  Completá tus datos para enviarnos el pedido por WhatsApp y coordinar el
                  pago/envío.
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
                    onValueChange={(v) =>
                      setPaymentMethod(v as 'efectivo' | 'transferencia' | 'mercado-pago')
                    }
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

                  {/* ✅ CHANGE: mostramos cantidad real de unidades */}
                  <Badge variant="outline">{totalQty} u</Badge>
                </div>

                <div
                  className="space-y-3 max-h-[40svh] overflow-auto pr-1
                  [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.400)_transparent]
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:bg-slate-400/60
                  hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/70
                  [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  {(!items || items.length === 0) && (
                    <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
                  )}

                  {items?.map((it, i) => {
                    const key = getLineKey(it);
                    const line = pricing.lines?.[key];

                    // ✅ CHANGE: unitario “de lista” (lo que guardás en basePrice)
                    // Motivo: it.price puede venir “cargado” por implementaciones anteriores.
                    const unitList = it.product?.basePrice ?? 0;
                    const listLineSubtotal = unitList * (it.quantity ?? 0);

                    const lineFinal = line?.total ?? listLineSubtotal;
                    const hasAnyPromo =
                      (line?.discount ?? 0) > 0 ||
                      (line?.freeUnits ?? 0) > 0 ||
                      (line?.percentDiscount ?? 0) > 0;

                    return (
                      <div key={i} className="border rounded-xl p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium break-words">
                              {it.product?.name ?? 'Producto'}
                            </p>
                            <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                              {it.selectedModel && <p>Modelo: {it.selectedModel}</p>}
                              {it.selectedSize && <p>Tamaño: {it.selectedSize}</p>}
                              {it.selectedInterior && <p>Interior: {it.selectedInterior}</p>}
                              {it.selectedCover && <p>Tapa: {it.selectedCover}</p>}
                              {it.personalization && <p>Personalización: “{it.personalization}”</p>}
                            </div>

                            {/* ✅ opcional: mostrar notas promo por ítem */}
                            {line?.freeUnits > 0 && (
                              <p className="text-[11px] text-muted-foreground mt-1">
                                2x1: {line.freeUnits} gratis
                              </p>
                            )}
                            {line?.percentDiscount > 0 && (
                              <p className="text-[11px] text-muted-foreground">
                                Descuento: -{formatARS(line.percentDiscount)}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm">x{it.quantity ?? 1}</p>

                            {/* ✅ CHANGE: mostramos “lista” y “final” si hubo promos */}
                            {hasAnyPromo ? (
                              <>
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatARS(listLineSubtotal)}
                                </p>
                                <p className="text-sm font-semibold">{formatARS(lineFinal)}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  {formatARS(unitList)} c/u
                                </p>
                                <p className="text-sm font-semibold">
                                  {formatARS(listLineSubtotal)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ✅ CHANGE: resumen económico coherente con Cart */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal (lista)</span>
                    <span>{formatARS(subtotalList)}</span>
                  </div>

                  {has2x1 && pricing.promo && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{pricing.promo.label}</span>
                      <span>-{formatARS(pricing.promo.amount)}</span>
                    </div>
                  )}

                  {hasPercent && pricing.percent && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{pricing.percent.label}</span>
                      <span>-{formatARS(pricing.percent.amount)}</span>
                    </div>
                  )}

                  {hasHotSale && pricing.hotSale && (
                    <div className="flex items-center justify-between text-accent font-medium">
                      <span>{pricing.hotSale.label}</span>
                      <span>-{formatARS(pricing.hotSale.amount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatARS(totalFinal)}</span>
                  </div>
                </div>

                {/* Continuar al pago -> WhatsApp + limpiar carrito + gracias */}
                <Button
                  size="lg"
                  className="w-full mt-4"
                  disabled={!canContinue}
                  onClick={() => {
                    // ✅ usamos el mismo mensaje, pero el total mostrado en UI ya es el correcto
                    window.open(waHref, '_blank', 'noopener,noreferrer');
                    clearCart();
                    navigate('/gracias');
                  }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Continuar al pago por WhatsApp
                </Button>

                {!canContinue && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Completá nombre, ciudad y{' '}
                    {deliveryMethod === 'envio' ? 'dirección' : 'método de entrega'} para continuar.
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
