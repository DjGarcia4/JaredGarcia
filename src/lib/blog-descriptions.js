// Todos los resúmenes del blog, fuera del bundle principal. Importarlo (solo
// por su efecto) desde las rutas que los muestran: /blog, cada artículo y los
// casos con artículos relacionados. Al cargarse los registra en lib/blog, así
// que también los ve el SEO de esas rutas (en el navegador y en el prerender).
import { descriptions } from "virtual:blog/descriptions";
import { registerDescriptions } from "@/lib/blog";

registerDescriptions(descriptions);
