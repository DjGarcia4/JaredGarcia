<template>
  <header
    ref="headerRef"
    class="fixed top-0 z-30 w-full transition-all duration-300"
    :class="
      scrolled || mobileOpen
        ? 'border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-xl'
        : 'border-b border-transparent'
    "
  >
    <div class="container-content flex h-20 items-center justify-between gap-4">

      <!-- Logo -->
      <RouterLink
        :to="{ name: 'home' }"
        class="group flex items-center gap-3"
        @click="closeMobile"
      >
        <span class="hdr-logo-mark-wrap inline-block overflow-hidden rounded-lg">
          <span
            class="hdr-logo-mark flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-sans text-sm font-bold text-ink-950 shadow-glow transition-colors duration-300 group-hover:bg-accent-light"
          >
            JG
          </span>
        </span>
        <span
          class="hdr-logo-text font-sans text-base font-bold text-white sm:text-lg"
        >
          Jared Garcia
        </span>
      </RouterLink>

      <!-- Nav desktop -->
      <nav class="hidden items-center gap-0.5 lg:flex">
        <span class="hdr-nav-item"><Link to="home">Inicio</Link></span>
        <span class="hdr-nav-item"><Link to="home" hash="#about">Sobre mí</Link></span>
        <span class="hdr-nav-item"><Link to="projects">Proyectos</Link></span>
        <span class="hdr-nav-item"><Link to="home" hash="#services">Servicios</Link></span>
        <span class="hdr-nav-item"><Link to="home" hash="#skills">Skills</Link></span>
      </nav>

      <!-- Aside derecha desktop -->
      <div class="hidden items-center gap-4 lg:flex">
        <!-- Status indicator -->
        <span
          class="hdr-aside-item inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/65"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"
            ></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          Disponible
        </span>

        <!-- CTA -->
        <RouterLink
          :to="{ name: 'home', hash: '#contact' }"
          class="hdr-aside-item inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink-950 transition-all duration-300 hover:bg-accent-light hover:shadow-glow active:scale-[0.98]"
        >
          Hablemos
          <font-awesome-icon
            :icon="['fas', 'arrow-right']"
            class="text-[11px]"
          />
        </RouterLink>
      </div>

      <!-- Hamburger mobile -->
      <button
        type="button"
        :aria-expanded="mobileOpen"
        aria-controls="mobile-nav"
        aria-label="Abrir menú"
        class="hdr-aside-item flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/80 transition-colors hover:border-accent/40 hover:text-white lg:hidden"
        @click="toggleMobile"
      >
        <span class="relative block h-3.5 w-5">
          <span
            class="absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300"
            :class="mobileOpen ? 'translate-y-[6px] rotate-45' : ''"
          ></span>
          <span
            class="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-opacity duration-200"
            :class="mobileOpen ? 'opacity-0' : ''"
          ></span>
          <span
            class="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300"
            :class="mobileOpen ? '-translate-y-[6px] -rotate-45' : ''"
          ></span>
        </span>
      </button>
    </div>

    <!-- Mobile drawer -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      leave-active-class="transition duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
      @after-enter="animateDrawerItems"
    >
      <div
        v-if="mobileOpen"
        id="mobile-nav"
        class="border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-xl lg:hidden"
      >
        <nav class="container-content flex flex-col gap-1 py-5">
          <RouterLink
            v-for="item in mobileItems"
            :key="item.label"
            :to="item.to"
            class="mobile-nav-item flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.04] hover:text-white"
            :class="
              isMobileItemActive(item)
                ? 'bg-white/[0.04] text-white'
                : ''
            "
            @click="closeMobile"
          >
            <span>{{ item.label }}</span>
            <font-awesome-icon
              :icon="['fas', 'arrow-right']"
              class="text-[10px] text-white/30"
            />
          </RouterLink>

          <div class="mobile-nav-item my-3 h-px bg-white/[0.06]"></div>

          <div class="mobile-nav-item flex items-center justify-between px-4 pb-1">
            <span class="inline-flex items-center gap-2 text-xs text-white/60">
              <span class="relative flex h-2 w-2">
                <span
                  class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"
                ></span>
                <span
                  class="relative inline-flex h-2 w-2 rounded-full bg-accent"
                ></span>
              </span>
              Disponible para proyectos
            </span>
          </div>

          <RouterLink
            :to="{ name: 'home', hash: '#contact' }"
            class="mobile-nav-item mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-light"
            @click="closeMobile"
          >
            Hablemos
            <font-awesome-icon
              :icon="['fas', 'arrow-right']"
              class="text-[11px]"
            />
          </RouterLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import Link from "@/components/Link.vue";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

