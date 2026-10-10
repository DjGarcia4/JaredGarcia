import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reproduce un timeline pausado una sola vez, cuando el trigger entra al
// viewport. Si al refrescar el scroll ya está pasado el start (p. ej. al
// volver con hash, /certificate/x → /#about), salta al estado final
// para que el contenido no quede invisible.
export const playOnEnter = (tl, options) =>
  ScrollTrigger.create({
    ...options,
    once: true,
    onEnter: () => tl.play(),
    onRefresh: (self) => {
      if (self.progress > 0) tl.progress(1);
    },
  });

export { gsap, ScrollTrigger };
