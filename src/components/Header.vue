<template>
  <div class="flex justify-center items-center w-screen">
    <Nav class="animate__animated animate__slideInDown" />
  </div>
</template>

<script setup>
import Nav from "@/components/Nav.vue";
</script>

<style scoped>
.animate__animated {
  --animate-duration: 0.2s;
}
</style>
