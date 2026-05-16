import { defineStore } from "pinia";
import { ref } from "vue";
import { projects } from "@/data/projects";

export const useProjects = defineStore("projects", () => {
  const projectsCollection = ref(
    [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  return { projectsCollection };
});
