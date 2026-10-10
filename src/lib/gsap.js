import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Al hidratar una página prerenderizada, el contenido ya se ve desde el
// primer paint. Las animaciones de entrada (gsap.from) lo esconderían para
// volver a mostrarlo: un parpadeo. Esto deja en su estado final las que
// afectan a algo que ya está en pantalla; lo de más abajo se sigue
// animando al hacer scroll.
const inViewport = (el) => {
  if (!(el instanceof Element)) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
};

export const settleVisibleIntros = () => {
  const roots = new Set();
  gsap.globalTimeline.getChildren(true, true, false).forEach((tween) => {
    if (!tween.targets().some(inViewport)) return;
    let root = tween;
    while (root.parent && root.parent !== gsap.globalTimeline) root = root.parent;
    roots.add(root);
  });
  roots.forEach((root) => {
    // Ni las ligadas al scroll (barra de progreso) ni los loops infinitos.
    if (root.scrollTrigger || root.repeat() === -1) return;
    root.progress(1);
  });
};

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
