<template>
  <RouterLink :to="{ name: to }" custom v-slot="{ navigate, isActive }">
    <button
      type="button"
      @click="navigate"
      class="relative rounded-lg px-2.5 py-2 text-sm font-medium transition-colors md:px-3.5 md:text-[15px]"
      :class="isActive ? 'text-white' : 'text-white/55 hover:text-white'"
    >
      <slot></slot>
      <span
        v-if="isActive"
        class="absolute -bottom-px left-2.5 right-2.5 h-0.5 rounded-full bg-accent md:left-3.5 md:right-3.5"
      ></span>
    </button>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  to: { type: String, required: true },
});
</script>
