<template>
  <div class="overflow-hidden">
    <div
      class="bg-red flex flex-col lg:flex-row justify-center items-center space-y-5 md:space-y-0 md:space-x-14"
    >
      <div class="tracking-in-expand text-center lg:text-left">
        <p class="text-2xl md:text-3xl text-gray-400">Hello, my name is</p>
        <p class="text-3xl md:text-5xl text-gray-600 font-bold">Jared Garcia</p>
        <p class="text-2xl md:text-3xl text-gray-400">
          I am
          <span class="text-3xl md:text-5xl text-green-500 font-bold"
            >Jr. Full Stack Developer</span
          >
        </p>
        <div class="flex flex-row justify-center my-5 space-x-5 items-center">
          <ButtonMain @click="scrollToContact" class="heartbeat">
            Contact Me!
          </ButtonMain>
          <a
            href="https://drive.google.com/file/d/1GNi77TQDAXmsa0jGcdN3a_QELK-lA0ty/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            class="border-2 py-2 px-4 rounded-lg text-sm md:text-2xl text-gray-400 hover:border-none hover:bg-green-500 hover:font-bold hover:text-white transition-all"
          >
            CV
          </a>
        </div>
        <div class="space-x-5 flex justify-center mt-5">
          <a
            href="https://github.com/DjGarcia4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-brand-github text-gray-400 hover:text-black transition-colors w-10 md:w-14 h-10 md:h-14"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"
              />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/jared-garcia-739255243/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-brand-linkedin text-gray-400 hover:text-blue-500 transition-colors w-10 md:w-14 h-10 md:h-14"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"
              />
              <path d="M8 11l0 5" />
              <path d="M8 8l0 .01" />
              <path d="M12 16l0 -5" />
              <path d="M16 16v-3a2 2 0 0 0 -4 0" />
            </svg>
          </a>
          <a
            href="mailto:denisjared286@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-mail text-gray-400 hover:text-red-500 transition-colors w-10 md:w-14 h-10 md:h-14"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"
              />
              <path d="M3 7l9 6l9 -6" />
            </svg>
          </a>
        </div>
      </div>
      <div data-aos="fade-left">
        <img
          src="/img/memojis/hello.png"
          alt="Image Memoji Home"
          class="w-40 h-40 md:w-[300px] md:h-80"
        />
      </div>
    </div>
    <div data-aos="fade-up" class="mx-8 py-5 md:py-14 flex justify-center">
      <p class="text-center text-2xl md:text-3xl text-gray-400 md:w-8/12">
        My <span class="font-bold text-gray-600">goal</span> is to utilize my
        <span class="font-bold text-gray-600">knowledge</span> and
        <span class="font-bold text-gray-600">experience</span> optimally to
        achieve the <span class="font-bold text-green-500">objectives</span> and
        <span class="font-bold text-green-500">goals</span> of your
        <span class="font-bold text-green-500">institution</span> with
        <span class="font-bold text-green-500">quality</span>,
        <span class="font-bold text-green-500">efficiency</span>, and
        <span class="font-bold text-green-500">reliability</span>, thereby
        maximizing my <span class="font-bold text-gray-600">performance</span>.
      </p>
    </div>
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
          >See more projects...</ButtonMain
        >
      </div>

      <!-- Skills -->
      <Skills />
      <Reviews />
      <div id="contact">
        <TitleSection>Contact Me!</TitleSection>
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
