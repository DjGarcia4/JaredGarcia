<template>
  <div class="container-content pb-28 pt-16 md:pt-24">
    <header class="max-w-3xl">
      <p class="eyebrow"><span class="h-px w-6 bg-accent-light"></span>Sistema de diseño</p>
      <h1 class="mt-5 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
        Cómo está <span class="text-gradient">hecho.</span>
      </h1>
      <p class="mt-6 text-lg leading-relaxed text-white/70">
        Los tokens y componentes de este portafolio, vivos: todo lo que ves acá
        es el mismo código que usa el sitio. Los contrastes se calculan en el
        navegador, no están escritos a mano.
      </p>
    </header>

    <!-- Principios -->
    <section class="mt-20" aria-labelledby="ds-principios">
      <h2 id="ds-principios" class="ds-h">Principios</h2>
      <ol class="mt-6 grid gap-5 md:grid-cols-3">
        <li v-for="(p, i) in principles" :key="p.title" class="surface p-6">
          <p class="font-mono text-[11px] font-bold text-accent-light">{{ String(i + 1).padStart(2, "0") }}</p>
          <h3 class="mt-2 text-xl font-bold">{{ p.title }}</h3>
          <p class="mt-2 text-[15px] leading-relaxed text-white/70">{{ p.body }}</p>
        </li>
      </ol>
    </section>

    <!-- Logo -->
    <section class="mt-20" aria-labelledby="ds-logo">
      <h2 id="ds-logo" class="ds-h">Logo</h2>
      <p class="ds-p">Una J y un cursor de terminal: diseño y código en una sola marca. Pensado para leerse incluso a 16 px; en el header el cursor parpadea.</p>
      <div class="mt-6 flex flex-wrap items-end gap-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
        <LogoMark blink class="h-28 w-28" />
        <LogoMark class="h-12 w-12" />
        <LogoMark class="h-8 w-8" />
        <LogoMark class="h-4 w-4" />
        <div class="rounded-xl bg-slate-100 p-3"><LogoMark class="h-10 w-10" /></div>
      </div>
    </section>

    <!-- Color -->
    <section class="mt-20" aria-labelledby="ds-color">
      <h2 id="ds-color" class="ds-h">Color</h2>
      <p class="ds-p">Base slate (un editor de código de noche) y un solo acento verde, reservado para acciones y estado.</p>
      <ul class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <li v-for="c in colors" :key="c.token" class="overflow-hidden rounded-xl border border-white/10">
          <div class="h-20" :style="{ background: c.value }"></div>
          <div class="bg-ink-900 p-3">
            <p class="font-mono text-xs text-white">{{ c.token }}</p>
            <p class="font-mono text-[11px] uppercase text-white/55">{{ c.value }}</p>
            <p class="mt-1 text-[11px] text-white/60">{{ c.use }}</p>
          </div>
        </li>
      </ul>

      <h3 class="mt-12 text-lg font-bold">Contraste del texto sobre el fondo</h3>
      <p class="ds-p">Mínimo AA (4.5:1) para todo texto que se lee. Por debajo, solo decoración.</p>
      <div class="mt-5 overflow-x-auto rounded-xl border border-white/[0.08]">
        <table class="w-full min-w-[520px] text-left text-sm">
          <thead class="bg-white/[0.03] font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            <tr><th class="px-4 py-3">Token</th><th class="px-4 py-3">Muestra</th><th class="px-4 py-3">Ratio</th><th class="px-4 py-3">Uso</th></tr>
          </thead>
          <tbody class="divide-y divide-white/[0.06]">
            <tr v-for="t in textTokens" :key="t.cls">
              <td class="px-4 py-3 font-mono text-xs text-white/80">{{ t.cls }}</td>
              <td class="px-4 py-3" :style="{ color: t.rgba }">Diseño y código</td>
              <td class="px-4 py-3 font-mono text-xs" :class="t.ratio >= 4.5 ? 'text-accent-light' : 'text-amber-300'">
                {{ t.ratio.toFixed(2) }}:1 {{ t.ratio >= 7 ? "AAA" : t.ratio >= 4.5 ? "AA" : "decorativo" }}
              </td>
              <td class="px-4 py-3 text-white/65">{{ t.use }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Tipografía -->
    <section class="mt-20" aria-labelledby="ds-type">
      <h2 id="ds-type" class="ds-h">Tipografía</h2>
      <p class="ds-p">Space Grotesk para títulos, Inter para lectura y Space Mono para etiquetas técnicas.</p>
      <ul class="mt-6 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08]">
        <li v-for="t in typeScale" :key="t.name" class="grid gap-2 px-5 py-5 md:grid-cols-[180px_1fr] md:items-baseline">
          <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">{{ t.name }}<br /><span class="normal-case tracking-normal text-white/45">{{ t.spec }}</span></p>
          <p :class="t.cls">{{ t.sample }}</p>
        </li>
      </ul>
    </section>

    <!-- Componentes -->
    <section class="mt-20" aria-labelledby="ds-comp">
      <h2 id="ds-comp" class="ds-h">Componentes y estados</h2>
      <p class="ds-p">Cada componente con todos sus estados. Probá con Tab para ver el foco.</p>

      <div class="mt-6 grid gap-5 lg:grid-cols-2">
        <div class="surface p-6">
          <h3 class="ds-sub">Botones</h3>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" class="btn-primary">Primario</button>
            <button type="button" class="btn-ghost">Secundario</button>
            <button type="button" class="btn-primary" disabled style="opacity: 0.5; cursor: not-allowed">Deshabilitado</button>
            <button type="button" class="btn-primary" aria-busy="true">
              <ThinkingOrb state="breathing" :size="20" color="#0F172A" label="Cargando" />
              Cargando…
            </button>
          </div>
        </div>

        <div class="surface p-6">
          <h3 class="ds-sub">Etiquetas</h3>
          <div class="mt-5 flex flex-wrap gap-2">
            <span class="chip">Vue 3</span>
            <span class="chip">TypeScript</span>
            <span class="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-light">
              <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>Producción
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60">Práctica</span>
          </div>
        </div>

        <div class="surface p-6">
          <h3 class="ds-sub">Campos</h3>
          <div class="mt-5 space-y-4">
            <div>
              <label for="ds-ok" class="mb-1.5 block text-sm font-medium text-white/70">Por defecto</label>
              <input id="ds-ok" class="field" placeholder="Tu nombre" />
            </div>
            <div>
              <label for="ds-err" class="mb-1.5 block text-sm font-medium text-white/70">Con error</label>
              <input id="ds-err" class="field !border-red-400/70" value="ana@correo" aria-invalid="true" aria-describedby="ds-err-msg" />
              <p id="ds-err-msg" class="mt-1.5 flex items-center gap-1.5 text-sm text-red-300">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="text-xs" />
                Revisá el correo, parece incompleto.
              </p>
            </div>
          </div>
        </div>

        <div class="surface p-6">
          <h3 class="ds-sub">Indicadores de IA (thinking-orbs)</h3>
          <div class="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-5">
            <div v-for="s in orbStates" :key="s" class="flex flex-col items-center gap-2">
              <ThinkingOrb :state="s" :size="64" color="#4ADE80" :label="s" />
              <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">{{ s }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Motion -->
    <section class="mt-20" aria-labelledby="ds-motion">
      <h2 id="ds-motion" class="ds-h">Motion</h2>
      <div class="mt-6 grid gap-5 md:grid-cols-3">
        <div v-for="m in motion" :key="m.title" class="surface p-6">
          <h3 class="ds-sub">{{ m.title }}</h3>
          <p class="mt-2 text-[15px] leading-relaxed text-white/70">{{ m.body }}</p>
          <p class="mt-3 font-mono text-[11px] text-white/55">{{ m.spec }}</p>
        </div>
      </div>
    </section>

    <!-- Accesibilidad -->
    <section class="mt-20" aria-labelledby="ds-a11y">
      <h2 id="ds-a11y" class="ds-h">Accesibilidad</h2>
      <ul class="mt-6 grid gap-3 md:grid-cols-2">
        <li v-for="rule in a11y" :key="rule" class="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-[15px] leading-relaxed text-white/75">
          <font-awesome-icon :icon="['fas', 'check']" class="mt-1.5 text-xs text-accent-light" />
          {{ rule }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import LogoMark from "@/components/LogoMark.vue";
import ThinkingOrb from "@/components/ThinkingOrb.vue";

const principles = [
  { title: "Contenido primero", body: "Cada pantalla responde una pregunta de quien la visita. Lo decorativo acompaña, no compite." },
  { title: "Un acento, con intención", body: "El verde marca acciones y estado. Si todo resalta, nada resalta." },
  { title: "Accesible por defecto", body: "Contraste AA, foco visible, teclado completo y menos movimiento cuando el sistema lo pide." },
];

const BG = [15, 23, 42]; // ink-950

const colors = [
  { token: "ink-950", value: "#0F172A", use: "Fondo" },
  { token: "ink-900", value: "#1E293B", use: "Superficies" },
  { token: "ink-800", value: "#334155", use: "Superficie secundaria" },
  { token: "accent", value: "#22C55E", use: "Acciones, estado" },
  { token: "accent-light", value: "#4ADE80", use: "Texto de acento, foco" },
];

// Contraste WCAG calculado en vivo para el texto blanco con opacidad.
const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg) => (lum(fg) + 0.05) / (lum(BG) + 0.05);
const blend = (a) => BG.map((c) => a * 255 + (1 - a) * c);

const textTokens = [
  { a: 1, use: "Títulos" },
  { a: 0.8, use: "Texto de cuerpo" },
  { a: 0.7, use: "Texto secundario" },
  { a: 0.55, use: "Etiquetas y metadatos" },
  { a: 0.5, use: "Placeholders" },
  { a: 0.08, use: "Wordmark decorativo" },
].map((t) => ({
  ...t,
  cls: t.a === 1 ? "text-white" : `text-white/${Math.round(t.a * 100)}`,
  rgba: `rgba(255,255,255,${t.a})`,
  ratio: ratio(blend(t.a)),
}));

const typeScale = [
  { name: "Display", spec: "Space Grotesk 700 · clamp(52–92px)", cls: "font-display text-5xl font-bold tracking-tight md:text-7xl", sample: "Jared Garcia." },
  { name: "Título", spec: "Space Grotesk 700 · 30–48px", cls: "font-display text-3xl font-bold tracking-tight md:text-5xl", sample: "Casos destacados" },
  { name: "Subtítulo", spec: "Space Grotesk 600 · 24px", cls: "font-display text-2xl font-semibold", sample: "Sistemas, no pantallas sueltas" },
  { name: "Cuerpo", spec: "Inter 400 · 17–18px · 1.75", cls: "text-lg leading-relaxed text-white/75", sample: "Diseño la experiencia y la construyo hasta producción." },
  { name: "Etiqueta", spec: "Space Mono 700 · 11px · +0.22em", cls: "font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light", sample: "Trabajo seleccionado" },
];

const orbStates = ["searching", "composing", "shaping", "solving", "breathing"];

const motion = [
  { title: "Entradas", body: "Una sola vez por sección, al entrar en pantalla. Nada se reinicia al volver.", spec: "0.5–0.8s · power3.out" },
  { title: "Microinteracciones", body: "Hover y foco responden rápido para sentirse directos.", spec: "200–300ms · ease" },
  { title: "Movimiento reducido", body: "Con prefers-reduced-motion: sin entradas, sin autoplay y 3D estático.", spec: "@media (prefers-reduced-motion)" },
];

const a11y = [
  "Texto informativo con contraste mínimo 4.5:1 (calculado arriba).",
  "Foco visible con anillo verde de 2px en todos los controles.",
  "Todo se usa con teclado: menús, galería, paleta ⌘K y formularios.",
  "Errores de formulario en texto, asociados al campo con aria-describedby.",
  "Diálogos que mueven, atrapan y devuelven el foco.",
  "Lighthouse Accesibilidad: 100 en mobile y desktop.",
];
</script>

<style scoped>
.ds-h {
  font-family: "Space Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #4ade80;
}
.ds-p {
  margin-top: 0.75rem;
  max-width: 42rem;
  line-height: 1.7;
  color: rgb(255 255 255 / 0.7);
}
.ds-sub {
  font-family: "Space Grotesk", Inter, sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: #fff;
}
</style>
