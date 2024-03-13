<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
  >
    <Project data-aos="fade-up" v-for="i in projects.amount" />
  </div>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import Project from "@/components/Project.vue";

defineProps({
  projects: {
    type: Object,
  },
});
</script>

<style scoped></style>
