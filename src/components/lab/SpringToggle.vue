<template>
  <!-- Switch con física: la perilla se estira en la dirección del
       movimiento (squash & stretch) y asienta con un resorte real
       (integración por frame, no una curva fija). Es un role="switch". -->
  <div class="grid h-56 place-items-center">
    <label class="flex cursor-pointer select-none items-center gap-4">
      <span class="text-sm text-white/70">{{ t("lab.toggle.label") }}</span>
      <button
        type="button"
        role="switch"
        :aria-checked="on"
        class="relative h-9 w-16 rounded-full border transition-colors duration-300"
        :class="on ? 'border-accent bg-accent/90' : 'border-white/15 bg-white/[0.06]'"
        @click="toggle"
      >
        <span
          class="absolute left-1 top-1 block h-7 w-7 rounded-full bg-white shadow-md"
          :style="{ transform: `translateX(${x}px) scaleX(${sx}) scaleY(${2 - sx})` }"
        ></span>
      </button>
      <span class="w-10 font-mono text-xs uppercase text-white/60">{{ on ? "on" : "off" }}</span>
    </label>
  </div>
</template>

<script setup>
import { onUnmounted, ref } from "vue";
import { prefersReducedMotion } from "@/lib/gsap";
import { t } from "@/i18n";

const TRAVEL = 28;
const on = ref(false);
const x = ref(0);
const sx = ref(1);
let v = 0;
let raf = 0;

// Resorte amortiguado: k = rigidez, c = fricción.
const step = () => {
  const target = on.value ? TRAVEL : 0;
  const k = 0.12;
  const c = 0.72;
  v = (v + (target - x.value) * k) * c;
  x.value += v;
  sx.value = 1 + Math.min(Math.abs(v) / 14, 0.35);
  if (Math.abs(v) > 0.01 || Math.abs(target - x.value) > 0.05) {
    raf = requestAnimationFrame(step);
  } else {
    x.value = target;
    sx.value = 1;
    raf = 0;
  }
};

const toggle = () => {
  on.value = !on.value;
  if (prefersReducedMotion()) {
    x.value = on.value ? TRAVEL : 0;
    return;
  }
  if (!raf) raf = requestAnimationFrame(step);
};

onUnmounted(() => cancelAnimationFrame(raf));
</script>
