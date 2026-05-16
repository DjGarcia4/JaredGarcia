<template>
  <div
    v-if="learning"
    v-glow
    class="surface surface-hover group relative overflow-hidden p-8 md:p-12"
  >
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
    ></div>

    <div class="relative">
      <span
        class="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"
          ></span>
          <span
            class="relative inline-flex h-2 w-2 rounded-full bg-accent"
          ></span>
        </span>
        Estudiando ahora
      </span>

      <h3
        class="mt-5 font-display text-2xl font-bold tracking-tight md:text-4xl"
      >
        {{ learning.title }}
      </h3>

      <p class="mt-3 flex items-center gap-2 text-sm text-white/45">
        <font-awesome-icon
          :icon="['fas', 'certificate']"
          class="text-accent-light"
        />
        Impartido por
        <span class="font-medium text-white/80">{{ learning.issuer }}</span>
      </p>

      <p class="mt-4 max-w-3xl leading-relaxed text-white/55 md:text-lg">
        {{ learning.description }}
      </p>

      <div class="mt-6 flex flex-wrap gap-2">
        <span v-for="topic in learning.topics" :key="topic" class="chip">
          <font-awesome-icon
            :icon="['fas', 'book-open']"
            class="text-accent-light"
          />
          {{ topic }}
        </span>
      </div>

      <RouterLink
        :to="`/certificate/${learning.slug}`"
        class="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-accent-light"
      >
        Ver detalles
        <font-awesome-icon
          :icon="['fas', 'arrow-right']"
          class="text-xs transition-transform duration-300 group-hover:translate-x-1"
        />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useCertifications } from "@/stores/certifications";

const certifications = useCertifications();

const learning = computed(() =>
  certifications.certificationsCollection.find((c) => c.status === "En curso")
);
</script>
