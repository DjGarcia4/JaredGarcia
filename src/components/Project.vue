<template>
  <RouterLink
    v-glow
    :to="`/project/${project.slug}`"
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60 backdrop-blur-md transition-colors duration-300 hover:border-accent/40"
  >
    <!-- Header brutalist: número + categoría -->
    <div
      class="flex items-center justify-between border-b border-white/[0.06] px-5 py-3"
    >
      <span class="font-mono text-[11px] font-bold tracking-[0.2em] text-white/40">
        #{{ String(index + 1).padStart(2, "0") }}
      </span>
      <span class="mono-label">{{ project.category }}</span>
    </div>

    <!-- Cover -->
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
        <span class="font-display text-2xl font-bold uppercase tracking-tight text-white/15">
          {{ project.title }}
        </span>
      </div>

      <!-- Gradiente para legibilidad de los pins -->
      <div
        class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink-900/80 via-ink-900/20 to-transparent"
      ></div>
      <div
        class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent"
      ></div>

      <!-- Status pin: estilo terminal -->
      <span
        v-if="project.status"
        class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider backdrop-blur"
        :class="statusStyle(project.status)"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current animate-glow-pulse"></span>
        {{ project.status }}
      </span>

      <!-- Featured marker -->
      <span
        v-if="project.featured"
        class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md border border-accent/40 bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent-light"
      >
        ★ featured
      </span>

      <!-- Tech pile en la base de la cover -->
      <div class="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
        <span
          v-for="tech in project.techStack?.slice(0, 5)"
          :key="tech"
          class="flex items-center gap-1.5 rounded-md border border-white/10 bg-ink-950/85 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur"
        >
          <img
            :src="`/img/skills/${tech}.svg`"
            alt=""
            class="h-3 w-3"
            aria-hidden="true"
          />
          {{ tech }}
        </span>
        <span
          v-if="project.techStack && project.techStack.length > 5"
          class="rounded-md border border-white/10 bg-ink-950/85 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/55 backdrop-blur"
        >
          +{{ project.techStack.length - 5 }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-5">
      <h3
        class="font-display text-xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-accent-light"
      >
        {{ project.title }}
      </h3>
      <p class="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-white/55">
        {{ project.summary }}
      </p>

      <!-- Metadata como key-value brutalist -->
      <dl
        class="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-white/[0.06] pt-4 font-mono text-[11px]"
      >
        <div class="flex items-center justify-between">
          <dt class="text-white/35">YEAR</dt>
          <dd class="font-semibold text-white/80">{{ project.year }}</dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="text-white/35">ROLE</dt>
          <dd class="truncate font-semibold text-white/80" :title="project.role">
            {{ shortRole }}
          </dd>
        </div>
      </dl>

      <!-- CTA estilo prompt -->
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
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { statusStyle } from "@/lib/status";

const props = defineProps({
  project: { type: Object, required: true },
  index: { type: Number, default: 0 },
});

const shortRole = computed(() => {
  const r = props.project.role || "";
  return r.length > 18 ? r.slice(0, 17).trimEnd() + "…" : r;
});
</script>
