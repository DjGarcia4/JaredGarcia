<template>
  <RouterLink
    :to="{ name: to }"
    class="text-gray-400 px-5 hover:text-gray-600 mx-2 transition-all"
    active-class="text-gray-600 font-bold border-b-4 border-green-500"
  >
    <slot></slot>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";
defineProps({
  to: {
    type: String,
  },
});
</script>
