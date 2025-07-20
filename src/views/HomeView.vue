<template>
  <div class="overflow-hidden">
    <Hero />
    <div class="mx-8 md:mx-16">
      <TitleSection>De la idea al código</TitleSection>
      <div data-aos="fade-up">
        <Carousel
          :itemsToShow="3.95"
          :wrapAround="true"
          :autoplay="3000"
          :transition="500"
          v-bind="carouselConfig"
        >
          <Slide
            v-for="project in projects.projectsCollection"
            :key="project.id"
          >
            <div class="carousel__item"><Project :project="project" /></div>
          </Slide>
          <template #addons>
            <Navigation />
          </template>
        </Carousel>
      </div>

      <div class="flex justify-center my-5">
        <ButtonMain
          data-aos="fade-up"
          @click="router.push({ name: 'projects' })"
          >Ver mas proyectos...</ButtonMain
        >
      </div>
      <Services />

      <!-- Skills -->
      <Skills />
      <Reviews />
      <div id="contact">
        <TitleSection>Hablemos!</TitleSection>
        <FormContact />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import { Carousel, Slide, Navigation } from "vue3-carousel";

import ButtonMain from "@/components/ButtonMain.vue";
import Project from "@/components/Project.vue";
import Skills from "@/components/Skills.vue";
import TitleSection from "@/components/TitleSection.vue";
import { useProjects } from "@/stores/projects";
import Reviews from "@/components/Reviews.vue";
import FormContact from "@/components/FormContact.vue";
import Hero from "@/components/common/Hero.vue";
import Services from "@/components/Services/Services.vue";

const projects = useProjects();
const router = useRouter();

const carouselConfig = {
  itemsToShow: 2.5,
  wrapAround: true,
  breakpoints: {
    500: {
      itemsToShow: 1.4,
      snapAlign: "center",
    },

    700: {
      itemsToShow: 4.3,
      snapAlign: "center",
    },
  },
};

onMounted(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 10);
});
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
