<template>
  <section class="py-20">
    <TitleSection>Tecnologías que domino</TitleSection>

    <div
      class="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24"
    >
      <!-- Memoji -->
      <div data-aos="fade-right" class="flex-shrink-0">
        <img
          src="/img/memojis/computer.png"
          alt="Memoji Developer"
          class="w-40 h-44 md:w-60 md:h-72 drop-shadow-2xl transition-transform hover:scale-105"
        />
      </div>

      <!-- Skills Grid -->
      <div
        data-aos="fade-up"
        class="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl"
      >
        <Skill
          v-for="(skill, index) in skills"
          :key="index"
          :skill="skill"
          class="group relative hover:scale-105 transition duration-300 ease-in-out"
        >
          <!-- Nombre flotante en mobile -->
          <p
            class="text-xs text-white bg-black/50 px-2 py-0.5 rounded-md mt-1 text-center sm:hidden"
          >
            {{ skill.name }}
          </p>
        </Skill>
      </div>
    </div>
  </section>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import Skill from "./Skill.vue";

const skills = [
  { name: "React", bg: "bg-blue-400", image: "react" },
  { name: "Vue.js", bg: "bg-green-400", image: "vue" },
  { name: "TypeScript", bg: "bg-purple-400", image: "ts" },
  { name: "JavaScript", bg: "bg-yellow-400", image: "js" },
  { name: "Node.js", bg: "bg-green-400", image: "node" },
  { name: "HTML", bg: "bg-orange-400", image: "html" },
  { name: "CSS", bg: "bg-blue-400", image: "css" },
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
  { name: "electron", bg: "bg-purple-400", image: "electron" },
];
</script>
