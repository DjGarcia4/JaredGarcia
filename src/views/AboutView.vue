<template>
  <div class="flex flex-col overflow-x-hidden">
    <div class="flex justify-center items-center md:w-5/6 mx-5 md:mx-auto">
      <div
        data-aos="fade-right"
        class="text-center md:text-left md:w-7/12 space-y-3 w-1/2"
      >
        <p class="text-1xl md:text-4xl text-gray-400">
          <span class="text-gray-600 font-bold">Hey there</span>
          , if you've made it this far!
        </p>
        <p class="text-2xl md:text-4xl text-gray-400 hidden md:block">
          Great to see you here! In this section, you can learn a bit more about
          me and my passion for programming.
        </p>

        <p class="tracking-in-expand text-2xl md:text-4xl text-gray-400">
          <span class="text-2xl md:text-6xl text-green-500 font-bold"
            >Enjoy reading!</span
          >
        </p>
      </div>
      <div data-aos="fade-left" class="w-1/2 md:w-auto">
        <img
          src="/img/memojis/party.png"
          alt="Image Memoji Home"
          class="w-44 h-44 md:w-80 md:h-80"
        />
      </div>
    </div>
    <div
      class="flex gap-2 md:gap-14 flex-col md:flex-row justify-center items-center md:w-5/6 mx-5 md:mx-auto"
    >
      <div data-aos="fade-right" class="">
        <img
          src="/img/memojis/greeting.png"
          alt="Image Memoji Home"
          class="w-36 h-48 md:w-72 md:h-96"
        />
      </div>
      <div
        data-aos="fade-left"
        class="tracking-in-expand text-center md:text-left md:w-7/12 space-y-1"
      >
        <p class="text-1xl md:text-4xl text-gray-400">
          Alright, I'll introduce myself again...
        </p>
        <p class="text-1xl md:text-4xl text-gray-400">Hello, my name is</p>
        <p class="text-2xl md:text-6xl text-gray-600 font-bold">Jared Garcia</p>
        <p class="text-1xl md:text-4xl text-gray-400">
          I am
          <span class="text-2xl md:text-6xl text-green-500 font-bold"
            >Frontend Developer</span
          >
        </p>
      </div>
    </div>
    <div class="mx-8 pt-5 md:pt-10 md:mx-16">
      <TitleSection>About Me</TitleSection>
      <div class="flex gap-5 flex-col md:flex-row md:mx-auto">
        <div data-aos="fade-right" class="text-left md:w-10/12 space-y-3">
          <p class="text-[20px] md:text-3xl text-gray-400">
            I'm a passionate
            <span class="font-bold">computer science engineer</span> with
            expertise in <span class="font-bold">web development</span>. I
            thrive on creative challenges and
            <span class="font-bold">constantly seek to expand my skills</span>.
            A <span class="font-bold">team player</span> at heart, I excel in
            <span class="font-bold">problem-solving</span> and aim to deliver
            <span class="font-bold">quality</span> and
            <span class="font-bold">reliability</span> in all my endeavors.
          </p>
        </div>
        <div data-aos="fade-left" class="flex justify-center">
          <img
            src="/img/memojis/like.png"
            alt="Image Memoji Home"
            class="w-44 h-44 md:w-72 md:h-72"
          />
        </div>
      </div>
      <Skills />

      <TitleSection>My Personal Skills</TitleSection>

      <PersonalSkills />

      <TitleSection>My Certifications</TitleSection>
      <Certifications />
      <div class="flex gap-5 flex-col mx-0 md:flex-row md:mx-auto mt-5">
        <div data-aos="fade-right" class="flex justify-center">
          <img
            src="/img/memojis/secret.png"
            alt="Image Memoji Home"
            class="w-36 h-44 md:w-64 md:h-72"
          />
        </div>
        <div data-aos="fade-left" class="text-left md:w-10/12 space-y-3">
          <TitleSection>And stepping away from work...</TitleSection>
          <p class="text-[20px] md:text-3xl text-gray-400">
            I'm passionate about playing video games, especially FIFA, where I
            enjoy competing and improving my skills. I also have a great
            interest in reading, finding inspiration and learning in a wide
            variety of genres. Additionally, I love playing sports like soccer,
            volleyball, and basketball, which keep me active and fit. Lastly, I
            greatly enjoy board games, with Monopoly being one of my favorites,
            as it combines strategy and fun in a unique experience.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import Skills from "@/components/Skills.vue";
import PersonalSkills from "@/components/PersonalSkills.vue";
import Certifications from "@/components/Certifications.vue";
</script>
<style scoped>
.tracking-in-expand {
  -webkit-animation: tracking-in-expand 1s cubic-bezier(0.215, 0.61, 0.1, 1)
    0.3s both;
  animation: tracking-in-expand 1s cubic-bezier(0.215, 0.61, 0.1, 1) 0.3s both;
}
/* ----------------------------------------------
 * Generated by Animista on 2024-3-11 17:3:49
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation tracking-in-expand
 * ----------------------------------------
 */
@-webkit-keyframes tracking-in-expand {
  0% {
    letter-spacing: -0.5em;
    opacity: 0;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
@keyframes tracking-in-expand {
  0% {
    letter-spacing: -0.5em;
    opacity: 0;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
