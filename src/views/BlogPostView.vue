<template>
  <div :key="post?.slug || 'not-found'">
    <!-- No encontrado -->
    <section v-if="!post" class="container-content py-32 text-center">
      <p class="text-lg text-white/70">{{ t("blog.notFound") }}</p>
      <RouterLink :to="{ name: 'blog' }" class="btn-ghost mt-8">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        {{ t("blog.back") }}
      </RouterLink>
    </section>

    <article v-else class="container-content pb-24 pt-12 md:pt-16">
      <header class="max-w-3xl">
        <RouterLink
          :to="{ name: 'blog' }"
          class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-accent-light"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="text-[10px]" />
          {{ t("blog.back") }}
        </RouterLink>

        <ul v-if="post.tags.length || post.draft" class="mt-8 flex flex-wrap gap-1.5">
          <li v-if="post.draft" class="chip border-amber-400/40 text-amber-300">{{ t("blog.draft") }}</li>
          <li v-for="tag in post.tags" :key="tag">
            <RouterLink :to="{ name: 'blog', query: { tag } }" class="chip transition-colors hover:border-accent/40 hover:text-white">
              {{ tag }}
            </RouterLink>
          </li>
        </ul>

        <h1 class="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl" :lang="post.lang">
          {{ post.title }}
        </h1>
        <p class="mt-6 text-lg leading-relaxed text-white/70 md:text-xl" :lang="post.lang">
          {{ post.description }}
        </p>

        <p class="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-white/55">
          <span class="inline-flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'calendar']" class="text-[10px] text-accent-light" />
            <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          </span>
          <span class="h-3 w-px bg-white/15"></span>
          <span class="inline-flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'clock']" class="text-[10px] text-accent-light" />
            {{ t("blog.minRead", { n: post.readingTime }) }}
          </span>
          <template v-if="post.updated">
            <span class="h-3 w-px bg-white/15"></span>
            <span>{{ t("blog.updated", { date: formatDate(post.updated) }) }}</span>
          </template>
        </p>

        <p v-if="post.fallback" class="mt-8 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-sm text-white/75">
          {{ t("blog.onlyInNotice") }}
        </p>
      </header>

      <div class="mt-12 border-t border-white/[0.06] pt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
        <!-- Índice -->
        <nav
          v-if="toc.length > 1"
          :aria-label="t('blog.toc')"
          class="mb-10 lg:order-2 lg:mb-0"
        >
          <div class="lg:sticky lg:top-28">
            <p class="mono-label">{{ t("blog.toc") }}</p>
            <ol class="mt-4 space-y-1 border-l border-white/[0.08] text-sm">
              <li v-for="item in toc" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="-ml-px block border-l py-1 transition-colors"
                  :class="[
                    item.level === 3 ? 'pl-7' : 'pl-4',
                    activeId === item.id ? 'border-accent text-white' : 'border-transparent text-white/55 hover:text-white',
                  ]"
                  :aria-current="activeId === item.id ? 'location' : undefined"
                  @click.prevent="goTo(item.id)"
                >
                  {{ item.text }}
                </a>
              </li>
            </ol>
          </div>
        </nav>

        <div class="min-w-0 lg:order-1">
          <!-- Mientras carga el chunk: altura reservada para no saltar (CLS). -->
          <div v-if="!html" class="min-h-[60vh]" aria-busy="true"></div>
          <!-- El HTML sale de los .md del repo, renderizado en el build: no hay
               contenido de terceros. -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-else ref="content" class="prose-blog max-w-3xl" :lang="post.lang" @click="onContentClick" v-html="html"></div>

          <!-- Casos relacionados -->
          <aside v-if="relatedProjects.length" class="mt-16 max-w-3xl">
            <p class="mono-label">{{ t("blog.related") }}</p>
            <ul class="mt-4 grid gap-3 sm:grid-cols-2">
              <li v-for="p in relatedProjects" :key="p.slug">
                <RouterLink
                  :to="{ name: 'project', params: { slug: p.slug } }"
                  class="group surface surface-hover flex items-center justify-between gap-4 p-5"
                >
                  <span>
                    <span class="block font-display text-lg font-bold text-white group-hover:text-accent-light">{{ p.title }}</span>
                    <span class="mt-1 block text-sm text-white/60">{{ p.category }}</span>
                  </span>
                  <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs text-white/50 transition-transform group-hover:translate-x-1" />
                </RouterLink>
              </li>
            </ul>
          </aside>

          <!-- CTA -->
          <section class="mt-16 max-w-3xl overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-ink-900 via-ink-900 to-ink-850 p-8 md:p-10">
            <h2 class="text-2xl font-bold tracking-tight md:text-3xl">{{ t("blog.ctaTitle") }}</h2>
            <p class="mt-3 max-w-xl leading-relaxed text-white/65">{{ t("blog.ctaBody") }}</p>
            <RouterLink :to="{ name: 'home', hash: '#contact' }" class="btn-primary mt-7">
              {{ t("common.hablemos") }}
              <font-awesome-icon :icon="['fas', 'arrow-right']" />
            </RouterLink>
          </section>

          <!-- Anterior / siguiente -->
          <nav v-if="older || newer" class="mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
            <RouterLink
              v-if="newer"
              :to="{ name: 'post', params: { slug: newer.slug } }"
              class="group flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04]"
            >
              <span class="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                <font-awesome-icon :icon="['fas', 'arrow-left']" /> {{ t("blog.next") }}
              </span>
              <span class="font-semibold text-white group-hover:text-accent-light">{{ newer.title }}</span>
            </RouterLink>
            <RouterLink
              v-if="older"
              :to="{ name: 'post', params: { slug: older.slug } }"
              class="group flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-right transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04] sm:col-start-2"
            >
              <span class="flex items-center justify-end gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                {{ t("blog.previous") }} <font-awesome-icon :icon="['fas', 'arrow-right']" />
              </span>
              <span class="font-semibold text-white group-hover:text-accent-light">{{ older.title }}</span>
            </RouterLink>
          </nav>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import { formatDate, getPost, getPosts, loadBody } from "@/lib/blog";
