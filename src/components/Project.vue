<template>
  <div
    class="rounded-xl shadow-xl w-80 relative min-h-[470px] bg-white/10 backdrop-blur-md border border-white/20"
  >
    <img :src="project.images.cover" alt="" class="rounded-t-xl" />
    <div class="px-5 pb-5 md:px-9 md:pb-9">
      <div class="my-3 flex gap-2">
        <img
          v-for="(skill, index) in project.techStack"
          :key="index"
          :src="'/img/skills/' + skill + '.svg'"
          :alt="skill"
          class="w-7 h-7"
        />
      </div>
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-white">
          {{ project.title }}
        </h2>
        <p class="text-white line-clamp-3">
          {{ project.summary }}
        </p>
      </div>
      <div class="flex justify-end mt-4 gap-4 absolute bottom-5 right-5">
        <a
          v-if="project.page"
          :href="project.page"
          target="_blank"
          rel="noopener noreferrer"
          class="border-2 py-2 px-4 rounded-lg text-sm md:text-lg text-white hover:border-none hover:bg-green-500 hover:scale-110 hover:text-white transition-all flex justify-center items-center"
        >
          Visitar
        </a>
        <a
          v-if="project.code"
          :href="project.code"
          target="_blank"
          rel="noopener noreferrer"
          class="border-2 py-2 px-4 rounded-lg text-sm md:text-lg text-white hover:border-none hover:bg-green-500 hover:scale-110 hover:text-white transition-all flex items-center"
          >Codigo
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-code"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 8l-4 4l4 4" />
            <path d="M17 8l4 4l-4 4" />
            <path d="M14 4l-4 16" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  project: { type: Object },
});
</script>
