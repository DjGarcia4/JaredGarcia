<template>
  <div class="mb-10 md:mb-14">
    <p v-if="eyebrow" class="eyebrow reveal mb-3">
      <span class="h-px w-6 bg-accent-light"></span>
      {{ eyebrow }}
    </p>
    <h2
      ref="titleRef"
      class="text-3xl font-bold tracking-tight md:text-5xl"
    >
      <slot></slot>
    </h2>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

defineProps({
  eyebrow: { type: String, default: "" },
});

const titleRef = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // Scrubbing: el título entra apagado y se ilumina con el scroll.
    gsap.fromTo(
      titleRef.value,
      { opacity: 0.2 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: titleRef.value,
          start: "top 90%",
          end: "top 45%",
          scrub: true,
        },
      }
    );
  }, titleRef.value);
});

onUnmounted(() => ctx?.revert());
</script>
