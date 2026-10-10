<template>
  <!-- Tarjeta que se inclina hacia el cursor, con un brillo que sigue al
       puntero y capas a distinta profundidad (translateZ). Con teclado, el
       foco la inclina suavemente para que también se note el efecto. -->
  <div class="grid h-56 place-items-center" style="perspective: 900px">
    <div
      ref="card"
      tabindex="0"
      :aria-label="t('lab.tilt.aria')"
      class="tilt-card relative h-36 w-60 rounded-2xl border border-white/15 bg-gradient-to-br from-ink-800 to-ink-950 p-5 outline-none"
      :style="style"
      @pointermove="onMove"
      @pointerleave="reset"
      @focus="onFocus"
      @blur="reset"
    >
      <span class="glare pointer-events-none absolute inset-0 rounded-2xl" :style="glare"></span>
      <div class="layer" style="transform: translateZ(40px)">
        <LogoMark class="h-9 w-9" />
      </div>
      <p class="layer mt-5 font-display text-lg font-bold text-white" style="transform: translateZ(28px)">Jared Garcia</p>
      <p class="layer font-mono text-[10px] uppercase tracking-[0.18em] text-white/60" style="transform: translateZ(18px)">
        Frontend · UI/UX
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import LogoMark from "@/components/LogoMark.vue";
import { prefersReducedMotion } from "@/lib/gsap";
import { t } from "@/i18n";

const card = ref(null);
const rx = ref(0);
const ry = ref(0);
const gx = ref(50);
const gy = ref(50);
const active = ref(false);

const style = computed(() => ({
  transform: `rotateX(${rx.value}deg) rotateY(${ry.value}deg)`,
  transition: active.value ? "transform 0.08s linear" : "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
}));
const glare = computed(() => ({
  background: `radial-gradient(circle at ${gx.value}% ${gy.value}%, rgba(255,255,255,0.18), transparent 55%)`,
  opacity: active.value ? 1 : 0,
}));

const onMove = (e) => {
  if (prefersReducedMotion() || e.pointerType !== "mouse") return;
  const r = card.value.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  active.value = true;
  ry.value = (px - 0.5) * 22;
  rx.value = (0.5 - py) * 18;
  gx.value = px * 100;
  gy.value = py * 100;
};

const onFocus = () => {
  if (prefersReducedMotion()) return;
  rx.value = 6;
  ry.value = -10;
};

const reset = () => {
  active.value = false;
  rx.value = 0;
  ry.value = 0;
};
</script>

<style scoped>
.tilt-card {
  transform-style: preserve-3d;
  box-shadow: 0 30px 60px -25px rgba(0, 0, 0, 0.8);
}
.tilt-card:focus-visible {
  box-shadow: 0 0 0 2px #4ade80, 0 30px 60px -25px rgba(0, 0, 0, 0.8);
}
.layer {
  transform-style: preserve-3d;
}
.glare {
  transition: opacity 0.3s;
  transform: translateZ(1px);
}
</style>
