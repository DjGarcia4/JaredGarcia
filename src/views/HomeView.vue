<template>
  <div class="overflow-hidden">
    <Hero />
    <div class="mx-8 md:mx-16">
      <TitleSection>My Projects</TitleSection>
      <div data-aos="fade-up">
        <Carousel
          :itemsToShow="3.95"
          :wrapAround="true"
          :autoplay="3000"
          :transition="500"
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

const projects = useProjects();
const router = useRouter();

const scrollToContact = () => {
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth" });
  }
};

onMounted(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 10);
});
</script>
