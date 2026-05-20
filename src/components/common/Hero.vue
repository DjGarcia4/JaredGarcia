<template>
  <section ref="heroRef" class="relative overflow-hidden">
    <!-- Glow ambient (parallax con scroll) -->
    <div
      ref="glowRef"
      class="pointer-events-none absolute left-1/2 top-32 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/15 blur-[160px] animate-glow-pulse"
    ></div>

    <!-- ─────────── ACTO 1 · PRESENTACIÓN ─────────── -->
    <div
      ref="act1Ref"
      class="container-content relative flex min-h-[92vh] flex-col items-start justify-center py-16 md:py-20"
    >
      <!-- Edition strip -->
      <div
        class="act1-item flex w-full items-center gap-4 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/40"
      >
        <span class="text-accent">/</span>
        <span>edition_01 · 2026</span>
        <span class="h-px flex-1 bg-white/10"></span>
        <span>{{ profile.location }}</span>
      </div>

      <!-- Greeting -->
      <p
        class="act1-item mt-10 font-mono text-sm uppercase tracking-[0.3em] text-white/45 md:mt-14"
      >
        hola,&nbsp;soy
      </p>

      <!-- Name (wordmark) -->
      <h1
        class="act1-item act1-name mt-3 font-display text-[15vw] font-bold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-[7.5rem] lg:text-[8.5rem] xl:text-[9.5rem]"
      >
        Jared <span class="text-gradient">Garcia.</span>
      </h1>

      <!-- Tagline (rol protagónico) -->
      <p
        class="act1-item mt-6 font-display text-2xl font-bold leading-[1.1] tracking-tight text-white/85 sm:text-3xl md:mt-8 md:text-4xl lg:text-5xl"
      >
        Frontend Developer
        <br />
        <span class="text-white/45">& UX/UI Designer</span>
      </p>

      <!-- Location detail -->
      <div class="act1-item mt-8 flex items-center gap-3 md:mt-10">
        <span class="h-px w-10 bg-accent"></span>
        <p
          class="font-mono text-xs font-medium uppercase tracking-[0.28em] text-white/50"
        >
          {{ profile.location }} · since 2023
        </p>
      </div>

      <!-- Scroll hint -->
      <div
        class="act1-item pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 md:bottom-10"
      >
        <span>scroll</span>
        <span
          class="block h-8 w-px origin-top animate-glow-pulse bg-accent/60"
        ></span>
      </div>
    </div>

    <!-- ─────────── ACTO 2 · MANIFESTO ─────────── -->
    <div
      ref="act2Ref"
      class="container-content relative flex min-h-[92vh] flex-col items-start justify-center py-16 md:py-20"
    >
      <!-- Marker -->
      <div
        class="act2-item flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
      >
        <span class="text-accent">/</span>
        <span>02 · manifesto</span>
      </div>

      <!-- Claim -->
      <blockquote
        class="act2-item act2-quote mt-10 max-w-4xl font-display text-3xl font-bold leading-[1.15] tracking-tight text-white md:mt-14 md:text-5xl lg:text-6xl"
      >
        <span
          class="mr-2 font-display text-5xl font-bold leading-none text-accent md:text-7xl lg:text-8xl"
          aria-hidden="true"
          >«</span
        >Construyo interfaces
        <span class="text-white/55">que no solo funcionan —</span>
        cuentan una historia.<span
          class="ml-2 font-display text-5xl font-bold leading-none text-accent md:text-7xl lg:text-8xl"
          aria-hidden="true"
          >»</span
        >
      </blockquote>

      <!-- Attribution -->
      <p
        class="act2-item mt-10 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-white/45 md:mt-12"
      >
        <span class="h-px w-8 bg-white/20"></span>
        <span>{{ profile.name }}</span>
      </p>
    </div>

    <!-- ─────────── ACTO 3 · PRUEBA + ACCIÓN ─────────── -->
    <div
      ref="act3Ref"
      class="container-content relative flex min-h-[92vh] flex-col items-start justify-center py-16 md:py-20"
    >
      <!-- Marker -->
      <div
        class="act3-item flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light"
      >
        <span class="text-accent">/</span>
        <span>03 · números</span>
      </div>

      <!-- Stats full-width con detalle secundario -->
      <dl
        class="act3-item mt-10 grid w-full grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] backdrop-blur-md md:mt-12 md:grid-cols-3"
      >
        <div
          v-for="stat in stats"
          :key="stat.key"
          class="act3-stat bg-ink-950/40 p-6 md:p-8 lg:p-10"
        >
          <dd
            class="font-display text-5xl font-bold text-gradient md:text-6xl lg:text-7xl"
          >
            {{ display[stat.key] }}{{ stat.suffix }}
          </dd>
          <dt
            class="mt-4 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/55 md:text-xs"
          >
            {{ stat.label }}
          </dt>
          <p class="mt-2 font-sans text-sm leading-relaxed text-white/40">
            {{ stat.detail }}
          </p>
        </div>
      </dl>

      <!-- CTAs -->
      <div class="act3-item mt-12 flex flex-wrap items-center gap-3 md:mt-14">
        <button
          type="button"
          class="btn-primary"
          @click="router.push({ name: 'projects' })"
        >
          Ver mi trabajo
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </button>
        <button type="button" class="btn-ghost" @click="scrollToContact">
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
          Hablemos
        </button>
        <a
          :href="profile.cvUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ghost"
        >
          <font-awesome-icon :icon="['fas', 'file-arrow-down']" />
          CV
        </a>
      </div>

      <!-- Socials -->
      <div class="act3-item mt-8 flex items-center gap-3 md:mt-10">
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
        <a
          :href="`mailto:${profile.email}`"
          aria-label="Email"
          class="link-icon"
        >
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const router = useRouter();

