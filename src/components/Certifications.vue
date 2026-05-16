<template>
  <div v-if="completedCertifications.length">
    <Carousel
      v-bind="carouselConfig"
      :wrapAround="true"
      :autoplay="7000"
      :transition="600"
      :pauseAutoplayOnHover="true"
    >
      <Slide
        v-for="certification in completedCertifications"
        :key="certification.id"
      >
        <div class="flex h-full w-full px-2.5 py-2">
          <CertificateCard :certificate="certification" />
        </div>
      </Slide>
      <template #addons>
        <Navigation />
      </template>
    </Carousel>
  </div>
</template>

<script setup>
import { computed } from "vue";
import CertificateCard from "@/components/Certificates/CertificateCard.vue";
import { useCertifications } from "@/stores/certifications";
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide, Navigation } from "vue3-carousel";

const certifications = useCertifications();

// El certificado "En curso" se muestra destacado en CurrentlyLearning,
// así que el carrusel solo lista los ya completados.
const completedCertifications = computed(() =>
  certifications.certificationsCollection.filter((c) => c.status !== "En curso")
);

const carouselConfig = {
  itemsToShow: 1,
  snapAlign: "start",
  breakpoints: {
    640: { itemsToShow: 2 },
    1024: { itemsToShow: 3 },
  },
};
</script>

<style scoped>
.carousel {
  --vc-nav-background: rgba(23, 23, 29, 0.85);
  --vc-nav-color: rgba(255, 255, 255, 0.75);
  --vc-nav-color-hover: #34d399;
  --vc-nav-border-radius: 12px;
  --vc-nav-width: 40px;
  --vc-nav-height: 40px;
}
.carousel :deep(.carousel__slide) {
  align-items: stretch;
}
</style>