import { getProjects } from "@/data/localized";
import { profile } from "@/data/profile";
import { t } from "@/i18n";
import { ScrollTrigger } from "@/lib/gsap";

const route = useRoute();
const router = useRouter();

const post = computed(() => getPost(route.params.slug));

const html = ref("");
const toc = ref([]);
const content = ref(null);
const activeId = ref(null);

// Lista ordenada de más nuevo a más viejo.
const index = computed(() => getPosts().findIndex((p) => p.slug === post.value?.slug));
const newer = computed(() => (index.value > 0 ? getPosts()[index.value - 1] : null));
const older = computed(() => (index.value >= 0 ? getPosts()[index.value + 1] ?? null : null));

const relatedProjects = computed(() =>
  post.value ? getProjects().filter((p) => post.value.projects.includes(p.slug)) : []
);

// ── Cuerpo: se descarga al entrar y al cambiar de idioma ─────────
let loadToken = 0;
watch(
  () => post.value && `${post.value.lang}/${post.value.slug}`,
  async () => {
    const current = post.value;
    const token = ++loadToken;
    html.value = "";
    toc.value = [];
    if (!current) return;
    const body = await loadBody(current);
    if (token !== loadToken) return;
    html.value = body.html;
    toc.value = body.toc;
    await nextTick();
    observeHeadings();
    ScrollTrigger.refresh();
    if (route.hash) document.getElementById(route.hash.slice(1))?.scrollIntoView();
  },
  { immediate: true }
);

// ── Índice: resalta la sección visible ───────────────────────────
let observer;
const observeHeadings = () => {
  observer?.disconnect();
  if (!content.value || !toc.value.length) return;
  const visible = new Map();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
      const first = toc.value.find((item) => visible.get(item.id));
      if (first) activeId.value = first.id;
    },
    { rootMargin: "-96px 0px -60% 0px" }
  );
  toc.value.forEach((item) => {
    const el = document.getElementById(item.id);
    if (el) observer.observe(el);
  });
};

const goTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
  history.replaceState(history.state, "", `#${id}`);
  activeId.value = id;
};

