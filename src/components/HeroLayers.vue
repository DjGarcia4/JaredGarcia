<template>
  <!-- "Interfaz explotada": la misma pantalla (el hero de RapiSites) en las
       cuatro capas de mi proceso, apiladas en 3D con CSS. Con el mouse se
       inclina; con el scroll las capas se juntan en la pantalla final.
       Decorativo para lectores de pantalla: el contenido real está en el
       texto del hero. -->
  <div
    ref="root"
    class="hero-layers relative mx-auto aspect-[10/9] w-full max-w-[560px] select-none"
    aria-hidden="true"
    @pointermove="onPointer"
    @pointerleave="resetPointer"
  >
    <div ref="tilt" class="tilt absolute inset-0">
      <div ref="stage" class="stage absolute left-1/2 top-1/2">
        <!-- Sombra en el "piso" -->
        <div class="floor"></div>

        <!-- 01 · Wireframe -->
        <div class="layer" style="--i: 0">
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
          <span class="tag">01 · Wireframe</span>
        </div>

        <!-- 02 · Tokens de diseño -->
        <div class="layer" style="--i: 1">
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
          <span class="tag">02 · Sistema</span>
        </div>

        <!-- 03 · Código -->
        <div class="layer" style="--i: 2">
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
          <span class="tag">03 · Código</span>
        </div>

        <!-- 04 · Producción -->
        <div class="layer" style="--i: 3">
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
          <span class="tag tag-live">
            <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
            04 · En producción
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

// Paleta real de RapiSites (la UI de la capa 04).
const palette = ["#7C3AED", "#C2410C", "#18181B", "#FAFAFA"];

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
  target = {
    x: (e.clientX - r.left) / r.width - 0.5,
    y: (e.clientY - r.top) / r.height - 0.5,
  };
  kick();
};

const resetPointer = () => {
  target = { x: 0, y: 0 };
  kick();
};

let ctx;

onMounted(() => {
  reduced = prefersReducedMotion();
  if (reduced) return;

  ctx = gsap.context(() => {
    // Entrada: las capas "se separan" desde la pila.
    gsap.from(stage.value, {
      "--gap": "0px",
      "--fan": "0%",
      duration: 1.4,
      ease: "expo.out",
      delay: 0.15,
    });

    // Scroll (desktop): al salir del hero, las capas se juntan y la vista
    // queda de frente sobre la pantalla final.
    gsap.matchMedia().add("(min-width: 1024px)", () => {
      gsap.to(stage.value, {
        "--gap": "0px",
        "--fan": "0%",
        "--rx": "0deg",
        "--rz": "0deg",
        "--s": 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: root.value,
          // Arranca apenas empieza el scroll y termina antes de que la pieza
          // salga de pantalla, para que se vea la pantalla final de frente.
          start: "top 40%",
          end: "center 25%",
          scrub: 0.6,
        },
      });
    });
  }, root.value);
});

onUnmounted(() => {
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
  --rx: 54deg;
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
  /* Escalonadas en diagonal además de en Z, para que asome cada capa.
     --fan se anima a 0 junto con --gap al colapsar. */
  transform: translate3d(
    calc((3 - var(--i)) * var(--fan) * -1),
    calc((3 - var(--i)) * var(--fan)),
    calc(var(--i) * var(--gap))
  );
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

.tag {
  position: absolute;
  left: -2px;
  top: -26px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 23, 42, 0.85);
  padding: 3px 9px;
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}
.tag-live {
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
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
