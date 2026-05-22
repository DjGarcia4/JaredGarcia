<template>
  <div
    v-if="learning"
    ref="root"
    v-glow
    class="learning-card surface group relative overflow-hidden p-8 md:p-12 lg:p-14"
  >
    <!-- Glow ambient -->
    <div
      class="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
    ></div>

    <!-- Número editorial decorativo -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute right-6 top-5 font-display text-5xl font-bold leading-none text-white/[0.045] md:right-10 md:top-7 md:text-7xl"
    >
      00.
    </span>

    <div class="relative">
      <!-- Status badge -->
      <span
        class="learning-item inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-accent-light"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"
          ></span>
          <span
            class="relative inline-flex h-2 w-2 rounded-full bg-accent"
          ></span>
        </span>
        Estudiando ahora
      </span>

      <!-- Title -->
      <h3
        class="learning-item mt-6 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-8 md:text-4xl lg:text-5xl"
      >
        {{ learning.title }}
      </h3>

      <!-- Issuer -->
      <p
        class="learning-item mt-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-white/55"
      >
        <span class="h-px w-8 bg-accent"></span>
        Impartido por
        <span class="font-semibold text-white/85 normal-case tracking-normal">
          {{ learning.issuer }}
        </span>
      </p>

      <!-- Description -->
      <p
        class="learning-item mt-6 max-w-3xl text-base leading-relaxed text-white/60 md:text-lg"
      >
        {{ learning.description }}
      </p>

      <!-- Topics -->
      <div class="learning-item mt-7 flex flex-wrap gap-2">
        <span v-for="topic in learning.topics" :key="topic" class="chip">
          <font-awesome-icon
            :icon="['fas', 'book-open']"
            class="text-[10px] text-accent-light"
          />
          {{ topic }}
        </span>
      </div>

      <!-- CTA -->
      <RouterLink
        :to="`/certificate/${learning.slug}`"
        class="learning-item mt-8 inline-flex w-fit items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-light transition-all duration-300 hover:border-accent hover:bg-accent hover:text-ink-950 md:mt-10"
      >
        Ver detalles
        <font-awesome-icon
          :icon="['fas', 'arrow-right']"
          class="text-xs transition-transform duration-300 group-hover:translate-x-1"
        />
      </RouterLink>

      <!-- Hairline expandible -->
      <div
        class="learning-item mt-10 h-px w-full origin-left scale-x-[0.12] bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useCertifications } from "@/stores/certifications";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const certifications = useCertifications();

const learning = computed(() =>
  certifications.certificationsCollection.find((c) => c.status === "En curso")
);

const root = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
    });

    tl.from(".learning-item", {
      opacity: 0,
      y: 28,
      scale: 0.98,
      filter: "blur(4px)",
      duration: 0.65,
      stagger: { amount: 0.25, from: "start" },
    });

    ScrollTrigger.create({
      trigger: root.value,
      start: "top 92%",
      onEnter: () => tl.restart(),
      onEnterBack: () => tl.restart(),
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>
