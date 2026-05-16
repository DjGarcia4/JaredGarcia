<template>
  <RouterLink
    v-glow
    :to="`/project/${project.slug}`"
    class="surface surface-hover group flex h-full flex-col overflow-hidden"
  >
    <div class="relative aspect-video overflow-hidden">
      <img
        v-if="project.images?.cover"
        :src="project.images.cover"
        :alt="project.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 via-ink-850 to-accent-soft/30 px-6 text-center"
      >
        <span class="font-display text-2xl font-bold text-white/25">
          {{ project.title }}
        </span>
      </div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent"
      ></div>

      <span
        v-if="project.featured"
        class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent-light"
      >
        <font-awesome-icon :icon="['fas', 'star']" />
        Destacado
      </span>

      <span
        v-if="project.status"
        class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur"
        :class="statusStyle(project.status)"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
        {{ project.status }}
      </span>

      <div class="absolute bottom-3 left-3 flex gap-1.5">
        <span
          v-for="tech in project.techStack"
          :key="tech"
          class="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-ink-900/80 backdrop-blur"
        >
          <img :src="`/img/skills/${tech}.svg`" :alt="tech" class="h-4 w-4" />
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <p class="text-xs font-medium uppercase tracking-wider text-accent-light">
        {{ project.category }}
      </p>
      <h3
        class="mt-1.5 font-display text-xl font-bold text-white transition-colors group-hover:text-accent-light"
      >
        {{ project.title }}
      </h3>
      <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
        {{ project.summary }}
      </p>

      <div class="mt-4 flex items-center gap-4 text-xs text-white/40">
        <span class="flex items-center gap-1.5">
          <font-awesome-icon :icon="['fas', 'calendar']" />
          {{ project.year }}
        </span>
        <span class="flex items-center gap-1.5">
          <font-awesome-icon :icon="['fas', 'users']" />
          {{ project.team }}
        </span>
      </div>

      <span
        class="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-white/80 transition-colors group-hover:text-accent-light"
      >
        Ver proyecto
        <font-awesome-icon
          :icon="['fas', 'arrow-right']"
          class="text-xs transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </div>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { statusStyle } from "@/lib/status";

defineProps({
  project: { type: Object, required: true },
});
</script>
