<template>
  <div ref="root" class="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
    <!-- Pantalla -->
    <div
      class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,197,94,0.14),transparent_60%),linear-gradient(#111a2e,#0b1222)]"
      @pointermove="onPointer"
      @pointerleave="onLeave"
    >
      <canvas
        v-show="use3d"
        ref="glCanvas"
        class="block aspect-[16/11] w-full"
        aria-hidden="true"
      ></canvas>

      <!-- Contenido de la pantalla. En 3D es la textura (oculto); sin WebGL
           o con reduced-motion se muestra plano dentro de un marco. -->
      <div v-show="!use3d" class="grid aspect-[16/11] place-items-center p-6 sm:p-10">
        <div class="w-full rounded-xl border-[10px] border-[#111827] bg-black shadow-card">
          <canvas
            ref="contentCanvas"
            width="1280"
            height="720"
            class="block aspect-video w-full rounded-[2px]"
            role="img"
            :aria-label="`Pantalla mostrando: ${slides[active].title}`"
          ></canvas>
        </div>
      </div>

      <p class="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
        <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
        Lobby principal · en línea
      </p>
    </div>

    <!-- Panel tipo Wink App -->
    <div class="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/70">
      <div class="flex h-9 items-center gap-1.5 border-b border-white/[0.06] px-3">
        <span class="h-2 w-2 rounded-full bg-white/20"></span>
        <span class="h-2 w-2 rounded-full bg-white/20"></span>
        <span class="h-2 w-2 rounded-full bg-white/20"></span>
        <span class="ml-3 font-mono text-[10px] text-white/50">app · playlists</span>
      </div>

      <div class="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <p class="font-display text-lg font-bold text-white">Playlist · Desayunos</p>
          <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            Lun–Sáb · 07:00–11:00 · 1 pantalla
          </p>
        </div>
        <button
          type="button"
          class="link-icon h-9 w-9 shrink-0"
          :aria-label="playing ? 'Pausar playlist' : 'Reproducir playlist'"
          @click="toggle"
        >
          <font-awesome-icon :icon="['fas', playing ? 'pause' : 'play']" class="text-xs" />
        </button>
      </div>

      <ol class="mt-4 flex-1 space-y-1.5 px-3 pb-4">
        <li v-for="(s, i) in slides" :key="s.title">
          <button
            type="button"
            class="relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-colors"
            :class="i === active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'"
            :aria-current="i === active ? 'true' : undefined"
            @click="go(i)"
          >
            <span class="h-9 w-14 shrink-0 rounded-md ring-1 ring-white/10" :style="{ background: s.thumb }"></span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium" :class="i === active ? 'text-white' : 'text-white/75'">{{ s.title }}</span>
              <span class="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">{{ s.kind }} · {{ s.seconds }} s</span>
            </span>
            <span
              v-if="i === active"
              class="absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-accent"
              :style="{ transform: `scaleX(${progress})` }"
            ></span>
          </button>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

// Contenidos ficticios (marcas inventadas), dibujados en canvas.
const slides = [
  {
    title: "Café Aurora · Combo desayuno",
    kind: "Promo",
    seconds: 5,
    thumb: "linear-gradient(135deg,#f59e0b,#b45309)",
    draw: (g) => {
      bg(g, ["#fbbf24", "#d97706"]);
      pill(g, 80, 90, "CAFÉ AURORA", "#78350f", "#fde68a");
      text(g, "Café +", 80, 300, 118, "#451a03", 800);
      text(g, "croissant", 80, 420, 118, "#451a03", 800);
      g.fillStyle = "#b91c1c";
      round(g, 80, 470, 250, 110, 22);
      text(g, "L 95", 112, 552, 76, "#fff", 800);
      text(g, "Todos los días hasta las 11:00", 80, 650, 34, "#78350f", 600);
      circle(g, 980, 360, 210, "rgba(255,255,255,0.22)");
      circle(g, 980, 360, 130, "#7c2d12");
    },
  },
  {
    title: "El Puente · Semana del hogar",
    kind: "Promo",
    seconds: 5,
    thumb: "linear-gradient(135deg,#2563eb,#1e3a8a)",
    draw: (g) => {
      bg(g, ["#1d4ed8", "#1e1b4b"]);
      pill(g, 80, 90, "FERRETERÍA EL PUENTE", "#fbbf24", "#1e1b4b");
      text(g, "Semana", 80, 310, 120, "#fff", 800);
      text(g, "del hogar", 80, 430, 120, "#fff", 800);
      text(g, "−20 % en pintura y herramientas", 80, 520, 40, "#bfdbfe", 600);
      text(g, "−20%", 820, 470, 220, "#fbbf24", 900);
    },
  },
  {
    title: "Clínica Vida · Vacunación",
    kind: "Aviso",
    seconds: 6,
    thumb: "linear-gradient(135deg,#14b8a6,#0f766e)",
    draw: (g) => {
      bg(g, ["#ecfeff", "#ccfbf1"]);
      pill(g, 80, 90, "CLÍNICA VIDA", "#0f766e", "#ecfeff");
      text(g, "Vacunación", 80, 300, 112, "#134e4a", 800);
      text(g, "sin cita", 80, 415, 112, "#134e4a", 800);
      text(g, "Lunes a sábado · 7:00 a 17:00", 80, 510, 40, "#115e59", 600);
      g.fillStyle = "#14b8a6";
      round(g, 900, 200, 120, 320, 24);
      round(g, 800, 300, 320, 120, 24);
    },
  },
  {
    title: "Turnos · Caja 3",
    kind: "Turnos",
    seconds: 4,
    thumb: "linear-gradient(135deg,#0ea5e9,#0c4a6e)",
    draw: (g) => {
      bg(g, ["#0c4a6e", "#082f49"]);
      text(g, "TURNO ACTUAL", 80, 140, 34, "#7dd3fc", 700, 6);
      text(g, "A-042", 80, 380, 230, "#fff", 900);
      text(g, "Pase a Caja 3", 80, 480, 56, "#e0f2fe", 600);
      g.fillStyle = "rgba(255,255,255,0.08)";
      round(g, 830, 140, 370, 440, 28);
      ["A-041 · Caja 1", "A-040 · Caja 2", "A-039 · Caja 4"].forEach((t, i) =>
        text(g, t, 870, 240 + i * 110, 40, "#bae6fd", 600)
      );
    },
  },
];

// ── Helpers de dibujo ──
const FONT = "Inter, system-ui, sans-serif";
function bg(g, [a, b]) {
  const grad = g.createLinearGradient(0, 0, 1280, 720);
  grad.addColorStop(0, a);
  grad.addColorStop(1, b);
  g.fillStyle = grad;
  g.fillRect(0, 0, 1280, 720);
}
function text(g, str, x, y, size, color, weight = 700, spacing = 0) {
  g.font = `${weight} ${size}px ${FONT}`;
  g.fillStyle = color;
  if ("letterSpacing" in g) g.letterSpacing = `${spacing}px`;
  g.fillText(str, x, y);
  if ("letterSpacing" in g) g.letterSpacing = "0px";
}
function round(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}
function circle(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}
function pill(g, x, y, label, bgColor, color) {
  g.font = `800 26px ${FONT}`;
  const w = g.measureText(label).width + 48;
  g.fillStyle = bgColor;
  round(g, x, y, w, 52, 26);
  text(g, label, x + 24, y + 36, 26, color, 800);
}

// ── Estado ──
const root = ref(null);
const glCanvas = ref(null);
const contentCanvas = ref(null);
const use3d = ref(false);
const active = ref(0);
const playing = ref(true);
const progress = ref(0);

let scene = null;
let ctx2d = null;
let raf = 0;
let visible = false;
let reduced = false;
let slideStart = 0;
let fade = null; // { from, to, t0 }
let io;

const paint = () => {
  if (!ctx2d) return;
  if (fade) {
    const k = Math.min(1, (performance.now() - fade.t0) / 600);
    slides[fade.from].draw(ctx2d);
    ctx2d.globalAlpha = k;
    slides[fade.to].draw(ctx2d);
    ctx2d.globalAlpha = 1;
    if (k >= 1) fade = null;
  } else {
    slides[active.value].draw(ctx2d);
  }
  scene?.refresh();
};

const go = (i) => {
  if (i === active.value) return;
  fade = reduced ? null : { from: active.value, to: i, t0: performance.now() };
  active.value = i;
  slideStart = performance.now();
  progress.value = 0;
  paint();
};

const toggle = () => {
  playing.value = !playing.value;
  // Reanuda desde donde quedó la barra.
  slideStart = performance.now() - progress.value * slides[active.value].seconds * 1000;
};

const loop = () => {
  if (fade) paint();
  if (playing.value && !reduced) {
    const dur = slides[active.value].seconds * 1000;
    progress.value = Math.min(1, (performance.now() - slideStart) / dur);
    if (progress.value >= 1) go((active.value + 1) % slides.length);
  }
  raf = requestAnimationFrame(loop);
};

const setRunning = (on) => {
  cancelAnimationFrame(raf);
  if (on) {
    slideStart = performance.now() - progress.value * slides[active.value].seconds * 1000;
    raf = requestAnimationFrame(loop);
    scene?.start();
  } else {
    scene?.stop();
  }
};

const onPointer = (e) => {
  if (!scene || e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  scene.setPointer((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
};
const onLeave = () => scene?.setPointer(0, 0);

const onVisibility = () => setRunning(visible && document.visibilityState !== "hidden");

onMounted(async () => {
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) playing.value = false;
  ctx2d = contentCanvas.value.getContext("2d");
  await document.fonts?.ready;
  paint();

  // three.js se descarga solo cuando la demo está por entrar en pantalla.
  let loading = null;
  io = new IntersectionObserver(async ([e]) => {
    visible = e.isIntersecting;
    if (visible && !scene && !reduced && !loading) {
      loading = import("@/lib/signageScene").then(({ createSignageScene, supportsWebGL }) => {
        if (!supportsWebGL() || !glCanvas.value) return;
        use3d.value = true;
        requestAnimationFrame(() => {
          scene = createSignageScene(glCanvas.value, contentCanvas.value);
          scene.refresh();
          onVisibility();
        });
      });
    }
    onVisibility();
  }, { rootMargin: "200px 0px" });
  io.observe(root.value);
  document.addEventListener("visibilitychange", onVisibility);
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  io?.disconnect();
  document.removeEventListener("visibilitychange", onVisibility);
  scene?.dispose();
});
</script>
