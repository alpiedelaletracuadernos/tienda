import { Truck, MapPin, Clock, Shield } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Envíos a Todo el País',
    description: 'Llegamos a cualquier punto de Argentina. Envío seguro con seguimiento.',
  },
  {
    icon: MapPin,
    title: 'Retiro en San Nicolás',
    description: 'Retiro sin cargo en zona centro. Te avisamos cuando esté listo.',
  },
  {
    icon: Clock,
    title: 'Entrega Rápida 48hs',
    description: 'Opción de producción express. Pedilo hoy, recibilo en 2 días.',
  },
  {
    icon: Shield,
    title: 'Compra Segura',
    description: 'Pagos protegidos. Múltiples medios de pago disponibles.',
  },
];

export const ShippingInfo = () => {
  return (
    <section className="py-24">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
