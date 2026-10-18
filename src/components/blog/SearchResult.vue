<template>
  <!-- Resultado de búsqueda: coincidencias marcadas en título y resumen, y
       un fragmento del cuerpo cuando la palabra está dentro del artículo. -->
  <RouterLink
    :to="{ name: 'post', params: { slug: post.slug } }"
    class="sr-row group surface surface-hover grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6"
  >
    <div class="min-w-0">
      <p class="mono-label flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="inline-block h-2 w-2 rounded-full" :style="{ background: project.color }"></span>
        <span class="text-accent-light">{{ t(`blog.kind.${post.kind}`) }}</span>
        <span>· {{ project.title }}</span>
        <span>· <time :datetime="post.date">{{ formatDate(post.date) }}</time></span>
        <span>· {{ t("blog.minRead", { n: post.readingTime }) }}</span>
      </p>
      <!-- eslint-disable vue/no-v-html -- highlight() escapa todo el texto -->
      <h3
        class="mt-2.5 text-lg font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-accent-light md:text-xl"
        v-html="highlight(post.title, words)"
      ></h3>
      <p class="mt-2 text-[15px] leading-relaxed text-white/65" v-html="highlight(post.description, words)"></p>
      <p v-if="snippet" class="mt-3 border-l-2 border-accent/40 pl-3 text-sm leading-relaxed text-white/55">
        <span class="mono-label mr-1.5 text-white/40">{{ t("blog.search.inBody") }}</span>
        <span v-html="highlight(snippet, words)"></span>
      </p>
      <!-- eslint-enable vue/no-v-html -->
      <ul v-if="post.tags.length || post.draft || post.fallback" class="mt-3.5 flex flex-wrap gap-1.5">
        <li v-if="post.draft" class="chip border-amber-400/40 text-amber-300">{{ t("blog.draft") }}</li>
        <li v-if="post.fallback" class="chip border-accent/30 text-accent-light">{{ t("blog.onlyIn") }}</li>
        <li
          v-for="tag in post.tags"
          :key="tag"
          class="chip"
          :class="isHit(tag) ? 'border-accent/40 text-accent-light' : ''"
        >
          {{ tag }}
        </li>
      </ul>
    </div>
    <font-awesome-icon
      :icon="['fas', 'arrow-right']"
      class="hidden text-white/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-light md:block"
    />
  </RouterLink>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

import { formatDate } from "@/lib/blog";
import { highlight, normalize, snippetFor } from "@/lib/blog-search";
import { t } from "@/i18n";

const props = defineProps({
  post: { type: Object, required: true },
  project: { type: Object, required: true },
  words: { type: Array, default: () => [] },
});

const snippet = computed(() => snippetFor(props.post, props.words));
const isHit = (tag) => props.words.some((w) => normalize(tag).includes(w));
</script>

<style scoped>
.sr-row :deep(mark) {
  @apply rounded-[3px] bg-accent/25 px-0.5 text-white;
}
</style>
