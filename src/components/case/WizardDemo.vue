<template>
  <!-- Demo ilustrativa: recorre los estados de generación de RapiSites con
       un thinking-orb distinto por etapa. No llama a ninguna API. -->
  <div
    ref="root"
    class="flex flex-col items-center gap-6 rounded-2xl border border-white/[0.08] bg-ink-950/60 px-6 py-10 sm:flex-row sm:gap-10 sm:px-10"
  >
    <div class="relative grid h-20 w-20 shrink-0 place-items-center">
      <Transition name="orb" mode="out-in">
        <ThinkingOrb
          v-if="!done"
          :key="current.state"
          :state="current.state"
          :size="64"
          color="#4ADE80"
          :label="current.label"
        />
        <span
          v-else
          class="grid h-16 w-16 place-items-center rounded-full border border-accent/40 bg-accent/10 text-2xl text-accent-light"
        >
          <font-awesome-icon :icon="['fas', 'check']" />
        </span>
      </Transition>
    </div>

    <div class="w-full min-w-0">
      <p class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
        {{ t("wizard.generating") }}
      </p>
      <!-- aria-live para que el cambio de etapa se anuncie -->
      <p class="mt-2 font-display text-xl font-semibold text-white" aria-live="polite">
        {{ done ? t("wizard.done") : current.label }}
      </p>
      <ol class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <li
          v-for="(s, i) in stages"
          :key="s.state"
          class="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300"
          :class="i < step || done ? 'text-accent-light' : i === step ? 'text-white' : 'text-white/40'"
        >
          <span
            class="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300"
            :class="i < step || done ? 'bg-accent' : i === step ? 'bg-white' : 'bg-white/25'"
          ></span>
          {{ s.short }}
        </li>
      </ol>
      <button
        v-if="done"
        type="button"
        class="mt-5 text-sm font-medium text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        @click="restart"
      >
        {{ t("wizard.again") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import ThinkingOrb from "@/components/ThinkingOrb.vue";
import { t, tm } from "@/i18n";

const STATES = ["searching", "composing", "shaping", "solving"];
const stages = computed(() => tm("wizard.stages").map((text, i) => ({ ...text, state: STATES[i] })));

const STEP_MS = 2200;
const step = ref(0);
const done = ref(false);
const current = computed(() => stages.value[Math.min(step.value, stages.value.length - 1)]);

const root = ref(null);
let timer = 0;
let io;

const tick = () => {
  if (step.value < stages.value.length - 1) {
    step.value++;
    timer = window.setTimeout(tick, STEP_MS);
  } else {
    done.value = true;
  }
};

const start = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(tick, STEP_MS);
};

const restart = () => {
  step.value = 0;
  done.value = false;
  start();
};

// Arranca cuando la demo entra en pantalla, una sola vez.
onMounted(() => {
  io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      start();
      io.disconnect();
    }
  }, { threshold: 0.5 });
  io.observe(root.value);
});

onUnmounted(() => {
  window.clearTimeout(timer);
  io?.disconnect();
});
</script>

<style scoped>
.orb-enter-active,
.orb-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.orb-enter-from,
.orb-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
