<template>
  <RouterLink :to="target" custom v-slot="{ navigate, isActive, isExactActive }">
    <button
      type="button"
      @click="navigate"
      class="group relative rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-300 md:px-3.5 md:text-[15px]"
      :class="active(isActive, isExactActive) ? 'text-white' : 'text-white/55 hover:text-white'"
    >
      <slot></slot>
      <!-- Underline persistente con scaleX animado (sweep desde la izquierda) -->
      <span
        class="pointer-events-none absolute -bottom-0.5 left-2.5 right-2.5 h-0.5 origin-left rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100 md:left-3.5 md:right-3.5"
        :class="active(isActive, isExactActive) ? 'scale-x-100' : 'scale-x-0'"
      ></span>
    </button>
  </RouterLink>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const props = defineProps({
  to: { type: String, required: true },
  hash: { type: String, default: null },
});

const route = useRoute();

const target = computed(() => {
  if (props.hash) {
    return { name: props.to, hash: props.hash };
  }
  return { name: props.to };
});

// Active rules: hash links match only when route + hash both match. Plain
// links (no hash) match the route name AND require no current hash, so
// e.g. "Inicio" doesn't light up when the user is on /#about.
const active = (isActive, isExactActive) => {
  if (props.hash) {
    return isExactActive && route.hash === props.hash;
  }
  return isActive && !route.hash;
};
</script>
