<template>
  <RouterLink
    v-glow
    :to="`/certificate/${certificate.slug}`"
    class="surface surface-hover group flex h-full flex-col p-6 text-left"
  >
    <div class="flex items-center justify-between gap-2 text-xs text-white/40">
      <span class="flex items-center gap-2">
        <font-awesome-icon
          :icon="['fas', 'certificate']"
          class="text-accent-light"
        />
        Emitido por
        <span class="font-medium text-white/70">{{ certificate.issuer }}</span>
      </span>

      <span
        v-if="certificate.status"
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
        :class="statusStyle(certificate.status)"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
        {{ certificate.status }}
      </span>
    </div>

    <h3
      class="mt-3 font-display text-lg font-bold text-white transition-colors group-hover:text-accent-light"
    >
      {{ certificate.title }}
    </h3>

    <p class="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55">
      {{ certificate.description }}
    </p>

    <div class="mt-4 flex flex-wrap gap-1.5">
      <span
        v-for="topic in certificate.topics?.slice(0, 4)"
        :key="topic"
        class="chip capitalize"
      >
        {{ topic }}
      </span>
    </div>

    <span
      class="mt-5 flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors group-hover:text-accent-light"
    >
      Ver detalles
      <font-awesome-icon
        :icon="['fas', 'arrow-right']"
        class="text-xs transition-transform duration-300 group-hover:translate-x-1"
      />
    </span>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { statusStyle } from "@/lib/status";

defineProps({
  certificate: { type: Object, required: true },
});
</script>