defineProps({
  scrolled: { type: Boolean, default: false },
});

const route = useRoute();
const headerRef = ref(null);
const mobileOpen = ref(false);

const mobileItems = [
  { label: "Inicio", to: { name: "home" } },
  { label: "Sobre mí", to: { name: "home", hash: "#about" } },
  { label: "Proyectos", to: { name: "projects" } },
  { label: "Servicios", to: { name: "home", hash: "#services" } },
  { label: "Skills", to: { name: "home", hash: "#skills" } },
];

const isMobileItemActive = (item) => {
  if (item.to.hash) {
    return route.name === item.to.name && route.hash === item.to.hash;
  }
  return route.name === item.to.name && !route.hash;
};

const toggleMobile = () => {
  mobileOpen.value = !mobileOpen.value;
};

const closeMobile = () => {
  mobileOpen.value = false;
};

// Cerrar drawer al cambiar de ruta o hash.
watch(
  () => [route.path, route.hash],
  closeMobile
);

// Cerrar con Escape.
const onKey = (e) => {
  if (e.key === "Escape" && mobileOpen.value) closeMobile();
};

// Lock scroll del body cuando el menú mobile está abierto.
const lockBody = computed(() => mobileOpen.value);
watch(lockBody, (locked) => {
  document.documentElement.style.overflow = locked ? "hidden" : "";
});

// ───────── Animación de entrada (GSAP) ─────────
// Espera con RAF a que el header sea realmente visible (no detrás del splash)
// antes de animar. Sin esto, el reveal sucede mientras está display:none.
let ctx;

const runEntryAnimation = () => {
  if (!headerRef.value) return;

  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Logo mark: clipPath reveal "construyéndose desde abajo".
    tl.from(".hdr-logo-mark", {
      clipPath: "inset(100% 0 0 0)",
      yPercent: 12,
      duration: 1,
      ease: "expo.out",
    });

    // Nombre al lado del logo: slide-in horizontal con blur.
    tl.from(
      ".hdr-logo-text",
      {
        opacity: 0,
        x: -18,
        filter: "blur(4px)",
        duration: 0.75,
      },
      "<0.2"
    );

    // Nav items: stagger horizontal con blur sutil.
    tl.from(
      ".hdr-nav-item",
      {
        opacity: 0,
        y: -16,
        scale: 0.96,
        filter: "blur(6px)",
        duration: 0.85,
        stagger: 0.07,
      },
      "<0.1"
    );

    // Aside derecha (status + CTA + hamburger): stagger desde arriba.
    tl.from(
      ".hdr-aside-item",
      {
        opacity: 0,
        y: -16,
        scale: 0.95,
        filter: "blur(6px)",
        duration: 0.85,
        stagger: 0.09,
      },
      "<0.1"
    );
  }, headerRef.value);
};

const animateDrawerItems = () => {
  if (prefersReducedMotion()) return;
  gsap.from(".mobile-nav-item", {
    opacity: 0,
    y: -16,
    scale: 0.97,
    filter: "blur(4px)",
    duration: 0.55,
    ease: "power4.out",
    stagger: 0.06,
  });
};

onMounted(() => {
  window.addEventListener("keydown", onKey);

  if (prefersReducedMotion()) return;

  // RAF polling hasta que el header sea realmente visible (offsetParent ≠ null
  // significa que ningún ancestro está en display:none — i.e. el splash terminó).
  const waitVisible = () => {
    if (!headerRef.value) return;
    if (headerRef.value.offsetParent !== null) {
      runEntryAnimation();
    } else {
      requestAnimationFrame(waitVisible);
    }
  };
  requestAnimationFrame(waitVisible);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
  document.documentElement.style.overflow = "";
  ctx?.revert();
});
</script>
