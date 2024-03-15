import { defineStore } from "pinia";
import { useFirestore, useCollection } from "vuefire";
import { collection, query, where } from "firebase/firestore";

export const useReviewsStore = defineStore("reviews", () => {
  const db = useFirestore();
  const q = query(collection(db, "reviews"), where("activate", "==", true));
  const reviewsCollection = useCollection(q);
  return { reviewsCollection };
});
