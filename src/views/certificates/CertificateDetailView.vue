<template>
  <!-- Forzamos remount al cambiar de certificate (slug) para que las
       animaciones GSAP corran de nuevo. -->
  <div :key="certificate?.slug || 'not-found'">
    <div
      v-if="certificate"
      ref="root"
      class="container-content max-w-content py-12 md:py-16 lg:py-20"
    >
      <!-- Top bar: back + contador editorial -->
      <div
        class="mb-10 flex items-center justify-between gap-4 md:mb-14"
      >
        <button
          type="button"
          @click="router.back()"
          class="group inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-accent-light"
        >
          <font-awesome-icon
            :icon="['fas', 'arrow-left']"
            class="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Volver
        </button>

        <p
          class="hidden font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/35 md:flex md:items-center md:gap-3"
        >
          <span>Certificado</span>
          <span class="h-px w-6 bg-white/15"></span>
          <span class="text-white/70">
            {{ String(currentNumber).padStart(2, "0") }}
          </span>
          <span class="text-white/35">/</span>
          <span>{{ String(totalCount).padStart(2, "0") }}</span>
        </p>
      </div>

      <!-- Hero layout: meta sidebar + main -->
      <div class="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
        <!-- Sidebar (sticky en desktop) -->
        <aside class="meta-sidebar lg:sticky lg:top-28 lg:self-start">
          <!-- Número editorial gigante decorativo -->
          <div class="cert-number-wrap overflow-hidden">
            <p
              class="cert-number block font-display text-[88px] font-bold leading-[0.85] tracking-tight text-white/[0.06] md:text-[120px]"
            >
              {{ String(currentNumber).padStart(2, "0") }}
            </p>
          </div>

          <!-- Hairline accent -->
          <div class="meta-item mt-8 h-px w-12 bg-accent"></div>

          <!-- Meta list editorial -->
          <dl class="mt-8 space-y-6">
            <div class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Emitido por
              </dt>
              <dd class="mt-2 flex items-center gap-2.5 text-white">
                <font-awesome-icon
                  :icon="['fas', 'certificate']"
                  class="text-sm text-accent-light"
                />
                <span class="text-base font-semibold">
                  {{ certificate.issuer }}
                </span>
              </dd>
            </div>

            <div v-if="certificate.status" class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Estado
              </dt>
              <dd class="mt-2">
                <span
                  class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                  :class="statusStyle(certificate.status)"
                >
                  <span class="relative flex h-1.5 w-1.5">
                    <span
                      class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-current opacity-75"
                    ></span>
                    <span
                      class="relative inline-flex h-1.5 w-1.5 rounded-full bg-current"
                    ></span>
                  </span>
                  {{ certificate.status }}
                </span>
              </dd>
            </div>

            <div class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Áreas cubiertas
              </dt>
              <dd class="mt-2 flex items-baseline gap-2">
                <span class="font-display text-2xl font-bold text-white">
                  {{ certificate.topics.length }}
                </span>
                <span class="text-sm text-white/55">
                  {{ certificate.topics.length === 1 ? "tema" : "temas" }}
                </span>
              </dd>
            </div>

            <div class="meta-item">
              <dt
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Formato
              </dt>
              <dd class="mt-2 text-sm text-white/75">
                Curso online · Práctico
              </dd>
            </div>
          </dl>

          <!-- Mini hairline + CTA -->
          <div class="meta-item mt-8 h-px w-12 bg-white/15"></div>

          <RouterLink
            :to="{ name: 'home', hash: '#contact' }"
            class="meta-item mt-6 inline-flex items-center gap-2 text-sm text-white/65 transition-colors duration-300 hover:text-accent-light"
          >
            Hablemos sobre esto
            <font-awesome-icon
              :icon="['fas', 'arrow-right']"
              class="text-[11px] transition-transform duration-300 group-hover:translate-x-1"
            />
          </RouterLink>
        </aside>

        <!-- Main content -->
        <div class="main-content">
          <!-- Eyebrow -->
          <p
            class="cert-eyebrow flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
          >
            <span class="h-px w-8 bg-accent"></span>
            Formación · Recorrido completo
          </p>

          <!-- Title con clipPath reveal -->
          <div class="cert-title-wrap mt-5 overflow-hidden md:mt-6">
            <h1
              class="cert-title font-display text-4xl font-bold leading-[1.02] tracking-tight text-white md:text-[56px] lg:text-[64px]"
            >
              {{ certificate.title }}
            </h1>
          </div>

          <!-- Decorative meta strip bajo el título -->
          <div
            class="cert-strip mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/55 md:mt-10"
          >
            <span class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', 'graduation-cap']"
                class="text-xs text-white/35"
              />
              {{ certificate.issuer }}
            </span>
            <span class="hidden h-px w-6 bg-white/15 sm:block"></span>
            <span class="flex items-center gap-2">
              <font-awesome-icon
                :icon="['fas', 'list-check']"
                class="text-xs text-white/35"
              />
              {{ certificate.topics.length }} temas cubiertos
            </span>
            <span
              v-if="certificate.status"
              class="hidden h-px w-6 bg-white/15 sm:block"
            ></span>
            <span
              v-if="certificate.status"
              class="flex items-center gap-2 font-semibold text-accent-light"
            >
              <span
                class="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-accent"
              ></span>
              {{ certificate.status }}
            </span>
          </div>

          <!-- Lead description con drop cap -->
          <div class="cert-description mt-10 max-w-2xl md:mt-12">
            <p
              class="cert-description-text text-lg leading-[1.75] text-white/75 md:text-xl"
            >
              {{ certificate.description }}
            </p>
          </div>

          <!-- Topics: stack del recorrido -->
          <section
            v-if="certificate.topics?.length"
            ref="topicsSection"
            class="mt-16 md:mt-20"
          >
            <header class="mb-6 flex items-center justify-between gap-4">
              <p
                class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
              >
                <span class="h-px w-8 bg-accent"></span>
                Stack del recorrido
              </p>
              <span
                class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/35"
              >
                {{ certificate.topics.length }} items
              </span>
            </header>

            <ul class="topics-grid grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              <li
                v-for="topic in certificate.topics"
                :key="topic"
                class="topic-card group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.04]"
              >
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent-light transition-all duration-300 group-hover:scale-110 group-hover:border-accent/50 group-hover:bg-accent/20"
                >
                  <font-awesome-icon
                    :icon="['fas', 'check']"
                    class="text-[10px]"
                  />
                </span>
                <span
                  class="text-sm font-medium text-white/80 transition-colors duration-300 group-hover:text-white"
                >
                  {{ topic }}
                </span>
              </li>
            </ul>
          </section>

          <!-- CTA section -->
          <section ref="ctaSection" class="cert-cta mt-16 md:mt-24">
            <div
              class="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-ink-900 via-ink-900 to-ink-850 p-8 md:p-14"
            >
              <!-- Glow ambient -->
              <div
                class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/[0.12] blur-3xl"
              ></div>
              <div
                class="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/[0.06] blur-3xl"
              ></div>

              <div class="relative">
                <p
                  class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
                >
                  <span class="h-px w-8 bg-accent"></span>
                  Próximo paso
                </p>
                <h2
                  class="mt-5 font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl lg:text-[36px]"
                >
                  ¿Querés que apliquemos este stack en tu próximo proyecto?
                </h2>
                <p class="mt-4 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
                  Hablemos sobre cómo puedo ayudarte a llevar tu idea a
                  producción con las tecnologías y prácticas de este recorrido.
                </p>

                <div class="mt-9 flex flex-wrap items-center gap-3">
                  <RouterLink
                    :to="{ name: 'home', hash: '#contact' }"
                    class="btn-primary"
                  >
                    Hablemos
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </RouterLink>
                  <RouterLink
                    :to="{ name: 'home', hash: '#aprendizaje' }"
                    class="btn-ghost"
                  >
                    Ver más certificados
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>

          <!-- Nav prev/next -->
          <nav
            v-if="prevCert || nextCert"
            ref="navSection"
            class="cert-nav mt-12 grid gap-3 sm:grid-cols-2 md:mt-16"
          >
            <RouterLink
              v-if="prevCert"
              :to="`/certificate/${prevCert.slug}`"
              class="nav-link group flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04]"
            >
              <p
                class="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                <font-awesome-icon
                  :icon="['fas', 'arrow-left']"
                  class="text-[9px] transition-transform duration-300 group-hover:-translate-x-1"
                />
                Anterior
              </p>
              <p
                class="font-display text-sm font-semibold leading-snug text-white/80 transition-colors duration-300 group-hover:text-accent-light md:text-base"
              >
                {{ prevCert.title }}
              </p>
            </RouterLink>
            <div v-else></div>

            <RouterLink
              v-if="nextCert"
              :to="`/certificate/${nextCert.slug}`"
              class="nav-link group flex flex-col gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.04] sm:items-end sm:text-right"
            >
              <p
                class="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
              >
                Siguiente
                <font-awesome-icon
                  :icon="['fas', 'arrow-right']"
                  class="text-[9px] transition-transform duration-300 group-hover:translate-x-1"
                />
              </p>
              <p
                class="font-display text-sm font-semibold leading-snug text-white/80 transition-colors duration-300 group-hover:text-accent-light md:text-base"
              >
                {{ nextCert.title }}
              </p>
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div
      v-else
      class="container-content flex flex-col items-center gap-4 py-32 text-center"
    >
      <font-awesome-icon
        :icon="['fas', 'folder-open']"
        class="text-4xl text-white/20"
      />
      <p class="text-white/55">No se encontró el certificado.</p>
      <RouterLink :to="{ name: 'home' }" class="btn-ghost">
        Volver al inicio
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useCertifications } from "@/stores/certifications";
import { statusStyle } from "@/lib/status";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const route = useRoute();
const router = useRouter();
const certificationStore = useCertifications();

