import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'María Fernández',
    role: 'Emprendedora',
    content: '¡Hermosas agendas! La calidad es increíble y la personalización quedó perfecta. Ya compré 3 para regalar.',
    rating: 5,
    image: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Lucas Martínez',
    role: 'Docente',
    content: 'La agenda docente es exactamente lo que necesitaba. Muy práctica y el diseño es precioso. Super recomendable.',
    rating: 5,
    image: 'https://i.pravatar.cc/150?img=33',
  },
  {
    name: 'Camila Rodriguez',
    role: 'Estudiante Universitaria',
    content: 'Me encantó! El cuaderno universitario es de excelente calidad y la atención al cliente es de 10. Volveré a comprar.',
    rating: 5,
    image: 'https://i.pravatar.cc/150?img=5',
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-soft/30">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Lo Que Dicen Nuestros Clientes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Miles de clientes felices en toda Argentina confían en nosotros
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-3 pt-4 border-t">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
