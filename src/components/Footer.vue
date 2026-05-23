<template>
  <footer ref="root" class="relative mt-32 overflow-hidden">
    <!-- Hairline superior, sobrio -->
    <div class="absolute inset-x-0 top-0 h-px bg-white/[0.06]"></div>

    <!-- ─────────────────────────────────────────────────────────────
         TIER 1 — Conectemos · Navegar (sobrio, chrome)
       ───────────────────────────────────────────────────────────── -->
    <div class="container-content grid gap-12 py-16 md:grid-cols-12 md:gap-10 lg:py-20">
      <!-- Columna izquierda: contacto + meta + socials -->
      <div ref="leftCol" class="md:col-span-7">
        <span class="ft-eyebrow eyebrow">
          <span class="h-px w-8 bg-accent/60"></span>
          Conectemos
        </span>

        <p
          class="ft-lead mt-6 max-w-lg font-display text-2xl font-semibold leading-tight text-white md:text-[28px]"
        >
          Gracias por llegar hasta acá.
          <span class="text-white/45">
            Quedó la puerta abierta para lo que sigue.
          </span>
        </p>

        <!-- Meta: ubicación + hora local en vivo -->
        <div class="ft-meta mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-white/55">
          <span class="inline-flex items-center gap-2">
            <font-awesome-icon
              :icon="['fas', 'location-dot']"
              class="text-[10px] text-accent-light"
            />
            {{ profile.location }}
          </span>
          <span class="h-3 w-px bg-white/15"></span>
          <span class="inline-flex items-center gap-2 tabular-nums">
            <font-awesome-icon
              :icon="['fas', 'clock']"
              class="text-[10px] text-white/40"
            />
            {{ localTime }}
            <span class="text-white/30">GMT-6</span>
          </span>
        </div>

        <!-- Socials -->
        <div ref="socials" class="mt-8 flex flex-wrap gap-3">
          <a
            v-for="social in socialLinks"
            :key="social.label"
            :href="social.href"
            :target="social.external ? '_blank' : undefined"
            :rel="social.external ? 'noopener noreferrer' : undefined"
            :aria-label="social.label"
            class="ft-social link-icon"
          >
            <font-awesome-icon :icon="social.icon" />
          </a>
        </div>
      </div>

      <!-- Columna derecha: sitemap + CV -->
      <nav ref="rightCol" class="md:col-span-5" aria-label="Mapa del sitio">
        <span class="ft-eyebrow mono-label">Navegar</span>

        <ul class="ft-nav mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <li v-for="item in navItems" :key="item.label" class="ft-nav-item">
            <RouterLink
              :to="item.to"
              class="group inline-flex items-center gap-2.5 text-sm text-white/65 transition-colors duration-300 hover:text-white"
            >
              <span
                class="h-px w-4 origin-left scale-x-50 bg-white/30 transition-all duration-500 group-hover:scale-x-100 group-hover:bg-accent"
              ></span>
              <span class="transition-transform duration-300 group-hover:translate-x-0.5">
                {{ item.label }}
              </span>
            </RouterLink>
          </li>
        </ul>

        <a
          :href="profile.cvUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="ft-cv btn-ghost mt-10 w-full justify-between sm:w-auto sm:justify-center"
        >
          Descargar CV
          <font-awesome-icon
            :icon="['fas', 'arrow-up-right-from-square']"
            class="text-[11px]"
          />
        </a>
      </nav>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
         TIER 2 — Wordmark cinematográfico (protagonista)
       ───────────────────────────────────────────────────────────── -->
    <div class="container-content py-10 md:py-14">
      <div ref="wordmarkWrap" class="wordmark-wrap overflow-hidden">
        <h2
          ref="wordmark"
          aria-hidden="true"
          class="wordmark select-none whitespace-nowrap font-display font-bold tracking-[-0.04em] text-white/[0.08]"
        >
          Jared Garcia<span class="text-accent/80">.</span>
        </h2>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
         TIER 3 — Meta bar (sobrio, mono)
       ───────────────────────────────────────────────────────────── -->
    <div class="border-t border-white/[0.06]">
      <div
        class="container-content flex flex-col gap-3 py-6 font-mono text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>
          © {{ year }} {{ profile.name }}
          <span class="mx-2 text-white/20">·</span>
        </p>
        <p class="inline-flex items-center gap-3 uppercase tracking-[0.18em]">
          <span class="text-white/30">v1.0</span>
          <span class="h-3 w-px bg-white/15"></span>
          <span>Made in Honduras</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { profile } from "@/data/profile";
import { gsap, prefersReducedMotion, replayOnEnter } from "@/lib/gsap";

const year = new Date().getFullYear();

