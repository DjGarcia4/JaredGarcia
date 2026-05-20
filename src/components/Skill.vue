<template>
  <div
    class="skill-card surface group relative flex flex-col items-center justify-center gap-3 overflow-hidden p-4 transition-colors duration-500 hover:border-accent/30 md:p-5"
  >
    <!-- Icon -->
    <img
      :src="`/img/skills/${skill.image}.svg`"
      :alt="skill.name"
      class="h-10 w-10 opacity-55 grayscale transition-all duration-500 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0 md:h-11 md:w-11"
    />

    <!-- Name -->
    <span
      class="text-center text-xs font-medium text-white/55 transition-colors duration-500 group-hover:text-white md:text-sm"
    >
      {{ skill.name }}
    </span>

    <!-- Usage counter: aparece en hover si el dato existe -->
    <span
      v-if="skill.usage"
      class="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-white/10 bg-ink-950/80 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/55 opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100"
      :title="`Usado en ${skill.usage} proyecto${skill.usage === 1 ? '' : 's'}`"
    >
      <span class="text-accent">×</span>
      {{ skill.usage }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  skill: { type: Object, required: true },
});
</script>
