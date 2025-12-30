import { Package, Pencil, Truck, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Package,
    title: 'Elegí tu producto',
    description: 'Explorá nuestro catálogo y seleccioná el tamaño, interior y tipo de tapa que más te guste.',
  },
  {
    icon: Pencil,
    title: 'Personalizalo',
    description: 'Agregá tu nombre o frase favorita. Hacé que sea único y especial.',
  },
  {
    icon: CheckCircle,
    title: 'Comprá o consultá',
    description: 'Finalizá tu compra online o contactanos por WhatsApp para hacer tu pedido.',
  },
  {
    icon: Truck,
    title: 'Recibilo o retiralo',
    description: 'Envíos a todo el país o retiro sin cargo en el centro de San Nicolás.',
  },
];

export const HowToOrder = () => {
  return (
    <section className="py-24">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">¿Cómo Pedir?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            En solo 4 simples pasos tenés tu agenda o cuaderno personalizado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary to-transparent" />
                )}
                
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 animate-pulse" />
                  <Icon className="h-10 w-10 text-primary relative z-10" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
