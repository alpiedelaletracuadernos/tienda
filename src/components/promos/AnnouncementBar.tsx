// src/components/promos/AnnouncementBar.tsx
import { Link } from "react-router-dom";

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-black text-white text-center text-sm py-2 px-3">
      <span className="font-semibold">Black Friday:</span>{" "}
      <span className="opacity-90">-15% OFF en agendas seleccionadas · </span>
      <Link to="/catalogo?utm_source=bar_bf&utm_medium=top&utm_campaign=bf" className="underline underline-offset-2">
        Ver ofertas →
      </Link>
    </div>
  );
}
