<template>
  <div
    v-glow
    class="featured-skill group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-ink-900 to-ink-850/60 p-8 backdrop-blur-md transition-colors duration-500 hover:border-accent/40 md:p-10"
  >
    <!-- Número editorial decorativo -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute right-5 top-4 font-display text-5xl font-bold leading-none text-white/[0.045] md:text-6xl"
    >
      {{ String(rank).padStart(2, "0") }}
    </span>

    <!-- Icon -->
    <div
      class="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.08] transition-all duration-500 group-hover:scale-110 group-hover:border-accent/50 group-hover:bg-accent/15 md:h-18 md:w-18"
    >
      <img
        :src="`/img/skills/${skill.image}.svg`"
        :alt="skill.name"
        class="h-9 w-9 transition-transform duration-500 group-hover:scale-110 md:h-10 md:w-10"
      />
    </div>

    <!-- Body -->
    <div class="relative">
      <!-- Name -->
      <h4
        class="font-display text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl"
      >
        {{ skill.name }}
      </h4>

      <!-- Usage con dot pulsante -->
      <p
        class="mt-3 inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent-light"
      >
        <span class="relative flex h-1.5 w-1.5">
          <span
            class="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-accent opacity-75"
          ></span>
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent"></span>
        </span>
        {{ skill.usage }} {{ skill.usage === 1 ? "proyecto" : "proyectos" }}
      </p>
    </div>

    <!-- Hairline editorial (crece en hover) -->
    <div
      class="mt-1 h-px w-full origin-left scale-x-[0.12] bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  skill: { type: Object, required: true },
  rank: { type: Number, required: true },
});
</script>
