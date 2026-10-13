<template>
  <!-- Tarjeta de un artículo: portada (captura o marca del proyecto),
       tipo · proyecto · minutos, título y resumen. `wide` la pone en
       horizontal (la primera del blog). La usan /blog y la home. -->
  <RouterLink
    :to="{ name: 'post', params: { slug: post.slug } }"
    class="group surface surface-hover flex h-full flex-col overflow-hidden"
    :class="wide ? 'md:flex-row' : ''"
  >
    <div
      class="overflow-hidden border-b border-white/[0.06] bg-ink-900"
      :class="wide ? 'md:w-3/5 md:border-b-0 md:border-r' : ''"
    >
      <img
        v-if="post.cover"
        :src="projectSrc(post.cover, 800)"
        :srcset="projectSrcset(post.cover)"
        :sizes="wide ? '(min-width: 768px) 60vw, 100vw' : '(min-width: 768px) 50vw, 100vw'"
        alt=""
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        class="aspect-video h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <PostCover v-else :project="project" :keyword="post.keyword || post.tags[0] || ''" />
    </div>
    <div class="flex flex-1 flex-col p-6 md:p-7" :class="wide ? 'md:justify-center md:p-10' : ''">
      <p class="mono-label">
        <span class="text-accent-light">{{ t(`blog.kind.${post.kind}`) }}</span>
        · {{ project.title }}
        · {{ t("blog.minRead", { n: post.readingTime }) }}
      </p>
      <h3
        class="mt-3 font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-accent-light"
        :class="wide ? 'text-2xl md:text-3xl' : 'text-xl'"
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
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

import PostCover from "@/components/blog/PostCover.vue";
import { getProjects } from "@/data/localized";
import { t } from "@/i18n";
import { projectSrc, projectSrcset } from "@/lib/img";

const props = defineProps({
  post: { type: Object, required: true },
  wide: { type: Boolean, default: false },
  eager: { type: Boolean, default: false },
});

// El proyecto de la portada de marca: el primer caso del artículo, o este
// mismo sitio si no habla de ningún caso.
const project = computed(
  () =>
    getProjects().find((p) => p.slug === props.post.projects[0]) ?? {
      id: "portfolio",
      title: t("blog.thisSite"),
      color: "#22c55e",
    }
);
</script>
