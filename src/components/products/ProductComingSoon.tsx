// src/components/products/ProductComingSoon.tsx
//
// PDP de un producto "Próximamente" (`inStock: false`). Se mantiene la página
// (no rompe links ni búsquedas) pero sin precio, sin selector y sin carrito:
// la acción principal es pedir aviso por WhatsApp.
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import { ProductSpecs } from '@/components/products/ProductSpecs';
import { COMING_SOON_LABEL, availabilityNote } from '@/lib/availability';
import { buildRestockMessage, buildWaLink } from '@/lib/whatsapp';
import vars from '@/data/data';
import type { Product } from '@/types/product';

export function ProductComingSoon({ product }: { product: Product }) {
  return (
    <div className="min-h-screen overflow-x-clip">
      <Header />

      <main className="py-8 w-full max-w-full">
        <div className="container px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/catalogo" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al catálogo
            </Link>
          </Button>

          <div className="w-full max-w-full min-w-0 grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="min-w-0">
              <ProductImageGallery images={product.images} altBase={product.name} />
            </div>

            <div className="space-y-6 min-w-0">
              <div className="space-y-3">
                <Badge className="bg-foreground text-background hover:bg-foreground">
                  {COMING_SOON_LABEL}
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-bold break-words">{product.name}</h1>
                <p className="text-lg font-medium text-muted-foreground">
                  {availabilityNote(product)}: estamos actualizando este producto para 2027.
                </p>
                <p className="text-muted-foreground break-words">{product.description}</p>
              </div>

              <div className="space-y-3">
                <Button asChild size="lg" className="w-full">
                  <a
                    href={buildWaLink(vars.phoneNumber, buildRestockMessage(product))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Bell className="mr-2 h-5 w-5" />
                    Avisame cuando esté disponible
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/catalogo">Ver productos disponibles</Link>
                </Button>
              </div>

              <ProductSpecs product={product} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
