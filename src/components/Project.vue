<template>
  <div class="bg-white rounded-xl shadow-xl w-80">
    <img src="/img/project.jpg" alt="" class="rounded-t-xl" />
    <div class="px-5 pb-5 md:px-9 md:pb-9">
      <div class="my-3 flex">
        <Skill v-for="i in 3" />
      </div>
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-600">Title</h2>
        <p class="text-gray-400">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempora.
        </p>
      </div>
      <div class="flex justify-end mt-4">
        <ButtonMain
          ><svg
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
            <path d="M14 4l-4 16" /></svg
        ></ButtonMain>
      </div>
    </div>
  </div>
</template>

<script setup>
import ButtonMain from "./ButtonMain.vue";
import Skill from "./SkillProject.vue";
</script>

<style scoped></style>
./SkillProject.vue
