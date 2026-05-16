// v-glow — spotlight premium que sigue el cursor mediante variables CSS.
// Solo actualiza --glow-x / --glow-y (paint barato) y togglea opacidad.
// El estilo visual vive en la clase .glow-card de main.css.

const state = new WeakMap();

export const glow = {
  mounted(el) {
    el.classList.add("glow-card");

    let frame = null;

    const onMove = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
        el.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
        frame = null;
      });
    };

    const onEnter = () => el.classList.add("is-glowing");

    const onLeave = () => {
      el.classList.remove("is-glowing");
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    state.set(el, { onMove, onEnter, onLeave });
  },

  unmounted(el) {
    const handlers = state.get(el);
    if (!handlers) return;
    el.removeEventListener("pointermove", handlers.onMove);
    el.removeEventListener("pointerenter", handlers.onEnter);
    el.removeEventListener("pointerleave", handlers.onLeave);
    state.delete(el);
  },
};
