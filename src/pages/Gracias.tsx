// src/pages/Gracias.tsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MessageCircle, ArrowRight, ArrowLeft, Timer, Package, MapPin } from 'lucide-react';
import AppVars from '@/data/data';

const buildWaLink = (phoneNumber: string, message: string) =>
  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

export default function Gracias() {
  // Código de pedido “visual” (no persistente)
  const ticketCode = useMemo(() => {
    const d = new Date();
    // Formato: AAMMDD-HHMMSS (ej.: 251107-143215)
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${String(d.getFullYear()).slice(-2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }, []);

  const waMessage = `¡Hola! Recién finalicé la compra desde la web.
Mi código de referencia es: *${ticketCode}*.

Quedo atento/a a los próximos pasos. ¡Gracias!`;

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />
      <main className="py-10">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold">¡Gracias por tu pedido!</h1>
            <p className="text-muted-foreground mt-3">
              Te escribimos por WhatsApp para confirmar detalles de personalización, pago y entrega.
            </p>

            <div className="mt-5">
              <Badge variant="outline" className="text-sm">
                Ref: {ticketCode}
              </Badge>
            </div>

            {/* Acciones principales */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Button asChild className="w-full">
                <a
                  href={buildWaLink(AppVars.phoneNumber, waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Ver estado por WhatsApp
                </a>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/catalogo" aria-label="Volver al catálogo">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver al catálogo
                </Link>
              </Button>
            </div>

            {/* Próximos pasos / info útil */}
            <div className="text-left mt-10 space-y-4 rounded-2xl border p-4 sm:p-6 max-w-xl mx-auto">
              <h2 className="font-semibold">Próximos pasos</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Timer className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Confirmación:</strong> te contactamos por WhatsApp dentro del día hábil para confirmar
                    personalización y disponibilidad.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Producción:</strong> 8–10 h hábiles. Opción de entrega rápida 24–48 h con recargo.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Entrega:</strong> retiro en punto acordado en zona centro (San Nicolás) o envío a domicilio.
                  </span>
                </li>
              </ul>

              <div className="pt-2">
                <Button asChild variant="ghost" className="w-full justify-center">
                  <a
                    href={buildWaLink(
                      AppVars.phoneNumber,
                      `Hola, tengo el ref *${ticketCode}* y quiero consultar por opciones de personalización/entrega.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tengo una consulta
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Si no te llega nuestro mensaje, escribinos al WhatsApp y mencioná la referencia <strong>{ticketCode}</strong>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
