<template>
  <nav
    class="h-16 flex justify-center items-center text-2sm md:text-2xl md:gap-12 text-center"
  >
    <Link to="home">Home</Link>
    <Link to="about">About Me</Link>
    <Link to="projects">Projects</Link>
  </nav>
</template>

<script setup>
import Link from "@/components/Link.vue";
</script>
