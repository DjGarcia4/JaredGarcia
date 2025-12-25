<template>
  <button
    type="button"
    class="border-2 py-2 px-4 rounded-lg text-sm md:text-2xl text-white transition-all duration-300 ease-in-out hover:border-none hover:text-white hover:scale-110 animated-gradient"
  >
        <slot></slot>
  </button>
</template>

<style scoped>
.animated-gradient {
  background: transparent;
}

.animated-gradient:hover {
  background: linear-gradient(
    90deg,
    #166534,
    #4ade80,
    #22c55e,
    #16a34a,
    #4ade80
  );
  background-size: 300% 300%;
  background-position: 0% 50%;
  animation: move-gradient 4s ease infinite;
}

@keyframes move-gradient {
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
</style>
