<template>
  <!-- Portada de un post sin captura: la marca del proyecto arriba y la
       palabra clave del post en grande. RapiSites usa su logo (dos chevrons
       sobre un cuadrado redondeado, variante oscura de su decisión 033) y
       sus chevrons de fondo; este portafolio, su J. -->
  <div
    class="post-cover relative flex aspect-video h-full w-full flex-col justify-between overflow-hidden p-6 md:p-8"
    :style="{ '--brand': brand.accent }"
    aria-hidden="true"
  >
    <svg
      v-if="brand.chevrons"
      class="post-cover__bg absolute -right-[8%] top-1/2 h-[150%] -translate-y-1/2"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path class="post-cover__chev post-cover__chev--1" d="M6 17l5-5l-5-5" />
      <path class="post-cover__chev post-cover__chev--2" d="M13 17l5-5l-5-5" />
    </svg>

    <!-- Marca -->
    <span class="relative inline-flex items-center gap-2.5">
      <span v-if="brand.chevrons" class="post-cover__mark grid h-8 w-8 place-items-center">
        <svg
          viewBox="0 0 24 24"
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 17l5-5l-5-5" />
          <path d="M13 17l5-5l-5-5" />
        </svg>
      </span>
      <LogoMark v-else-if="brand.logoMark" class="h-8 w-8" />
      <span v-else class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
      <span class="text-lg font-semibold tracking-[-0.02em] text-white/90">{{ title }}</span>
    </span>

    <!-- Palabra clave del post -->
    <span
      v-if="keyword"
      class="post-cover__keyword relative font-display text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold leading-[0.95] tracking-tight"
    >
      {{ keyword }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import LogoMark from "@/components/LogoMark.vue";

const props = defineProps({
  // Proyecto del post: { id, title, color } (ver postProject en lib/posts).
  project: { type: Object, default: null },
  keyword: { type: String, default: "" },
});

// Marcas con logo propio. Las demás usan el color de su proyecto.
const BRANDS = {
  rapisites: { accent: "#a78bfa", chevrons: true },
  portfolio: { accent: "#22c55e", logoMark: true },
};

const title = computed(() => props.project?.title ?? "");
const brand = computed(() => BRANDS[props.project?.id] ?? { accent: props.project?.color ?? "#22c55e" });
</script>

<style scoped>
.post-cover {
  background:
    radial-gradient(90% 120% at 100% 50%, color-mix(in srgb, var(--brand) 22%, transparent), transparent 65%),
    radial-gradient(60% 80% at 0% 100%, color-mix(in srgb, var(--brand) 10%, transparent), transparent 70%),
    #0b1222;
}
.post-cover__bg {
  color: color-mix(in srgb, var(--brand) 14%, transparent);
}
.post-cover__chev {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.group:hover .post-cover__chev--1 {
  transform: translateX(0.6px);
}
.group:hover .post-cover__chev--2 {
  transform: translateX(1.4px);
}
.post-cover__mark {
  border-radius: 22%;
  background: var(--brand);
  color: #1a1030;
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--brand) 55%, transparent);
}
.post-cover__keyword {
  color: color-mix(in srgb, var(--brand) 35%, #fff);
}
@media (prefers-reduced-motion: reduce) {
  .post-cover__chev {
    transition: none;
  }
}
</style>
