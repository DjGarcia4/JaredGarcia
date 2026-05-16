<template>
  <section class="container-content py-20 md:py-28">
    <TitleSection eyebrow="Actualmente">
      En qué estoy trabajando
    </TitleSection>

    <div
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
          Trabajando ahora
        </span>

        <h3
          class="mt-5 font-display text-2xl font-bold tracking-tight md:text-4xl"
        >
          {{ current.role }}
          <span class="text-gradient">@ {{ current.company }}</span>
        </h3>

        <p class="mt-4 max-w-3xl leading-relaxed text-white/55 md:text-lg">
          {{ current.description }}
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <span v-for="item in current.focus" :key="item" class="chip">
            <font-awesome-icon
              :icon="['fas', 'bolt']"
              class="text-accent-light"
            />
            {{ item }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import { current } from "@/data/experience";
</script>
