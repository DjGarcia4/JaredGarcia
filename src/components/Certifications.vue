<template>
  <section
    v-if="completedCertifications.length"
    ref="root"
    aria-label="Certificaciones completadas"
  >
    <div ref="carouselWrap" class="relative">
      <!-- Scroll-snap nativo: sin clones (que duplicaban los headings para
           lectores de pantalla) y sin autoplay. -->
      <ul
        ref="track"
        class="no-scrollbar -mx-2.5 flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        @scroll.passive="updateEdges"
      >
        <li
          v-for="(certification, i) in completedCertifications"
          :key="certification.id"
          class="flex w-full shrink-0 snap-start px-2.5 py-2 sm:w-1/2 lg:w-1/3"
        >
          <CertificateCard :certificate="certification" :index="i" />
        </li>
      </ul>

      <div class="mt-6 flex justify-end gap-2">
        <button
          type="button"
          class="link-icon disabled:opacity-30"
          aria-label="Certificados anteriores"
          :disabled="atStart"
          @click="page(-1)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </button>
        <button
          type="button"
          class="link-icon disabled:opacity-30"
          aria-label="Certificados siguientes"
          :disabled="atEnd"
          @click="page(1)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import CertificateCard from "@/components/Certificates/CertificateCard.vue";
import { useCertifications } from "@/stores/certifications";
import { gsap, prefersReducedMotion, playOnEnter } from "@/lib/gsap";

const certifications = useCertifications();

// El certificado "En curso" se muestra destacado en CurrentlyLearning,
// así que el carrusel solo lista los ya completados.
const completedCertifications = computed(() =>
  certifications.certificationsCollection.filter((c) => c.status !== "En curso")
);

const root = ref(null);
const carouselWrap = ref(null);
const track = ref(null);
const atStart = ref(true);
const atEnd = ref(false);

const updateEdges = () => {
  const el = track.value;
  if (!el) return;
  atStart.value = el.scrollLeft <= 4;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
};

// Avanza una "página" (lo que se ve en pantalla).
const page = (dir) => {
  track.value?.scrollBy({ left: dir * track.value.clientWidth, behavior: "smooth" });
};

let ctx;

onMounted(() => {
  updateEdges();
  window.addEventListener("resize", updateEdges);
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
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

    playOnEnter(tl, {
      trigger: carouselWrap.value,
      start: "top 92%",
    });
  }, root.value);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateEdges);
  ctx?.revert();
});
</script>
