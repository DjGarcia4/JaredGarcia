<template>
  <div class="mx-auto w-full max-w-[560px]">
    <!-- "Interfaz explotada": la misma pantalla (el hero de RapiSites) en
         las cuatro etapas de mi proceso, apiladas en 3D con CSS. La leyenda
         de abajo recorre las capas y explica cada una. La escena es
         decorativa (aria-hidden); la leyenda sí es accesible. -->
  <div
    ref="root"
    class="hero-layers relative aspect-square w-full select-none"
    aria-hidden="true"
    @pointermove="onPointer"
    @pointerleave="resetPointer"
  >
    <div ref="tilt" class="tilt absolute inset-0">
      <div ref="stage" class="stage absolute left-1/2 top-1/2">
        <!-- Sombra en el "piso" -->
        <div class="floor"></div>

        <!-- 01 · Wireframe -->
        <div class="layer" :class="layerClass(0)" style="--i: 0">
          <div class="card bg-ink-950/90 ring-1 ring-white/15">
            <div class="wf">
              <div class="flex items-center justify-between">
                <span class="wf-box h-3 w-14"></span>
                <span class="flex gap-2">
                  <span class="wf-box h-2 w-8"></span>
                  <span class="wf-box h-2 w-8"></span>
                  <span class="wf-box h-3 w-12"></span>
                </span>
              </div>
              <div class="mt-6 grid grid-cols-2 gap-5">
                <div class="space-y-2">
                  <span class="wf-box block h-4 w-full"></span>
                  <span class="wf-box block h-4 w-5/6"></span>
                  <span class="wf-box block h-4 w-3/5"></span>
                  <span class="wf-line mt-3 block w-full"></span>
                  <span class="wf-line block w-11/12"></span>
                  <span class="wf-line block w-4/5"></span>
                  <span class="mt-3 flex gap-2">
                    <span class="wf-box h-4 w-14"></span>
                    <span class="wf-box h-4 w-14"></span>
                  </span>
                </div>
                <div class="wf-box h-24"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 02 · Tokens de diseño -->
        <div class="layer" :class="layerClass(1)" style="--i: 1">
          <div class="card bg-ink-900/85 ring-1 ring-white/15 backdrop-blur-sm">
            <div class="flex h-full flex-col justify-between p-5">
              <div class="flex gap-2.5">
                <span
                  v-for="c in palette"
                  :key="c"
                  class="h-10 w-10 rounded-lg ring-1 ring-white/20"
                  :style="{ background: c }"
                ></span>
              </div>
              <div class="flex items-end justify-between">
                <div>
                  <p class="font-sans text-5xl font-bold leading-none text-white">Aa</p>
                  <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Inter · 700 / 400
                  </p>
                </div>
                <div class="flex items-end gap-1.5">
                  <span class="h-2 w-2 rounded-sm bg-accent/80"></span>
                  <span class="h-3 w-3 rounded-sm bg-accent/80"></span>
                  <span class="h-4 w-4 rounded-sm bg-accent/80"></span>
                  <span class="h-6 w-6 rounded-md bg-accent/80"></span>
                  <span class="h-8 w-8 rounded-md bg-accent/80"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 03 · Código -->
        <div class="layer" :class="layerClass(2)" style="--i: 2">
          <div class="card bg-[#0b1222]/90 ring-1 ring-accent/30 backdrop-blur-sm">
            <pre class="code"><span class="c-tag">&lt;script setup</span> <span class="c-attr">lang</span>=<span class="c-str">"ts"</span><span class="c-tag">&gt;</span>
<span class="c-key">const</span> site = <span class="c-key">await</span> <span class="c-fn">generateSite</span>(answers)
<span class="c-tag">&lt;/script&gt;</span>

<span class="c-tag">&lt;template&gt;</span>
  <span class="c-tag">&lt;SiteEditor</span>
    <span class="c-attr">:sections</span>=<span class="c-str">"site.sections"</span>
    <span class="c-attr">autosave</span>
  <span class="c-tag">/&gt;</span>
