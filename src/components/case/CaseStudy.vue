<template>
  <!-- Cuerpo del caso de estudio: contexto, problema, decisiones (con
       evidencia visual opcional) y resultado. El TL;DR va aparte, arriba. -->
  <div class="space-y-16 md:space-y-20">
    <section class="grid gap-10 md:grid-cols-2 md:gap-12">
      <div>
        <h2 class="case-h">Contexto</h2>
        <p class="case-p">{{ study.context }}</p>
      </div>
      <div>
        <h2 class="case-h">El problema</h2>
        <p class="case-p">{{ study.problem }}</p>
      </div>
    </section>

    <section aria-labelledby="decisiones">
      <h2 id="decisiones" class="case-h">Decisiones de diseño</h2>
      <ol class="mt-8 space-y-14">
        <li v-for="(d, i) in study.decisions" :key="d.title" class="grid gap-6 md:grid-cols-[3rem_1fr]">
          <span class="font-mono text-sm font-bold text-accent-light">{{ String(i + 1).padStart(2, "0") }}</span>
          <div>
            <h3 class="text-2xl font-bold tracking-tight">{{ d.title }}</h3>
            <p class="mt-3 max-w-3xl leading-relaxed text-white/75 md:text-lg">{{ d.body }}</p>

            <figure v-if="d.media" class="mt-7">
              <WizardDemo v-if="d.media.type === 'orbs'" />
              <SignageDemo v-else-if="d.media.type === 'signage'" />

              <!-- Línea de tiempo de iteraciones -->
              <ol
                v-else-if="d.media.type === 'steps'"
                class="relative grid gap-4 md:grid-cols-4 md:gap-3"
              >
                <li
                  v-for="(st, k) in d.media.steps"
                  :key="st.title"
                  class="relative rounded-2xl border p-5"
                  :class="k === d.media.steps.length - 1 ? 'border-accent/40 bg-accent/[0.06]' : 'border-white/[0.08] bg-white/[0.02]'"
                >
                  <p class="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em]" :class="k === d.media.steps.length - 1 ? 'text-accent-light' : 'text-white/50'">
                    <span class="grid h-5 w-5 place-items-center rounded-full border text-[10px]" :class="k === d.media.steps.length - 1 ? 'border-accent/60' : 'border-white/20'">{{ k + 1 }}</span>
                    {{ k === d.media.steps.length - 1 ? "Hoy" : `Versión ${k + 1}` }}
                  </p>
                  <h4 class="mt-3 font-display text-lg font-bold leading-snug text-white">{{ st.title }}</h4>
                  <p class="mt-2 text-sm leading-relaxed text-white/65">{{ st.body }}</p>
                  <span
                    v-if="k < d.media.steps.length - 1"
                    class="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-950 text-[9px] text-white/60 md:grid"
                    aria-hidden="true"
                  >→</span>
                </li>
              </ol>

              <div
                v-else-if="d.media.type === 'video'"
                class="overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900"
              >
                <video
                  ref="videoEl"
                  class="block aspect-video w-full"
                  :poster="d.media.poster"
                  muted
                  loop
                  playsinline
                  preload="none"
                  :controls="showControls"
                  :aria-label="d.media.caption"
                >
                  <source :src="`${d.media.src}.webm`" type="video/webm" />
                  <source :src="`${d.media.src}.mp4`" type="video/mp4" />
                </video>
              </div>

              <img
                v-else-if="d.media.type === 'image'"
                :src="projectSrc(d.media.src)"
                :srcset="projectSrcset(d.media.src)"
                sizes="(min-width: 1024px) 760px, 100vw"
                :alt="d.media.caption"
                loading="lazy"
                decoding="async"
                class="w-full rounded-2xl border border-white/[0.08]"
              />

              <figcaption class="mt-3 flex flex-wrap items-center gap-x-3 text-sm text-white/55">
                {{ d.media.caption }}
                <a
                  v-if="d.media.href"
                  :href="d.media.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                >
                  Verlo en vivo ↗
                </a>
              </figcaption>
            </figure>
          </div>
        </li>
      </ol>
    </section>

    <section v-if="study.outcome?.length" aria-labelledby="resultado">
      <h2 id="resultado" class="case-h">Resultado</h2>
      <dl class="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-3">
        <div v-for="o in study.outcome" :key="o.label" class="flex flex-col bg-ink-950 p-6">
          <dt class="order-2 mt-2 text-sm leading-relaxed text-white/65">
            {{ o.label }}
            <a
              v-if="o.source"
              :href="o.source.href"
              target="_blank"
              rel="noopener noreferrer"
              class="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/50 hover:text-accent-light"
            >
              Fuente: {{ o.source.label }}
            </a>
          </dt>
          <dd class="order-1 font-display text-3xl font-bold text-white md:text-4xl">{{ o.value }}</dd>
        </div>
      </dl>
    </section>

    <section v-if="study.learnings">
      <h2 class="case-h">Qué aprendí</h2>
      <p class="case-p max-w-3xl">{{ study.learnings }}</p>
    </section>
  </div>
</template>

<script setup>
import { defineAsyncComponent, onMounted, onUnmounted, ref } from "vue";
import WizardDemo from "@/components/case/WizardDemo.vue";
import { projectSrc, projectSrcset } from "@/lib/img";
// La demo 3D (y three.js) se cargan aparte, solo en el caso que la usa.
const SignageDemo = defineAsyncComponent(() => import("@/components/case/SignageDemo.vue"));

defineProps({
  study: { type: Object, required: true },
});

// El video se reproduce solo (muted) cuando está en pantalla y se pausa al
// salir. Con reduced-motion no hay autoplay: se muestran los controles.
const videoEl = ref([]);
const showControls = ref(false);
let io;

onMounted(() => {
  const videos = [].concat(videoEl.value).filter(Boolean);
  if (!videos.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showControls.value = true;
    return;
  }
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()));
  }, { threshold: 0.4 });
  videos.forEach((v) => io.observe(v));
});

onUnmounted(() => io?.disconnect());
</script>

<style scoped>
.case-h {
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #4ade80;
}
.case-p {
  margin-top: 1rem;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: rgb(255 255 255 / 0.75);
}
@media (min-width: 768px) {
  .case-p {
    font-size: 1.125rem;
  }
}
</style>
