<template>
  <div
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
  >
    <Project
      data-aos="fade-up"
      v-for="project in projects.projectsCollection"
      :key="project.id"
      :project="project"
    />
  </div>
</template>

<script setup>
import Project from "@/components/Project.vue";
import { useProjects } from "@/stores/projects";
const projects = useProjects();
</script>
