<template>
  <div ref="root" class="space-y-8">
    <div
      v-for="(project, i) in projects"
      :key="project.id"
      :ref="(el) => setStickyRef(el, i)"
      class="sticky"
      :style="{ top: `calc(6rem + ${i * 1.75}rem)` }"
    >
      <article
        :ref="(el) => setCardRef(el, i)"
        v-glow
        class="stack-card group grid overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900 shadow-card md:grid-cols-[1fr_1.05fr]"
      >
        <!-- Cover (visual side) -->
        <div
          :ref="(el) => setCoverRef(el, i)"
          class="card-cover relative overflow-hidden md:min-h-full"
        >
          <img
            v-if="project.images?.cover"
            :src="project.images.cover"
            :alt="project.title"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
          <div
            v-else
            class="absolute inset-0 grid-overlay flex min-h-[260px] items-center justify-center bg-gradient-to-br from-ink-900 via-ink-850 to-accent-soft/20 md:min-h-[420px]"
          >
            <span
              class="font-display text-3xl font-bold uppercase tracking-tight text-white/15 md:text-5xl"
            >
              {{ project.title }}
            </span>
          </div>

          <!-- Gradiente de transición hacia el panel info -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent md:bg-gradient-to-r"
          ></div>

          <!-- Status: solo en cover, sutil -->
          <span
            v-if="project.status"
            class="card-cover-pin absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur"
            :class="statusStyle(project.status)"
          >
            <span
              class="h-1.5 w-1.5 rounded-full bg-current animate-glow-pulse"
            ></span>
            {{ project.status }}
          </span>
        </div>

        <!-- Info side -->
        <div
          :ref="(el) => setInfoRef(el, i)"
          class="card-info relative flex flex-col justify-center gap-5 p-8 md:p-12 lg:gap-6 lg:p-14"
        >
          <!-- Número editorial protagonista -->
          <div class="card-number-wrap overflow-hidden">
            <span
              class="card-number block font-display text-5xl font-bold leading-none text-gradient md:text-6xl lg:text-7xl"
            >
              {{ String(i + 1).padStart(2, "0") }}.
            </span>
          </div>

          <!-- Eyebrow + categoría -->
          <p class="card-eyebrow eyebrow">
            <span class="h-px w-6 bg-accent-light"></span>
            {{ project.category }}
          </p>

          <!-- Title -->
          <div class="card-title-wrap overflow-hidden">
            <h3
              class="card-title font-display text-3xl font-bold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl"
            >
              {{ project.title }}
            </h3>
          </div>

          <!-- Summary -->
          <p
            class="card-summary max-w-md font-sans text-base leading-relaxed text-white/60 md:text-lg"
          >
            {{ project.summary }}
          </p>

          <!-- Metadata clean (icon + label) -->
          <div
            class="card-meta flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50"
          >
            <span class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', 'calendar']"
                class="text-[11px] text-white/35"
              />
              {{ project.year }}
            </span>
            <span v-if="project.duration" class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', 'clock']"
                class="text-[11px] text-white/35"
              />
              {{ project.duration }}
            </span>
            <span class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', 'users']"
                class="text-[11px] text-white/35"
              />
              {{ project.team }}
            </span>
          </div>

          <!-- Tech stack: iconos limpios -->
          <div class="card-tech flex flex-wrap items-center gap-2">
            <span
              v-for="tech in project.techStack"
              :key="tech"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-accent/40 hover:bg-accent/[0.06]"
              :title="tech"
            >
              <img
                :src="`/img/skills/${tech}.svg`"
                :alt="tech"
                class="h-4 w-4"
              />
            </span>
          </div>

          <!-- CTA (mismo lenguaje que el Hero) -->
          <RouterLink
            :to="`/project/${project.slug}`"
            class="card-cta btn-primary mt-2 w-fit"
          >
            Ver proyecto
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { statusStyle } from "@/lib/status";

defineProps({
  projects: { type: Array, required: true },
});

const root = ref(null);
const cardRefs = ref([]);
const coverRefs = ref([]);
const infoRefs = ref([]);
const stickyRefs = ref([]);

const setCardRef = (el, i) => {
  if (el) cardRefs.value[i] = el;
};
const setCoverRef = (el, i) => {
  if (el) coverRefs.value[i] = el;
};
const setInfoRef = (el, i) => {
  if (el) infoRefs.value[i] = el;
};
const setStickyRef = (el, i) => {
  if (el) stickyRefs.value[i] = el;
};

