<template>
  <TitleSection>Reviews from people I have worked with</TitleSection>
  <div data-aos="fade-up" class="overflow-y-scroll h-[500px] py-6 px-2">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Review
        v-for="review in reviews.reviewsCollection"
        :key="review.id"
        :review="review"
      />
    </div>
  </div>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import Review from "@/components/Review.vue";
import { useReviewsStore } from "@/stores/reviews";
const reviews = useReviewsStore();
</script>

<style scoped></style>
