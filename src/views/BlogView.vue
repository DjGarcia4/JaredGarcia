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

      <!-- Buscador + filtros. Todo vive en la URL para poder compartirlo. -->
      <div class="bv-in mb-8 space-y-4">
        <div class="relative">
          <label for="blog-search" class="sr-only">{{ t("blog.search.label") }}</label>
          <font-awesome-icon
            :icon="['fas', 'magnifying-glass']"
            class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/45"
          />
          <input
            id="blog-search"
            ref="input"
            v-model="query"
            type="search"
            autocomplete="off"
            spellcheck="false"
            enterkeyhint="search"
            :placeholder="t('blog.search.placeholder')"
            class="field !rounded-2xl !py-4 !pl-12 !pr-28 md:!text-base [&::-webkit-search-cancel-button]:hidden"
            @focus="loadIndex"
            @keydown.esc="query ? (query = '') : input?.blur()"
          />
          <div class="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <span v-if="words.length && !indexReady" class="mono-label hidden animate-pulse sm:inline">{{ t("blog.search.loading") }}</span>
            <button
              v-if="query"
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
              :aria-label="t('blog.search.clear')"
              @click="clearQuery"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" />
            </button>
            <kbd v-else class="hidden items-center gap-1.5 rounded-md border border-white/10 px-2 py-0.5 font-mono text-[11px] text-white/45 md:inline-flex">
              / <span class="font-sans text-white/35">{{ t("blog.search.hint") }}</span>
            </kbd>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="t('blog.filterBy')">
            <button
              v-for="k in KINDS"
              :key="k ?? 'all'"
              type="button"
              class="rounded-full border px-4 py-1.5 text-sm transition-colors"
              :class="active.kind === k ? 'border-accent/50 bg-accent/10 text-accent-light' : 'border-white/10 text-white/65 hover:border-white/25 hover:text-white'"
              :aria-pressed="active.kind === k"
              @click="setFilter({ kind: k })"
            >
              {{ k ? t(`blog.kinds.${k}`) : t("blog.all") }}
              <span class="ml-1 font-mono text-[11px] opacity-60">{{ facet("kind", k) }}</span>
            </button>
          </div>

          <span class="mx-1 hidden h-5 w-px bg-white/10 md:block"></span>

          <label v-for="sel in selects" :key="sel.key" class="relative">
            <span class="sr-only">{{ sel.label }}</span>
            <select
              :value="sel.key === 'sort' ? sortBy : active[sel.key] ?? ''"
              class="cursor-pointer appearance-none rounded-full border bg-transparent py-1.5 pl-4 pr-9 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-accent/40"
              :class="active[sel.key] && sel.key !== 'sort' ? 'border-accent/50 bg-accent/10 text-accent-light' : 'border-white/10 text-white/65 hover:border-white/25 hover:text-white'"
              @change="onSelect(sel.key, $event.target.value)"
            >
              <option v-if="sel.key !== 'sort'" value="" class="bg-ink-900 text-white">{{ sel.label }}: {{ t("blog.search.any") }}</option>
              <option v-for="o in sel.options" :key="o.value" :value="o.value" :disabled="o.count === 0" class="bg-ink-900 text-white">
                {{ sel.key === "sort" ? `${sel.label}: ${o.label}` : `${o.label} (${o.count})` }}
              </option>
            </select>
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] opacity-60" />
          </label>
        </div>

        <div v-if="isFiltering" class="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
          <span class="mono-label mr-1">{{ filtered.length === 1 ? t("blog.search.result") : t("blog.search.results", { n: filtered.length }) }}</span>
          <button
            v-for="pill in pills"
            :key="pill.key"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs text-white transition-colors hover:border-accent/70"
            @click="setFilter({ [pill.key]: null })"
          >
            <span class="text-white/50">{{ pill.label }}:</span> {{ pill.value }}
            <font-awesome-icon :icon="['fas', 'xmark']" class="text-[10px]" />
          </button>
          <button type="button" class="ml-auto inline-flex items-center gap-2 text-white/55 transition-colors hover:text-accent-light" @click="resetAll">
            <font-awesome-icon :icon="['fas', 'rotate-left']" class="text-xs" />
            {{ t("blog.search.reset") }}
          </button>
        </div>
      </div>

      <p v-if="!posts.length" class="surface p-10 text-center text-white/60">{{ t("blog.none") }}</p>
      <div v-else-if="!filtered.length" class="surface p-10 text-center">
        <p class="text-lg font-semibold text-white/85">{{ t("blog.search.emptyTitle") }}</p>
        <p class="mt-2 text-white/60">{{ t("blog.search.emptyBody") }}</p>
        <button type="button" class="btn-ghost mt-6" @click="resetAll">
          <font-awesome-icon :icon="['fas', 'rotate-left']" class="text-xs" />
          {{ t("blog.search.reset") }}
        </button>
      </div>

      <!-- Con texto buscado: lista con coincidencias marcadas. -->
      <ul v-else-if="words.length" class="grid gap-3">
        <li v-for="post in filtered" :key="post.slug">
          <SearchResult :post="post" :project="projectOf(post)" :words="words" />
        </li>
      </ul>

      <ul v-else class="grid gap-6 md:grid-cols-2">
        <li v-for="(post, i) in filtered" :key="post.slug" class="bv-card" :class="i === 0 && !isFiltering ? 'md:col-span-2' : ''">
          <PostCard :post="post" :wide="i === 0 && !isFiltering" :eager="i === 0" />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import PostCard from "@/components/blog/PostCard.vue";
