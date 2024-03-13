<template>
  <div class="p-1">
    <img :src="'/img/skills/' + skill + '.svg'" :alt="skill" class="w-7 h-7" />
  </div>
</template>

<script setup>
defineProps({
  skill: {
    type: String,
  },
});
</script>

<style scoped></style>
