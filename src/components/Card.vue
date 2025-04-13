<template>
  <div
    data-aos="fade-up"
    class="flex flex-col justify-center items-center text-center shadow-lg p-5 rounded-xl space-y-5 min-w-64 md:min-w-80 bg-white/10 backdrop-blur-md border border-white/20"
  >
    <img :src="infoCard.image" alt="" class="w-36 h-36 md:w-48 md:h-48" />
    <div>
      <h3 class="font-bold text-2xl md:text-2xl text-white">
        {{ infoCard.title }}
      </h3>
      <div class="w-64 md:w-full">
        <p class="text-white md:text-xl width-description">
          {{ infoCard.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  infoCard: {
    type: Object,
  },
});
</script>
