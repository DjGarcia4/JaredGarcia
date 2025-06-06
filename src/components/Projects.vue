<template>
  <div class="space-y-6">
    <!-- Filtros -->
    <div class="space-y-4">
      <!-- Filtro por categoría -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-md',
            activeCategory === cat
              ? 'bg-primary/90 text-white shadow-[0_0_0_2px] shadow-primary'
              : 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Buscador -->
      <input
        v-model="searchQuery"
        type="text"
        placeholder="🔍 Buscar proyecto..."
        class="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 backdrop-blur-md placeholder:text-white/60"
      />

      <div class="flex flex-wrap gap-2">
        <button
          v-for="tech in allTechs"
          :key="tech"
          @click="toggleTech(tech)"
          :class="[
            'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all backdrop-blur',
            selectedTechs.includes(tech)
              ? 'bg-green-500 text-white shadow'
              : 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
          ]"
        >
          <img :src="`/img/skills/${tech}.svg`" :alt="tech" class="w-4 h-4" />
          <span class="capitalize">{{ tech }}</span>
        </button>
      </div>
    </div>

    <!-- Grilla de proyectos -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
    >
      <Project
        data-aos="fade-up"
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useProjects } from "@/stores/projects";
import Project from "@/components/Project.vue";

const projects = useProjects();

const activeCategory = ref("Todos");
const searchQuery = ref("");
const selectedTechs = ref([]);

const categories = computed(() => {
  const base = projects.projectsCollection.map(
    (p) => p.category || "Sin categoría"
  );
  return ["Todos", ...new Set(base)];
});

const allTechs = computed(() => {
  const all = projects.projectsCollection.flatMap((p) => p.techStack || []);
  return [...new Set(all)];
});

const toggleTech = (tech) => {
  if (selectedTechs.value.includes(tech)) {
    selectedTechs.value = selectedTechs.value.filter((t) => t !== tech);
  } else {
    selectedTechs.value.push(tech);
  }
};

const filteredProjects = computed(() => {
  return projects.projectsCollection.filter((p) => {
    const matchCategory =
      activeCategory.value === "Todos" || p.category === activeCategory.value;

    const matchSearch =
      searchQuery.value.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchTech =
      selectedTechs.value.length === 0 ||
      selectedTechs.value.every((tech) => p.techStack?.includes(tech));

    return matchCategory && matchSearch && matchTech;
  });
});
</script>
