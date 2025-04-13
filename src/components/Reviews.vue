<template>
  <section class="py-16 px-6 lg:px-1 overflow-hidden">
    <div class="mx-auto flex flex-col lg:flex-row gap-8">
      <div class="flex flex-col gap-5">
        <!-- Título -->
        <div>
          <TitleSection
            >Lo que dicen quienes han trabajado conmigo</TitleSection
          >
        </div>

        <!-- Botones de navegación -->
        <div class="flex gap-3">
          <button
            @click="scrollLeft"
            class="w-9 h-9 rounded-full border border-green-400 text-green-600 transition"
          >
            <svg
              class="w-4 h-4 mx-auto"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            @click="scrollRight"
            class="w-9 h-9 rounded-full border border-green-400 text-green-600 transition"
          >
            <svg
              class="w-4 h-4 mx-auto"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Scroll horizontal con testimonios -->
      <div
        ref="scrollContainer"
        class="overflow-x-auto no-scrollbar scroll-smooth"
      >
        <div class="flex gap-6 min-w-max py-10">
          <div
            v-for="review in reviews.reviewsCollection"
            :key="review.id"
            class="flex-shrink-0 relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg px-6 pt-14 pb-6 text-center w-72"
          >
            <img
              :src="review.image"
              :alt="review.name"
              class="w-20 h-20 object-cover rounded-full border-4 border-white absolute left-1/2 -top-10 transform -translate-x-1/2 shadow-md"
            />
            <h3 class="text-sm font-bold text-white uppercase mt-10">
              {{ review.name }}
            </h3>
            <div class="flex justify-center gap-1 my-2">
              <template v-for="i in review.rating" :key="i">
                <svg
                  class="w-4 h-4 text-green-500 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 15l-5.878 3.09L5.5 11.545 1 7.91l6.06-.91L10 2l2.94 5 6.06.91-4.5 3.635 1.378 6.545z"
                  />
                </svg>
              </template>
            </div>
            <p class="text-white text-sm leading-relaxed line-clamp-5">
              {{ review.review }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useReviewsStore } from "@/stores/reviews";
import TitleSection from "@/components/TitleSection.vue";

const reviews = useReviewsStore();
const scrollContainer = ref(null);

const scrollLeft = () => {
  scrollContainer.value.scrollLeft -= 300;
};
const scrollRight = () => {
  scrollContainer.value.scrollLeft += 300;
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
