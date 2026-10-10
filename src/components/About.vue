<template>
  <div ref="root" class="grid gap-10 lg:grid-cols-12 lg:gap-14">
    <!-- Bio -->
    <div class="about-in lg:col-span-7">
      <div class="space-y-5 text-lg leading-relaxed text-white/75">
        <p>
          Soy {{ firstName }}, ingeniero en Ciencias de la Computación de
          {{ profile.location }}. Desde {{ profile.careerStart }} construyo
          interfaces, y con los años el trabajo se fue moviendo hacia las dos
          puntas: <span class="text-white">entender qué necesita la gente</span>
          y <span class="text-white">entregarlo funcionando en producción</span>.
        </p>
        <p>
          Hoy soy Head of Development en Wink Digital, donde lidero una
          plataforma de digital signage con más de 500 implementaciones en 3
          países<a href="https://winkdigital.io" target="_blank" rel="noopener noreferrer" class="align-super text-xs text-accent-light" aria-label="Fuente: winkdigital.io">¹</a>.
          En paralelo construyo RapiSites, un SaaS de punta a punta (del
          producto y la UI a la infraestructura) que ya generó más de 80 sitios
          y cuya API usa Wink para hospedar los sitios de sus clientes.
        </p>
        <p>
          Me muevo cómodo entre Figma y el código. Eso me permite tomar
          decisiones de diseño sabiendo lo que cuestan, y escribir frontend
          que respeta el diseño hasta el último estado.
        </p>
      </div>

      <p class="mt-8 inline-flex items-center gap-2.5 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-[15px] text-white/80">
        <font-awesome-icon :icon="['fas', 'briefcase']" class="text-accent-light" />
        Abierto a roles de Frontend y UI/UX, y a proyectos freelance.
      </p>
    </div>

    <!-- Ahora + Formación -->
    <div class="space-y-5 lg:col-span-5">
      <div class="about-in surface p-6 md:p-7">
        <p class="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          Ahora
        </p>
        <h3 class="mt-3 text-xl font-bold">
          {{ current.role }} <span class="text-white/60">·</span> {{ current.company }}
        </h3>
        <div class="mt-4 flex flex-wrap gap-2">
          <span v-for="item in current.focus" :key="item" class="chip">{{ item }}</span>
        </div>
      </div>

      <div class="about-in surface p-6 md:p-7">
        <p class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
          Formación
        </p>
        <ul class="mt-4 divide-y divide-white/[0.06]">
          <li class="flex items-baseline justify-between gap-4 py-3 first:pt-0">
            <span class="text-[15px] font-medium text-white">{{ profile.title }}</span>
            <span class="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">Grado</span>
          </li>
          <li v-for="c in education" :key="c.slug">
            <RouterLink
              :to="{ name: 'certificate', params: { slug: c.slug } }"
              class="group flex items-baseline justify-between gap-4 py-3"
            >
              <span class="text-[15px] text-white/80 transition-colors group-hover:text-accent-light">
                {{ c.title }}
              </span>
              <span class="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                {{ c.status === "En curso" ? "En curso" : c.issuer }}
              </span>
            </RouterLink>
          </li>
        </ul>
        <button
          v-if="rest.length"
          type="button"
          class="mt-2 text-sm font-medium text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          :aria-expanded="showAll"
          @click="showAll = !showAll"
        >
          {{ showAll ? "Ver menos" : `Ver ${rest.length} cursos más de desarrollo` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { profile } from "@/data/profile";
import { current } from "@/data/experience";
import { certificates } from "@/data/certificates";
import { gsap, playOnEnter, prefersReducedMotion } from "@/lib/gsap";

const firstName = profile.name.split(" ")[0];

// Primero lo relevante para el rol (diseño + lo que estoy cursando); el
// resto de cursos de desarrollo queda detrás de "ver más".
const isHighlight = (c) => c.status === "En curso" || /UX|UI/.test(c.title);
const sorted = [...certificates].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const highlights = sorted.filter(isHighlight);
const rest = sorted.filter((c) => !isHighlight(c));

const showAll = ref(false);
const education = computed(() => (showAll.value ? [...highlights, ...rest] : highlights));

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ paused: true });
    tl.from(".about-in", { opacity: 0, y: 24, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    playOnEnter(tl, { trigger: root.value, start: "top 80%" });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
