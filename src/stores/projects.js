import { defineStore } from "pinia";
import { computed } from "vue";
import { getProjects } from "@/data/localized";

// Reactivo al idioma: getProjects() lee el locale actual.
export const useProjects = defineStore("projects", () => {
  const projectsCollection = computed(() =>
    [...getProjects()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  return { projectsCollection };
});
