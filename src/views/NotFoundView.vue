<template>
  <section class="container-content flex min-h-[70vh] flex-col items-start justify-center py-24">
    <p class="eyebrow"><span class="h-px w-6 bg-accent-light"></span>{{ t("notFound.eyebrow") }}</p>
    <h1 class="mt-5 text-5xl font-bold tracking-tight md:text-7xl">
      {{ t("notFound.titleA") }} <span class="text-gradient">{{ t("notFound.titleB") }}</span>
    </h1>
    <p class="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
      {{ t("notFound.lead") }}
      <span v-if="suggestion">
        {{ t("notFound.didYouMean") }}
        <RouterLink :to="suggestion.to" class="text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent">{{ suggestion.label }}</RouterLink>?
      </span>
    </p>
    <div class="mt-9 flex flex-wrap gap-3">
      <RouterLink :to="{ name: 'home' }" class="btn-primary">
        {{ t("notFound.home") }}
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </RouterLink>
      <RouterLink :to="{ name: 'projects' }" class="btn-ghost">{{ t("notFound.projects") }}</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { projects } from "@/data/projects";
import { t } from "@/i18n";

const route = useRoute();

// Sugerencia simple para errores de tipeo: la ruta conocida más parecida
// (distancia de Levenshtein pequeña), p. ej. /designe-system → /design-system.
const known = [
  { label: "/projects", to: { name: "projects" } },
  { label: "/design-system", to: { name: "design-system" } },
  ...projects
    .filter((p) => p.status !== "Práctica")
    .map((p) => ({ label: `/project/${p.slug}`, to: { name: "project", params: { slug: p.slug } } })),
];

const distance = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

const suggestion = computed(() => {
  const path = route.path.toLowerCase();
  const best = known
    .map((k) => ({ ...k, d: distance(path, k.label) }))
    .sort((x, y) => x.d - y.d)[0];
  return best && best.d <= 3 ? best : null;
});
</script>
