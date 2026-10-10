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
import { gsap, playOnEnter, prefersReducedMotion } from "@/lib/gsap";

defineProps({
  eyebrow: { type: String, default: "" },
});

const titleRef = ref(null);
let ctx;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    const tl = gsap.timeline({ paused: true });
    tl.from(titleRef.value, {
      opacity: 0,
      y: 18,
      duration: 0.6,
      ease: "power3.out",
    });
    playOnEnter(tl, { trigger: titleRef.value, start: "top 90%" });
  }, titleRef.value);
});

onUnmounted(() => ctx?.revert());
</script>
