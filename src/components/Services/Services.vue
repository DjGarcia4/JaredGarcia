<template>
  <section ref="root" class="container-content py-20 md:py-28">
    <!-- Pin target: incluye title + card. Ambos quedan fijos juntos durante
         el scrollytelling, para que el header "Lo que ofrezco" no se vaya
         arriba mientras el user explora los servicios. -->
    <div ref="pinTarget">
      <TitleSection eyebrow="Servicios">
        Lo que ofrezco
      </TitleSection>

      <div
        ref="wrap"
        class="surface relative overflow-hidden"
      >
        <div class="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
          <!-- Tabs list -->
          <div
            class="relative border-b border-white/[0.07] lg:border-b-0 lg:border-r"
          >
            <!-- Indicador vertical (solo desktop) -->
            <div
              ref="indicator"
              aria-hidden="true"
              class="pointer-events-none absolute left-3 top-0 hidden h-12 w-[2px] rounded-full bg-accent lg:block"
            ></div>

            <ul
              role="tablist"
              aria-label="Servicios"
              class="no-scrollbar flex overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3"
            >
              <li
                v-for="(service, i) in services"
                :key="service.title"
                class="flex-shrink-0 lg:flex-shrink"
              >
                <button
                  type="button"
                  role="tab"
                  :aria-selected="active === i"
                  :tabindex="active === i ? 0 : -1"
                  @click="setActive(i)"
                  class="service-tab group relative flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-left transition-colors duration-300 lg:gap-4 lg:px-5 lg:py-3.5"
                  :class="
                    active === i
                      ? 'bg-white/[0.05] text-white'
                      : 'text-white/55 hover:bg-white/[0.025] hover:text-white/85'
                  "
                >
                  <span
                    class="font-mono text-[11px] font-bold tracking-[0.22em] transition-colors duration-300"
                    :class="active === i ? 'text-accent' : 'text-white/35'"
                  >
                    {{ String(i + 1).padStart(2, "0") }}
                  </span>
                  <span
                    class="font-display text-sm font-semibold tracking-tight lg:text-[15px]"
                  >
                    {{ service.short || service.title }}
                  </span>
                  <font-awesome-icon
                    :icon="['fas', service.icon]"
                    class="ml-auto hidden text-xs transition-all duration-300 lg:block"
                    :class="
                      active === i
                        ? 'translate-x-0 text-accent-light opacity-100'
                        : '-translate-x-1 text-white/30 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    "
                  />
                </button>
              </li>
            </ul>
          </div>

          <!-- Panel derecho -->
          <div
            ref="panel"
            class="relative min-h-[420px] p-7 md:min-h-[480px] md:p-12 lg:min-h-[520px] lg:p-14"
          >
            <!-- Glow ambient -->
            <div
              class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/8 blur-3xl"
            ></div>

            <!-- Progress hint (sutil) -->
            <div
              class="pointer-events-none absolute right-5 top-5 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 md:right-6 md:top-6"
            >
              <span class="hidden sm:inline">Scroll para avanzar</span>
              <font-awesome-icon
                :icon="['fas', 'arrow-down']"
                class="text-[9px]"
              />
            </div>

            <div ref="panelContent" class="relative">
              <!-- Eyebrow contador -->
              <p
                class="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
              >
                <span class="h-px w-8 bg-accent"></span>
                Servicio {{ String(displayed + 1).padStart(2, "0") }} /
                {{ String(services.length).padStart(2, "0") }}
              </p>

              <!-- Icon -->
              <div
                class="mt-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-2xl text-accent-light md:h-20 md:w-20 md:text-3xl"
              >
                <font-awesome-icon :icon="['fas', displayedService.icon]" />
              </div>

              <!-- Title -->
              <h3
                class="mt-7 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-[44px]"
              >
                {{ displayedService.title }}
              </h3>

              <!-- Description -->
              <p
                class="mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg"
              >
                {{ displayedService.description }}
              </p>

              <!-- Bullets -->
              <ul
                v-if="displayedService.bullets?.length"
                class="mt-8 space-y-2.5"
              >
                <li
                  v-for="bullet in displayedService.bullets"
                  :key="bullet"
                  class="flex items-start gap-3 text-sm leading-relaxed text-white/70 md:text-base"
                >
                  <span
                    class="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent md:mt-[10px]"
                  ></span>
                  <span>{{ bullet }}</span>
                </li>
              </ul>

              <!-- Stack -->
              <div
                v-if="displayedService.stack?.length"
                class="mt-8 flex flex-wrap items-center gap-3"
              >
                <span
                  class="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/40"
                >
                  Stack
                </span>
                <span class="h-px w-6 bg-white/15"></span>
                <span
                  v-for="tag in displayedService.stack"
                  :key="tag"
                  class="chip"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- CTA -->
              <a
                href="#contact"
                class="mt-10 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent-light transition-all duration-300 hover:border-accent hover:bg-accent hover:text-ink-950"
              >
                Hablemos sobre este servicio
                <font-awesome-icon
                  :icon="['fas', 'arrow-right']"
                  class="text-xs transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import TitleSection from "@/components/TitleSection.vue";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const services = [
  {
    title: "Desarrollo Web Fullstack",
    short: "Fullstack",
    description:
      "Aplicaciones web completas con Vue 3 y React: frontend impecable, backend con Node y Firebase, listas para producción y a escala.",
    icon: "code",
    bullets: [
      "Frontend reactivo con Vue 3 o React",
      "Backend serverless con Node y Firebase",
      "Pipeline CI/CD y deploy a producción",
    ],
    stack: ["Vue", "React", "Node", "Firebase"],
  },
  {
    title: "Aplicaciones Móviles",
    short: "Móviles",
    description:
      "Apps nativas para iOS y Android construidas con React Native, integradas con APIs REST/GraphQL y servicios cloud.",
    icon: "mobile-screen",
    bullets: [
      "React Native — un código, dos plataformas",
      "Push notifications y modo offline",
      "Integración con GraphQL, Firebase y APIs",
    ],
    stack: ["React Native", "Expo", "GraphQL"],
  },
  {
    title: "Plataformas SaaS Multi-tenant",
    short: "SaaS Multi-tenant",
    description:
      "Arquitecturas escalables con datos aislados por cliente, control de acceso por roles y autenticación multifactor lista para producción.",
    icon: "layer-group",
    bullets: [
      "Aislamiento de datos por cliente",
      "RBAC + autenticación multifactor",
      "Onboarding self-service para nuevos tenants",
    ],
    stack: ["Vue", "Firebase", "Auth"],
  },
  {
    title: "Paneles Administrativos",
    short: "Dashboards",
    description:
      "Dashboards a medida con CRUD completo, filtros avanzados, reportes exportables y datos en tiempo real.",
    icon: "chart-line",
    bullets: [
      "CRUD completo con filtros y búsqueda",
      "Reportes exportables (CSV, PDF)",
      "Sincronización en tiempo real",
    ],
    stack: ["Vue", "PrimeVue", "Firestore"],
  },
  {
    title: "Diseño UI/UX",
    short: "UI/UX",
    description:
      "Prototipado en Figma, sistemas de diseño coherentes y experiencias de usuario con carácter editorial.",
    icon: "paint-brush",
    bullets: [
      "Wireframes y prototipos en Figma",
      "Sistema de diseño con tokens reusables",
      "Microinteracciones y motion design",
    ],
    stack: ["Figma", "GSAP", "Tailwind"],
  },
  {
    title: "Despliegue & DevOps",
    short: "DevOps",
    description:
      "Contenedores con Docker, integración continua, configuración de dominios y hosting optimizado para performance.",
    icon: "cloud-arrow-up",
    bullets: [
      "Contenedores Docker reproducibles",
      "CI/CD automatizado (GitHub Actions)",
      "DNS, SSL y CDN para performance",
    ],
    stack: ["Docker", "GH Actions", "Vercel"],
  },
];

