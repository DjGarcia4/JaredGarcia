<template>
  <Header class="fixed z-10 top-0" />
  <main class="container md:mx-auto mt-24">
    <RouterView />
  </main>
  <Footer />
  <div>
    <button
      v-show="showScrollButton"
      type="button"
      class="bg-green-500 z-50 fixed bottom-10 left-10 py-3 px-5 rounded-lg text-white font-bold animate-pulse"
    >
      Contact Me!
    </button>
    <button
      v-show="showScrollButton"
      @click="scrollToTop"
      type="button"
      class="bg-green-500 z-50 fixed bottom-10 right-10 py-3 px-5 rounded-lg text-white font-bold"
    >
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
        class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-bar-up"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 4l0 10" />
        <path d="M12 4l4 4" />
        <path d="M12 4l-4 4" />
        <path d="M4 20l16 0" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import AOS from "aos";
onMounted(() => {
  AOS.init();
});

const showScrollButton = ref(false);

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 100;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
</script>

<style></style>
