<template>
  <!-- Wrapper con fondo más sólido solo en mobile -->
  <div class="sm:bg-transparent bg-black/80 rounded-2xl">
    <div
      data-aos="fade-up"
      class="flex flex-col md:flex-row gap-6 items-center md:items-start text-left shadow-xl p-6 rounded-2xl min-w-64 md:min-w-80 bg-white/20 md:bg-white/10 backdrop-blur-md border border-white/15 hover:border-white/30 transition-all duration-300 max-w-3xl w-full"
    >
      <!-- Imagen -->
      <div v-if="certificate.imageUrl" class="flex-shrink-0">
        <img
          :src="certificate.imageUrl"
          :alt="certificate.title"
          class="w-32 h-32 md:w-36 md:h-36 object-cover rounded-xl ring-1 ring-white/20 shadow"
        />
      </div>

      <!-- Contenido -->
      <div class="flex-1 space-y-3">
        <!-- Título -->
        <h3 class="text-xl md:text-2xl font-bold text-white drop-shadow-sm">
          {{ certificate.title }}
        </h3>

        <!-- Fecha -->
        <p class="text-white/60 text-sm">
          Emitido por <span class="text-purple-600 font-semibold">Udemy</span>
        </p>

        <!-- Descripción -->
        <p class="text-white/80 text-sm leading-relaxed line-clamp-3">
          {{ certificate.description }}
        </p>

        <!-- Topics -->
        <div class="flex flex-wrap gap-2 pt-2">
          <span
            v-for="(topic, index) in certificate.topics.slice(0, 4)"
            :key="index"
            class="bg-white/10 text-white text-xs px-3 py-1 rounded-full border border-white/20"
          >
            {{ topic }}
          </span>
        </div>

        <!-- Acción -->
        <div class="pt-4 flex justify-end">
          <router-link
            :to="`/certificate/${certificate.id}`"
            class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow"
          >
            Ver Detalles
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-xs" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  certificate: {
    type: Object,
    required: true,
  },
});
</script>
