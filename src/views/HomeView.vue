<template>
  <div class="overflow-hidden">
    <Hero />

    <section class="container-content py-20 md:py-28">
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

    <!-- Sobre mí -->
    <section class="container-content py-20 md:py-28">
      <TitleSection eyebrow="Sobre mí">Lo que me define</TitleSection>
      <div v-stagger class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(value, i) in values"
          :key="value.title"
          v-glow
          class="surface surface-hover group relative flex flex-col p-6"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-lg text-accent-light transition-all duration-300 group-hover:scale-110 group-hover:border-accent/40 group-hover:bg-accent/20"
          >
            <font-awesome-icon :icon="['fas', value.icon]" />
          </div>

          <h4 class="mt-5 font-display text-base font-bold text-white">
            {{ value.title }}
          </h4>
          <p class="mt-2 flex-1 text-sm leading-relaxed text-white/55">
            {{ value.description }}
          </p>

          <div
            class="mt-6 h-px w-10 rounded-full bg-accent/50 transition-all duration-500 ease-out group-hover:w-full"
          ></div>
        </div>
      </div>
    </section>

    <Currently />
    <Services />
    <Skills />

    <!-- Aprendizaje -->
    <section class="container-content py-20 md:py-28">
      <TitleSection eyebrow="Aprendizaje">
        Mi camino de aprendizaje
      </TitleSection>
      <CurrentlyLearning class="reveal-scale mb-12" />
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

const values = [
  {
    title: "Trabajo en equipo",
    description:
      "Colaboro, aprendo de otros y sumo al proyecto como un jugador comprometido.",
    icon: "users",
  },
  {
    title: "Resolución de problemas",
    description:
      "Disfruto encontrar soluciones creativas, eficientes y que realmente funcionen.",
    icon: "lightbulb",
  },
  {
    title: "Compromiso con la calidad",
    description:
      "Cada detalle cuenta: que todo funcione bien, se vea bien y sea confiable.",
    icon: "shield-halved",
  },
  {
    title: "Ganas de crecer",
    description:
      "Siempre busco aprender algo nuevo, mejorar mis skills y asumir nuevos retos.",
    icon: "rocket",
  },
];
</script>
