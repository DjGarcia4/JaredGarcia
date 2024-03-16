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
import { Carousel, Slide, Navigation } from "vue3-carousel";
const personalSkills = usePersonalSkills();
</script>
