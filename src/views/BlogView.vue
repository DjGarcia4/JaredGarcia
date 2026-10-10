<template>
  <div ref="root">
    <section class="container-content pb-12 pt-16 md:pb-16 md:pt-24">
      <p class="bv-in eyebrow">
        <span class="h-px w-6 bg-accent-light"></span>
        {{ t("blog.eyebrow") }}
      </p>
      <h1 class="bv-in mt-5 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
        {{ t("blog.titleA") }} <span class="text-gradient">{{ t("blog.titleB") }}</span>
      </h1>
      <p class="bv-in mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
        {{ t("blog.lead") }}
      </p>
      <a :href="isEn ? '/en/rss.xml' : '/rss.xml'" class="bv-in mt-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-accent-light">
        <font-awesome-icon :icon="['fas', 'rss']" class="text-xs" />
        {{ t("blog.rss") }}
      </a>
    </section>

    <section class="container-content pb-28" aria-labelledby="posts-title">
      <h2 id="posts-title" class="sr-only">{{ t("blog.posts") }}</h2>

      <div v-if="tags.length > 1" class="bv-in mb-10 flex flex-wrap gap-2" role="group" :aria-label="t('blog.filterBy')">
        <button
          v-for="tag in [null, ...tags]"
          :key="tag ?? 'all'"
          type="button"
          class="rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors"
          :class="activeTag === tag ? 'border-accent/60 bg-accent/15 text-white' : 'border-white/10 text-white/65 hover:border-accent/40 hover:text-white'"
          :aria-pressed="activeTag === tag"
          @click="setTag(tag)"
        >
          {{ tag ?? t("blog.all") }}
        </button>
      </div>

      <p v-if="!posts.length" class="surface p-10 text-center text-white/60">{{ t("blog.none") }}</p>
      <p v-else-if="!filtered.length" class="surface p-10 text-center text-white/60">{{ t("blog.empty") }}</p>

      <ul v-else class="divide-y divide-white/[0.06] border-y border-white/[0.06]">
        <li v-for="post in filtered" :key="post.slug" class="bv-card">
          <PostRow :post="post" />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import PostRow from "@/components/blog/PostRow.vue";
import { getPosts, getTags } from "@/lib/blog";
import { useI18n } from "@/i18n";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const { t, isEn } = useI18n();
const route = useRoute();
const router = useRouter();

const posts = computed(getPosts);
const tags = computed(getTags);

// El tema elegido vive en la URL (?tag=...) para poder compartir el filtro.
const activeTag = computed(() => (tags.value.includes(route.query.tag) ? route.query.tag : null));
const filtered = computed(() =>
  activeTag.value ? posts.value.filter((p) => p.tags.includes(activeTag.value)) : posts.value
);

const setTag = (tag) =>
  router.replace({ query: { ...route.query, tag: tag ?? undefined } });

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    gsap.from(".bv-in", { opacity: 0, y: 18, duration: 0.6, stagger: 0.07, ease: "power3.out" });
    gsap.from(".bv-card", { opacity: 0, y: 20, duration: 0.55, stagger: 0.06, delay: 0.2, ease: "power3.out" });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
