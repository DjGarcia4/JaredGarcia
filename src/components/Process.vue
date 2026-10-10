<template>
  <!-- Proceso en 4 pasos. Cada paso se respalda con algo real de un
       proyecto (no con adjetivos). -->
  <ol ref="root" class="grid gap-5 md:grid-cols-2">
    <li
      v-for="(step, i) in steps"
      :key="step.title"
      class="step surface flex flex-col overflow-hidden"
    >
      <div class="p-7 md:p-8">
        <p class="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light">
          {{ String(i + 1).padStart(2, "0") }} · {{ step.kicker }}
        </p>
        <h3 class="mt-3 text-2xl font-bold tracking-tight">{{ step.title }}</h3>
        <p class="mt-3 leading-relaxed text-white/70">{{ step.body }}</p>
        <p class="mt-4 text-sm leading-relaxed text-white/60">
          <span class="font-semibold text-white/85">{{ t("process.inPractice") }}</span>
          {{ step.proof }}
          <RouterLink
            v-if="step.link"
            :to="step.link.to"
            class="whitespace-nowrap font-medium text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {{ t(step.link.label) }}
          </RouterLink>
        </p>
      </div>

      <!-- Evidencia visual -->
      <div class="mt-auto flex border-t border-white/[0.06] bg-ink-950/40 p-5 md:h-[184px] md:items-center md:p-6" aria-hidden="true">
        <!-- 01: las 4 preguntas reales del wizard de RapiSites -->
        <img
          v-if="step.visual === 'wizard'"
          src="/img/process/rapisites-wizard.webp"
          alt=""
          width="900"
          height="283"
          loading="lazy"
          decoding="async"
          class="w-full rounded-lg ring-1 ring-white/10"
        />

        <!-- 02: tokens de este mismo sitio -->
        <div v-else-if="step.visual === 'tokens'" class="flex items-center justify-between gap-4">
          <div class="flex gap-2">
            <span
              v-for="tok in tokens"
              :key="tok.name"
              class="flex h-12 w-12 items-end rounded-lg p-1 ring-1 ring-white/15"
              :style="{ background: tok.value }"
            >
              <span class="font-mono text-[8px] leading-none" :class="tok.dark ? 'text-ink-950' : 'text-white/70'">{{ tok.name }}</span>
            </span>
          </div>
          <div class="text-right">
            <p class="font-display text-3xl font-bold leading-none text-white">Aa</p>
            <p class="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">Space Grotesk · Inter</p>
          </div>
        </div>

        <!-- 03: pipeline de calidad de SwiftFlow -->
        <div v-else-if="step.visual === 'pipeline'" class="font-mono text-[12px] leading-6 text-white/70">
          <p><span class="text-accent-light">✓</span> vitest <span class="text-white/45">— {{ tm("process.pipeline")[0] }}</span></p>
          <p><span class="text-accent-light">✓</span> playwright <span class="text-white/45">— {{ tm("process.pipeline")[1] }}</span></p>
          <p><span class="text-accent-light">✓</span> axe-core <span class="text-white/45">— {{ tm("process.pipeline")[2] }}</span></p>
          <p class="text-white/45">{{ tm("process.pipeline")[3] }}</p>
        </div>

        <!-- 04: Lighthouse real de este portafolio (antes → después) -->
        <div v-else-if="step.visual === 'scores'" class="flex flex-wrap items-center gap-5">
          <!-- Anillo tipo Lighthouse: el puntaje actual adentro; el arco tenue
               marca dónde estaba antes del rediseño. -->
          <div v-for="s in scores" :key="s.label" class="flex items-center gap-3">
            <div class="relative h-14 w-14 shrink-0">
              <svg viewBox="0 0 36 36" class="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round"
                  :stroke-dasharray="`${(s.after / 100) * 97.4} 97.4`"
                />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="rgba(15,23,42,0.55)" stroke-width="3"
                  :stroke-dasharray="`${(s.before / 100) * 97.4} 97.4`"
                />
              </svg>
              <span class="absolute inset-0 grid place-items-center font-display text-base font-bold text-white">
                {{ s.after }}
              </span>
            </div>
            <div>
              <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">{{ s.label }}</p>
              <p class="mt-1 text-xs text-white/55">{{ t("process.before", { n: s.before }) }}</p>
            </div>
          </div>
        </div>
      </div>
    </li>
  </ol>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { t, tm } from "@/i18n";
import { RouterLink } from "vue-router";
import { gsap, playOnEnter, prefersReducedMotion } from "@/lib/gsap";

// Metadata de cada paso; el texto (kicker, title, body, proof) sale de
// los mensajes de i18n (process.steps), en el mismo orden.
const stepMeta = [
  { link: { label: "process.viewCase", to: { name: "project", params: { slug: "rapisites" } } }, visual: "wizard" },
  { link: { label: "process.viewSystem", to: { name: "design-system" } }, visual: "tokens" },
  { link: { label: "process.viewCase", to: { name: "project", params: { slug: "swiftflow-typing-test" } } }, visual: "pipeline" },
  { link: { label: "process.viewCase", to: { name: "project", params: { slug: "wink-site" } } }, visual: "scores" },
];

const steps = computed(() => tm("process.steps").map((text, i) => ({ ...text, ...stepMeta[i] })));

const tokens = [
  { name: "950", value: "#0F172A" },
  { name: "900", value: "#1E293B" },
  { name: "accent", value: "#22C55E", dark: true },
  { name: "light", value: "#4ADE80", dark: true },
];

// Lighthouse de este sitio (docs/metrics.md): main @ fe6ece3 → redesign/v2.
const scoreValues = [
  { before: 80, after: 100 },
  { before: 92, after: 100 },
  { before: 93, after: 100 },
];
const scores = computed(() => tm("process.scores").map((label, i) => ({ label, ...scoreValues[i] })));

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ paused: true });
    tl.from(".step", { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    playOnEnter(tl, { trigger: root.value, start: "top 80%" });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
