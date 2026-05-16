<template>
  <div v-if="project" class="container-content max-w-5xl py-16 md:py-20">
    <RouterLink
      :to="{ name: 'projects' }"
      class="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-accent-light"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" />
      Volver a proyectos
    </RouterLink>

    <!-- Encabezado -->
    <div class="reveal mt-8">
      <p class="text-sm font-medium uppercase tracking-wider text-accent-light">
        {{ project.category }}
      </p>
      <h1
        class="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl"
      >
        {{ project.title }}
      </h1>
      <p class="mt-3 max-w-2xl text-lg text-white/55">
        {{ project.summary }}
      </p>
    </div>

    <!-- Metadata -->
    <div class="reveal mt-6 flex flex-wrap gap-2">
      <span
        v-if="project.status"
        class="chip"
        :class="statusStyle(project.status)"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
        {{ project.status }}
      </span>
      <span class="chip">
        <font-awesome-icon :icon="['fas', 'user-gear']" />
        {{ project.role }}
      </span>
      <span class="chip">
        <font-awesome-icon :icon="['fas', 'calendar']" />
        {{ project.year }}
      </span>
      <span v-if="project.duration" class="chip">
        <font-awesome-icon :icon="['fas', 'clock']" />
        {{ project.duration }}
      </span>
      <span v-if="project.team" class="chip">
        <font-awesome-icon :icon="['fas', 'users']" />
        {{ project.team }}
      </span>
      <span
        v-if="project.featured"
        class="chip border-accent/30 bg-accent/10 text-accent-light"
      >
        <font-awesome-icon :icon="['fas', 'star']" />
        Destacado
      </span>
    </div>

    <!-- Imagen principal -->
    <div class="reveal-scale surface mt-10 overflow-hidden p-0">
      <img
        v-if="project.images?.cover"
        :src="project.images.cover"
        :alt="project.title"
        class="aspect-video w-full object-cover"
      />
      <div
        v-else
        class="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-ink-800 via-ink-850 to-accent-soft/30"
      >
        <span class="font-display text-3xl font-bold text-white/25 md:text-5xl">
          {{ project.title }}
        </span>
      </div>
    </div>

    <!-- Tecnologías -->
    <div class="reveal mt-8 flex flex-wrap gap-2">
      <span v-for="tech in project.techStack" :key="tech" class="chip">
        <img :src="`/img/skills/${tech}.svg`" :alt="tech" class="h-4 w-4" />
        <span class="capitalize">{{ tech }}</span>
      </span>
    </div>

    <!-- Descripción -->
    <div class="reveal mt-10 grid gap-10 md:grid-cols-3">
      <h2 class="font-display text-xl font-bold text-white">
        Sobre el proyecto
      </h2>
      <p class="text-white/70 md:col-span-2 md:text-lg md:leading-relaxed">
        {{ project.description }}
      </p>
    </div>

    <!-- Características -->
    <div
      v-if="project.features?.length"
      class="reveal mt-12 border-t border-white/[0.06] pt-12"
    >
      <h2 class="font-display text-xl font-bold text-white">
        Funcionalidades destacadas
      </h2>
      <div v-stagger class="mt-6 grid gap-4 sm:grid-cols-2">
        <div
          v-for="(feature, i) in project.features"
          :key="i"
          v-glow
          class="surface flex items-start gap-3 p-5"
        >
          <font-awesome-icon
            :icon="['fas', 'circle-check']"
            class="mt-0.5 shrink-0 text-accent-light"
          />
          <p class="text-sm leading-relaxed text-white/75">{{ feature }}</p>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="project.tags?.length" class="reveal mt-10 flex flex-wrap gap-2">
      <span v-for="tag in project.tags" :key="tag" class="text-sm text-white/40">
        #{{ tag }}
      </span>
    </div>

    <!-- Enlaces -->
    <div
      class="reveal mt-12 flex flex-wrap gap-3 border-t border-white/[0.06] pt-10"
    >
      <a
        v-if="project.liveUrl"
        :href="project.liveUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-primary"
      >
        Ver sitio en vivo
        <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
      </a>
      <a
        v-if="project.repoUrl"
        :href="project.repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-ghost"
      >
        <font-awesome-icon :icon="['fab', 'github']" />
        Ver código
      </a>
    </div>
  </div>

  <div
    v-else
    class="container-content flex flex-col items-center gap-4 py-32 text-center"
  >
    <font-awesome-icon
      :icon="['fas', 'folder-open']"
      class="text-4xl text-white/20"
    />
    <p class="text-white/55">No se encontró el proyecto.</p>
    <RouterLink :to="{ name: 'projects' }" class="btn-ghost">
      Volver a proyectos
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useProjects } from "@/stores/projects";
import { statusStyle } from "@/lib/status";

const route = useRoute();
const projects = useProjects();

const project = computed(() =>
  projects.projectsCollection.find((p) => p.slug === route.params.slug)
);
</script>
