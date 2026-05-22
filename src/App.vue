<template>
  <Transition
    enter-active-class="transition-opacity duration-500"
    leave-active-class="transition-opacity duration-500"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <Splash v-if="showSplash" @finish="finishSplash" />
  </Transition>

  <div v-show="!showSplash" class="relative min-h-screen">
    <!-- Fondo -->
    <MeshBackground />
    <div class="grid-overlay fixed inset-0 -z-10"></div>

    <!-- Barra de progreso de scroll -->
    <div
      ref="progressBar"
      class="scroll-progress fixed left-0 top-0 z-50 h-[3px] w-full bg-gradient-to-r from-accent-dark via-accent to-accent-light"
    ></div>

    <Modal />
    <Toaster
      position="top-center"
      theme="dark"
      :duration="3200"
      :gap="10"
      :visible-toasts="3"
      close-button
      expand
    />
    <Header :scrolled="scrolled" />

    <main class="pt-20">
      <RouterView v-slot="{ Component }">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-400 ease-out"
          leave-active-class="transition duration-200 ease-in"
          enter-from-class="opacity-0 translate-y-3"
          leave-to-class="opacity-0"
          @after-enter="onAfterEnter"
        >
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <Footer />

    <!-- Botón contacto flotante -->
    <Transition
      enter-active-class="transition duration-300"
      leave-active-class="transition duration-300"
      enter-from-class="opacity-0 translate-x-6"
      leave-to-class="opacity-0 translate-x-6"
    >
      <button
        v-if="!modal.showModal && route.path !== '/'"
        @click="modal.handleModal(true)"
        type="button"
        class="btn-primary fixed bottom-6 left-6 z-40 shadow-glow md:bottom-8 md:left-8"
      >
        <font-awesome-icon :icon="['fas', 'paper-plane']" />
        Contactame
      </button>
    </Transition>

    <!-- Botón scroll-to-top -->
    <Transition
      enter-active-class="transition duration-300"
      leave-active-class="transition duration-300"
      enter-from-class="opacity-0 translate-y-6"
      leave-to-class="opacity-0 translate-y-6"
    >
      <button
        v-if="!modal.showModal && showScrollTop"
        @click="scrollToTop"
        type="button"
        aria-label="Volver arriba"
        class="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-ink-850/80 text-white/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent-light md:bottom-8 md:right-8"
      >
        <font-awesome-icon :icon="['fas', 'arrow-up']" />
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";

import { Toaster } from "vue-sonner";

import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Modal from "@/components/Modal.vue";
import MeshBackground from "@/components/MeshBackground.vue";
import Splash from "@/views/Splash.vue";

import { useModalStore } from "@/stores/modal";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const modal = useModalStore();
const route = useRoute();

const showSplash = ref(!sessionStorage.getItem("splashSeen"));
const scrolled = ref(false);
const showScrollTop = ref(false);
const progressBar = ref(null);

let ctx;

const finishSplash = () => {
  sessionStorage.setItem("splashSeen", "1");
  showSplash.value = false;
};

const handleScroll = () => {
  scrolled.value = window.scrollY > 24;
  showScrollTop.value = window.scrollY > 400;
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });

  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    gsap.to(progressBar.value, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  ctx?.revert();
});

const onAfterEnter = () => {
  ScrollTrigger.refresh();
};

// La altura de la página cambia entre rutas: recalcular ScrollTrigger.
watch(
  () => route.path,
  () => {
    nextTick(() => ScrollTrigger.refresh());
  }
);
</script>
