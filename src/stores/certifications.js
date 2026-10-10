import { defineStore } from "pinia";
import { computed } from "vue";
import { getCertificates } from "@/data/localized";

export const useCertifications = defineStore("certificates", () => {
  const certificationsCollection = computed(() =>
    [...getCertificates()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );

  return { certificationsCollection };
});
