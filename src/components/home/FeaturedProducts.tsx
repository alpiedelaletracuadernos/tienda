import { products } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import vars from '@/data/data';

export const FeaturedProducts = () => {
  const featured = products.slice(0, 4);

  return (
    <section className="py-24 bg-soft/30">
      <div className="container px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">Productos Destacados</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubrí nuestras agendas y cuadernos más populares. Cada uno hecho a mano con amor y
            atención al detalle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featured.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard key={product.id} product={product} />
              {
                // Etiqueta Descuento
                vars.promotions.discount.enabled &&
                  (product.category === 'agendas' || product.category === 'agendas docentes') && (
                    <span className="absolute left-2 top-2 rounded-full bg-amber-400 text-black text-[11px] font-semibold px-2 py-0.5 shadow">
                      Promo {vars.promotions.discount.percentage}% OFF
                    </span>
                  )
              }

              {/* Descuentos  */}
              {/* <span className="absolute left-2 top-2 rounded-full bg-amber-400 text-black text-[11px] font-semibold px-2 py-0.5 shadow">
                hasta -30%
              </span> */}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/catalogo">Ver Todos los Productos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
