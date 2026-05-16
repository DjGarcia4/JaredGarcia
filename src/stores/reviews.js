import { defineStore } from "pinia";
import { ref } from "vue";
import { reviews } from "@/data/reviews";

export const useReviewsStore = defineStore("reviews", () => {
  const reviewsCollection = ref(reviews.filter((r) => r.activate));

  return { reviewsCollection };
});