const certificate = computed(() =>
  certificationStore.certificationsCollection.find(
    (c) => c.slug === route.params.slug
  )
);

const certificateIndex = computed(() => {
  if (!certificate.value) return -1;
  return certificationStore.certificationsCollection.findIndex(
    (c) => c.slug === certificate.value.slug
  );
});

const currentNumber = computed(() => certificateIndex.value + 1);
const totalCount = computed(
  () => certificationStore.certificationsCollection.length
);

const prevCert = computed(() => {
  const i = certificateIndex.value;
  return i > 0 ? certificationStore.certificationsCollection[i - 1] : null;
});

const nextCert = computed(() => {
  const i = certificateIndex.value;
  return i >= 0 &&
    i < certificationStore.certificationsCollection.length - 1
    ? certificationStore.certificationsCollection[i + 1]
    : null;
});

const root = ref(null);
const topicsSection = ref(null);
const ctaSection = ref(null);
const navSection = ref(null);

let ctx;

onMounted(() => {
  if (!certificate.value) return;
  // Scroll to top en cada nuevo cert (por si el router no lo hace)
  window.scrollTo({ top: 0, behavior: "instant" });

  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // ── HERO ENTRANCE (al mount, no scroll-trigger) ────────────────────
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Número editorial decorativo: sube desde abajo como el wordmark del Hero
    tl.from(
      ".cert-number",
      {
        yPercent: 110,
        duration: 0.85,
        ease: "expo.out",
      },
      0
    );

    // Sidebar meta items: stagger desde la izquierda
    tl.from(
      ".meta-item",
      {
        opacity: 0,
        x: -16,
        duration: 0.55,
        stagger: 0.06,
        clearProps: "transform,opacity",
      },
      0.15
    );

    // Eyebrow del main
    tl.from(
      ".cert-eyebrow",
      {
        opacity: 0,
        x: -12,
        duration: 0.5,
        clearProps: "transform,opacity",
      },
      0.1
    );

    // Title con clipPath reveal (estilo StackedProjects)
    tl.from(
      ".cert-title",
      {
        clipPath: "inset(100% 0 0 0)",
        yPercent: 6,
        duration: 0.9,
        ease: "expo.out",
      },
      0.15
    );

    // Strip meta debajo del título
    tl.from(
      ".cert-strip",
      {
        opacity: 0,
        y: 16,
        duration: 0.55,
        clearProps: "transform,opacity",
      },
      0.35
    );

    // Descripción
    tl.from(
      ".cert-description",
      {
        opacity: 0,
        y: 20,
        duration: 0.65,
        clearProps: "transform,opacity",
      },
      0.45
    );

    // ── TOPICS GRID (al scroll) ─────────────────────────────────────────
    if (topicsSection.value) {
      const cards = topicsSection.value.querySelectorAll(".topic-card");
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 18, scale: 0.96 });

        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries[0].isIntersecting) return;
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              stagger: 0.035,
              ease: "power3.out",
              clearProps: "transform,opacity",
            });
            obs.disconnect();
          },
          { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
        );

        obs.observe(topicsSection.value);
      }
    }

    // ── CTA SECTION (al scroll) ────────────────────────────────────────
    if (ctaSection.value) {
      gsap.set(ctaSection.value, { opacity: 0, y: 32 });

      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          gsap.to(ctaSection.value, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power4.out",
            clearProps: "transform,opacity",
          });
          obs.disconnect();
        },
        { threshold: 0.1 }
      );

      obs.observe(ctaSection.value);
    }

    // ── NAV PREV/NEXT (al scroll) ──────────────────────────────────────
    if (navSection.value) {
      const links = navSection.value.querySelectorAll(".nav-link");
      if (links.length) {
        gsap.set(links, { opacity: 0, y: 20 });

        const obs = new IntersectionObserver(
          (entries) => {
            if (!entries[0].isIntersecting) return;
            gsap.to(links, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            });
            obs.disconnect();
          },
          { threshold: 0.1 }
        );

        obs.observe(navSection.value);
      }
    }
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>

<style scoped>
/* Drop cap editorial en la primera letra de la descripción. Tipografía
   display, color accent, sangría leve. Solo en pantallas md+ para que en
   mobile no compita con el flow de lectura compacto. */
@media (min-width: 768px) {
  .cert-description-text::first-letter {
    font-family: "Space Grotesk", "Inter", sans-serif;
    float: left;
    font-size: 4.5rem;
    line-height: 0.85;
    font-weight: 700;
    color: rgb(74 222 128);
    padding: 0.35rem 0.65rem 0 0;
  }
}
</style>