const active = ref(0);
const displayed = ref(0);
const displayedService = computed(() => services[displayed.value]);

const root = ref(null);
const pinTarget = ref(null);
const wrap = ref(null);
const panel = ref(null);
const panelContent = ref(null);
const indicator = ref(null);

let ctx;
let pinST = null;
let isTransitioning = false;
let scrollingFromClick = false;

const moveIndicator = () => {
  if (!indicator.value || !wrap.value) return;
  if (window.innerWidth < 1024) return;
  const buttons = wrap.value.querySelectorAll(".service-tab");
  const btn = buttons[active.value];
  if (!btn) return;
  gsap.to(indicator.value, {
    y: btn.offsetTop,
    height: btn.offsetHeight,
    duration: 0.45,
    ease: "power3.out",
    overwrite: true,
  });
};

// Click manual en un tab. Si el pin está activo (desktop o mobile), scrollea
// a la posición correspondiente del pin — el onUpdate del ScrollTrigger setea
// active solo. Fallback: setea active directamente (prefers-reduced-motion).
const setActive = (i) => {
  if (i === active.value || isTransitioning) return;

  if (pinST) {
    const targetProgress = (i + 0.5) / services.length;
    const targetScroll =
      pinST.start + targetProgress * (pinST.end - pinST.start);
    scrollingFromClick = true;
    gsap.to(window, {
      scrollTo: { y: targetScroll, autoKill: true },
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: () => {
        scrollingFromClick = false;
      },
    });
  } else {
    active.value = i;
  }
};

