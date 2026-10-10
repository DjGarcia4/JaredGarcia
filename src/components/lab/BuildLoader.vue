<template>
  <!-- Loader de "build": una barra que no miente (avanza por etapas
       reales de un pipeline), con el log escribiéndose debajo. Al terminar
       se puede volver a correr. Progreso anunciado con role="progressbar". -->
  <div class="flex h-56 flex-col justify-center px-2">
    <div class="flex items-center justify-between font-mono text-[11px] text-white/60">
      <span>$ npm run build</span>
      <span>{{ Math.round(progress * 100) }}%</span>
    </div>
    <div
      class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
      role="progressbar"
      :aria-valuenow="Math.round(progress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="t('lab.loader.aria')"
    >
      <div
        class="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
        :style="{ width: `${progress * 100}%` }"
      ></div>
    </div>
    <ul class="mt-4 h-[6.5rem] space-y-1 overflow-hidden font-mono text-[11px]">
      <li v-for="(line, i) in log" :key="i" class="flex gap-2 text-white/70">
        <span :class="line.done ? 'text-accent-light' : 'text-white/40'">{{ line.done ? "✓" : "›" }}</span>
        {{ line.text }}
      </li>
    </ul>
    <button
      type="button"
      class="mt-1 self-start text-sm font-medium text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent disabled:opacity-40"
      :disabled="running"
      @click="run"
    >
      {{ t("lab.loader.run") }}
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { t } from "@/i18n";

// Etapas con peso distinto: la barra avanza según el trabajo real de cada
// una, no a ritmo constante (así se siente creíble).
const STAGES = [
  { text: "resolving modules", weight: 0.15, ms: 500 },
  { text: "transforming 169 modules", weight: 0.4, ms: 1200 },
  { text: "rendering chunks", weight: 0.25, ms: 800 },
  { text: "computing gzip size", weight: 0.12, ms: 450 },
  { text: "built in 1.37s", weight: 0.08, ms: 250 },
];

const progress = ref(0);
const log = ref([]);
const running = ref(false);
let timers = [];

const run = () => {
  timers.forEach(clearTimeout);
  timers = [];
  progress.value = 0;
  log.value = [];
  running.value = true;
  let at = 0;
  let acc = 0;
  STAGES.forEach((s, i) => {
    timers.push(setTimeout(() => log.value.push({ text: s.text, done: false }), at));
    at += s.ms;
    acc += s.weight;
    const value = acc;
    timers.push(
      setTimeout(() => {
        progress.value = value;
        log.value[i].done = true;
        if (i === STAGES.length - 1) running.value = false;
      }, at)
    );
  });
};

onMounted(run);
onUnmounted(() => timers.forEach(clearTimeout));
</script>
