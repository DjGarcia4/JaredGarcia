<template>
  <Carousel
    v-bind="carouselConfig"
    :wrapAround="true"
    :autoplay="7000"
    :transition="500"
  >
    <Slide
      v-for="certification in certifications.certificationsCollection"
      :key="certification.id"
    >
      <div class="carousel__item">
        <CertificateCard :certificate="certification" />
      </div>
    </Slide>
    <template #addons>
      <Navigation />
    </template>
  </Carousel>
</template>

<script setup>
import Card from "@/components/Card.vue";
import CertificateCard from "@/components/Certificates/CertificateCard.vue";
import { useCertifications } from "@/stores/certifications";
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide, Navigation } from "vue3-carousel";

const certifications = useCertifications();

const carouselConfig = {
  itemsToShow: 2.5,
  wrapAround: true,
  breakpoints: {
    500: {
      itemsToShow: 1.5,
      snapAlign: "center",
    },
    700: {
      itemsToShow: 3,
      snapAlign: "center",
    },
  },
};
</script>

<style scoped>
.carousel {
  --vc-nav-background: rgba(0, 0, 0, 0.3);
  --vc-nav-color: white;
  --vc-nav-color-hover: #e5e5e5;
  --vc-nav-border-radius: 50%;
  --vc-nav-width: 40px;
  --vc-nav-height: 40px;
}
</style>
