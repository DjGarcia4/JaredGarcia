<template>
  <div class="relative min-h-screen">
    <a href="#main" class="skip-link" @click.prevent="skipToMain">Saltar al contenido</a>
    <!-- Fondo -->
    <MeshBackground />
    <div class="grid-overlay fixed inset-0 -z-10"></div>

    <!-- Barra de progreso de scroll -->
    <div
      ref="progressBar"
      class="scroll-progress fixed left-0 top-0 z-50 h-[3px] w-full bg-gradient-to-r from-accent-dark via-accent to-accent-light"
    ></div>

    <Modal v-if="modalUsed" />
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

    <main id="main" tabindex="-1" class="pt-20 focus:outline-none">
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

    <!-- Acciones flotantes (abajo a la derecha): volver arriba y, solo en
         páginas de detalle, contacto. Apiladas para no tapar contenido. -->
    <div
      v-if="!modal.showModal"
      class="pointer-events-none fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 md:bottom-8 md:right-8"
    >
      <Transition
        enter-active-class="transition duration-300"
        leave-active-class="transition duration-300"
        enter-from-class="opacity-0 translate-y-6"
        leave-to-class="opacity-0 translate-y-6"
      >
        <button
          v-if="showScrollTop"
          @click="scrollToTop"
          type="button"
          aria-label="Volver arriba"
          class="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-ink-850/80 text-white/80 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent-light"
        >
          <font-awesome-icon :icon="['fas', 'arrow-up']" />
        </button>
      </Transition>

      <Transition
        enter-active-class="transition duration-300"
        leave-active-class="transition duration-300"
        enter-from-class="opacity-0 translate-y-6"
        leave-to-class="opacity-0 translate-y-6"
      >
        <button
          v-if="showFloatingContact"
          @click="modal.handleModal(true)"
          type="button"
          class="btn-primary pointer-events-auto shadow-glow"
        >
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
          Contactame
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";

import { Toaster } from "vue-sonner";

import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import MeshBackground from "@/components/MeshBackground.vue";

import { useModalStore } from "@/stores/modal";

// El modal (Headless UI + formulario) solo se descarga la primera vez que se
// abre; después queda montado para que funcione la transición de cierre.
const Modal = defineAsyncComponent(() => import("@/components/Modal.vue"));
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

const modal = useModalStore();
const modalUsed = ref(false);
watch(
  () => modal.showModal,
  (open) => {
    if (open) modalUsed.value = true;
  }
);
const route = useRoute();

const scrolled = ref(false);
const showScrollTop = ref(false);
const progressBar = ref(null);

// En la home ya está la sección de contacto, y en /projects el botón tapaba
// el buscador y los filtros: solo se muestra en las páginas de detalle.
const showFloatingContact = computed(() =>
  ["project", "certificate"].includes(route.name)
);

let ctx;

const handleScroll = () => {
  scrolled.value = window.scrollY > 24;
  showScrollTop.value = window.scrollY > 400;
};

// Sin dejar que el router interprete #main como navegación.
const skipToMain = () => {
  const main = document.getElementById("main");
  main?.focus({ preventScroll: true });
  main?.scrollIntoView();
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const initScrollProgress = () => {
  if (prefersReducedMotion() || !progressBar.value) return;
  ctx = gsap.context(() => {
    gsap.to(progressBar.value, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });

  initScrollProgress();
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