import SearchResult from "@/components/blog/SearchResult.vue";
import { getProjects } from "@/data/localized";
import { getPosts, getTags } from "@/lib/blog";
import "@/lib/blog-descriptions";
import { isIndexReady, loadSearchIndex, scorePost, searchIndex, terms } from "@/lib/blog-search";
import { useI18n } from "@/i18n";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const { t, isEn } = useI18n();
const route = useRoute();
const router = useRouter();

const KINDS = [null, "learning", "guide"];
const SORTS = ["relevance", "new", "old", "short", "long"];
const SITE = "portfolio";

const posts = computed(getPosts);
const langs = computed(() => [...new Set(posts.value.map((p) => p.lang))]);
const loadIndex = () => loadSearchIndex(langs.value);
const indexReady = computed(() => isIndexReady(langs.value));
const tags = computed(getTags);

// Proyecto de cada artículo (el primero); sin proyecto, "este portafolio".
const projectList = computed(getProjects);
const projectOf = (post) =>
  projectList.value.find((p) => p.slug === post.projects[0]) ?? { slug: SITE, title: t("blog.thisSite"), color: "#22c55e" };
const projectSlugs = (post) => (post.projects.length ? post.projects : [SITE]);
const years = computed(() => [...new Set(posts.value.map((p) => p.date.slice(0, 4)))].sort().reverse());
const projectOptions = computed(() => {
  const seen = new Map();
  for (const p of posts.value) {
    for (const slug of projectSlugs(p)) {
      if (!seen.has(slug)) seen.set(slug, projectList.value.find((x) => x.slug === slug)?.title ?? (slug === SITE ? t("blog.thisSite") : slug));
    }
  }
  return [...seen].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
});

// Filtros desde la URL (?q=…&kind=…&project=…&tag=…&year=…&sort=…).
const pick = (v, list) => (list.includes(v) ? v : null);
const active = computed(() => ({
  q: typeof route.query.q === "string" ? route.query.q : "",
  kind: pick(route.query.kind, KINDS),
  project: pick(route.query.project, projectOptions.value.map((o) => o.value)),
  tag: pick(route.query.tag, tags.value),
  year: pick(route.query.year, years.value),
  sort: pick(route.query.sort, SORTS),
}));

const setFilter = (patch) => {
  const query = { ...route.query };
  for (const [k, v] of Object.entries(patch)) query[k] = v ?? undefined;
  router.replace({ query });
};

// El campo escribe en la URL con un respiro, para no reemplazar la ruta en
// cada tecla.
const input = ref(null);
const query = ref(active.value.q);
let timer;
watch(query, (v) => {
  clearTimeout(timer);
  if (v.trim()) loadIndex();
  timer = setTimeout(() => {
    if (v.trim() !== active.value.q) setFilter({ q: v.trim() || null });
  }, 180);
});
watch(() => active.value.q, (v) => {
  if (v !== query.value.trim()) query.value = v;
});
const clearQuery = () => {
  query.value = "";
  setFilter({ q: null });
  input.value?.focus();
};
const resetAll = () => {
  query.value = "";
  router.replace({ query: {} });
};

