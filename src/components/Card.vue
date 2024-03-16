<template>
  <div
    data-aos="fade-up"
    class="flex flex-col justify-center items-center text-center shadow-lg p-5 bg-white rounded-xl space-y-5 min-w-64 md:min-w-80"
  >
    <img :src="infoCard.image" alt="" class="w-36 h-36 md:w-48 md:h-48" />
    <div>
      <h3 class="font-bold text-2xl md:text-2xl text-gray-600">
        {{ infoCard.title }}
      </h3>
      <div class="w-64 md:w-full">
        <p class="text-gray-400 md:text-xl width-description">
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
