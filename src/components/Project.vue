<template>
  <!-- Wrapper: fondo más opaco en móviles -->
  <!-- <div class="sm:bg-transparent bg-black/80 rounded-xl"> -->
  <div
    class="rounded-xl shadow-xl w-80 relative min-h-[470px] bg-black/90 md:bg-white/10 backdrop-blur-md border border-white/20"
  >
    <img :src="project.images.cover" alt="" class="rounded-t-xl" />

    <div class="px-5 pb-5 md:px-9 md:pb-9">
      <!-- Tech stack -->
      <div class="my-3 flex gap-2">
        <img
          v-for="(skill, index) in project.techStack"
          :key="index"
          :src="'/img/skills/' + skill + '.svg'"
          :alt="skill"
          class="w-7 h-7"
        />
      </div>

      <!-- Título y resumen -->
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-white">
          {{ project.title }}
        </h2>
        <p class="text-white line-clamp-3">
          {{ project.summary }}
        </p>
      </div>

      <!-- Botón -->
      <div class="flex justify-end mt-4 gap-4 absolute bottom-5 right-5">
        <router-link
          :to="`/project/${project.slug}`"
          class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-md"
        >
          Ver Proyecto
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="text-sm" />
        </router-link>
      </div>
    </div>
  </div>
  <!-- </div> -->
</template>

<script setup>
defineProps({
  project: { type: Object },
});
</script>