// Palabras de la búsqueda, ya normalizadas (sin tildes, minúsculas).
const words = computed(() => terms(query.value));

const matches = (p, f, skip) =>
  (skip === "kind" || !f.kind || p.kind === f.kind) &&
  (skip === "project" || !f.project || projectSlugs(p).includes(f.project)) &&
  (skip === "tag" || !f.tag || p.tags.includes(f.tag)) &&
  (skip === "year" || !f.year || p.date.startsWith(f.year));

// Puntaje de texto por artículo (0 = no coincide). Depende del índice
// completo, así que se recalcula cuando termina de llegar.
const scores = computed(() => {
  void searchIndex.value;
  const map = new Map();
  for (const p of posts.value) map.set(p.slug, scorePost(p, words.value, projectOf(p).title));
  return map;
});
const textHits = computed(() => posts.value.filter((p) => scores.value.get(p.slug) > 0));

const sortBy = computed(() => active.value.sort ?? (words.value.length ? "relevance" : "new"));
const filtered = computed(() => {
  const list = textHits.value.filter((p) => matches(p, active.value));
  const s = sortBy.value;
  const byDate = (a, b) => b.date.localeCompare(a.date);
  return [...list].sort((a, b) => {
    if (s === "old") return -byDate(a, b);
    if (s === "short") return a.readingTime - b.readingTime || byDate(a, b);
    if (s === "long") return b.readingTime - a.readingTime || byDate(a, b);
    if (s === "relevance" && words.value.length) return scores.value.get(b.slug) - scores.value.get(a.slug) || byDate(a, b);
    return byDate(a, b);
  });
});

// Cuántos artículos quedarían con cada opción, respetando el resto de filtros.
const facet = (key, value) =>
  textHits.value.filter((p) => matches(p, active.value, key) && matches(p, { [key]: value })).length;

// El año aparece recién cuando hay artículos de más de uno.
const selects = computed(() => [
  {
    key: "project",
    label: t("blog.search.project"),
    options: projectOptions.value.map((o) => ({ ...o, count: facet("project", o.value) })),
  },
  {
    key: "tag",
    label: t("blog.search.tag"),
    options: tags.value.map((tag) => ({ value: tag, label: tag, count: facet("tag", tag) })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  },
  {
    key: "year",
    label: t("blog.search.year"),
    options: years.value.map((y) => ({ value: y, label: y, count: facet("year", y) })),
  },
  {
    key: "sort",
    label: t("blog.search.sort"),
    options: SORTS.filter((s) => s !== "relevance" || words.value.length).map((s) => ({ value: s, label: t(`blog.search.sorts.${s}`) })),
  },
].filter((sel) => sel.key !== "year" || years.value.length > 1));

const onSelect = (key, value) => {
  const fallback = words.value.length ? "relevance" : "new";
  setFilter({ [key]: value && !(key === "sort" && value === fallback) ? value : null });
};

const isFiltering = computed(
  () => !!(words.value.length || active.value.kind || active.value.project || active.value.tag || active.value.year || active.value.sort)
);
const pills = computed(() => {
  const out = [];
  const f = active.value;
  if (f.project) out.push({ key: "project", label: t("blog.search.project"), value: projectOptions.value.find((o) => o.value === f.project)?.label });
  if (f.tag) out.push({ key: "tag", label: t("blog.search.tag"), value: f.tag });
  if (f.year) out.push({ key: "year", label: t("blog.search.year"), value: f.year });
  return out;
});

// "/" enfoca el buscador desde cualquier parte de la página.
const onKey = (e) => {
  if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
  const el = document.activeElement;
  if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
  e.preventDefault();
  input.value?.focus();
};

const root = ref(null);
let ctx;

onMounted(() => {
  window.addEventListener("keydown", onKey);
  if (active.value.q) loadIndex();
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    gsap.from(".bv-in", { opacity: 0, y: 18, duration: 0.6, stagger: 0.07, ease: "power3.out" });
    gsap.from(".bv-card", { opacity: 0, y: 20, duration: 0.55, stagger: 0.06, delay: 0.2, ease: "power3.out" });
  }, root.value);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
  clearTimeout(timer);
  ctx?.revert();
});
</script>
