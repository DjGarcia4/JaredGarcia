<template>
  <div class="overflow-hidden">
    <section class="container-content py-16 md:py-24">
      <p class="eyebrow animate-fade-up">
        <span class="h-px w-6 bg-accent-light"></span>
        Portafolio
      </p>
      <h1
        class="mt-5 animate-fade-up font-display text-4xl font-bold tracking-tight md:text-6xl"
        style="animation-delay: 0.08s"
      >
        Mis <span class="text-gradient">proyectos</span>
      </h1>
      <p
        class="mt-6 max-w-2xl animate-fade-up text-lg text-white/55"
        style="animation-delay: 0.16s"
      >
        Una selección de mi trabajo y mi pasión por la programación. Filtrá por
        categoría o tecnología para explorar.
      </p>
    </section>

    <section class="container-content pb-24">
      <Projects />
    </section>
  </div>
</template>

<script setup>
import Projects from "@/components/Projects.vue";
</script>
