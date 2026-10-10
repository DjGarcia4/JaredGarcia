<template>
  <!-- Logo: "J" + cursor de terminal. El cursor parpadea (como en una
       terminal) salvo con prefers-reduced-motion. Mismo dibujo que
       public/favicon.svg. -->
  <svg viewBox="0 0 32 32" :class="['logo-mark', { 'logo-blink': blink }]" aria-hidden="true">
    <rect width="32" height="32" rx="8" class="logo-bg" />
    <path
      d="M15.5 8.5v10.25a4.75 4.75 0 0 1-9.5 0"
      fill="none"
      stroke="#0F172A"
      stroke-width="3.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <rect class="logo-cursor" x="19.5" y="16.5" width="6" height="7.5" rx="1.2" fill="#0F172A" />
  </svg>
</template>

<script setup>
defineProps({
  blink: { type: Boolean, default: false },
});
</script>

<style scoped>
.logo-bg {
  fill: #22c55e;
  transition: fill 0.3s;
}
:global(.group:hover) .logo-bg {
  fill: #4ade80;
}
.logo-blink .logo-cursor {
  animation: logo-blink 1.1s steps(1) infinite;
}
@keyframes logo-blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .logo-blink .logo-cursor {
    animation: none;
  }
}
</style>
