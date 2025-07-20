<template>
  <div
    class="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center text-white"
  >
    <!-- Fondo animado verde -->
    <div
      class="absolute inset-0 animate-gradient bg-[length:400%_400%] z-0"
    ></div>
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

    <!-- Iconos stack -->
    <div class="flex flex-wrap justify-center gap-5 mb-10 z-10">
      <div
        v-for="(icon, index) in icons"
        :key="index"
        class="text-xl md:text-3xl px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all animate__animated animate__fadeInUp"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <font-awesome-icon :icon="icon" class="text-white" />
      </div>
    </div>

    <!-- Nombre y roles -->
    <div class="text-center space-y-3 z-10 animate__animated animate__fadeInUp">
      <h1 class="text-3xl md:text-5xl font-extrabold tracking-wide">
        Jared Garcia
      </h1>
      <div class="flex flex-col text-lg md:text-2xl font-medium">
        <span class="text-green-400">Frontend Developer</span>
        <span class="text-green-300">UX/UI Designer</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const icons = [
  "fa-solid fa-code",
  "fa-solid fa-palette",
  "fa-solid fa-lightbulb",
  "fa-solid fa-bolt",
  "fa-solid fa-rocket",
];
</script>

<style scoped>
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.animate-gradient {
  background: linear-gradient(-45deg, #0f0f0f, #013b1b, #0f0f0f, #025e2e);
  background-size: 300% 400%;
  animation: gradientMove 12s ease infinite;
}
</style>
