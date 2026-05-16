<template>
  <header
    class="fixed top-0 z-30 w-full transition-all duration-300"
    :class="
      scrolled
        ? 'border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-xl'
        : 'border-b border-transparent'
    "
  >
    <div class="container-content flex h-20 items-center justify-between">
      <RouterLink
        :to="{ name: 'home' }"
        class="group flex items-center gap-2.5"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-ink-950 transition-transform duration-300 group-hover:rotate-6"
        >
          JG
        </span>
        <span class="font-display text-lg font-semibold text-white">
          Jared Garcia
        </span>
      </RouterLink>

      <nav class="flex items-center gap-0.5 md:gap-1">
        <Link to="home">Inicio</Link>
        <Link to="projects">Proyectos</Link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from "vue-router";
import Link from "@/components/Link.vue";

defineProps({
  scrolled: { type: Boolean, default: false },
});
</script>
