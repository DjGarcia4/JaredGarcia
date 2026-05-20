<template>
  <div class="space-y-10">
    <!-- Toolbar brutalist -->
    <div class="space-y-6">
      <!-- Buscador estilo prompt + counter -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label class="relative block w-full max-w-md">
          <span class="sr-only">Buscar proyecto</span>
          <span
            class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-accent"
            aria-hidden="true"
            >›</span
          >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="search_projects..."
            class="w-full rounded-lg border border-white/10 bg-ink-900/60 py-3 pl-10 pr-4 font-mono text-sm text-white placeholder:text-white/30 transition-colors focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          <span
            v-if="!searchQuery"
            class="pointer-events-none absolute top-1/2 -translate-y-1/2 font-mono text-sm text-accent/70 animate-blink"
            :style="{ left: 'calc(2.5rem + 11ch)' }"
            aria-hidden="true"
            >▌</span
          >
        </label>

        <!-- Counter results -->
        <div
          class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/45"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-accent animate-glow-pulse"></span>
          <span>
            {{ String(filteredProjects.length).padStart(2, "0") }} /
            {{ String(totalProjects).padStart(2, "0") }}
          </span>
          <span>results</span>
        </div>
      </div>

      <!-- Categorías -->
      <div>
        <p class="mono-label mb-2">/ category</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            @click="activeCategory = cat"
            :class="[
              'rounded-md border px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-200',
              activeCategory === cat
                ? 'border-accent bg-accent text-ink-950'
                : 'border-white/10 bg-ink-900/60 text-white/55 hover:border-white/30 hover:text-white',
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Tecnologías -->
      <div v-if="allTechs.length">
        <p class="mono-label mb-2">/ tech_stack</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tech in allTechs"
            :key="tech"
            type="button"
            @click="toggleTech(tech)"
            :class="[
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide transition-all duration-200',
              selectedTechs.includes(tech)
                ? 'border-accent/60 bg-accent/15 text-accent-light'
                : 'border-white/10 bg-ink-900/40 text-white/50 hover:border-white/25 hover:text-white',
            ]"
          >
            <img
              :src="`/img/skills/${tech}.svg`"
              alt=""
              class="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {{ tech }}
          </button>
        </div>
      </div>
    </div>

    <!-- Grid de proyectos -->
    <div
      v-if="filteredProjects.length"
      :key="filterKey"
      v-stagger
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Project
        v-for="(project, i) in filteredProjects"
        :key="project.id"
        :project="project"
        :index="i"
      />
    </div>

    <!-- Empty state brutalist -->
    <div
      v-else
      class="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-dashed border-white/15 bg-ink-900/40 py-20 text-center"
    >
      <div class="grid-overlay absolute inset-0 opacity-30"></div>
      <font-awesome-icon
        :icon="['fas', 'folder-open']"
        class="relative text-3xl text-white/20"
      />
      <p class="relative font-mono text-sm uppercase tracking-[0.2em] text-white/55">
        no results found
      </p>
      <button
        type="button"
        class="relative inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light transition-all hover:border-accent hover:bg-accent hover:text-ink-950"
        @click="resetFilters"
      >
        <span>›</span>
        reset_filters
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

const totalProjects = computed(() => projects.projectsCollection.length);

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
