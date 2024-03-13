<template>
  <Header class="fixed z-10 top-0" />
  <main class="container md:mx-auto space-y-5 mt-24 w-screen">
    <RouterView />
  </main>
  <Footer />
</template>
<script setup>
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import AOS from "aos";
onMounted(() => {
  AOS.init();
});
</script>

<style></style>
