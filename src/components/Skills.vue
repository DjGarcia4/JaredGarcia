<template>
  <div>
    <TitleSection>My Skills</TitleSection>
    <div
      class="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-24"
    >
      <div data-aos="fade-right">
        <img
          src="/img/memojis/computer.png"
          alt="Image Memoji Home"
          class="w-40 h-44 md:w-64 md:h-72"
        />
      </div>
      <div class="grid grid-cols-4 gap-3">
        <Skill v-for="(skill, index) in skills" :skill="skill" :key="index">{{
          skill.name
        }}</Skill>
      </div>
    </div>
  </div>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import Skill from "./Skill.vue";

const skills = [
  { name: "JavaScript", bg: "bg-yellow-400", image: "js" },
  { name: "HTML", bg: "bg-orange-400", image: "html" },
  { name: "CSS", bg: "bg-blue-400", image: "css" },
  { name: "Vue.js", bg: "bg-green-400", image: "vue" },
  { name: "React", bg: "bg-blue-400", image: "react" },
  { name: "Node.js", bg: "bg-green-400", image: "node" },

  { name: "MongoDB", bg: "bg-green-400", image: "mongo" },

  { name: "Git", bg: "bg-red-400", image: "git" },
  { name: "Git", bg: "bg-gray-400", image: "github" },
  { name: "Firebase", bg: "bg-orange-400", image: "firebase" },
  { name: "Tailwind", bg: "bg-blue-400", image: "tailwind" },
  { name: "Figma", bg: "bg-purple-400", image: "figma" },
  { name: "bootstap", bg: "bg-purple-400", image: "bootstrap" },
  { name: "vite", bg: "bg-purple-400", image: "vite" },
  { name: "vuetify", bg: "bg-purple-400", image: "vuetify" },
  { name: "pinia", bg: "bg-purple-400", image: "pinia" },
];
</script>

<style scoped></style>
