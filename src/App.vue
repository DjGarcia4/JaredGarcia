<template>
  <div v-if="route.path === '/'">
    <!-- Solo splash -->
    <RouterView />
  </div>

  <div v-else>
    <!-- Fondo global (detrás de todo excepto el splash) -->
    <!-- Fondo global -->
    <div
      class="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none fondo-grid"
    ></div>

    <!-- Blob difuso animado -->
    <div
      id="blob"
      class="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    ></div>
    <Modal />

    <Header
      class="fixed z-10 top-0 w-full transition-all duration-300"
      :class="[
        hideHeader ? 'hidden' : '',
        !atTop ? 'bg-white/10 backdrop-blur-md ' : '',
      ]"
    />

    <main class="container md:mx-auto mt-16">
      <RouterView />
    </main>

    <Footer />

    <Transition
      enter-active-class="animate__animated animate__backInLeft"
      leave-active-class="animate__animated animate__backOutLeft"
    >
      <button
        v-if="!modal.showModal"
        v-show="route.path !== '/'"
        @click="() => modal.handleModal(true)"
        type="button"
        class="bg-green-500 z-50 fixed bottom-5 md:bottom-10 left-5 md:left-10 py-3 px-5 rounded-lg text-white font-bold text-[12px] md:text-xl"
      >
        Contactame!
      </button>
    </Transition>

    <Transition
      enter-active-class="animate__animated animate__backInRight"
      leave-active-class="animate__animated animate__backOutRight"
    >
      <button
        v-if="!modal.showModal && showScrollButton"
        @click="scrollToTop"
        type="button"
        class="bg-green-500 z-50 fixed bottom-5 md:bottom-10 right-5 md:right-10 py-3 px-5 rounded-lg text-white font-bold text-[11px] md:text-xl"
      >
        <!-- Icono scroll up -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 md:w-15 h-5 md:h-15"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 4l0 10" />
          <path d="M12 4l4 4" />
          <path d="M12 4l-4 4" />
          <path d="M4 20l16 0" />
        </svg>
      </button>
    </Transition>
  </div>
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
const atTop = ref(true);

const showScrollButton = ref(false);
const hideHeader = ref(false);
let lastScrollTop = 0;

const handleScroll = () => {
  const scrollTop = window.scrollY;
  showScrollButton.value = scrollTop > 100;
  atTop.value = scrollTop === 0;

  // Ocultar o mostrar el header según dirección del scroll
  hideHeader.value = scrollTop > lastScrollTop && scrollTop > 100;
  if (scrollTop === 0) hideHeader.value = false;

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
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
.bg-blur {
  @apply bg-white/10 backdrop-blur-md border border-white/20;
}
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

.fondo-grid {
  background: radial-gradient(
      circle at 20% 50%,
      rgba(0, 255, 153, 0.08),
      transparent 60%
    ),
    radial-gradient(circle at 80% 50%, rgba(0, 255, 153, 0.08), transparent 60%),
    repeating-linear-gradient(
      to right,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px,
      transparent 40px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px,
      transparent 40px
    ),
    #0c0c0c;
  background-size: cover;
  animation: move-bg 20s linear infinite;
}

@keyframes move-bg {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}
.text-gradient-animated {
  background: linear-gradient(
    90deg,
    #166534,
    #4ade80,
    #22c55e,
    #16a34a,
    #4ade80
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  animation: move-gradient 2s ease infinite;
  font-weight: bold;
}

@keyframes move-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
#blob::before {
  content: "";
  position: absolute;
  top: var(--scroll);
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(34, 197, 94, 0.2) 0%,
    transparent 70%
  );
  filter: blur(120px);
  pointer-events: none;
  transition: top 0.2s ease-out;
}
</style>
