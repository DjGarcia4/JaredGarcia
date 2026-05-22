<template>
  <RouterLink
    v-glow
    :to="`/certificate/${certificate.slug}`"
    class="certificate-card surface group relative flex h-full flex-col overflow-hidden p-6 text-left transition-colors duration-500 hover:border-accent/30 md:p-7"
  >
    <!-- Número editorial decorativo -->
    <span
      v-if="index !== null"
      aria-hidden="true"
      class="pointer-events-none absolute right-5 top-4 font-display text-4xl font-bold leading-none text-white/[0.05] md:text-5xl"
    >
      {{ String(index + 1).padStart(2, "0") }}
    </span>

    <!-- Eyebrow: issuer + status -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p
        class="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/55"
      >
        <span class="h-px w-6 bg-accent"></span>
        {{ certificate.issuer }}
      </p>

      <span
        v-if="certificate.status"
        class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
        :class="statusStyle(certificate.status)"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
        {{ certificate.status }}
      </span>
    </div>

    <!-- Title -->
    <h3
      class="mt-5 font-display text-lg font-bold leading-tight tracking-tight text-white transition-colors duration-300 group-hover:text-accent-light md:text-xl"
    >
      {{ certificate.title }}
    </h3>

    <!-- Description -->
    <p
      class="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-white/55"
    >
      {{ certificate.description }}
    </p>

    <!-- Topics -->
    <div class="mt-5 flex flex-wrap gap-1.5">
      <span
        v-for="topic in certificate.topics?.slice(0, 4)"
        :key="topic"
        class="chip capitalize"
      >
        {{ topic }}
      </span>
      <span
        v-if="certificate.topics && certificate.topics.length > 4"
        class="chip text-white/45"
      >
        +{{ certificate.topics.length - 4 }}
      </span>
    </div>

    <!-- CTA -->
    <span
      class="mt-5 flex items-center gap-2 text-sm font-semibold text-white/75 transition-colors duration-300 group-hover:text-accent-light"
    >
      Ver detalles
      <font-awesome-icon
        :icon="['fas', 'arrow-right']"
        class="text-xs transition-transform duration-300 group-hover:translate-x-1"
      />
    </span>

    <!-- Hairline expandible -->
    <div
      class="mt-5 h-px w-full origin-left scale-x-[0.15] bg-accent transition-transform duration-700 ease-out group-hover:scale-x-100"
    ></div>
  </RouterLink>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { statusStyle } from "@/lib/status";

defineProps({
  certificate: { type: Object, required: true },
  index: { type: Number, default: null },
});
</script>
