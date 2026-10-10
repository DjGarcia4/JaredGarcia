<template>
  <canvas
    ref="canvasRef"
    role="img"
    :aria-label="label"
    :style="{ width: `${size}px`, height: `${size}px`, display: 'block' }"
  ></canvas>
</template>

<script setup>
// Port a Vue del componente React de thinking-orbs (MIT, Jakub Antalik —
// https://libraries.dev/orbs). Usa solo el entry `thinking-orbs/engine`, que
// no depende de React: resuelve el preset una vez y pinta un frame por rAF.
// Igual que el original: se pausa fuera de pantalla o con la pestaña oculta,
// y con prefers-reduced-motion dibuja un único frame estático.
import { onMounted, onUnmounted, ref, watch } from "vue";
import { MODE_FRAMES, paintFrame, resolvePreset } from "thinking-orbs/engine";

const props = defineProps({
  // working | searching | solving | listening | connecting | weaving |
  // composing | breathing | shaping
  state: { type: String, default: "working" },
  // Presets afinados para 64 (avatar) y 20 (inline).
  size: { type: Number, default: 64 },
  speed: { type: Number, default: 1 },
  // Tinte opcional (#rgb, #rrggbb). Sin tinte usa la tinta neutra.
  color: { type: String, default: "" },
  label: { type: String, default: "Pensando…" },
});

const canvasRef = ref(null);
let teardown = null;

const parseTint = (color) => {
  const m = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return undefined;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const setup = () => {
  teardown?.();
  const canvas = canvasRef.value;
  if (!canvas) return;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(props.size * dpr);
  canvas.height = Math.round(props.size * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { mode, speed: baseSpeed, opts } = resolvePreset(props.state, props.size);
  const frameFn = MODE_FRAMES[mode];
  const tint = parseTint(props.color);
  const effSpeed = baseSpeed * props.speed;

  // El sitio es siempre oscuro: dark = true.
  const frame = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, props.size, props.size);
    paintFrame(ctx, frameFn(props.size, t, opts), true, tint);
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    frame(0.6);
    teardown = null;
    return;
  }

  let raf = 0;
  let running = false;
  let visible = true;
  const loop = () => {
    frame((performance.now() / 1000) * effSpeed);
    if (running) raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  frame((performance.now() / 1000) * effSpeed);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && document.visibilityState !== "hidden") start();
    else stop();
  });
  io.observe(canvas);
  const onVis = () => {
    if (document.visibilityState === "hidden") stop();
    else if (visible) start();
  };
  document.addEventListener("visibilitychange", onVis);

  teardown = () => {
    stop();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
  };
};

onMounted(setup);
watch(() => [props.state, props.size, props.speed, props.color], setup);
onUnmounted(() => teardown?.());
</script>
