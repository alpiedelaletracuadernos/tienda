import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail } from 'lucide-react';
import vars from '@/data/data';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img className='w-60' src="/src/assets/logo-largo.png" alt="Al Pie de la Letra - logo pie de página" />
            <p className="text-sm text-muted-foreground">
              Agendas y cuadernos artesanales 100% personalizados. Hechos a mano en San Nicolás, Argentina.
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

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalogo?categoria=agendas" className="text-muted-foreground hover:text-primary transition-colors">
                  Agendas
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=cuadernos" className="text-muted-foreground hover:text-primary transition-colors">
                  Cuadernos
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=recetarios" className="text-muted-foreground hover:text-primary transition-colors">
                  Recetarios
                </Link>
              </li>
              <li>
                <Link to="/catalogo?categoria=libretas" className="text-muted-foreground hover:text-primary transition-colors">
                  Libretas
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-4">Información</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/como-pedir" className="text-muted-foreground hover:text-primary transition-colors">
                  Cómo Pedir
                </Link>
              </li>
              <li>
                <Link to="/envios" className="text-muted-foreground hover:text-primary transition-colors">
                  Envíos y Retiro
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/opiniones" className="text-muted-foreground hover:text-primary transition-colors">
                  Opiniones
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terminos" className="text-muted-foreground hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/cambios-devoluciones" className="text-muted-foreground hover:text-primary transition-colors">
                  Cambios y Devoluciones
                </Link>
              </li>
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
