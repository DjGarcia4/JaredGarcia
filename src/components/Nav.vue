<template>
  <nav
    class="h-16 flex justify-center items-center text-2sm md:text-2xl md:gap-12 text-center"
  >
    <Link to="home">Inicio</Link>
    <Link to="about">Sobre Mi</Link>
    <Link to="projects">Proyectos</Link>
  </nav>
</template>

<script setup>
import Link from "@/components/Link.vue";
</script>