watch(active, async (newVal) => {
  moveIndicator();

  if (prefersReducedMotion()) {
    displayed.value = newVal;
    return;
  }

  isTransitioning = true;

  await gsap.to(panelContent.value, {
    opacity: 0,
    y: 12,
    filter: "blur(6px)",
    duration: 0.2,
    ease: "power2.in",
  });

  displayed.value = newVal;
  await nextTick();

  await gsap.fromTo(
    panelContent.value,
    { opacity: 0, y: -12, filter: "blur(6px)" },
    {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.4,
      ease: "power3.out",
    }
  );

  isTransitioning = false;
});

onMounted(() => {
  nextTick(() => moveIndicator());
  window.addEventListener("resize", moveIndicator);

  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // Entrada cinematográfica del pin target completo (title + card como
    // 1 bloque, dispara antes del pin).
    gsap.from(pinTarget.value, {
      scrollTrigger: {
        trigger: pinTarget.value,
        start: "top 88%",
        toggleActions: "restart none none none",
      },
      opacity: 0,
      y: 36,
      scale: 0.98,
      filter: "blur(6px)",
      duration: 0.8,
      ease: "power4.out",
      clearProps: "filter,transform,opacity",
    });

    // Pin scrollytelling: pinea title + card juntos. Mientras dura el
    // scrollytelling el header "Lo que ofrezco" queda visible arriba.
    pinST = ScrollTrigger.create({
      trigger: pinTarget.value,
      start: "top top+=80",
      // Menos scroll por servicio en mobile (viewports más chicos): 320 vs 420.
      end: () => {
        const perService = window.innerWidth < 1024 ? 320 : 420;
        return `+=${services.length * perService}`;
      },
      pin: pinTarget.value,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (scrollingFromClick) return; // evita feedback loop con click manual
        const idx = Math.min(
          Math.floor(self.progress * services.length),
          services.length - 1
        );
        if (idx !== active.value) active.value = idx;
      },
    });
  }, root.value);
});

onUnmounted(() => {
  ctx?.revert();
  window.removeEventListener("resize", moveIndicator);
});
</script>
