<template>
  <!-- Casos destacados: filas alternadas, cover completa (sin recortes ni
       fundidos) dentro de un marco de navegador, y lo esencial para decidir
       si abrir el caso: qué es, mi rol y tres puntos. -->
  <ol ref="root" class="space-y-20 md:space-y-28">
    <li
      v-for="(project, i) in projects"
      :key="project.id"
      class="case-row grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
    >
      <!-- Cover -->
      <RouterLink
        :to="{ name: 'project', params: { slug: project.slug } }"
        class="case-cover group relative block lg:col-span-7"
        :class="i % 2 ? 'lg:order-2' : ''"
        :style="{ '--brand': project.color }"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="cover-glow"></div>
        <div
          class="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-card transition-transform duration-500 ease-out group-hover:-translate-y-1"
        >
          <div class="flex h-7 items-center gap-1.5 border-b border-white/[0.06] bg-ink-900 px-3">
            <span class="h-2 w-2 rounded-full bg-white/20"></span>
            <span class="h-2 w-2 rounded-full bg-white/20"></span>
            <span class="h-2 w-2 rounded-full bg-white/20"></span>
            <span
              v-if="project.liveUrl"
              class="ml-3 truncate font-mono text-[10px] text-white/50"
            >
              {{ host(project.liveUrl) }}
            </span>
          </div>
          <img
            :src="projectSrc(project.images.cover)"
            :srcset="projectSrcset(project.images.cover)"
            sizes="(min-width: 1024px) 58vw, 100vw"
            alt=""
            width="1680"
            height="1050"
            loading="lazy"
            decoding="async"
            class="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        </div>
      </RouterLink>

      <!-- Texto -->
      <div class="lg:col-span-5" :class="i % 2 ? 'lg:order-1' : ''">
        <p class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light">
          <span class="text-white/50">{{ String(i + 1).padStart(2, "0") }}</span>
          <span class="h-px w-6 bg-accent"></span>
          {{ project.category }}
        </p>

        <h3 class="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          <RouterLink
            :to="{ name: 'project', params: { slug: project.slug } }"
            class="transition-colors hover:text-accent-light"
          >
            {{ project.title }}
          </RouterLink>
        </h3>

        <p class="mt-4 text-lg leading-relaxed text-white/75">
          {{ project.headline }}
        </p>

        <ul class="mt-6 space-y-2.5">
          <li
            v-for="point in project.highlights"
            :key="point"
            class="flex gap-3 text-[15px] leading-relaxed text-white/70"
          >
            <font-awesome-icon :icon="['fas', 'check']" class="mt-1.5 text-xs text-accent-light" />
            {{ point }}
          </li>
        </ul>

        <p class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          <span>{{ project.role }}</span>
          <span class="h-3 w-px bg-white/15"></span>
          <span>{{ project.team }}</span>
          <span class="h-3 w-px bg-white/15"></span>
          <span>{{ project.year }}</span>
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            :to="{ name: 'project', params: { slug: project.slug } }"
            class="btn-primary"
          >
            {{ t("cases.view") }}
            <span class="sr-only">{{ t("cases.viewOf", { title: project.title }) }}</span>
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </RouterLink>
          <a
            v-if="project.liveUrl"
            :href="project.liveUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-ghost"
          >
            {{ t("cases.live") }}
            <span class="sr-only">{{ t("cases.viewOf", { title: project.title }) }} ({{ t("common.newTab") }})</span>
            <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
          </a>
        </div>
      </div>
    </li>
  </ol>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { projectSrc, projectSrcset } from "@/lib/img";
import { t } from "@/i18n";
import { gsap, playOnEnter, prefersReducedMotion } from "@/lib/gsap";

defineProps({
  projects: { type: Array, required: true },
});

const host = (url) => new URL(url).host.replace(/^www\./, "");

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    gsap.utils.toArray(".case-row").forEach((row) => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.from(row.querySelector(".case-cover"), { opacity: 0, y: 40, duration: 0.8 })
        .from(row.querySelectorAll(".lg\\:col-span-5 > *"), {
          opacity: 0,
          y: 18,
          duration: 0.55,
          stagger: 0.06,
        }, 0.1);
      playOnEnter(tl, { trigger: row, start: "top 82%" });
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>

<style scoped>
.cover-glow {
  position: absolute;
  inset: 8% 6% -4%;
  border-radius: 32px;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--brand) 45%, transparent), transparent);
  filter: blur(40px);
  opacity: 0.55;
  transition: opacity 0.5s;
}
.case-cover:hover .cover-glow {
  opacity: 0.85;
}
</style>