let ctx;
let snapTrigger;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    const cards = cardRefs.value;

    cards.forEach((card, i) => {
      const cover = coverRefs.value[i];
      const info = infoRefs.value[i];
      if (!card || !info) return;

      // Selectors scoped a esta card (evita choques entre cards).
      const q = (sel) => info.querySelector(sel);
      const number = q(".card-number");
      const eyebrow = q(".card-eyebrow");
      const title = q(".card-title");
      const summary = q(".card-summary");
      const meta = q(".card-meta");
      const tech = q(".card-tech");
      const cta = q(".card-cta");
      const coverPin = cover?.querySelector(".card-cover-pin");
      const coverImg = cover?.querySelector("img, .grid-overlay");

      // Timeline reusable por card (re-disparable al volver al viewport).
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out" },
      });

      // Cover entra con un clipPath reveal de izquierda a derecha.
      if (coverImg) {
        tl.from(
          coverImg,
          {
            clipPath: "inset(0 100% 0 0)",
            duration: 0.7,
            ease: "expo.out",
          },
          0
        );
      }
      if (coverPin) {
        tl.from(
          coverPin,
          { opacity: 0, y: -12, duration: 0.4 },
          "<0.2"
        );
      }

      // Número editorial: se "construye desde abajo" como el wordmark del Hero.
      // Entra casi en paralelo con el cover (no detrás), para que el texto
      // no quede "esperando" mientras la card ya es visible.
      if (number) {
        tl.from(
          number,
          {
            yPercent: 110,
            duration: 0.7,
            ease: "expo.out",
          },
          0.05
        );
      }

      // Eyebrow + title + summary + meta + tech + CTA: stagger refinado,
      // arranca casi en paralelo al número para que el bloque de texto
      // entre apenas el card asoma.
      const stack = [eyebrow, title, summary, meta, tech, cta].filter(Boolean);
      if (stack.length) {
        tl.from(
          stack,
          {
            opacity: 0,
            y: 28,
            scale: 0.98,
            filter: "blur(4px)",
            duration: 0.55,
            stagger: 0.065,
          },
          0.15
        );
      }

      // Title con un overflow-hidden parent + clipPath para sumar carácter.
      if (title) {
        tl.from(
          title,
          {
            clipPath: "inset(100% 0 0 0)",
            yPercent: 6,
            duration: 0.65,
            ease: "expo.out",
          },
          0.2
        );
      }

      // ScrollTrigger: dispara la entrada apenas el top del card asoma por
      // el bottom del viewport (95%). Así para cuando el card está totalmente
      // visible, su contenido ya terminó de materializarse.
      ScrollTrigger.create({
        trigger: card,
        start: "top 95%",
        onEnter: () => tl.restart(),
        onEnterBack: () => tl.restart(),
      });

      // Sticky stack: cada card se encoge y se desenfoca mientras la siguiente sube a taparla.
      if (i < cards.length - 1) {
        gsap.to(card, {
          scale: 0.9,
          filter: "blur(3px)",
          opacity: 0.7,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      }
    });

    // Snap suave entre cards: mismo patrón que el Hero. Solo desktop con pointer fino.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (pointer: fine)", () => {
      const stickies = stickyRefs.value.filter(Boolean);
      if (stickies.length < 2) return;

      const first = stickies[0];
      const last = stickies[stickies.length - 1];

      snapTrigger = ScrollTrigger.create({
        id: "stacked-snap",
        trigger: first,
        start: "top top",
        endTrigger: last,
        end: "top top",
        snap: {
          snapTo: (value) => {
            const range = last.offsetTop - first.offsetTop;
            if (!range) return value;
            const points = stickies.map(
              (el) => (el.offsetTop - first.offsetTop) / range
            );
            return points.reduce(
              (prev, curr) =>
                Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
              points[0]
            );
          },
          duration: { min: 0.3, max: 0.7 },
          delay: 0.18,
          ease: "power2.inOut",
        },
      });

      return () => {
        snapTrigger?.kill();
        snapTrigger = null;
      };
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>

<style scoped>
.stack-card {
  transform-origin: center top;
  will-change: transform, filter, opacity;
  /* Llenar casi todo el viewport bajo el header: evita que aparezcan gaps
     del background entre la card sticky-trabada y la siguiente. */
  min-height: calc(100svh - 7rem);
}

@media (min-width: 768px) {
  .stack-card {
    min-height: calc(100svh - 8rem);
  }
}
</style>
