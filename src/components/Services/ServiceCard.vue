<template>
  <div
    data-aos="fade-up"
    class="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-xl transition duration-300 ease-in-out hover:shadow-2xl hover:border-white/30 text-white flex flex-col h-full"
  >
    <!-- Efecto de glow detrás del ícono -->
    <div
      class="absolute -top-10 -left-10 w-40 h-40 bg-green-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-500"
    ></div>

    <!-- Ícono con animación -->
    <div
      class="text-4xl mb-4 text-green-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
    >
      <font-awesome-icon :icon="['fas', service.icon]" />
    </div>

    <!-- Título -->
    <h3
      class="text-xl md:text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors"
    >
      {{ service.title }}
    </h3>

    <!-- Descripción -->
    <p
      class="text-white/70 text-sm leading-relaxed group-hover:text-white transition-colors"
    >
      {{ service.description }}
    </p>

    <!-- Línea decorativa inferior -->
    <div
      class="mt-4 h-[2px] w-0 bg-green-400 group-hover:w-full transition-all duration-500"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  service: {
    type: Object,
    required: true,
  },
});
</script>