const heroRef = ref(null);
const glowRef = ref(null);
const act1Ref = ref(null);
const act2Ref = ref(null);
const act3Ref = ref(null);

// Datos derivados de los proyectos reales.
const productionCount = projects.filter((p) => p.status === "Producción").length;
const earliestYear = Math.min(...projects.map((p) => p.year));

// Top 2 techs más usadas en los proyectos.
const topTechs = (() => {
  const counts = {};
  projects.forEach((p) => {
    (p.techStack || []).forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t]) => t);
})();

const targets = {
  projects: projects.length,
  years: new Date().getFullYear() - earliestYear,
  techs: skills.length,
};

const stats = computed(() => [
  {
    key: "projects",
    suffix: "",
    label: "Proyectos",
    detail: `${productionCount} en producción`,
  },
  {
    key: "years",
    suffix: "+",
    label: "Años creando",
    detail: `desde ${earliestYear}`,
  },
  {
    key: "techs",
    suffix: "",
    label: "Tecnologías",
    detail: `${topTechs.join(" · ")} principales`,
  },
]);

const display = reactive({ projects: 0, years: 0, techs: 0 });

let ctx;
let snapTrigger;

const scrollToContact = () => {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
};

onMounted(() => {
  if (prefersReducedMotion()) {
    Object.assign(display, targets);
    return;
  }

  ctx = gsap.context(() => {
    // ─────── ACTO 1 · ENTRADA (reusable timeline) ───────
    // Pausada al construirse; se dispara con ScrollTrigger cada vez que el
    // acto entra al viewport (incluso al volver desde abajo).
    const act1In = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
    });
    act1In.from(".act1-item", {
      opacity: 0,
      y: 60,
      scale: 0.97,
      filter: "blur(8px)",
      duration: 1.2,
      stagger: 0.13,
    });
    act1In.from(
      ".act1-name",
      {
        clipPath: "inset(100% 0 0 0)",
        yPercent: 8,
        duration: 1.4,
        ease: "expo.out",
      },
      "<0.15"
    );

    ScrollTrigger.create({
      trigger: act1Ref.value,
      start: "top 78%",
      onEnter: () => act1In.restart(),
      onEnterBack: () => act1In.restart(),
    });

    // ─────── ACTO 2 · ENTRADA (reusable timeline) ───────
    const act2In = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
    });
    act2In.from(".act2-item", {
      opacity: 0,
      y: 70,
      scale: 0.97,
      filter: "blur(6px)",
      duration: 1.15,
      stagger: 0.14,
    });
    act2In.from(
      ".act2-quote",
      {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.5,
        ease: "expo.out",
      },
      "<0.2"
    );

    ScrollTrigger.create({
      trigger: act2Ref.value,
      start: "top 78%",
      onEnter: () => act2In.restart(),
      onEnterBack: () => act2In.restart(),
    });

    // ─────── ACTO 3 · ENTRADA (reusable timeline) ───────
    // Incluye el contador, que vuelve a 0 y recuenta cada vez que el acto se
    // dispara — coherente con que "todo el efecto se reinicia".
    const act3In = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
      onStart: () => {
        // Reset contador al inicio del timeline para que vuelva a 0.
        Object.assign(display, { projects: 0, years: 0, techs: 0 });
      },
    });
    act3In.from(".act3-item", {
      opacity: 0,
      y: 50,
      scale: 0.97,
      filter: "blur(6px)",
      duration: 1.1,
      stagger: 0.12,
    });
    act3In.from(
      ".act3-stat",
      {
        scale: 0.85,
        opacity: 0,
        duration: 0.7,
        ease: "back.out(1.4)",
        stagger: 0.1,
      },
      "<0.3"
    );
    act3In.to(
      display,
      {
        ...targets,
        duration: 1.6,
        ease: "power2.out",
        snap: { projects: 1, years: 1, techs: 1 },
      },
      "<0.2"
    );

    ScrollTrigger.create({
      trigger: act3Ref.value,
      start: "top 78%",
      onEnter: () => act3In.restart(),
      onEnterBack: () => act3In.restart(),
    });

    // ─────── PARALLAX AMBIENTE ───────
    gsap.to(glowRef.value, {
      yPercent: 70,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.value,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // ─────── SALIDAS · cada acto se "desenfoca al fondo" cuando lo dejás atrás ───────
    gsap.to(act1Ref.value, {
      yPercent: -22,
      opacity: 0.1,
      scale: 0.92,
      filter: "blur(6px)",
      ease: "none",
      scrollTrigger: {
        trigger: act1Ref.value,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(act2Ref.value, {
      yPercent: -16,
      opacity: 0.2,
      scale: 0.95,
      filter: "blur(5px)",
      ease: "none",
      scrollTrigger: {
        trigger: act2Ref.value,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(act3Ref.value, {
      yPercent: -10,
      opacity: 0.35,
      scale: 0.97,
      filter: "blur(3px)",
      ease: "none",
      scrollTrigger: {
        trigger: act3Ref.value,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Snap entre los 3 actos: solo en desktop con puntero fino.
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (pointer: fine)", () => {
      snapTrigger = ScrollTrigger.create({
        id: "hero-snap",
        trigger: heroRef.value,
        start: "top top",
        endTrigger: act3Ref.value,
        end: "top top",
        snap: {
          snapTo: (value) => {
            const total = act3Ref.value.offsetTop;
            if (!total) return value;
            const points = [
              0,
              act2Ref.value.offsetTop / total,
              1,
            ];
            return points.reduce(
              (prev, curr) =>
                Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
              points[0]
            );
          },
          duration: { min: 0.3, max: 0.7 },
          delay: 0.18,
          ease: "power2.inOut",
        },
      });
      return () => {
        snapTrigger?.kill();
        snapTrigger = null;
      };
    });
  }, heroRef.value);
});

onUnmounted(() => {
  ctx?.revert();
});
</script>
