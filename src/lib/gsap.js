import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Crea un ScrollTrigger que (a) reproduce un timeline pausado cada vez que el
// trigger entra al viewport (filosofía cinematográfica "se reinicia al volver")
// y (b) si el scroll ya está pasado el start al refresh inicial — caso típico
// al navegar de vuelta con hash, p.ej. /certificate/x → /#aprendizaje — saltea
// el timeline a su estado final para que el contenido no quede invisible.
export const replayOnEnter = (tl, options) =>
  ScrollTrigger.create({
    ...options,
    onEnter: () => tl.restart(),
    onEnterBack: () => tl.restart(),
    onRefresh: (self) => {
      if (self.progress > 0) tl.progress(1).pause();
    },
  });

export { gsap, ScrollTrigger };
