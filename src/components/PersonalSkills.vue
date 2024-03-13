<template>
  <Carousel
    :itemsToShow="3.95"
    :wrapAround="true"
    :autoplay="8000"
    :transition="500"
  >
    <Slide
      v-for="personalSkill in personalSkills.personalSkillsCollection"
      :key="personalSkill.id"
    >
      <div class="carousel__item">
        <Card :infoCard="personalSkill" />
      </div>
    </Slide>
    <template #addons>
      <Navigation />
    </template>
  </Carousel>
</template>

<script setup>
import Card from "./Card.vue";
import "vue3-carousel/dist/carousel.css";
import { usePersonalSkills } from "@/stores/personalSkills";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";

const personalSkills = usePersonalSkills();
</script>

<style scoped>
.carousel__slide {
  padding: 5px;
}

.carousel__viewport {
  perspective: 2000px;
}

.carousel__track {
  transform-style: preserve-3d;
}

.carousel__slide--sliding {
  transition: 0.5s;
}

.carousel__slide {
  opacity: 0.5;
  transform: rotateY(0) scale(0.8);
}

.carousel__slide--prev {
  opacity: 1;
  transform: rotateY(0) scale(0.8);
}

.carousel__slide--next {
  opacity: 1;
  transform: rotateY(0) scale(0.8);
}

.carousel__slide--active {
  opacity: 1;
  transform: rotateY(0) scale(1);
  z-index: 10;
}
</style>
