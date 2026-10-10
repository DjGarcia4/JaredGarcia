<template>
  <div ref="root">
    <section class="container-content pb-12 pt-16 md:pb-16 md:pt-24">
      <p class="pv-in eyebrow">
        <span class="h-px w-6 bg-accent-light"></span>
        Proyectos
      </p>
      <h1 class="pv-in mt-5 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
        Trabajo <span class="text-gradient">real.</span>
      </h1>
      <p class="pv-in mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
        Productos que diseñé y construí, hoy en producción. Más abajo, los
        ejercicios de cursos y de mis primeros años, como registro de cómo
        aprendí.
      </p>
      <dl class="pv-in mt-8 flex flex-wrap gap-x-10 gap-y-4">
        <div>
          <dt class="mono-label">Casos</dt>
          <dd class="mt-1 font-display text-3xl font-bold text-white">{{ cases.length }}</dd>
        </div>
        <div>
          <dt class="mono-label">Práctica</dt>
          <dd class="mt-1 font-display text-3xl font-bold text-white">{{ practice.length }}</dd>
        </div>
        <div>
          <dt class="mono-label">Desde</dt>
          <dd class="mt-1 font-display text-3xl font-bold text-white">{{ profile.careerStart }}</dd>
        </div>
      </dl>
    </section>

    <!-- Casos -->
    <section class="container-content pb-24" aria-labelledby="casos-title">
      <h2 id="casos-title" class="sr-only">Casos</h2>
      <ul class="grid gap-6 md:grid-cols-2">
        <li v-for="(project, i) in cases" :key="project.id" class="pv-card" :class="i === 0 ? 'md:col-span-2' : ''">
          <RouterLink
            :to="{ name: 'project', params: { slug: project.slug } }"
            class="group surface surface-hover flex h-full flex-col overflow-hidden"
            :class="i === 0 ? 'md:flex-row' : ''"
          >
            <div class="overflow-hidden border-b border-white/[0.06] bg-ink-900" :class="i === 0 ? 'md:w-3/5 md:border-b-0 md:border-r' : ''">
              <img
                :src="projectSrc(project.images.cover)"
                :srcset="projectSrcset(project.images.cover)"
                :sizes="i === 0 ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 50vw, 100vw'"
                alt=""
                width="1680"
                height="1050"
                :loading="i < 1 ? 'eager' : 'lazy'"
                :fetchpriority="i === 0 ? 'high' : undefined"
                decoding="async"
                class="aspect-[16/10] h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div class="flex flex-1 flex-col p-6 md:p-7">
              <p class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light">
                {{ project.category }}
                <span class="h-px w-5 bg-white/15"></span>
                <span class="text-white/55">{{ project.year }}</span>
              </p>
              <h3 class="mt-3 text-2xl font-bold tracking-tight transition-colors group-hover:text-accent-light md:text-3xl">
                {{ project.title }}
              </h3>
              <p class="mt-3 leading-relaxed text-white/70">{{ project.headline }}</p>
              <ul class="mt-5 flex flex-wrap gap-1.5">
                <li v-for="t in project.techStack" :key="t" class="chip">{{ techName(t) }}</li>
              </ul>
              <span class="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-white">
                Ver caso
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </section>

    <!-- Práctica -->
    <section class="container-content pb-28" aria-labelledby="practica-title">
      <div class="mb-8 max-w-2xl">
        <h2 id="practica-title" class="text-3xl font-bold tracking-tight md:text-4xl">
          Práctica y cursos
        </h2>
        <p class="mt-3 leading-relaxed text-white/65">
          Ejercicios que hice mientras aprendía (varios de cursos de Udemy).
          No son casos de estudio: los dejo con su código y su demo.
        </p>
      </div>

      <ul class="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07]">
        <li
          v-for="project in practice"
          :key="project.id"
          class="grid gap-3 px-5 py-5 md:grid-cols-[1.2fr_1.6fr_auto] md:items-center md:gap-8 md:px-6"
        >
          <div>
            <h3 class="text-base font-semibold text-white">{{ project.title }}</h3>
            <p class="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
              {{ project.year }} · {{ project.techStack.map(techName).join(" · ") }}
            </p>
          </div>
          <p class="text-sm leading-relaxed text-white/65">{{ project.summary }}</p>
          <div class="flex gap-2">
            <a
              v-if="project.repoUrl"
              :href="project.repoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80 transition-colors hover:border-accent/50 hover:text-white"
            >
              <font-awesome-icon :icon="['fab', 'github']" />
              Código
              <span class="sr-only">de {{ project.title }}</span>
            </a>
            <a
              v-if="project.liveUrl"
              :href="project.liveUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80 transition-colors hover:border-accent/50 hover:text-white"
            >
              Demo
              <span class="sr-only">de {{ project.title }}</span>
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-[10px]" />
            </a>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { projectSrc, projectSrcset } from "@/lib/img";

import { profile } from "@/data/profile";
import { techName } from "@/data/skills";
import { useProjects } from "@/stores/projects";
import { gsap, playOnEnter, prefersReducedMotion } from "@/lib/gsap";

const projects = useProjects();

const cases = computed(() =>
  projects.projectsCollection.filter((p) => p.status !== "Práctica")
);
const practice = computed(() =>
  projects.projectsCollection
    .filter((p) => p.status === "Práctica")
    .sort((a, b) => b.year - a.year)
);

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    gsap.from(".pv-in", { opacity: 0, y: 18, duration: 0.6, stagger: 0.07, ease: "power3.out" });
    const tl = gsap.timeline({ paused: true });
    tl.from(".pv-card", { opacity: 0, y: 28, duration: 0.6, stagger: 0.08, ease: "power3.out" });
    playOnEnter(tl, { trigger: ".pv-card", start: "top 90%" });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
