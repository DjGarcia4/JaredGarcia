<template>
  <section class="container-content py-20 md:py-28">
    <TitleSection eyebrow="Stack">
      Tecnologías que domino
    </TitleSection>

    <div
      v-stagger
      class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
    >
      <Skill v-for="skill in skills" :key="skill.name" :skill="skill" />
    </div>
  </section>
</template>

<script setup>
import TitleSection from "@/components/TitleSection.vue";
import Skill from "@/components/Skill.vue";
import { skills } from "@/data/skills";
</script>
