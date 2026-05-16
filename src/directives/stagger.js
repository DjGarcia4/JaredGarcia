// v-stagger — revela los hijos directos del contenedor de forma escalonada
// cuando entran al viewport (ScrollTrigger.batch). Limpia sus triggers al desmontar.

import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const state = new WeakMap();

export const stagger = {
  mounted(el) {
    const items = Array.from(el.children);
    if (!items.length || prefersReducedMotion()) return;

    gsap.set(items, {
      opacity: 0,
      y: 22,
      willChange: "transform, opacity",
    });

    const triggers = ScrollTrigger.batch(items, {
      start: "top 92%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.06,
          overwrite: true,
          onComplete: () => gsap.set(batch, { willChange: "auto" }),
        }),
    });

    state.set(el, triggers);
  },

  unmounted(el) {
    const triggers = state.get(el);
    if (!triggers) return;
    triggers.forEach((trigger) => trigger.kill());
    state.delete(el);
  },
};
