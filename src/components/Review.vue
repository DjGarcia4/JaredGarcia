<template>
  <div class="flex gap-2 shadow-xl rounded-xl p-4 md:p-6">
    <img
      :src="review.image ? review.image : '/img/memojis/like.png'"
      alt=""
      class="w-16 h-16 rounded-full"
    />
    <div>
      <h1 class="text-gray-600 font-bold text-xl md:text-2xl">
        {{ review.name }}
      </h1>
      <p class="text-gray-400 text-sm md:text-xl">
        {{ review.review }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  review: {
    type: Object,
  },
});
</script>

<style scoped></style>
