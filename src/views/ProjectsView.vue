<template>
  <div
    class="bg-red flex flex-col md:flex-row justify-center items-center md:w-5/6 mx-5 md:mx-auto"
  >
    <div data-aos="fade-right" class="">
      <img
        src="/img/memojis/lucky.png"
        alt="Image Memoji Home"
        class="w-56 h-56 md:w-80 md:h-80"
      />
    </div>
    <div
      data-aos="fade-left"
      class="text-center md:text-left md:w-7/12 space-y-3"
    >
      <p class="text-2xl md:text-3xl text-gray-400">
        <span class="text-gray-600 font-bold"
          >Welcome to my project gallery!</span
        >
      </p>
      <p class="text-2xl md:text-3xl text-gray-400">
        Where you can discover my work and passion for programming.
      </p>

      <p class="text-2xl md:text-3xl text-gray-400">
        <span class="text-3xl md:text-5xl text-green-500 font-bold"
          >Explore my projects!</span
        >
      </p>
    </div>
  </div>
  <div class="mx-8 md:mx-16">
    <TitleSection>Projects</TitleSection>
  </div>
  <div
    class="mx-8 md:mx-16 flex flex-col justify-center items-center text-left"
  >
    <Projects />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Projects from "@/components/Projects.vue";
import TitleSection from "@/components/TitleSection.vue";
onMounted(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 10);
});
</script>
