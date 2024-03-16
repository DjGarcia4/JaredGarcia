<template>
  <Carousel
    :itemsToShow="3.95"
    :wrapAround="true"
    :autoplay="7000"
    :transition="500"
  >
    <Slide
      v-for="certification in certifications.certificationsCollection"
      :key="certification.id"
    >
      <div class="carousel__item"><Card :infoCard="certification" /></div>
    </Slide>
    <template #addons>
      <Navigation />
    </template>
  </Carousel>
</template>

<script setup>
import Card from "@/components/Card.vue";
import { useCertifications } from "@/stores/certifications";
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide, Navigation } from "vue3-carousel";

const certifications = useCertifications();
</script>
