<template>
  <section v-if="completedCertifications.length" ref="root">
    <div ref="carouselWrap">
      <Carousel
        v-bind="carouselConfig"
        :wrapAround="true"
        :autoplay="7000"
        :transition="600"
        :pauseAutoplayOnHover="true"
      >
        <Slide
          v-for="(certification, i) in completedCertifications"
          :key="certification.id"
        >
          <div class="flex h-full w-full px-2.5 py-2">
            <CertificateCard :certificate="certification" :index="i" />
          </div>
        </Slide>
        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import CertificateCard from "@/components/Certificates/CertificateCard.vue";
import { useCertifications } from "@/stores/certifications";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide, Navigation } from "vue3-carousel";

const certifications = useCertifications();

// El certificado "En curso" se muestra destacado en CurrentlyLearning,
// así que el carrusel solo lista los ya completados.
const completedCertifications = computed(() =>
  certifications.certificationsCollection.filter((c) => c.status !== "En curso")
);

const carouselConfig = {
  itemsToShow: 1,
  snapAlign: "start",
  breakpoints: {
    640: { itemsToShow: 2 },
    1024: { itemsToShow: 3 },
  },
};

const root = ref(null);
const carouselWrap = ref(null);

let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // Entrada cinematográfica del carousel completo (no por slide, porque el
    // carousel maneja sus propias transiciones internas al cambiar de slide).
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power4.out" },
    });

    tl.from(carouselWrap.value, {
      opacity: 0,
      y: 28,
      scale: 0.98,
      filter: "blur(5px)",
      duration: 0.7,
    });

    ScrollTrigger.create({
      trigger: carouselWrap.value,
      start: "top 92%",
      onEnter: () => tl.restart(),
      onEnterBack: () => tl.restart(),
    });
  }, root.value);
});

onUnmounted(() => ctx?.revert());
</script>

<style scoped>
.carousel {
  --vc-nav-background: rgba(30, 41, 59, 0.85);
  --vc-nav-color: rgba(255, 255, 255, 0.75);
  --vc-nav-color-hover: #4ade80;
  --vc-nav-border-radius: 12px;
  --vc-nav-width: 40px;
  --vc-nav-height: 40px;
}
.carousel :deep(.carousel__slide) {
  align-items: stretch;
}
</style>
