<template>
  <section
    ref="root"
    id="about"
    class="container-content py-20 md:py-28 scroll-mt-24"
  >
    <TitleSection eyebrow="Sobre mí">Lo que me define</TitleSection>

    <div
      ref="grid"
      class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div
        v-for="(value, i) in values"
        :key="value.title"
        :ref="(el) => setCardRef(el, i)"
        v-glow
        class="value-card surface group relative flex flex-col overflow-hidden p-7 transition-colors duration-500 hover:border-accent/30 lg:p-8"
      >
        <!-- Icon -->
        <div
          class="value-icon flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-xl text-accent-light transition-all duration-500 group-hover:scale-110 group-hover:border-accent/40 group-hover:bg-accent/20"
        >
          <font-awesome-icon :icon="['fas', value.icon]" />
        </div>

        <!-- Title -->
        <h4
          class="value-title mt-6 font-display text-xl font-bold leading-tight tracking-tight text-white md:text-2xl"
        >
          {{ value.title }}
        </h4>

        <!-- Description -->
        <p
          class="value-summary mt-3 flex-1 text-sm leading-relaxed text-white/55 md:text-base"
        >
          {{ value.description }}
        </p>

        <!-- Hairline expandible (crece de 15% → 100% al hover) -->
        <div
          class="value-hairline mt-7 h-px w-full origin-left scale-x-[0.15] bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import TitleSection from "@/components/TitleSection.vue";
import { gsap, prefersReducedMotion, replayOnEnter } from "@/lib/gsap";

const values = [
  {
    title: "Trabajo en equipo",
    description:
      "Colaboro, aprendo de otros y sumo al proyecto como un jugador comprometido.",
    icon: "users",
  },
  {
    title: "Resolución de problemas",
    description:
      "Disfruto encontrar soluciones creativas, eficientes y que realmente funcionen.",
    icon: "lightbulb",
  },
  {
    title: "Compromiso con la calidad",
    description:
      "Cada detalle cuenta: que todo funcione bien, se vea bien y sea confiable.",
    icon: "shield-halved",
  },
  {
    title: "Ganas de crecer",
    description:
      "Siempre busco aprender algo nuevo, mejorar mis skills y asumir nuevos retos.",
    icon: "rocket",
  },
];

const root = ref(null);
const grid = ref(null);
const cardRefs = ref([]);

const setCardRef = (el, i) => {
  if (el) cardRefs.value[i] = el;
};

let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // Timeline reusable, re-disparable al volver a entrar al viewport.
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
    });

    tl.from(cardRefs.value, {
      opacity: 0,
      y: 36,
      scale: 0.97,
      filter: "blur(5px)",
      duration: 0.7,
      stagger: { amount: 0.3, from: "start" },
    });

    replayOnEnter(tl, {
      trigger: grid.value,
      start: "top 92%",
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
