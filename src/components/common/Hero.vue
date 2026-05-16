<template>
  <section ref="heroRef" class="relative overflow-hidden">
    <!-- Glow controlado (parallax con scroll) -->
    <div
      ref="glowRef"
      class="pointer-events-none absolute left-1/2 top-24 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px] animate-glow-pulse"
    ></div>

    <div
      ref="contentRef"
      class="container-content relative flex min-h-[70vh] flex-col items-center justify-center py-10 text-center"
    >
      <p class="eyebrow">
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"
          ></span>
          <span
            class="relative inline-flex h-2 w-2 rounded-full bg-accent"
          ></span>
        </span>
        Disponible para nuevos proyectos
      </p>

      <p class="mt-6 text-lg font-medium text-white/45 md:text-xl">
        Hola, soy
        <span class="font-semibold text-white">{{ profile.name }}</span>
      </p>

      <h1
        class="mt-3 font-display text-[2.6rem] font-bold leading-[1.06] tracking-tight md:text-7xl lg:text-[5.2rem]"
      >
        Frontend Developer
        <br />
        <span class="text-gradient">& UX/UI Designer</span>
      </h1>

      <p class="mt-7 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
        {{ profile.bio }}
      </p>

      <dl
        class="mt-10 grid w-full max-w-lg grid-cols-3 divide-x divide-white/[0.08] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-md"
      >
        <div v-for="stat in stats" :key="stat.key" class="px-3 py-5">
          <dd class="font-display text-3xl font-bold text-gradient md:text-4xl">
            {{ display[stat.key] }}{{ stat.suffix }}
          </dd>
          <dt
            class="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-white/45"
          >
            {{ stat.label }}
          </dt>
        </div>
      </dl>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="btn-primary"
          @click="router.push({ name: 'projects' })"
        >
          Ver proyectos
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </button>
        <button type="button" class="btn-ghost" @click="scrollToContact">
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
          Contactame
        </button>
        <a
          :href="profile.cvUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ghost"
        >
          <font-awesome-icon :icon="['fas', 'file-arrow-down']" />
          CV
        </a>
      </div>

      <div class="mt-8 flex gap-3">
        <a
          :href="profile.socials.github"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fab', 'github']" />
        </a>
        <a
          :href="profile.socials.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fab', 'linkedin']" />
        </a>
        <a
          :href="`mailto:${profile.email}`"
          aria-label="Email"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </a>
      </div>
    </div>

    <!-- Marquee de tecnologías -->
    <div class="relative flex overflow-hidden border-y border-white/[0.06] py-6">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent"
      ></div>
      <div
        class="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent"
      ></div>
      <div class="flex w-max animate-marquee gap-10">
        <div
          v-for="(skill, i) in marqueeSkills"
          :key="i"
          class="flex items-center gap-2.5 text-white/45"
        >
          <img
            :src="`/img/skills/${skill.image}.svg`"
            :alt="skill.name"
            class="h-6 w-6"
          />
          <span class="text-sm font-medium">{{ skill.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const router = useRouter();
const marqueeSkills = [...skills, ...skills];

const heroRef = ref(null);
const glowRef = ref(null);
const contentRef = ref(null);

// Métricas derivadas de los datos reales.
const targets = {
  projects: projects.length,
  years: new Date().getFullYear() - Math.min(...projects.map((p) => p.year)),
  techs: skills.length,
};

const stats = [
  { key: "projects", suffix: "", label: "Proyectos" },
  { key: "years", suffix: "+", label: "Años creando" },
  { key: "techs", suffix: "", label: "Tecnologías" },
];

const display = reactive({ projects: 0, years: 0, techs: 0 });

let ctx;

const scrollToContact = () => {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
};

onMounted(() => {
  if (prefersReducedMotion()) {
    Object.assign(display, targets);
    return;
  }

  ctx = gsap.context(() => {
    // Entrada escalonada al cargar la página.
    gsap.from(contentRef.value.children, {
      opacity: 0,
      y: 44,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
    });

    // Contador: los números suben de 0 a su valor.
    gsap.to(display, {
      ...targets,
      duration: 1.6,
      ease: "power2.out",
      delay: 0.7,
      snap: { projects: 1, years: 1, techs: 1 },
    });

    // Parallax sincronizado con el scroll.
    const scrollTrigger = {
      trigger: heroRef.value,
      start: "top top",
      end: "bottom top",
      scrub: true,
    };

    gsap.to(glowRef.value, { yPercent: 55, ease: "none", scrollTrigger });
    gsap.to(contentRef.value, {
      yPercent: -10,
      opacity: 0.25,
      ease: "none",
      scrollTrigger,
    });
  }, heroRef.value);
});

onUnmounted(() => ctx?.revert());
</script>