<span class="c-tag">&lt;/template&gt;</span></pre>
          </div>
        </div>

        <!-- 04 · Producción -->
        <div class="layer" :class="layerClass(3)" style="--i: 3">
          <div class="card overflow-hidden bg-white ring-1 ring-white/30">
            <div class="flex h-6 items-center gap-1.5 border-b border-black/5 bg-[#f4f4f5] px-2.5">
              <span class="h-2 w-2 rounded-full bg-[#ff5f57]"></span>
              <span class="h-2 w-2 rounded-full bg-[#febc2e]"></span>
              <span class="h-2 w-2 rounded-full bg-[#28c840]"></span>
              <span class="ml-2 rounded bg-white px-2 py-px font-mono text-[8px] text-zinc-500">rapisites.com</span>
            </div>
            <img
              src="/img/hero/ui.webp"
              alt=""
              width="960"
              height="600"
              decoding="async"
              class="block h-[calc(100%-1.5rem)] w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- Leyenda -->
    <div
      class="mt-6 rounded-2xl border border-white/[0.08] bg-ink-950/50 p-4 backdrop-blur-sm"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
      @focusin="paused = true"
      @focusout="paused = false"
    >
      <p class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
        {{ t("layers.title") }}
      </p>
      <div class="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="tablist" :aria-label="t('layers.tablist')">
        <button
          v-for="(st, i) in stages"
          :key="st.name"
          type="button"
          role="tab"
          :aria-selected="i === active"
          class="rounded-lg px-2 py-2 text-left transition-colors"
          :class="i === active ? 'bg-accent/15 text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white'"
          @click="active = i"
        >
          <span class="block font-mono text-[10px]" :class="i === active ? 'text-accent-light' : 'text-white/50'">0{{ i + 1 }}</span>
          <span class="block text-[13px] font-semibold">{{ st.name }}</span>
        </button>
      </div>
      <p class="mt-3 min-h-[2.75rem] text-sm leading-relaxed text-white/70" aria-live="polite">
        {{ stages[active].desc }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { t, tm } from "@/i18n";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// Paleta real de RapiSites (la UI de la capa 04).
const palette = ["#7C3AED", "#C2410C", "#18181B", "#FAFAFA"];

const stages = computed(() => tm("layers.stages"));

const active = ref(0);
const paused = ref(false);
let cycle = 0;

// Las capas por encima de la activa casi desaparecen (para que se lea la
// activa); las de abajo quedan atenuadas como contexto.
const layerClass = (i) => ({
  "is-active": i === active.value,
  "is-above": i > active.value,
  "is-below": i < active.value,
});

const root = ref(null);
const tilt = ref(null);
const stage = ref(null);

// Inclinación con el puntero, suavizada con rAF (solo mientras hay movimiento).
let target = { x: 0, y: 0 };
let current = { x: 0, y: 0 };
let raf = 0;
let reduced = false;

const animateTilt = () => {
  current.x += (target.x - current.x) * 0.08;
  current.y += (target.y - current.y) * 0.08;
  tilt.value?.style.setProperty("--px", current.x.toFixed(4));
  tilt.value?.style.setProperty("--py", current.y.toFixed(4));
  if (Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001) {
    raf = requestAnimationFrame(animateTilt);
  } else {
    raf = 0;
  }
};

const kick = () => {
  if (!raf) raf = requestAnimationFrame(animateTilt);
};

const onPointer = (e) => {
  if (reduced || e.pointerType !== "mouse") return;
  const r = root.value.getBoundingClientRect();
  target = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
  kick();
};

const resetPointer = () => {
  target = { x: 0, y: 0 };
  kick();
};

let ctx;

onMounted(() => {
  reduced = prefersReducedMotion();
  if (reduced) {
    active.value = 3;
    return;
  }

  // Recorre las etapas sola; se pausa con hover o foco en la leyenda.
  cycle = window.setInterval(() => {
    if (!paused.value && document.visibilityState === "visible") {
      active.value = (active.value + 1) % stages.value.length;
    }
  }, 2800);

  ctx = gsap.context(() => {
    // Entrada: las capas "se separan" desde la pila.
    gsap.from(stage.value, { "--gap": "0px", "--fan": "0%", duration: 1.4, ease: "expo.out", delay: 0.15 });
  }, root.value);
});

onUnmounted(() => {
  window.clearInterval(cycle);
  cancelAnimationFrame(raf);
  ctx?.revert();
});
</script>

<style scoped>
.hero-layers {
  perspective: 1800px;
}

.tilt {
  --px: 0;
  --py: 0;
  transform-style: preserve-3d;
  transform: rotateY(calc(var(--px) * 10deg)) rotateX(calc(var(--py) * -8deg));
}

.stage {
  --gap: 70px;
  --fan: 9%;
  --rx: 50deg;
  --rz: -34deg;
  --s: 1;
  width: 72%;
  aspect-ratio: 16 / 10;
  transform-style: preserve-3d;
  transform: translate(-50%, -34%) scale(var(--s)) rotateX(var(--rx)) rotateZ(var(--rz));
}

.layer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  /* Escalonadas en diagonal además de en Z, para que asome cada capa.
     --fan se anima a 0 junto con --gap al colapsar. */
  transform: translate3d(
    calc((3 - var(--i)) * var(--fan) * -1),
    calc((3 - var(--i)) * var(--fan)),
    calc(var(--i) * var(--gap) + var(--lift, 0px))
  );
}
/* La capa activa se levanta y se ilumina; las demás se apagan. */
.layer.is-active {
  --lift: 34px;
}
.layer .card {
  transition: opacity 0.5s, box-shadow 0.5s;
}
.layer.is-below .card {
  opacity: 0.45;
}
.layer.is-above {
  --lift: 60px;
}
.layer.is-above .card {
  opacity: 0.08;
}
.layer.is-active .card {
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.85), 0 30px 60px -20px rgba(0, 0, 0, 0.9);
}

.card {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.9);
}

.floor {
  position: absolute;
  inset: 4%;
  border-radius: 24px;
  background: radial-gradient(closest-side, rgba(34, 197, 94, 0.28), transparent);
  filter: blur(18px);
  transform: translateZ(-30px);
}


/* Wireframe */
.wf {
  padding: 16px 18px;
}
.wf-box {
  display: inline-block;
  border-radius: 4px;
  border: 1px dashed rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.04);
}
.wf-line {
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.18);
}

/* Código */
.code {
  margin: 0;
  padding: 16px 18px;
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 10.5px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre;
  overflow: hidden;
}
.c-tag { color: #4ade80; }
.c-attr { color: #93c5fd; }
.c-str { color: #fcd34d; }
.c-key { color: #c4b5fd; }
.c-fn { color: #67e8f9; }

@media (max-width: 1023px) {
  .stage {
    --gap: 56px;
  }
  .code {
    font-size: 8.5px;
  }
}
</style>
