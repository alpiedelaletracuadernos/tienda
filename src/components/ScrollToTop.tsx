// src/components/ScrollToTop.tsx
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Si toda la página scrollea:
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Si usás un contenedor scrollable, en vez de la línea de arriba:
    // document.querySelector("#app-scroll")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