// ── Refs ─────────────────────────────────────────────────────────
const root = ref(null);
const leftCol = ref(null);
const rightCol = ref(null);
const socials = ref(null);
const wordmarkWrap = ref(null);
const wordmark = ref(null);

// ── Sitemap (mismas rutas que el Header) ─────────────────────────
const navItems = [
  { label: "Inicio", to: { name: "home" } },
  { label: "Sobre mí", to: { name: "home", hash: "#about" } },
  { label: "Proyectos", to: { name: "projects" } },
  { label: "Servicios", to: { name: "home", hash: "#services" } },
  { label: "Skills", to: { name: "home", hash: "#skills" } },
  { label: "Contacto", to: { name: "home", hash: "#contact" } },
];

// ── Socials (orden por jerarquía: trabajo → mensajería → email) ──
const socialLinks = computed(() => [
  {
    label: "GitHub",
    href: profile.socials.github,
    icon: ["fab", "github"],
    external: true,
  },
  {
    label: "LinkedIn",
    href: profile.socials.linkedin,
    icon: ["fab", "linkedin"],
    external: true,
  },
  {
    label: "WhatsApp",
    href: profile.socials.whatsapp,
    icon: ["fab", "whatsapp"],
    external: true,
  },
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    icon: ["fas", "envelope"],
    external: false,
  },
]);

// ── Hora local de Honduras (GMT-6, en vivo) ──────────────────────
// Usamos Intl con timeZone fijo para no depender del reloj del visitante:
// alguien en Tokio verá igualmente la hora real en Honduras.
const timeFormatter = new Intl.DateTimeFormat("es-HN", {
  timeZone: "America/Tegucigalpa",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const localTime = ref(timeFormatter.format(new Date()));
let clockId;

const updateClock = () => {
  localTime.value = timeFormatter.format(new Date());
};

// ── Animaciones GSAP ─────────────────────────────────────────────
let ctx;

onMounted(() => {
  // Reloj corre siempre, hasta con reduced-motion (no es animación).
  updateClock();
  clockId = setInterval(updateClock, 30_000);

  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // ── Tier 1: stagger sobrio en entry (chrome) ──────────────
    // start top 92%, total ≤ 1s, amount fijo (consistente con AboutValues).
    const tlChrome = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
    });

    tlChrome
      .from(".ft-eyebrow", {
        opacity: 0,
        y: 14,
        filter: "blur(4px)",
        duration: 0.6,
        stagger: { amount: 0.1 },
      })
      .from(
        ".ft-lead",
        {
          opacity: 0,
          y: 18,
          filter: "blur(5px)",
          duration: 0.7,
        },
        "<0.1"
      )
      .from(
        ".ft-meta",
        {
          opacity: 0,
          y: 12,
          duration: 0.55,
        },
        "<0.15"
      )
      .from(
        ".ft-social",
        {
          opacity: 0,
          y: 14,
          scale: 0.94,
          filter: "blur(4px)",
          duration: 0.55,
          stagger: { amount: 0.2 },
        },
        "<0.05"
      )
      .from(
        ".ft-nav-item",
        {
          opacity: 0,
          y: 12,
          filter: "blur(3px)",
          duration: 0.5,
          stagger: { amount: 0.25 },
        },
        "<0"
      )
      .from(
        ".ft-cv",
        {
          opacity: 0,
          y: 14,
          scale: 0.96,
          duration: 0.55,
        },
        "<0.1"
      );

    replayOnEnter(tlChrome, {
      trigger: root.value,
      start: "top 92%",
    });

    // ── Tier 2: wordmark protagonista (clipPath + blur) ───────
    // Persiana subiendo desde abajo + blur fuerte que se resuelve.
    // Stagger interno: un beat tras el chrome para sentirse "cierre".
    const tlWordmark = gsap.timeline({
      paused: true,
      defaults: { ease: "expo.out" },
    });

    tlWordmark.from(wordmark.value, {
      clipPath: "inset(100% 0 0 0)",
      yPercent: 14,
      filter: "blur(10px)",
      opacity: 0.4,
      duration: 1.4,
    });

    replayOnEnter(tlWordmark, {
      trigger: wordmarkWrap.value,
      start: "top 88%",
    });
  }, root.value);
});

onUnmounted(() => {
  clearInterval(clockId);
  ctx?.revert();
});
</script>

<style scoped>
/* Wordmark fluido: escala con el viewport para sentirse "edge to edge".
   clamp() mantiene legibilidad en mobile y impacto en desktop sin overflow
   (el .wordmark-wrap tiene overflow-hidden para el clipPath reveal). */
.wordmark {
  font-size: clamp(3.5rem, 14vw, 11rem);
  line-height: 0.9;
}
</style>
