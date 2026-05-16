<template>
  <div class="space-y-8">
    <!-- Filtros -->
    <div class="space-y-5">
      <!-- Buscador -->
      <div class="relative max-w-md">
        <font-awesome-icon
          :icon="['fas', 'magnifying-glass']"
          class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar proyecto..."
          class="field pl-10"
        />
      </div>

      <!-- Categorías -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          @click="activeCategory = cat"
          :class="[
            'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200',
            activeCategory === cat
              ? 'bg-accent text-ink-950'
              : 'border border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white',
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Tecnologías -->
      <div v-if="allTechs.length" class="flex flex-wrap gap-2">
        <button
          v-for="tech in allTechs"
          :key="tech"
          type="button"
          @click="toggleTech(tech)"
          :class="[
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
            selectedTechs.includes(tech)
              ? 'border border-accent/40 bg-accent/15 text-accent-light'
              : 'border border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white',
          ]"
        >
          <img :src="`/img/skills/${tech}.svg`" :alt="tech" class="h-4 w-4" />
          <span class="capitalize">{{ tech }}</span>
        </button>
      </div>
    </div>

    <!-- Grilla -->
    <div
      v-if="filteredProjects.length"
      :key="filterKey"
      v-stagger
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Project
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
      />
    </div>

    <div
      v-else
      class="surface flex flex-col items-center gap-3 py-20 text-center"
    >
      <font-awesome-icon
        :icon="['fas', 'folder-open']"
        class="text-3xl text-white/20"
      />
      <p class="text-white/55">No hay proyectos que coincidan con el filtro.</p>
      <button type="button" class="btn-ghost" @click="resetFilters">
        Limpiar filtros
      </button>
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

// Remonta la grilla (y reejecuta v-stagger) al cambiar categoría o tecnologías.
const filterKey = computed(
  () => `${activeCategory.value}|${selectedTechs.value.join(",")}`
);

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
  selectedTechs.value = selectedTechs.value.includes(tech)
    ? selectedTechs.value.filter((t) => t !== tech)
    : [...selectedTechs.value, tech];
};

const resetFilters = () => {
  activeCategory.value = "Todos";
  searchQuery.value = "";
  selectedTechs.value = [];
};

const filteredProjects = computed(() => {
  return projects.projectsCollection.filter((p) => {
    const matchCategory =
      activeCategory.value === "Todos" || p.category === activeCategory.value;

    const query = searchQuery.value.trim().toLowerCase();
    const matchSearch =
      query === "" ||
      p.title.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query);

    const matchTech =
      selectedTechs.value.length === 0 ||
      selectedTechs.value.every((tech) => p.techStack?.includes(tech));

    return matchCategory && matchSearch && matchTech;
  });
});
</script>
