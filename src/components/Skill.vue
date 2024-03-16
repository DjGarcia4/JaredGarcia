<template>
  <div data-aos="fade-left">
    <img
      :src="'/img/skills/' + skill.image + '.svg'"
      alt=""
      class="w-10 md:w-16 opacity-35 hover:opacity-100 transition-all"
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
