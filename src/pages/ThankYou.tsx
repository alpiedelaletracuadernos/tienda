import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Mail, Phone } from 'lucide-react';

const ThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="container px-4 max-w-3xl">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">¡Gracias por tu compra!</h1>
            <p className="text-xl text-muted-foreground">
              Tu pedido ha sido recibido y está siendo procesado
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Package className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">¿Qué sigue?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Comenzaremos la producción de tu agenda/cuaderno personalizado</li>
                      <li>✓ Te mantendremos informado sobre el estado de tu pedido</li>
                      <li>✓ Tiempo estimado de producción: 8-10 horas hábiles</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">¿Tenés dudas?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Estamos para ayudarte. Contactanos por WhatsApp o email y te responderemos a la brevedad.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a
                          href="https://wa.me/5493364123456?text=Hola! Tengo una consulta sobre mi pedido"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <a href="mailto:info@alpiedelaletrasn.com.ar">
                          Email
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/catalogo">Seguir Comprando</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">Volver al Inicio</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
