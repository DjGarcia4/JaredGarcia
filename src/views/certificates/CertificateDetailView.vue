<template>
  <div v-if="certificate" class="container-content max-w-3xl py-16 md:py-20">
    <button
      type="button"
      @click="router.back()"
      class="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-accent-light"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" />
      Volver
    </button>

    <div class="reveal mt-8">
      <div class="flex flex-wrap items-center gap-3">
        <p class="flex items-center gap-2 text-sm text-white/45">
          <font-awesome-icon
            :icon="['fas', 'certificate']"
            class="text-accent-light"
          />
          Emitido por
          <span class="font-medium text-white/80">{{ certificate.issuer }}</span>
        </p>
        <span
          v-if="certificate.status"
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
          :class="statusStyle(certificate.status)"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
          {{ certificate.status }}
        </span>
      </div>
      <h1
        class="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl"
      >
        {{ certificate.title }}
      </h1>
    </div>

    <div class="reveal surface mt-8 p-6 text-white/75 md:p-8">
      <p class="whitespace-pre-line leading-relaxed">
        {{ certificate.description }}
      </p>
    </div>

    <div v-if="certificate.topics?.length" class="reveal mt-8">
      <p class="eyebrow mb-3">Temas</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="topic in certificate.topics"
          :key="topic"
          class="chip capitalize"
        >
          <font-awesome-icon
            :icon="['fas', 'circle-check']"
            class="text-accent-light"
          />
          {{ topic }}
        </span>
      </div>
    </div>

    <div
      v-if="certificate.imageUrl"
      class="reveal-scale surface mt-8 overflow-hidden p-0"
    >
      <img
        :src="certificate.imageUrl"
        :alt="certificate.title"
        class="w-full object-cover"
      />
    </div>
  </div>

  <div
    v-else
    class="container-content flex flex-col items-center gap-4 py-32 text-center"
  >
    <font-awesome-icon
      :icon="['fas', 'folder-open']"
      class="text-4xl text-white/20"
    />
    <p class="text-white/55">No se encontró el certificado.</p>
    <RouterLink :to="{ name: 'home' }" class="btn-ghost">
      Volver al inicio
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useCertifications } from "@/stores/certifications";
import { statusStyle } from "@/lib/status";

const route = useRoute();
const router = useRouter();
const certificationStore = useCertifications();

const certificate = computed(() =>
  certificationStore.certificationsCollection.find(
    (c) => c.slug === route.params.slug
  )
);
</script>
