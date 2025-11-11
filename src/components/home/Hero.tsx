import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import heroImage from '@/assets/hero-notebook.jpg';

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Agendas artesanales personalizadas"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              ✨ Edición Limitada - Solo 15 Cupos por Semana
            </p>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
              Tu agenda,{' '}
              <span className="gradient-primary bg-clip-text text-white p-1">
                tu estilo
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance">
              Agendas y cuadernos artesanales 100% personalizados. Diseñados y hechos a mano en San Nicolás, Argentina.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/catalogo">
                Comprar Ahora
              </Link>
            </Button>
            <WhatsAppButton 
              className="text-lg px-8 py-6"
              message="Hola! Me interesa conocer más sobre sus agendas personalizadas ✨"
            />
          </div>

          <div className="flex flex-wrap gap-8 pt-8 border-t">
            <div>
              <p className="text-3xl font-bold text-primary">15+</p>
              <p className="text-sm text-muted-foreground">Diseños únicos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">48h</p>
              <p className="text-sm text-muted-foreground">Entrega rápida</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Personalizable</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
