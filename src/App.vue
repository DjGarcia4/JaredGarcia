<template>
  <Modal />
  <Header class="fixed z-10 top-0" />
  <main class="container md:mx-auto mt-24">
    <RouterView />
  </main>
  <Footer />
  <div>
    <button
      v-show="showScrollButton"
      @click="modal.handleModal(true)"
      v-if="!modal.showModal"
      type="button"
      class="bg-green-500 z-50 fixed bottom-5 md:bottom-10 left-5 md:left-10 py-3 px-5 rounded-lg text-white font-bold animate-pulse text-[12px] md:text-xl"
    >
      Contact Me!
    </button>
    <button
      v-show="showScrollButton"
      v-if="!modal.showModal"
      @click="scrollToTop"
      type="button"
      class="bg-green-500 z-50 fixed bottom-5 md:bottom-10 right-5 md:right-10 py-3 px-5 rounded-lg text-white font-bold text-[11px] md:text-xl"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-bar-up w-5 md:w-15 h-5 md:h-15 cursor-pointer"
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
import Modal from "./components/Modal.vue";
import { useModalStore } from "./stores/modal";
const modal = useModalStore();
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
  modal.handleModal(false);
});
</script>

<style></style>
