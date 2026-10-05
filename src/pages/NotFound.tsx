import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const NotFound = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 grid place-items-center bg-soft/30 px-4 py-16">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold text-primary">Error 404</p>
        <h1 className="text-3xl sm:text-4xl font-bold">No encontramos esta página</h1>
        <p className="text-muted-foreground">Puede que el link esté desactualizado.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild>
            <Link to="/catalogo">Ver el catálogo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
