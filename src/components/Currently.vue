<template>
  <section
    ref="root"
    class="container-content py-20 md:py-28"
  >
    <TitleSection eyebrow="Actualmente">
      En qué estoy trabajando
    </TitleSection>

    <div
      ref="card"
      v-glow
      class="currently-card surface surface-hover group relative overflow-hidden p-8 md:p-12 lg:p-14"
    >
      <!-- Glow ambient -->
      <div
        class="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      ></div>

      <!-- Número editorial decorativo -->
      <div class="relative">
        <!-- Status badge -->
        <span
          class="currently-item inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-light"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"
            ></span>
            <span
              class="relative inline-flex h-2 w-2 rounded-full bg-accent"
            ></span>
          </span>
          Trabajando ahora
        </span>

        <!-- Title -->
        <h3
          class="currently-item mt-6 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-8 md:text-4xl lg:text-5xl"
        >
          {{ current.role }}
          <span class="text-gradient">@ {{ current.company }}</span>
        </h3>

        <!-- Company line (mono editorial) -->
        <p
          class="currently-item mt-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-white/55"
        >
          <span class="h-px w-8 bg-accent"></span>
          Rol actual
          <span class="font-semibold text-white/85 normal-case tracking-normal">
            {{ current.company }}
          </span>
        </p>

        <!-- Description -->
        <p
          class="currently-item mt-6 max-w-3xl text-base leading-relaxed text-white/60 md:text-lg"
        >
          {{ current.description }}
        </p>

        <!-- Focus chips -->
        <div class="currently-item mt-7 flex flex-wrap gap-2">
          <span v-for="item in current.focus" :key="item" class="chip">
            <font-awesome-icon
              :icon="['fas', 'bolt']"
              class="text-[10px] text-accent-light"
            />
            {{ item }}
          </span>
        </div>

        <!-- Hairline expandible -->
        <div
          class="currently-item mt-10 h-px w-full origin-left scale-x-[0.12] bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import TitleSection from "@/components/TitleSection.vue";
import { current } from "@/data/experience";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const root = ref(null);
const card = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
    });

    tl.from(".currently-item", {
      opacity: 0,
      y: 28,
      scale: 0.98,
      filter: "blur(4px)",
      duration: 0.65,
      stagger: { amount: 0.25, from: "start" },
    });

    ScrollTrigger.create({
      trigger: card.value,
      start: "top 92%",
      onEnter: () => tl.restart(),
      onEnterBack: () => tl.restart(),
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
