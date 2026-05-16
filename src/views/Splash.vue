<template>
  <div
    class="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink-950"
  >
    <div class="bg-mesh absolute inset-0"></div>
    <div
      class="absolute h-[420px] w-[420px] rounded-full bg-accent/20 blur-[130px] animate-glow-pulse"
    ></div>

    <div class="relative px-6 text-center">
      <p class="eyebrow mb-5 animate-fade-up">Portafolio</p>
      <h1
        class="animate-fade-up font-display text-5xl font-bold tracking-tight md:text-7xl"
      >
        Jared <span class="text-gradient">Garcia</span>
      </h1>
      <p
        class="mt-4 animate-fade-up text-sm uppercase tracking-[0.25em] text-white/45 md:text-base"
        style="animation-delay: 0.12s"
      >
        Frontend Developer · UX/UI Designer
      </p>

      <div class="mx-auto mt-10 h-px w-52 overflow-hidden bg-white/10">
        <div
          class="h-full bg-accent transition-[width] duration-100 ease-linear"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>

    <button
      type="button"
      @click="finish"
      class="absolute bottom-10 text-xs uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-accent-light"
    >
      Saltar intro →
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const emit = defineEmits(["finish"]);

const DURATION = 2200;
const progress = ref(0);
let rafId = null;
let done = false;

const finish = () => {
  if (done) return;
  done = true;
  if (rafId) cancelAnimationFrame(rafId);
  emit("finish");
};

onMounted(() => {
  const start = performance.now();
  const tick = (now) => {
    const elapsed = now - start;
    progress.value = Math.min(100, (elapsed / DURATION) * 100);
    if (elapsed >= DURATION) {
      finish();
    } else {
      rafId = requestAnimationFrame(tick);
    }
  };
  rafId = requestAnimationFrame(tick);
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>
