import { defineStore } from "pinia";
import { ref } from "vue";
import { certificates } from "@/data/certificates";

export const useCertifications = defineStore("certificates", () => {
  const certificationsCollection = ref(
    [...certificates].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  return { certificationsCollection };
});
