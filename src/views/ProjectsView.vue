<template>
  <div>
    <!-- ─────────── HEADER EDITORIAL ─────────── -->
    <section
      ref="headerRef"
      class="container-content pt-16 pb-10 md:pt-24 md:pb-14"
    >
      <p class="header-item eyebrow">
        <span class="h-px w-6 bg-accent-light"></span>
        Portafolio · Edition 01
      </p>

      <div
        class="mt-6 grid items-end gap-y-10 md:grid-cols-[1fr_auto] md:gap-x-16"
      >
        <h1
          class="header-item font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[7.5rem]"
        >
          Mis<br />
          <span class="text-gradient">proyectos.</span>
        </h1>

        <!-- Metadata strip editorial (alineado al baseline del título) -->
        <dl
          class="header-item grid grid-cols-2 gap-x-8 gap-y-5 md:border-l md:border-white/[0.08] md:pl-10"
        >
          <div>
            <dt class="mono-label text-white/40">/ total</dt>
            <dd class="mt-1.5 font-display text-3xl font-bold text-white md:text-4xl">
              {{ String(stats.total).padStart(2, "0") }}
            </dd>
          </div>
          <div>
            <dt class="mono-label text-white/40">/ destacados</dt>
            <dd
              class="mt-1.5 font-display text-3xl font-bold text-accent-light md:text-4xl"
            >
              {{ String(stats.featured).padStart(2, "0") }}
            </dd>
          </div>
          <div>
            <dt class="mono-label text-white/40">/ rango</dt>
            <dd
              class="mt-1.5 font-mono text-lg font-semibold tracking-tight text-white md:text-xl"
            >
              {{ stats.yearMin }} → {{ stats.yearMax }}
            </dd>
          </div>
          <div>
            <dt class="mono-label text-white/40">/ categorías</dt>
            <dd
              class="mt-1.5 font-mono text-lg font-semibold tracking-tight text-white md:text-xl"
            >
              {{ String(stats.categories).padStart(2, "0") }}
            </dd>
          </div>
        </dl>
      </div>

      <p
        class="header-item mt-10 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg"
      >
        Una selección curada de mi trabajo. Filtrá por categoría o tecnología
        para explorar lo que construyo y cómo lo pienso.
      </p>
    </section>

    <!-- ─────────── PROJECTS GRID ─────────── -->
    <section class="container-content pb-24">
      <Projects />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import Projects from "@/components/Projects.vue";
import { useProjects } from "@/stores/projects";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const projects = useProjects();
const headerRef = ref(null);
let ctx;

const stats = computed(() => {
  const all = projects.projectsCollection;
  const years = all.map((p) => p.year).filter(Boolean);
  const cats = new Set(all.map((p) => p.category || "Sin categoría"));
  return {
    total: all.length,
    featured: all.filter((p) => p.featured).length,
    yearMin: Math.min(...years),
    yearMax: Math.max(...years),
    categories: cats.size,
  };
});

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    gsap.from(".header-item", {
      opacity: 0,
      y: 40,
      filter: "blur(8px)",
      duration: 0.9,
      ease: "power4.out",
      stagger: { amount: 0.5 },
      clearProps: "filter",
    });
  }, headerRef.value);
});

onUnmounted(() => ctx?.revert());
</script>
