<template>
  <div ref="root" class="grid gap-10 lg:grid-cols-12 lg:gap-14">
    <!-- Bio -->
    <div class="about-in lg:col-span-7">
      <div class="space-y-5 text-lg leading-relaxed text-white/75">
        <p>
          {{ t("about.p1a", { name: firstName, location: profile.location, year: profile.careerStart }) }}
          <span class="text-white">{{ t("about.p1b") }}</span>
          {{ t("about.p1c") }}
          <span class="text-white">{{ t("about.p1d") }}</span>.
        </p>
        <p>
          {{ t("about.p2a") }}<a href="https://winkdigital.io" target="_blank" rel="noopener noreferrer" class="align-super text-xs text-accent-light" :aria-label="t('about.sourceLabel')">¹</a>{{ t("about.p2b") }}
        </p>
        <p>{{ t("about.p3") }}</p>
      </div>

      <p class="mt-8 inline-flex items-center gap-2.5 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-[15px] text-white/80">
        <font-awesome-icon :icon="['fas', 'briefcase']" class="text-accent-light" />
        {{ t("about.open") }}
      </p>
    </div>

    <!-- Foto + Ahora + Formación -->
    <div class="space-y-5 lg:col-span-5">
      <figure class="about-in overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900">
        <img
          src="/img/me/jared-880.webp"
          srcset="/img/me/jared-480.webp 480w, /img/me/jared-880.webp 880w"
          sizes="(min-width: 1024px) 440px, 100vw"
          :alt="t('about.photoAlt')"
          width="880"
          height="880"
          loading="lazy"
          decoding="async"
          class="aspect-[4/3] w-full object-cover object-[50%_28%]"
        />
      </figure>
      <div class="about-in surface p-6 md:p-7">
        <p class="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent-light">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          {{ t("about.now") }}
        </p>
        <h3 class="mt-3 text-xl font-bold">
          {{ cur.role }} <span class="text-white/60">·</span> {{ cur.company }}
        </h3>
        <div class="mt-4 flex flex-wrap gap-2">
          <span v-for="item in cur.focus" :key="item" class="chip">{{ item }}</span>
        </div>
      </div>

      <div class="about-in surface p-6 md:p-7">
        <p class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
          {{ t("about.education") }}
        </p>
        <ul class="mt-4 divide-y divide-white/[0.06]">
          <li class="flex items-baseline justify-between gap-4 py-3 first:pt-0">
            <span class="text-[15px] font-medium text-white">{{ prof.title }}</span>
            <span class="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">{{ t("about.degree") }}</span>
          </li>
          <li v-for="c in education" :key="c.slug">
            <RouterLink
              :to="{ name: 'certificate', params: { slug: c.slug } }"
              class="group flex items-baseline justify-between gap-4 py-3"
            >
              <span class="text-[15px] text-white/80 transition-colors group-hover:text-accent-light">
                {{ c.title }}
              </span>
              <span class="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                {{ c.status === "En curso" ? t("about.inProgress") : c.issuer }}
              </span>
            </RouterLink>
          </li>
        </ul>
        <button
          v-if="rest.length"
          type="button"
          class="mt-2 text-sm font-medium text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          :aria-expanded="showAll"
          @click="showAll = !showAll"
        >
          {{ showAll ? t("about.less") : t("about.more", { n: rest.length }) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { profile } from "@/data/profile";
import { getCertificates, getCurrent, getProfile } from "@/data/localized";
import { t } from "@/i18n";
import { gsap, playOnEnter, prefersReducedMotion } from "@/lib/gsap";

const firstName = profile.name.split(" ")[0];

// Primero lo relevante para el rol (diseño + lo que estoy cursando); el
// resto de cursos de desarrollo queda detrás de "ver más".
const isHighlight = (c) => c.status === "En curso" || /UX|UI/.test(c.title);
const sorted = computed(() => [...getCertificates()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
const highlights = computed(() => sorted.value.filter(isHighlight));
const rest = computed(() => sorted.value.filter((c) => !isHighlight(c)));

const cur = computed(() => getCurrent());
const prof = computed(() => getProfile());

const showAll = ref(false);
const education = computed(() => (showAll.value ? [...highlights.value, ...rest.value] : highlights.value));

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ paused: true });
    tl.from(".about-in", { opacity: 0, y: 24, duration: 0.6, stagger: 0.1, ease: "power3.out" });
    playOnEnter(tl, { trigger: root.value, start: "top 80%" });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
