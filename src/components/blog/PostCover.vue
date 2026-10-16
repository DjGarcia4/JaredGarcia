<template>
  <!-- Portada de un post sin captura: la marca del proyecto arriba y la
       palabra clave del post en grande. RapiSites usa su logo (dos chevrons
       sobre un cuadrado redondeado, variante oscura de su decisión 033) y
       sus chevrons de fondo; SwiftFlow, su rayo blanco sobre naranja; Wink
       (App, Site y Studio), su wordmark con la sonrisa; este portafolio, su J. -->
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

    <svg
      v-else-if="brand.bolt"
      class="post-cover__bg post-cover__bolt absolute -right-[4%] top-1/2 h-[140%] -translate-y-1/2"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path :d="BOLT" />
    </svg>

    <svg
      v-else-if="brand.wink"
      class="post-cover__bg post-cover__smile absolute -right-[8%] top-[22%] w-[78%]"
      viewBox="330 290 475 130"
      fill="currentColor"
    >
      <path :d="SMILE" />
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
      <span v-else-if="brand.bolt" class="post-cover__mark post-cover__mark--bolt grid h-8 w-8 place-items-center">
        <svg viewBox="0 0 24 24" class="h-[1.1rem] w-[1.1rem]" fill="currentColor"><path :d="BOLT" /></svg>
      </span>
      <img v-else-if="brand.wink" :src="winkLogo" alt="" class="-my-2 h-11 w-auto" />
      <LogoMark v-else-if="brand.logoMark" class="h-8 w-8" />
      <span v-else class="h-2.5 w-2.5 rounded-full bg-[var(--brand)]"></span>
      <!-- Con el wordmark de Wink, solo lo que va después de «Wink» (Studio, App…) -->
      <span class="text-lg font-semibold tracking-[-0.02em] text-white/90">{{ brand.wink ? title.replace(/^Wink\s*/, "") : title }}</span>
    </span>

    <!-- Palabra clave del post -->
    <span
      v-if="keyword"
      class="post-cover__keyword relative font-display font-bold leading-[0.95] tracking-tight"
    >
      {{ keyword }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import LogoMark from "@/components/LogoMark.vue";
// Logo de Wink (packages/theme de Wink Studio): wordmark + sonrisa.
import winkLogo from "@/assets/brands/wink-logo.svg";

const props = defineProps({
  // Proyecto del post: { id, title, color } (ver postProject en lib/posts).
  project: { type: Object, default: null },
  keyword: { type: String, default: "" },
});

// Marcas con logo propio. Las demás usan el color de su proyecto.
const BRANDS = {
  rapisites: { accent: "#a78bfa", chevrons: true },
  swiftflow: { accent: "#f97316", bolt: true },
  "wink-studio": { accent: "#00d2ea", wink: true },
  "wink-app": { accent: "#00d2ea", wink: true },
  "wink-site": { accent: "#00d2ea", wink: true },
  gantthub: { accent: "#34d399" },
  portfolio: { accent: "#22c55e", logoMark: true },
};

// El rayo de SwiftFlow (lucide "zap"), el mismo de su ícono.
const BOLT =
  "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z";

// La sonrisa del logo de Wink, para el fondo.
const SMILE =
  "M792.35,337.9a372.2,372.2,0,0,1-450.09,0c-4.28-3.25-5.55-8.65-2.91-11.91l19.17-23.94c2.65-3.26,7.76-3.52,11.48-.69a326.32,326.32,0,0,0,394.61,0c3.72-2.83,8.83-2.57,11.48.69L795.26,326C797.9,329.25,796.63,334.65,792.35,337.9Z";

const title = computed(() => props.project?.title ?? "");
const brand = computed(() => BRANDS[props.project?.id] ?? { accent: props.project?.color ?? "#22c55e" });
</script>

<style scoped>
.post-cover {
  /* La palabra clave se mide con el ancho de la tarjeta, no de la ventana:
     en la grilla de 3 de la home las tarjetas son angostas. */
  container-type: inline-size;
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
.post-cover__mark--bolt {
  color: #fff;
}
.post-cover__bolt {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.group:hover .post-cover__bolt {
  transform: translateY(-50%) translateX(-6px) rotate(-4deg);
}
.post-cover__smile {
  color: color-mix(in srgb, #fec101 30%, transparent);
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.group:hover .post-cover__smile {
  transform: translateY(-6px) scale(1.02);
}
.post-cover__keyword {
  font-size: clamp(1.75rem, 10cqi, 4.25rem);
  overflow-wrap: anywhere;
  color: color-mix(in srgb, var(--brand) 35%, #fff);
}
@media (prefers-reduced-motion: reduce) {
  .post-cover__chev,
  .post-cover__bolt,
  .post-cover__smile {
    transition: none;
  }
}
</style>
