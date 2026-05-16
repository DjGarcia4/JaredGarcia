<template>
  <div
    class="surface surface-hover group flex flex-col items-center gap-3 p-5"
  >
    <img
      :src="`/img/skills/${skill.image}.svg`"
      :alt="skill.name"
      class="h-9 w-9 opacity-60 grayscale transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0"
    />
    <span
      class="text-center text-xs font-medium text-white/50 transition-colors group-hover:text-white"
    >
      {{ skill.name }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  skill: { type: Object, required: true },
});
</script>
