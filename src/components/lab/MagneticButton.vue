<template>
  <!-- El botón se acerca al cursor dentro de un radio y vuelve con un
       resorte al salir. El texto se mueve un poco más que el fondo (efecto
       de profundidad). Sin efecto con touch o reduced motion. -->
  <div
    ref="zone"
    class="grid h-56 place-items-center"
    @pointermove="onMove"
    @pointerleave="reset"
  >
    <button
      ref="btn"
      type="button"
      class="btn-primary px-7 py-3.5 text-base will-change-transform"
      @click="clicks++"
    >
      <span ref="label" class="inline-flex items-center gap-2 will-change-transform">
        {{ clicks ? t("lab.magnetic.clicked", { n: clicks }) : t("lab.magnetic.label") }}
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </span>
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { t } from "@/i18n";

const zone = ref(null);
const btn = ref(null);
const label = ref(null);
const clicks = ref(0);
let enabled = false;
let toBtnX, toBtnY, toLabelX, toLabelY;

onMounted(() => {
  enabled = !prefersReducedMotion();
  if (!enabled) return;
  const opts = { duration: 0.5, ease: "power3.out" };
  toBtnX = gsap.quickTo(btn.value, "x", opts);
  toBtnY = gsap.quickTo(btn.value, "y", opts);
  toLabelX = gsap.quickTo(label.value, "x", opts);
  toLabelY = gsap.quickTo(label.value, "y", opts);
});

const onMove = (e) => {
  if (!enabled || e.pointerType !== "mouse") return;
  const r = btn.value.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  const dist = Math.hypot(dx, dy);
  const RADIUS = 140;
  if (dist > RADIUS) return reset();
  const pull = 0.4 * (1 - dist / RADIUS) + 0.15;
  toBtnX(dx * pull);
  toBtnY(dy * pull);
  toLabelX(dx * pull * 0.35);
  toLabelY(dy * pull * 0.35);
};

const reset = () => {
  if (!enabled) return;
  gsap.to([btn.value, label.value], { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" });
};

onUnmounted(() => gsap.killTweensOf([btn.value, label.value]));
</script>
