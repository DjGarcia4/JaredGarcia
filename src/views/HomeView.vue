<template>
  <div class="overflow-hidden">
    <Hero />

    <section id="trabajo" class="container-content py-20 md:py-28 scroll-mt-24">
      <TitleSection eyebrow="Trabajo seleccionado">
        Proyectos destacados
      </TitleSection>

      <StackedProjects :projects="featured" />

      <div class="reveal mt-14 flex justify-center">
        <button
          type="button"
          class="btn-ghost"
          @click="router.push({ name: 'projects' })"
        >
          Ver todos los proyectos
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </button>
      </div>
    </section>

    <AboutValues />

    <Currently />
    <div id="services" class="scroll-mt-24"></div>
    <Services />
    <div id="skills" class="scroll-mt-24"></div>
    <Skills />

    <!-- Aprendizaje -->
    <section class="container-content py-20 md:py-28">
      <TitleSection eyebrow="Aprendizaje">
        Mi camino de aprendizaje
      </TitleSection>
      <CurrentlyLearning class="mb-12" />
      <Certifications />
    </section>

   <!-- <Reviews /> -->

    <section id="contact" class="container-content py-20 md:py-28">
      <TitleSection eyebrow="Contacto">Hablemos</TitleSection>
      <FormContact />
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import Hero from "@/components/common/Hero.vue";
import StackedProjects from "@/components/StackedProjects.vue";
import AboutValues from "@/components/AboutValues.vue";
import Currently from "@/components/Currently.vue";
import CurrentlyLearning from "@/components/CurrentlyLearning.vue";
import Services from "@/components/Services/Services.vue";
import Skills from "@/components/Skills.vue";
import Certifications from "@/components/Certifications.vue";
import Reviews from "@/components/Reviews.vue";
import FormContact from "@/components/FormContact.vue";
import TitleSection from "@/components/TitleSection.vue";

import { useProjects } from "@/stores/projects";

const router = useRouter();
const projects = useProjects();

const featured = computed(() => {
  const all = projects.projectsCollection;
  const starred = all.filter((p) => p.featured);
  return (starred.length >= 3 ? starred : all).slice(0, 3);
});

</script>
