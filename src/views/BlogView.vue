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

      <!-- Filtro: tipo de artículo (y el tema, si vino en la URL) -->
      <div class="bv-in mb-8 flex flex-wrap items-center gap-2" role="group" :aria-label="t('blog.filterBy')">
        <button
          v-for="k in KINDS"
          :key="k ?? 'all'"
          type="button"
          class="rounded-full border px-4 py-1.5 text-sm transition-colors"
          :class="activeKind === k ? 'border-accent/50 bg-accent/10 text-accent-light' : 'border-white/10 text-white/65 hover:border-white/25 hover:text-white'"
          :aria-pressed="activeKind === k"
          @click="setFilter({ kind: k })"
        >
          {{ k ? t(`blog.kinds.${k}`) : t("blog.all") }}
          <span class="ml-1 font-mono text-[11px] opacity-60">{{ countOf(k) }}</span>
        </button>
        <button
          v-if="activeTag"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3.5 py-1.5 font-mono text-xs text-white"
          @click="setFilter({ tag: null })"
        >
          {{ activeTag }}
          <font-awesome-icon :icon="['fas', 'xmark']" class="text-[10px]" />
          <span class="sr-only">({{ t("blog.all") }})</span>
        </button>
      </div>

      <p v-if="!posts.length" class="surface p-10 text-center text-white/60">{{ t("blog.none") }}</p>
      <p v-else-if="!filtered.length" class="surface p-10 text-center text-white/60">{{ t("blog.empty") }}</p>

      <ul v-else class="grid gap-6 md:grid-cols-2">
        <li v-for="(post, i) in filtered" :key="post.slug" class="bv-card" :class="i === 0 ? 'md:col-span-2' : ''">
          <RouterLink
            :to="{ name: 'post', params: { slug: post.slug } }"
            class="group surface surface-hover flex h-full flex-col overflow-hidden"
            :class="i === 0 ? 'md:flex-row' : ''"
          >
            <div
              class="overflow-hidden border-b border-white/[0.06] bg-ink-900"
              :class="i === 0 ? 'md:w-3/5 md:border-b-0 md:border-r' : ''"
            >
              <img
                v-if="post.cover"
                :src="projectSrc(post.cover, 800)"
                :srcset="projectSrcset(post.cover)"
                :sizes="i === 0 ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 50vw, 100vw'"
                alt=""
                :loading="i === 0 ? 'eager' : 'lazy'"
                decoding="async"
                class="aspect-video h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <PostCover v-else :project="projectOf(post)" :keyword="post.keyword || post.tags[0] || ''" />
            </div>
            <div class="flex flex-1 flex-col p-6 md:p-7" :class="i === 0 ? 'md:justify-center md:p-10' : ''">
              <p class="mono-label">
                <span class="text-accent-light">{{ t(`blog.kind.${post.kind}`) }}</span>
                · {{ projectOf(post).title }}
                · {{ t("blog.minRead", { n: post.readingTime }) }}
              </p>
              <h3
                class="mt-3 font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-accent-light"
                :class="i === 0 ? 'text-2xl md:text-3xl' : 'text-xl'"
              >
                {{ post.title }}
              </h3>
              <p class="mt-3 text-[15px] leading-relaxed text-white/65">{{ post.description }}</p>
              <ul v-if="post.draft || post.fallback" class="mt-4 flex flex-wrap gap-1.5">
                <li v-if="post.draft" class="chip border-amber-400/40 text-amber-300">{{ t("blog.draft") }}</li>
                <li v-if="post.fallback" class="chip border-accent/30 text-accent-light">{{ t("blog.onlyIn") }}</li>
              </ul>
              <span class="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-white/80 group-hover:text-accent-light">
                {{ t("blog.read") }}
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import PostCover from "@/components/blog/PostCover.vue";
import { getPosts, getTags } from "@/lib/blog";
import { getProjects } from "@/data/localized";
import { useI18n } from "@/i18n";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { projectSrc, projectSrcset } from "@/lib/img";

const { t, isEn } = useI18n();
const route = useRoute();
const router = useRouter();

const KINDS = [null, "learning", "guide"];

const posts = computed(getPosts);
const tags = computed(getTags);

// Los filtros viven en la URL (?kind=…&tag=…) para poder compartirlos. El
// tema llega desde los chips de cada artículo.
const activeKind = computed(() => (KINDS.includes(route.query.kind) ? route.query.kind : null));
const activeTag = computed(() => (tags.value.includes(route.query.tag) ? route.query.tag : null));
const byTag = computed(() => (activeTag.value ? posts.value.filter((p) => p.tags.includes(activeTag.value)) : posts.value));
const filtered = computed(() => (activeKind.value ? byTag.value.filter((p) => p.kind === activeKind.value) : byTag.value));
const countOf = (k) => (k ? byTag.value.filter((p) => p.kind === k).length : byTag.value.length);

const setFilter = (patch) => {
  const query = { ...route.query };
  if ("kind" in patch) query.kind = patch.kind ?? undefined;
  if ("tag" in patch) query.tag = patch.tag ?? undefined;
  router.replace({ query });
};

// El proyecto de la portada de marca: el primer caso del artículo, o este
// mismo sitio si no habla de ningún caso.
const projectOf = (post) =>
  getProjects().find((p) => p.slug === post.projects[0]) ?? { id: "portfolio", title: t("blog.thisSite"), color: "#22c55e" };

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
