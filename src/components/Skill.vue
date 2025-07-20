<template>
  <div
    data-aos="fade-left"
    class="group relative flex items-center justify-center w-14 md:w-20 h-14 md:h-20 transition-all duration-300"
  >
    <!-- Ícono -->
    <img
      :src="'/img/skills/' + skill.image + '.svg'"
      :alt="skill.name"
      class="w-10 md:w-16 opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
    />

    <!-- Tooltip -->
    <div
      class="absolute bottom-0 translate-y-full mt-2 px-3 py-1 rounded-lg text-xs text-white bg-white/10 backdrop-blur border border-white/20 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10"
    >
      {{ skill.name }}
      <!-- Flechita -->
      <div
        class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/10 border-l border-t border-white/20 rotate-45 backdrop-blur-sm"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  skill: {
    type: Object,
    required: true,
  },
});
</script>