// ── Clicks dentro del Markdown ───────────────────────────────────
const copyTimers = new Map();
const onContentClick = async (e) => {
  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    const code = copyBtn.closest(".code-block")?.querySelector("pre")?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(code);
      const label = copyBtn.dataset.label ?? copyBtn.textContent;
      copyBtn.dataset.label = label;
      copyBtn.textContent = t("blog.copied");
      clearTimeout(copyTimers.get(copyBtn));
      copyTimers.set(copyBtn, setTimeout(() => (copyBtn.textContent = label), 1600));
    } catch {
      // Sin permiso de portapapeles: no hacer nada.
    }
    return;
  }

  const link = e.target.closest("a[href]");
  if (!link || link.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const href = link.getAttribute("href");
  if (href.startsWith("#")) {
    e.preventDefault();
    goTo(href.slice(1));
  } else if (href.startsWith("/") && !href.startsWith("//") && !/\.\w+$/.test(href.split(/[?#]/)[0])) {
    // Enlaces internos sin recargar la página.
    e.preventDefault();
    router.push(href);
  }
};

// ── Datos estructurados (BlogPosting) ────────────────────────────
const LD_ID = "ld-blog-post";
watch(
  post,
  (p) => {
    document.getElementById(LD_ID)?.remove();
    if (!p) return;
    const base = import.meta.env.VITE_SITE_URL || window.location.origin;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = LD_ID;
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated || p.date,
      inLanguage: p.lang,
      keywords: p.tags.join(", "),
      url: `${base}/blog/${p.slug}`,
      ...(p.cover ? { image: new URL(p.cover, base).href } : {}),
      author: { "@type": "Person", name: profile.name, url: base },
    });
    document.head.appendChild(script);
  },
  { immediate: true }
);

onUnmounted(() => {
  observer?.disconnect();
  copyTimers.forEach(clearTimeout);
  document.getElementById(LD_ID)?.remove();
});
</script>

<style>
/* Tipografía del artículo. Sin @tailwindcss/typography: estas reglas son
   las únicas que necesita el Markdown y viajan en el chunk de esta ruta. */
.prose-blog {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: rgb(255 255 255 / 0.78);
}
.prose-blog > * + * {
  margin-top: 1.25em;
}
.prose-blog h2,
.prose-blog h3 {
  scroll-margin-top: 6rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.015em;
}
.prose-blog h2 {
  margin-top: 2.4em;
  font-size: 1.75rem;
}
.prose-blog h3 {
  margin-top: 2em;
  font-size: 1.3rem;
}
.prose-blog h2 + *,
.prose-blog h3 + * {
  margin-top: 0.75em;
}
.prose-blog .heading-anchor {
  margin-left: 0.35em;
  color: rgb(255 255 255 / 0.25);
  text-decoration: none;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
}
.prose-blog h2:hover .heading-anchor,
.prose-blog h3:hover .heading-anchor {
  opacity: 1;
}
.prose-blog .heading-anchor:hover {
  color: #4ade80;
}
.prose-blog a:not(.heading-anchor) {
  color: #4ade80;
  text-decoration: underline;
  text-decoration-color: rgb(34 197 94 / 0.4);
  text-underline-offset: 4px;
  transition: text-decoration-color 0.2s;
}
.prose-blog a:not(.heading-anchor):hover {
  text-decoration-color: #22c55e;
}
.prose-blog strong {
  color: #fff;
  font-weight: 600;
}
.prose-blog ul,
.prose-blog ol {
  padding-left: 1.4em;
}
.prose-blog ul {
  list-style: disc;
}
.prose-blog ol {
  list-style: decimal;
}
.prose-blog li + li {
  margin-top: 0.4em;
}
.prose-blog li::marker {
  color: rgb(74 222 128 / 0.8);
}
.prose-blog blockquote {
  border-left: 2px solid #22c55e;
  padding-left: 1.25em;
  color: rgb(255 255 255 / 0.7);
  font-style: italic;
}
.prose-blog hr {
  margin: 3em 0;
  border-color: rgb(255 255 255 / 0.08);
}
.prose-blog img {
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.07);
}
.prose-blog :not(pre) > code {
  border-radius: 0.375rem;
  background: rgb(255 255 255 / 0.07);
  padding: 0.15em 0.4em;
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 0.85em;
  color: #fff;
}
.prose-blog table {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 0.92em;
}
.prose-blog th,
.prose-blog td {
  border-bottom: 1px solid rgb(255 255 255 / 0.08);
  padding: 0.6em 0.9em;
  text-align: left;
  white-space: nowrap;
}
.prose-blog th {
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgb(255 255 255 / 0.6);
}
.prose-blog .code-block {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.08);
  background: #1e293b;
}
.prose-blog .code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgb(255 255 255 / 0.06);
  padding: 0.5rem 0.75rem 0.5rem 1rem;
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgb(255 255 255 / 0.5);
}
.prose-blog .code-copy {
  border-radius: 0.5rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  padding: 0.2rem 0.6rem;
  color: rgb(255 255 255 / 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: border-color 0.2s, color 0.2s;
}
.prose-blog .code-copy:hover {
  border-color: rgb(34 197 94 / 0.5);
  color: #fff;
}
.prose-blog pre.shiki {
  margin: 0;
  overflow-x: auto;
  background: transparent !important;
  padding: 1rem 1.1rem;
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 0.85rem;
  line-height: 1.7;
}
@media (min-width: 768px) {
  .prose-blog {
    font-size: 1.125rem;
  }
  .prose-blog h2 {
    font-size: 2rem;
  }
}
</style>
