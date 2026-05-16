<template>
  <div
    ref="root"
    class="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-ink-950"
  >
    <div
      ref="trackA"
      class="blob-track"
      style="top: -12%; left: 6%"
    >
      <div class="blob blob-a"></div>
    </div>
    <div
      ref="trackB"
      class="blob-track"
      style="top: 28%; left: 58%"
    >
      <div class="blob blob-b"></div>
    </div>
    <div
      ref="trackC"
      class="blob-track"
      style="top: 60%; left: 18%"
    >
      <div class="blob blob-c"></div>
    </div>

    <!-- Velo + grano sutil para unificar -->
    <div class="absolute inset-0 bg-ink-950/55"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const root = ref(null);
const trackA = ref(null);
const trackB = ref(null);
const trackC = ref(null);

let ctx;
let onMove;

onMounted(() => {
  if (prefersReducedMotion()) return;

  ctx = gsap.context(() => {
    // Parallax de mouse: cada capa se mueve a distinta profundidad.
    const layers = [
      { el: trackA.value, depth: 34 },
      { el: trackB.value, depth: -52 },
      { el: trackC.value, depth: 22 },
    ].map(({ el, depth }) => ({
      depth,
      xTo: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3" }),
      yTo: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3" }),
    }));

    onMove = (event) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      layers.forEach(({ depth, xTo, yTo }) => {
        xTo(nx * depth);
        yTo(ny * depth);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
  }, root.value);
});

onUnmounted(() => {
  if (onMove) window.removeEventListener("pointermove", onMove);
  ctx?.revert();
});
</script>

<style scoped>
.blob-track {
  position: absolute;
  will-change: transform;
}

.blob {
  width: 52vw;
  height: 52vw;
  max-width: 760px;
  max-height: 760px;
  border-radius: 9999px;
  filter: blur(140px);
  will-change: transform;
  opacity: 0.55;
}

/* Float infinito (transform puro, fuera del hilo principal). */
.blob-a {
  background: #10b981;
  animation: drift-a 19s ease-in-out infinite;
}
.blob-b {
  background: #065f46;
  animation: drift-b 24s ease-in-out infinite;
}
.blob-c {
  background: #0f766e;
  animation: drift-c 22s ease-in-out infinite;
}

@keyframes drift-a {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(7%, 9%, 0) scale(1.12);
  }
}
@keyframes drift-b {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1.05);
  }
  50% {
    transform: translate3d(-9%, -6%, 0) scale(0.92);
  }
}
@keyframes drift-c {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(0.95);
  }
  50% {
    transform: translate3d(6%, -8%, 0) scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
}
</style>
