import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail } from 'lucide-react';
import vars from '@/data/data';
import { COLLECTIONS } from '@/data/collections';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img
              className="w-60 h-auto"
              src="assets/logo-largo.webp"
              width={720}
              height={309}
              loading="lazy"
              alt="Al Pie de la Letra - logo pie de página"
            />
            <p className="text-sm text-muted-foreground">
              Agendas y cuadernos artesanales, hechos a mano en San Nicolás, Argentina.
            </p>
            <div className="flex space-x-4">
              <a
                href={vars.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:info@alpiedelaletrasn.com.ar"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tienda: mismas categorías que el catálogo (src/data/collections.ts) */}
          <div>
            <h4 className="font-semibold mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm">
              {COLLECTIONS.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/catalogo?cat=${c.id}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Información: secciones de la portada (Index las busca con ?s=) */}
          <div>
            <h4 className="font-semibold mb-4">Información</h4>
            <ul className="space-y-2 text-sm">
              {[
                { s: 'como-pedir', label: 'Cómo pedir' },
                { s: 'contacto', label: 'Envíos y retiro' },
                { s: 'opiniones', label: 'Opiniones' },
              ].map((l) => (
                <li key={l.s}>
                  <Link
                    to={`/?s=${l.s}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Al Pie de la Letra. Todos los derechos reservados. Hecho con amor en San Nicolás, Argentina.</p>
        </div>
      </div>
    </footer>
  );
};
