<template>
  <div data-aos="fade-left">
    <img
      :src="'/img/skills/' + skill.image + '.svg'"
      alt=""
      class="w-10 md:w-16 opacity-90 hover:opacity-100 transition-all hover:scale-110"
    />
  </div>
</template>

<script setup>
defineProps({
  skill: {
    type: Object,
  },
});
</script>

<style scoped></style>
