<template>
  <div v-glow class="surface surface-hover group flex h-full flex-col p-6">
    <div class="flex items-start justify-between">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-xl text-accent-light transition-transform duration-300 group-hover:scale-110"
      >
        <font-awesome-icon :icon="['fas', service.icon]" />
      </div>
    </div>

    <h3
      class="mt-5 font-display text-lg font-bold text-white transition-colors group-hover:text-accent-light"
    >
      {{ service.title }}
    </h3>
    <p class="mt-2 text-sm leading-relaxed text-white/55">
      {{ service.description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  service: { type: Object, required: true },
  index: { type: Number, default: 0 },
});
</script>
