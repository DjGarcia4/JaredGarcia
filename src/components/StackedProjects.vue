<template>
  <div ref="root" class="space-y-8">
    <div
      v-for="(project, i) in projects"
      :key="project.id"
      class="sticky"
      :style="{ top: `calc(6rem + ${i * 1.75}rem)` }"
    >
      <article
        :ref="(el) => setCardRef(el, i)"
        v-glow
        class="stack-card group grid overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900 shadow-card md:grid-cols-2"
      >
        <!-- Imagen -->
        <div class="relative min-h-[220px] overflow-hidden md:min-h-full">
          <img
            v-if="project.images?.cover"
            :src="project.images.cover"
            :alt="project.title"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            v-else
            class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-800 via-ink-850 to-accent-soft/30"
          >
            <span class="font-display text-3xl font-bold text-white/25">
              {{ project.title }}
            </span>
          </div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent md:bg-gradient-to-r"
          ></div>
        </div>

        <!-- Info -->
        <div class="relative flex flex-col justify-center gap-5 p-8 md:p-12">
          <span
            class="font-display text-6xl font-bold text-white/[0.06] md:text-8xl"
          >
            {{ String(i + 1).padStart(2, "0") }}
          </span>

          <div>
            <div class="flex flex-wrap items-center gap-3">
              <p
                class="text-xs font-medium uppercase tracking-[0.2em] text-accent-light"
              >
                {{ project.category }}
              </p>
              <span
                v-if="project.status"
                class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                :class="statusStyle(project.status)"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                {{ project.status }}
              </span>
            </div>
            <h3
              class="mt-3 font-display text-2xl font-bold tracking-tight text-white md:text-4xl"
            >
              {{ project.title }}
            </h3>
          </div>

          <p class="max-w-md text-sm leading-relaxed text-white/55 md:text-base">
            {{ project.summary }}
          </p>

          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/45"
          >
            <span class="flex items-center gap-1.5">
              <font-awesome-icon :icon="['fas', 'calendar']" />
              {{ project.year }}
            </span>
            <span class="flex items-center gap-1.5">
              <font-awesome-icon :icon="['fas', 'clock']" />
              {{ project.duration }}
            </span>
            <span class="flex items-center gap-1.5">
              <font-awesome-icon :icon="['fas', 'users']" />
              {{ project.team }}
            </span>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tech in project.techStack"
              :key="tech"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]"
            >
              <img
                :src="`/img/skills/${tech}.svg`"
                :alt="tech"
                class="h-4 w-4"
              />
            </span>
          </div>

          <RouterLink
            :to="`/project/${project.slug}`"
            class="btn-primary mt-1 w-fit"
          >
            Ver proyecto
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
          </RouterLink>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { statusStyle } from "@/lib/status";

defineProps({
  projects: { type: Array, required: true },
});

const root = ref(null);
const cardRefs = ref([]);

const setCardRef = (el, i) => {
  if (el) cardRefs.value[i] = el;
};

let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    const cards = cardRefs.value;

    // Cada card se encoge mientras la siguiente sube a taparla.
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.9,
        ease: "none",
        scrollTrigger: {
          trigger: cards[i + 1],
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>

<style scoped>
.stack-card {
  transform-origin: center top;
  will-change: transform;
  min-height: 78vh;
}

@media (min-width: 768px) {
  .stack-card {
    min-height: 66vh;
  }
}
</style>
