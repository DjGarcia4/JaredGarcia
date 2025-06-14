<template>
  <div
    v-if="project"
    class="px-4 md:px-0 max-w-6xl mx-auto space-y-8 mt-20 md:space-y-14"
  >
    <!-- Encabezado -->
    <div class="text-center space-y-2" data-aos="fade-down">
      <h1
        class="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow"
      >
        {{ project.title }}
      </h1>
      <p class="text-sm md:text-lg text-white/60 italic">
        {{ project.summary }}
      </p>
    </div>

    <!-- Metadata -->
    <div
      class="flex flex-wrap justify-center gap-3 text-white/70 text-sm"
      data-aos="fade-up"
    >
      <span
        class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20"
      >
        <font-awesome-icon :icon="['fas', 'layer-group']" />
        {{ project.category }}
      </span>
      <span
        class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20"
      >
        <font-awesome-icon :icon="['fas', 'user-cog']" />
        {{ project.role }}
      </span>
      <span
        class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20"
      >
        <font-awesome-icon :icon="['fas', 'calendar-alt']" />
        {{ project.year }}
      </span>
      <span
        v-if="project.featured"
        class="flex items-center gap-2 bg-yellow-400/10 text-yellow-300 px-3 py-1 rounded-full border border-yellow-300/20"
      >
        <font-awesome-icon :icon="['fas', 'star']" />
        Proyecto Destacado
      </span>
    </div>

    <!-- Imagen principal -->
    <div
      class="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10 hover:ring-white/20 transition"
      data-aos="zoom-in"
    >
      <img
        :src="project.images.cover"
        :alt="project.title"
        class="w-full h-auto object-cover"
      />
    </div>

    <!-- Tecnologías -->
    <div class="flex flex-wrap gap-3 justify-center" data-aos="fade-up">
      <div
        v-for="tech in project.techStack"
        :key="tech"
        class="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition text-white text-sm px-3 py-1 rounded-full backdrop-blur border border-white/20"
      >
        <img :src="`/img/skills/${tech}.svg`" :alt="tech" class="w-4 h-4" />
        <span class="capitalize">{{ tech }}</span>
      </div>
    </div>

    <!-- Descripción -->
    <div
      class="max-w-3xl mx-auto bg-white/5 border border-white/10 p-6 rounded-xl text-white/90 text-base leading-relaxed backdrop-blur-lg shadow-md"
      data-aos="fade-right"
    >
      {{ project.description }}
    </div>

    <!-- Características -->
    <div class="md:w-5/6 mx-5 md:mx-auto space-y-6">
      <h2
        class="text-2xl text-white font-semibold text-center"
        data-aos="fade-up"
      >
        Funcionalidades destacadas
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div
          v-for="(feature, i) in project.features"
          :key="i"
          class="group flex items-start gap-3 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition"
          :data-aos="'fade-up'"
        >
          <font-awesome-icon
            :icon="['fas', 'check-circle']"
            class="text-green-400 group-hover:text-primary mt-1 w-5 h-5"
          />
          <p class="text-white/90 text-sm leading-snug">
            {{ feature }}
          </p>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div
      v-if="project.tags?.length"
      class="flex flex-wrap justify-center gap-2 mt-8"
      data-aos="fade-up"
    >
      <span
        v-for="tag in project.tags"
        :key="tag"
        class="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full border border-white/20"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- Enlaces -->
    <div class="flex justify-center gap-4 mt-10" data-aos="zoom-in">
      <button
        @click="router.back()"
        class="flex items-center gap-2 bg-white/10 text-white px-6 py-2 rounded-lg font-medium border border-white/20 hover:bg-white/20 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>

      <a
        v-if="project.repoUrl"
        :href="project.repoUrl"
        target="_blank"
        class="flex items-center gap-2 bg-white/10 text-white px-6 py-2 rounded-lg font-medium border border-white/20 hover:bg-white/20 transition"
      >
        <font-awesome-icon :icon="['fab', 'github']" />
        Ver Código
      </a>
      <a
        v-if="project.liveUrl"
        :href="project.liveUrl"
        target="_blank"
        class="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition"
      >
        Ver Sitio
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </a>
    </div>
  </div>

  <div v-else class="text-center text-white py-20">
    <p class="text-lg animate-pulse">Cargando proyecto...</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useProjects } from "@/stores/projects";
import { computed, onMounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const route = useRoute();
const router = useRouter();
const projects = useProjects();

const project = computed(() =>
  projects.projectsCollection.find((p) => p.slug === route.params.slug)
);
onMounted(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 10);
});
</script>
