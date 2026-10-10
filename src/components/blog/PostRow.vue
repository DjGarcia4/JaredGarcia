<template>
  <RouterLink
    :to="{ name: 'post', params: { slug: post.slug } }"
    class="group grid gap-3 py-7 md:grid-cols-[12.5rem_1fr_auto] md:items-baseline md:gap-8"
  >
    <p class="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
      <time :datetime="post.date">{{ formatDate(post.date) }}</time>
    </p>
    <div>
      <h3 class="text-xl font-bold tracking-tight transition-colors group-hover:text-accent-light md:text-2xl">
        {{ post.title }}
      </h3>
      <p class="mt-2 max-w-2xl leading-relaxed text-white/65">{{ post.description }}</p>
      <ul class="mt-4 flex flex-wrap items-center gap-1.5">
        <li v-if="post.draft" class="chip border-amber-400/40 text-amber-300">{{ t("blog.draft") }}</li>
        <li v-if="post.fallback" class="chip border-accent/30 text-accent-light">{{ t("blog.onlyIn") }}</li>
        <li v-for="tag in post.tags" :key="tag" class="chip">{{ tag }}</li>
      </ul>
    </div>
    <span class="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white/75 group-hover:text-white">
      {{ t("blog.minRead", { n: post.readingTime }) }}
      <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { formatDate } from "@/lib/blog";
import { t } from "@/i18n";

defineProps({ post: { type: Object, required: true } });
</script>
