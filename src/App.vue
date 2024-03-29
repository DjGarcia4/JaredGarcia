<template>
  <Modal />

  <Header class="fixed z-10 top-0" :class="{ hidden: hideHeader }" />

  <main class="container md:mx-auto mt-16">
    <RouterView />
  </main>
  <Footer />

  <Transition
    enter-active-class="animate__animated  animate__backInLeft "
    leave-active-class="animate__animated animate__backOutLeft"
  >
    <button
      v-if="!modal.showModal && route.path !== '/'"
      @click="
        () => {
          modal.handleModal(true);
        }
      "
      type="button"
      class="bg-green-500 z-50 fixed bottom-5 md:bottom-10 left-5 md:left-10 py-3 px-5 rounded-lg text-white font-bold text-[12px] md:text-xl"
    >
      Contact Me!
    </button>
  </Transition>
  <Transition
    enter-active-class="animate__animated animate__backInRight   "
    leave-active-class="animate__animated animate__backOutRight"
  >
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
  </Transition>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import AOS from "aos";

import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Modal from "./components/Modal.vue";

import { useModalStore } from "./stores/modal";
import { useRoute } from "vue-router";

const modal = useModalStore();
const route = useRoute();

const showScrollButton = ref(false);
const hideHeader = ref(false);
let lastScrollTop = 0;

const handleScroll = () => {
  const scrollTop = window.scrollY;
  showScrollButton.value = scrollTop > 100;

  // Ocultar o mostrar el encabezado basado en la dirección del scroll
  hideHeader.value = scrollTop > lastScrollTop && scrollTop > 100;
  if (scrollTop === 0) {
    hideHeader.value = false;
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Para dispositivos móviles
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  AOS.init();
  window.addEventListener("scroll", handleScroll);
  modal.handleModal(false);
});
</script>

<style>
.animate__animated {
  --animate-duration: 0.5s;
}

.tracking-in-expand {
  -webkit-animation: tracking-in-expand 1s cubic-bezier(0.215, 0.61, 0.1, 1)
    0.3s both;
  animation: tracking-in-expand 1s cubic-bezier(0.215, 0.61, 0.1, 1) 0.3s both;
}
@-webkit-keyframes tracking-in-expand {
  0% {
    letter-spacing: -0.5em;
    opacity: 0;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
@keyframes tracking-in-expand {
  0% {
    letter-spacing: -0.5em;
    opacity: 0;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
.carousel__slide {
  padding: 5px;
}

.carousel__viewport {
  perspective: 2000px;
}

.carousel__track {
  transform-style: preserve-3d;
}

.carousel__slide--sliding {
  transition: 0.5s;
}

.carousel__slide {
  opacity: 0.5;
  transform: rotateY(0) scale(0.8);
}

.carousel__slide--prev {
  opacity: 1;
  transform: rotateY(0) scale(0.8);
}

.carousel__slide--next {
  opacity: 1;
  transform: rotateY(0) scale(0.8);
}

.carousel__slide--active {
  opacity: 1;
  transform: rotateY(0) scale(1);
  z-index: 10;
}

.heartbeat {
  -webkit-animation: heartbeat 1.5s ease-in-out infinite both;
  animation: heartbeat 1.5s ease-in-out infinite both;
}
@-webkit-keyframes heartbeat {
  from {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-transform-origin: center center;
    transform-origin: center center;
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  10% {
    -webkit-transform: scale(0.91);
    transform: scale(0.91);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  17% {
    -webkit-transform: scale(0.98);
    transform: scale(0.98);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  33% {
    -webkit-transform: scale(0.87);
    transform: scale(0.87);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  45% {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
}
@keyframes heartbeat {
  from {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-transform-origin: center center;
    transform-origin: center center;
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  10% {
    -webkit-transform: scale(0.91);
    transform: scale(0.91);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  17% {
    -webkit-transform: scale(0.98);
    transform: scale(0.98);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
  33% {
    -webkit-transform: scale(0.87);
    transform: scale(0.87);
    -webkit-animation-timing-function: ease-in;
    animation-timing-function: ease-in;
  }
  45% {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-animation-timing-function: ease-out;
    animation-timing-function: ease-out;
  }
}
</style>
