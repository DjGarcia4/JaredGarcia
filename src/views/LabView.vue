<template>
  <div class="container-content pb-28 pt-16 md:pt-24">
    <header class="max-w-3xl">
      <p class="eyebrow"><span class="h-px w-6 bg-accent-light"></span>{{ t("lab.eyebrow") }}</p>
      <h1 class="mt-5 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
        {{ t("lab.titleA") }} <span class="text-gradient">{{ t("lab.titleB") }}</span>
      </h1>
      <p class="mt-6 text-lg leading-relaxed text-white/70">{{ t("lab.lead") }}</p>
    </header>

    <ul class="mt-16 grid gap-6 md:grid-cols-2">
      <li v-for="(piece, i) in pieces" :key="piece.file" class="surface flex flex-col overflow-hidden">
        <div class="border-b border-white/[0.06] bg-ink-950/50 px-6">
          <component :is="piece.component" />
        </div>
        <div class="flex flex-1 flex-col p-6">
          <p class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light">
            {{ String(i + 1).padStart(2, "0") }} · {{ tm("lab.pieces")[i].kicker }}
          </p>
          <h2 class="mt-2 text-xl font-bold">{{ tm("lab.pieces")[i].title }}</h2>
          <p class="mt-2 text-[15px] leading-relaxed text-white/70">{{ tm("lab.pieces")[i].body }}</p>
          <a
            :href="`${REPO}/src/components/lab/${piece.file}`"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-auto inline-flex items-center gap-2 self-start pt-5 text-sm font-medium text-white/80 hover:text-accent-light"
          >
            <font-awesome-icon :icon="['fab', 'github']" />
            {{ t("lab.code") }}
            <span class="sr-only">({{ t("common.newTab") }})</span>
          </a>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import MagneticButton from "@/components/lab/MagneticButton.vue";
import SpringToggle from "@/components/lab/SpringToggle.vue";
import TiltCard from "@/components/lab/TiltCard.vue";
import BuildLoader from "@/components/lab/BuildLoader.vue";
import { t, tm } from "@/i18n";

const REPO = "https://github.com/DjGarcia4/JaredGarcia/blob/main";

const pieces = [
  { component: MagneticButton, file: "MagneticButton.vue" },
  { component: SpringToggle, file: "SpringToggle.vue" },
  { component: TiltCard, file: "TiltCard.vue" },
  { component: BuildLoader, file: "BuildLoader.vue" },
];
</script>
