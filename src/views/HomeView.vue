<template>
  <div class="overflow-hidden">
    <Hero />

    <section id="trabajo" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection eyebrow="Trabajo seleccionado">
        Casos destacados
      </TitleSection>
      <FeaturedCases :projects="featured" />
      <div class="mt-20 flex justify-center">
        <RouterLink :to="{ name: 'projects' }" class="btn-ghost">
          Ver todos los proyectos
          <font-awesome-icon :icon="['fas', 'arrow-right']" />
        </RouterLink>
      </div>
    </section>

    <section id="proceso" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection eyebrow="Cómo trabajo">
        Diseño y código, sin pasamanos
      </TitleSection>
      <Process />
    </section>

    <section id="about" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection eyebrow="Sobre mí">
        Entre Figma y producción
      </TitleSection>
      <About />
    </section>

    <section id="stack" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection eyebrow="Stack">Con qué trabajo</TitleSection>
      <Stack />
    </section>

    <section id="contact" class="container-content scroll-mt-24 py-20 md:py-28">
      <TitleSection eyebrow="Contacto">Hablemos</TitleSection>
      <FormContact />
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

import Hero from "@/components/common/Hero.vue";
import TitleSection from "@/components/TitleSection.vue";
import FeaturedCases from "@/components/FeaturedCases.vue";
import Process from "@/components/Process.vue";
import About from "@/components/About.vue";
import Stack from "@/components/Stack.vue";
import FormContact from "@/components/FormContact.vue";

import { useProjects } from "@/stores/projects";

const projects = useProjects();

// Los 4 primeros con línea de valor (headline), por orden.
const featured = computed(() =>
  projects.projectsCollection.filter((p) => p.featured && p.headline).slice(0, 4)
);
</script>
