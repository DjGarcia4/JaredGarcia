<template>
  <div
    v-if="certificate"
    class="px-4 md:px-6 max-w-4xl mx-auto mt-24 mb-20 space-y-10"
  >
    <!-- Header más enfocado en timeline -->
    <div
      class="flex flex-col gap-3 items-start md:items-center text-left md:text-center"
    >
      <h1
        class="text-2xl md:text-4xl font-semibold text-white drop-shadow"
        data-aos="fade-down"
      >
        {{ certificate.title }}
      </h1>
      <div class="text-sm text-white/60" data-aos="fade-down">
        Emitido por
        <span class="text-purple-600 font-semibold">Udemy</span>
      </div>
    </div>

    <!-- Descripción destacada -->
    <div
      class="bg-white/5 border border-white/10 p-5 md:p-8 rounded-xl text-white/90 leading-relaxed backdrop-blur-sm shadow-md"
      data-aos="fade-up"
    >
      <p class="text-base whitespace-pre-line">
        {{ certificate.description }}
      </p>
    </div>

    <!-- Tags de temas -->
    <div class="flex flex-wrap justify-center gap-3" data-aos="fade-up">
      <div
        v-for="topic in certificate.topics"
        :key="topic"
        class="group flex items-center gap-2 px-4 py-2 bg-white/10 text-white/90 rounded-full border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition backdrop-blur-md"
      >
        <font-awesome-icon
          :icon="['fas', 'circle-check']"
          class="text-green-400 group-hover:text-primary"
        />
        <span class="capitalize">{{ topic }}</span>
      </div>
    </div>
    <!-- Imagen si existe -->
    <div
      v-if="certificate.imageUrl"
      class="mx-auto max-w-2xl overflow-hidden rounded-xl shadow-lg border border-white/10"
      data-aos="zoom-in"
    >
      <img
        :src="certificate.imageUrl"
        :alt="certificate.title"
        class="w-full object-cover"
      />
    </div>

    <!-- Botón de regreso -->
    <div class="flex justify-center pt-6" data-aos="fade-up">
      <button
        @click="router.back()"
        class="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-2 rounded-md border border-white/20 hover:bg-white/20 transition"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Volver a certificados
      </button>
    </div>
  </div>

  <div v-else class="text-center text-white py-20">
    <p class="text-lg animate-pulse">Cargando certificado...</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { useCertifications } from "@/stores/certifications";

const route = useRoute();
const router = useRouter();
const certificationStore = useCertifications();

const certificate = computed(() =>
  certificationStore.certificationsCollection.find(
    (c) => c.id === route.params.slug
  )
);

const formatDate = (timestamp) => {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-HN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 10);
});
</script>
