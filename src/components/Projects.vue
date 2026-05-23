<template>
  <div class="lg:grid lg:grid-cols-[260px_1fr] lg:gap-x-12 xl:grid-cols-[280px_1fr] xl:gap-x-16">
    <!-- ─────────── SIDEBAR FILTROS ─────────── -->
    <aside
      ref="sidebarRef"
      class="mb-10 lg:mb-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2 no-scrollbar"
    >
      <!-- Search -->
      <div class="filter-item">
        <p class="mono-label mb-2.5">/ search</p>
        <label class="relative block">
          <span class="sr-only">Buscar proyecto</span>
          <span
            class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-accent"
            aria-hidden="true"
            >›</span
          >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="type_here..."
            class="w-full rounded-lg border border-white/10 bg-ink-900/60 py-2.5 pl-9 pr-3 font-mono text-[13px] text-white placeholder:text-white/30 transition-colors focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </label>
      </div>

      <!-- Counter inline -->
      <div class="filter-item mt-5 flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
        <span class="h-1.5 w-1.5 rounded-full bg-accent animate-glow-pulse"></span>
        <span class="text-accent-light">{{ String(filteredProjects.length).padStart(2, "0") }}</span>
        <span class="text-white/30">/</span>
        <span>{{ String(totalProjects).padStart(2, "0") }} results</span>
      </div>

      <div class="filter-item my-6 h-px w-full bg-white/[0.06]"></div>

      <!-- Categorías como lista editorial con counts -->
      <div class="filter-item">
        <p class="mono-label mb-3 flex items-center justify-between">
          <span>/ category</span>
          <span class="text-white/25">{{ String(categoriesWithCounts.length - 1).padStart(2, "0") }}</span>
        </p>
        <ul class="space-y-0.5">
          <li v-for="cat in categoriesWithCounts" :key="cat.name">
            <button
              type="button"
              @click="activeCategory = cat.name"
              :class="[
                'group flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors duration-200',
                activeCategory === cat.name
                  ? 'bg-accent/10 text-white'
                  : 'text-white/55 hover:bg-white/[0.025] hover:text-white/85',
              ]"
            >
              <span class="flex min-w-0 items-center gap-2.5">
                <span
                  class="h-1 w-1 flex-shrink-0 rounded-full transition-colors"
                  :class="activeCategory === cat.name ? 'bg-accent' : 'bg-white/15 group-hover:bg-white/35'"
                ></span>
                <span class="truncate font-mono text-[12px] font-semibold uppercase tracking-[0.14em]">
                  {{ cat.name }}
                </span>
              </span>
              <span
                class="font-mono text-[10px] font-bold tabular-nums"
                :class="activeCategory === cat.name ? 'text-accent-light' : 'text-white/30'"
              >
                {{ String(cat.count).padStart(2, "0") }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div class="filter-item my-6 h-px w-full bg-white/[0.06]"></div>

      <!-- Tech stack -->
      <div v-if="techsWithCounts.length" class="filter-item">
        <p class="mono-label mb-3 flex items-center justify-between">
          <span>/ tech_stack</span>
          <span class="text-white/25">{{ String(techsWithCounts.length).padStart(2, "0") }}</span>
        </p>
        <ul class="space-y-0.5">
          <li v-for="tech in techsWithCounts" :key="tech.name">
            <button
              type="button"
              @click="toggleTech(tech.name)"
              :class="[
                'group flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors duration-200',
                selectedTechs.includes(tech.name)
                  ? 'bg-accent/10 text-white'
                  : 'text-white/55 hover:bg-white/[0.025] hover:text-white/85',
              ]"
            >
              <span class="flex min-w-0 items-center gap-2.5">
                <img
                  :src="`/img/skills/${tech.name}.svg`"
                  alt=""
                  class="h-3.5 w-3.5 flex-shrink-0 transition-opacity"
                  :class="selectedTechs.includes(tech.name) ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'"
                  aria-hidden="true"
                />
                <span class="truncate font-mono text-[12px] font-semibold uppercase tracking-[0.14em]">
                  {{ tech.name }}
                </span>
              </span>
              <span
                class="font-mono text-[10px] font-bold tabular-nums"
                :class="selectedTechs.includes(tech.name) ? 'text-accent-light' : 'text-white/30'"
              >
                {{ String(tech.count).padStart(2, "0") }}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Reset -->
      <div v-if="hasActiveFilters" class="filter-item mt-6">
        <button
          type="button"
          @click="resetFilters"
          class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-ink-900/40 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/55 transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent-light"
        >
          <font-awesome-icon :icon="['fas', 'rotate-left']" class="text-[10px]" />
          reset_filters
        </button>
      </div>
    </aside>

    <!-- ─────────── STREAM ─────────── -->
    <div class="space-y-14 md:space-y-20">
      <!-- Featured (solo cuando no hay filtros activos) -->
      <section v-if="!hasActiveFilters && featuredProjects.length">
        <header class="mb-6 flex items-end justify-between">
          <p class="eyebrow">
            <span class="h-px w-6 bg-accent-light"></span>
            Destacados
          </p>
          <span class="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
            {{ String(featuredProjects.length).padStart(2, "0") }} pieces
          </span>
        </header>

        <!-- Bento: primer card wide arriba, resto en grid -->
        <div
          ref="featuredGrid"
          :key="`f-${filterKey}`"
          class="grid gap-5 sm:grid-cols-2"
        >
          <!-- Hero featured -->
          <RouterLink
            v-if="featuredProjects[0]"
            v-glow
            :to="`/project/${featuredProjects[0].slug}`"
            class="project-card project-card-hero group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60 backdrop-blur-md transition-colors duration-300 hover:border-accent/40 sm:col-span-2"
          >
            <div class="flex items-center justify-between border-b border-white/[0.06] px-6 py-3.5">
              <span class="flex items-center gap-3 font-mono text-[11px] font-bold tracking-[0.2em] text-white/40">
                <span class="text-accent">#01</span>
                <span class="h-px w-6 bg-white/10"></span>
                <span class="text-accent-light">★ flagship</span>
              </span>
              <span class="mono-label">{{ featuredProjects[0].category }}</span>
            </div>

            <div class="relative aspect-[21/9] overflow-hidden">
              <img
                v-if="featuredProjects[0].images?.cover"
                :src="featuredProjects[0].images.cover"
                :alt="featuredProjects[0].title"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div
                v-else
                class="absolute inset-0 grid-overlay flex items-center justify-center bg-ink-900"
              >
                <span class="font-display text-6xl font-bold uppercase tracking-tight text-white/10 md:text-8xl">
                  {{ featuredProjects[0].title }}
                </span>
              </div>
              <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-900 via-ink-900/50 to-transparent"></div>

              <!-- Status pin -->
              <span
                v-if="featuredProjects[0].status"
                class="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur"
                :class="statusStyle(featuredProjects[0].status)"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current animate-glow-pulse"></span>
                {{ featuredProjects[0].status }}
              </span>
            </div>

            <div class="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
              <div class="min-w-0">
                <h3
                  class="font-display text-3xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-accent-light md:text-4xl"
                >
                  {{ featuredProjects[0].title }}
                </h3>
                <p class="mt-3 max-w-2xl line-clamp-2 font-sans text-base leading-relaxed text-white/55">
                  {{ featuredProjects[0].summary }}
                </p>

                <div class="mt-5 flex flex-wrap items-center gap-1.5">
                  <span
                    v-for="tech in featuredProjects[0].techStack?.slice(0, 6)"
                    :key="tech"
                    class="flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-950/60 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/65"
                  >
                    <img :src="`/img/skills/${tech}.svg`" alt="" class="h-3 w-3" aria-hidden="true" />
                    {{ tech }}
                  </span>
                  <span
                    v-if="(featuredProjects[0].techStack || []).length > 6"
                    class="rounded-md border border-white/10 bg-ink-950/60 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/45"
                  >
                    +{{ featuredProjects[0].techStack.length - 6 }}
                  </span>
                </div>
              </div>

              <div class="flex flex-shrink-0 items-center gap-6 md:flex-col md:items-end md:gap-3">
                <dl class="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] md:text-right">
                  <dt class="text-white/35">YEAR</dt>
                  <dd class="font-semibold text-white/80 tabular-nums">{{ featuredProjects[0].year }}</dd>
                  <dt class="text-white/35">ROLE</dt>
                  <dd class="truncate font-semibold text-white/80" :title="featuredProjects[0].role">
                    {{ shortRole(featuredProjects[0].role) }}
                  </dd>
                </dl>
                <span
                  class="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-white/65 transition-colors group-hover:text-accent-light"
                >
                  view
                  <font-awesome-icon
                    :icon="['fas', 'arrow-right']"
                    class="text-[10px] transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </RouterLink>

          <!-- Featured 2 y 3 (cards medianos) -->
          <RouterLink
            v-for="(project, i) in featuredProjects.slice(1)"
            :key="project.id"
            v-glow
            :to="`/project/${project.slug}`"
            class="project-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60 backdrop-blur-md transition-colors duration-300 hover:border-accent/40"
          >
            <div class="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <span class="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white/40">
                <span class="text-accent">#{{ String(i + 2).padStart(2, "0") }}</span>
                <span class="text-accent-light">★</span>
              </span>
              <span class="mono-label">{{ project.category }}</span>
            </div>

            <div class="relative aspect-[16/10] overflow-hidden">
              <img
                v-if="project.images?.cover"
                :src="project.images.cover"
                :alt="project.title"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                v-else
                class="absolute inset-0 grid-overlay flex items-center justify-center bg-ink-900"
              >
                <span class="font-display text-3xl font-bold uppercase tracking-tight text-white/12">
                  {{ project.title }}
                </span>
              </div>
              <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent"></div>

              <span
                v-if="project.status"
                class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur"
                :class="statusStyle(project.status)"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current animate-glow-pulse"></span>
                {{ project.status }}
              </span>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <h3
                class="font-display text-xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-accent-light"
              >
                {{ project.title }}
              </h3>
              <p class="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-white/55">
                {{ project.summary }}
              </p>

              <div class="mt-4 flex flex-wrap items-center gap-1.5">
                <span
                  v-for="tech in project.techStack?.slice(0, 4)"
                  :key="tech"
                  class="flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/65"
                >
                  <img :src="`/img/skills/${tech}.svg`" alt="" class="h-3 w-3" aria-hidden="true" />
                  {{ tech }}
                </span>
                <span
                  v-if="(project.techStack || []).length > 4"
                  class="rounded-md border border-white/10 bg-ink-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/45"
                >
                  +{{ project.techStack.length - 4 }}
                </span>
              </div>

              <span
                class="mt-5 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-white/65 transition-colors group-hover:text-accent-light"
              >
                <span class="text-accent">›</span>
                view_project
                <font-awesome-icon
                  :icon="['fas', 'arrow-right']"
                  class="text-[10px] transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- Resto (o todos los filtrados) -->
      <section v-if="restProjects.length || (hasActiveFilters && filteredProjects.length)">
        <header class="mb-6 flex items-end justify-between">
          <p class="eyebrow">
            <span class="h-px w-6 bg-accent-light"></span>
            {{ hasActiveFilters ? "Resultados" : "Todo el catálogo" }}
          </p>
          <span class="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
            {{ String(displayProjects.length).padStart(2, "0") }} {{ hasActiveFilters ? "matches" : "pieces" }}
          </span>
        </header>

        <div
          ref="restGrid"
          :key="`r-${filterKey}`"
          v-stagger
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          <RouterLink
            v-for="(project, i) in displayProjects"
            :key="project.id"
            v-glow
            :to="`/project/${project.slug}`"
            class="project-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60 backdrop-blur-md transition-colors duration-300 hover:border-accent/40"
          >
            <div class="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <span class="font-mono text-[11px] font-bold tracking-[0.2em] text-white/40">
                #{{ String(displayStartIndex + i).padStart(2, "0") }}
              </span>
              <span class="mono-label">{{ project.category }}</span>
            </div>

            <div class="relative aspect-[16/10] overflow-hidden">
              <img
                v-if="project.images?.cover"
                :src="project.images.cover"
                :alt="project.title"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                v-else
                class="absolute inset-0 grid-overlay flex items-center justify-center bg-ink-900"
              >
                <span class="font-display text-2xl font-bold uppercase tracking-tight text-white/12">
                  {{ project.title }}
                </span>
              </div>
              <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent"></div>

              <span
                v-if="project.status"
                class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur"
                :class="statusStyle(project.status)"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current animate-glow-pulse"></span>
                {{ project.status }}
              </span>

              <span
                v-if="project.featured"
                class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent-light"
              >
                ★ featured
              </span>
            </div>

            <div class="flex flex-1 flex-col p-5">
              <h3
                class="font-display text-lg font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-accent-light"
              >
                {{ project.title }}
              </h3>
              <p class="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-white/55">
                {{ project.summary }}
              </p>

              <div class="mt-4 flex flex-wrap items-center gap-1.5">
                <span
                  v-for="tech in project.techStack?.slice(0, 4)"
                  :key="tech"
                  class="flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/65"
                >
                  <img :src="`/img/skills/${tech}.svg`" alt="" class="h-3 w-3" aria-hidden="true" />
                  {{ tech }}
                </span>
                <span
                  v-if="(project.techStack || []).length > 4"
                  class="rounded-md border border-white/10 bg-ink-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/45"
                >
                  +{{ project.techStack.length - 4 }}
                </span>
              </div>

              <div class="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-[11px]">
                <span class="flex items-center gap-1.5">
                  <span class="text-white/35">YEAR</span>
                  <span class="font-semibold text-white/80 tabular-nums">{{ project.year }}</span>
                </span>
                <span
                  class="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white/55 transition-colors group-hover:text-accent-light"
                >
                  view
                  <font-awesome-icon
                    :icon="['fas', 'arrow-right']"
                    class="text-[10px] transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- Empty state -->
      <div
        v-if="!filteredProjects.length"
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
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useProjects } from "@/stores/projects";
import { statusStyle } from "@/lib/status";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const projects = useProjects();

