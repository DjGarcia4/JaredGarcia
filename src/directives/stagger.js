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

    const triggers = [];
    const isDesktop = window.innerWidth >= 1024;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    const cols = isDesktop ? 3 : (isTablet ? 2 : 1);

    items.forEach((item, index) => {
      const delay = (index % cols) * 0.06;

      const trigger = ScrollTrigger.create({
        trigger: item,
        start: "top 92%",
        once: true,
        onEnter: () => {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            delay,
            clearProps: "transform,opacity",
            onComplete: () => gsap.set(item, { willChange: "auto" }),
          });
        },
      });
      triggers.push(trigger);
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
