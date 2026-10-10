<template>
  <section ref="heroRef" class="relative overflow-hidden">
    <!-- Grid chase: líneas con destellos que recorren el fondo en bucle. -->
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div class="grid-chase grid-chase-v" style="left: 8%">
        <span class="grid-chase-glow"></span>
      </div>
      <div class="grid-chase grid-chase-v hidden lg:block" style="left: 46%; animation-delay: -3s">
        <span class="grid-chase-glow" style="animation-delay: -3s"></span>
      </div>
      <div class="grid-chase grid-chase-v hidden lg:block" style="left: 92%">
        <span class="grid-chase-glow" style="animation-delay: -7.5s"></span>
      </div>
      <div class="grid-chase grid-chase-h" style="top: 18%">
        <span class="grid-chase-glow" style="animation-delay: -2s"></span>
      </div>
      <div class="grid-chase grid-chase-h" style="top: 86%">
        <span class="grid-chase-glow" style="animation-delay: -8s"></span>
      </div>
    </div>

    <div
      class="pointer-events-none absolute -left-40 top-0 h-[560px] w-[560px] rounded-full bg-accent/15 blur-[160px]"
      aria-hidden="true"
    ></div>

    <div
      class="container-content relative grid min-h-[calc(92svh-5rem)] items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-10"
    >
      <!-- Texto -->
      <div>
        <p class="hero-in inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          {{ t("hero.status") }}
        </p>

        <!-- Sin animación de entrada: es el LCP. -->
        <h1
          class="mt-7 font-display text-[clamp(3.25rem,6.4vw,5.75rem)] font-bold leading-[0.92] tracking-tight text-white"
        >
          Jared <span class="text-gradient">Garcia.</span>
        </h1>

        <p
          class="mt-5 font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-[1.8rem] xl:text-[2rem]"
        >
          <span class="whitespace-nowrap">Frontend Developer</span> <span class="text-accent-light">&amp;</span> <span class="whitespace-nowrap">UI/UX Designer</span>
        </p>

        <!-- Sin animación de entrada: en mobile es candidato a LCP. -->
        <p class="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
          {{ t("hero.leadA") }} <RouterLink :to="{ name: 'project', params: { slug: 'wink-app' } }" class="hero-link">Wink</RouterLink>{{ t("hero.leadB") }} <RouterLink :to="{ name: 'project', params: { slug: 'rapisites' } }" class="hero-link">RapiSites</RouterLink>{{ t("hero.leadC") }}
        </p>

        <div class="hero-in mt-9 flex flex-wrap items-center gap-3" style="--d: 3">
          <a href="#trabajo" class="btn-primary" @click.prevent="scrollToWork">
            {{ t("hero.cta") }}
            <font-awesome-icon :icon="['fas', 'arrow-down']" />
          </a>
          <a
            :href="profile.cvUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-ghost"
          >
            <font-awesome-icon :icon="['fas', 'file-arrow-down']" />
            {{ t("common.downloadCv") }}
          </a>
          <span class="mx-1 hidden h-6 w-px bg-white/10 sm:block"></span>
          <a
            :href="profile.socials.github"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            class="link-icon"
          >
            <font-awesome-icon :icon="['fab', 'github']" />
          </a>
          <a
            :href="profile.socials.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            class="link-icon"
          >
            <font-awesome-icon :icon="['fab', 'linkedin']" />
          </a>
        </div>

        <ul
          class="hero-in mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/55"
          style="--d: 4"
        >
          <li class="flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'location-dot']" class="text-accent-light" />
            {{ profile.location }}
          </li>
          <li>{{ t("hero.since", { year: profile.careerStart }) }}</li>
          <li>{{ t("hero.current") }}</li>
        </ul>
      </div>

      <!-- Visual -->
      <div class="hero-in relative mt-14 lg:mt-0" style="--d: 2">
        <HeroLayers />
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from "vue-router";

import HeroLayers from "@/components/HeroLayers.vue";
import { profile } from "@/data/profile";
import { t } from "@/i18n";

const scrollToWork = () => {
  document.getElementById("trabajo")?.scrollIntoView({ behavior: "smooth" });
};
</script>

<style scoped>
/* Entrada con CSS (no bloquea el primer render ni depende de GSAP). */
.hero-in {
  animation: hero-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--d, 0) * 90ms);
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-in {
    animation: none;
  }
}

.hero-link {
  color: #fff;
  text-decoration: underline;
  text-decoration-color: rgba(74, 222, 128, 0.5);
  text-underline-offset: 4px;
  transition: text-decoration-color 0.2s;
}
.hero-link:hover {
  text-decoration-color: #4ade80;
}
</style>