const activeCategory = ref("Todos");
const searchQuery = ref("");
const selectedTechs = ref([]);

const sidebarRef = ref(null);
let ctx;

const totalProjects = computed(() => projects.projectsCollection.length);

const hasActiveFilters = computed(
  () =>
    activeCategory.value !== "Todos" ||
    searchQuery.value.trim() !== "" ||
    selectedTechs.value.length > 0
);

const filterKey = computed(
  () => `${activeCategory.value}|${searchQuery.value}|${selectedTechs.value.join(",")}`
);

const categoriesWithCounts = computed(() => {
  const counts = new Map();
  projects.projectsCollection.forEach((p) => {
    const cat = p.category || "Sin categoría";
    counts.set(cat, (counts.get(cat) || 0) + 1);
  });
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  return [{ name: "Todos", count: projects.projectsCollection.length }, ...sorted];
});

const techsWithCounts = computed(() => {
  const counts = new Map();
  projects.projectsCollection.forEach((p) => {
    (p.techStack || []).forEach((t) => {
      counts.set(t, (counts.get(t) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
});

const shortRole = (role) => {
  const r = role || "";
  return r.length > 18 ? r.slice(0, 17).trimEnd() + "…" : r;
};

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
      p.slug.toLowerCase().includes(query) ||
      (p.category || "").toLowerCase().includes(query);

    const matchTech =
      selectedTechs.value.length === 0 ||
      selectedTechs.value.every((tech) => p.techStack?.includes(tech));

    return matchCategory && matchSearch && matchTech;
  });
});

// Featured = top 3 destacados (cuando no hay filtros activos).
const featuredProjects = computed(() =>
  projects.projectsCollection.filter((p) => p.featured).slice(0, 3)
);

// Resto = no featured (cuando no hay filtros activos).
const restProjects = computed(() => {
  if (hasActiveFilters.value) return [];
  return projects.projectsCollection.filter((p) => !p.featured);
});

// Lo que se muestra en la grilla principal: resto cuando no hay filtros,
// el filtrado completo cuando sí los hay.
const displayProjects = computed(() =>
  hasActiveFilters.value ? filteredProjects.value : restProjects.value
);

// Índice de inicio para la numeración: continúa después de los featured cuando
// no hay filtros activos, arranca en 1 cuando sí.
const displayStartIndex = computed(() =>
  hasActiveFilters.value ? 1 : featuredProjects.value.length + 1
);

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    gsap.from(".filter-item", {
      opacity: 0,
      x: -16,
      duration: 0.5,
      ease: "power3.out",
      stagger: { amount: 0.35 },
    });
  }, sidebarRef.value);
});

onUnmounted(() => ctx?.revert());
</script>
