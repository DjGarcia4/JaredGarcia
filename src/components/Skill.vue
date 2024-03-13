<template>
  <!-- <div
    data-aos="fade-left"
    :class="`flex justify-center items-center text-white font-bold py-1 px-3 md:py-3 md:px-5 rounded-md md:rounded-xl gap-3 ${skill.bg}`"
  > -->
  <div data-aos="fade-left">
    <img
      :src="'/img/skills/' + skill.image + '.svg'"
      alt=""
      class="w-10 hover:w-14 md:w-16 opacity-35 hover:opacity-100 transition-all hover:md:w-20"
    />
  </div>
  <!-- <div class="text-1xl md:text-5xl">
    <slot></slot>
  </div> -->
  <!-- </div> -->
</template>

<script setup>
defineProps({
  skill: {
    type: Object,
  },
});
</script>

<style scoped></style>
