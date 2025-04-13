<template>
  <RouterLink
    :to="{ name: to }"
    class="text-white px-5 hover:text-green-500 mx-2 transition-all"
    active-class="text-gray-600 font-bold border-b-4 border-green-500 bg-gradient-to-r from-green-800 via-green-400 to-green-600 bg-clip-text text-transparen"
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
