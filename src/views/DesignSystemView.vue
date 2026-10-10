<template>
  <div class="container-content pb-28 pt-16 md:pt-24">
    <header class="max-w-3xl">
      <p class="eyebrow"><span class="h-px w-6 bg-accent-light"></span>{{ t("ds.eyebrow") }}</p>
      <h1 class="mt-5 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
        {{ t("ds.titleA") }} <span class="text-gradient">{{ t("ds.titleB") }}</span>
      </h1>
      <p class="mt-6 text-lg leading-relaxed text-white/70">
        {{ t("ds.lead") }}
      </p>
    </header>

    <!-- Principios -->
    <section class="mt-20" aria-labelledby="ds-principios">
      <h2 id="ds-principios" class="ds-h">{{ t("ds.principles") }}</h2>
      <ol class="mt-6 grid gap-5 md:grid-cols-3">
        <li v-for="(p, i) in tm('ds.principleList')" :key="p.title" class="surface p-6">
          <p class="font-mono text-[11px] font-bold text-accent-light">{{ String(i + 1).padStart(2, "0") }}</p>
          <h3 class="mt-2 text-xl font-bold">{{ p.title }}</h3>
          <p class="mt-2 text-[15px] leading-relaxed text-white/70">{{ p.body }}</p>
        </li>
      </ol>
    </section>

    <!-- Logo -->
    <section class="mt-20" aria-labelledby="ds-logo">
      <h2 id="ds-logo" class="ds-h">{{ t("ds.logo") }}</h2>
      <p class="ds-p">{{ t("ds.logoLead") }}</p>
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
      <h2 id="ds-color" class="ds-h">{{ t("ds.color") }}</h2>
      <p class="ds-p">{{ t("ds.colorLead") }}</p>
      <ul class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <li v-for="(c, ci) in colors" :key="c.token" class="overflow-hidden rounded-xl border border-white/10">
          <div class="h-20" :style="{ background: c.value }"></div>
          <div class="bg-ink-900 p-3">
            <p class="font-mono text-xs text-white">{{ c.token }}</p>
            <p class="font-mono text-[11px] uppercase text-white/55">{{ c.value }}</p>
            <p class="mt-1 text-[11px] text-white/60">{{ tm("ds.colorUses")[ci] }}</p>
          </div>
        </li>
      </ul>

      <h3 class="mt-12 text-lg font-bold">{{ t("ds.contrast") }}</h3>
      <p class="ds-p">{{ t("ds.contrastLead") }}</p>
      <div class="mt-5 overflow-x-auto rounded-xl border border-white/[0.08]">
        <table class="w-full min-w-[520px] text-left text-sm">
          <thead class="bg-white/[0.03] font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
            <tr><th class="px-4 py-3">{{ t("ds.table.token") }}</th><th class="px-4 py-3">{{ t("ds.table.sample") }}</th><th class="px-4 py-3">{{ t("ds.table.ratio") }}</th><th class="px-4 py-3">{{ t("ds.table.use") }}</th></tr>
          </thead>
          <tbody class="divide-y divide-white/[0.06]">
            <tr v-for="(tok, ti) in textTokens" :key="tok.cls">
              <td class="px-4 py-3 font-mono text-xs text-white/80">{{ tok.cls }}</td>
              <td class="px-4 py-3" :style="{ color: tok.rgba }">{{ t("ds.sampleText") }}</td>
              <td class="px-4 py-3 font-mono text-xs" :class="tok.ratio >= 4.5 ? 'text-accent-light' : 'text-amber-300'">
                {{ tok.ratio.toFixed(2) }}:1 {{ tok.ratio >= 7 ? "AAA" : tok.ratio >= 4.5 ? "AA" : t("ds.table.decorative") }}
              </td>
              <td class="px-4 py-3 text-white/65">{{ tm("ds.textUses")[ti] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Tipografía -->
    <section class="mt-20" aria-labelledby="ds-type">
      <h2 id="ds-type" class="ds-h">{{ t("ds.type") }}</h2>
      <p class="ds-p">{{ t("ds.typeLead") }}</p>
      <ul class="mt-6 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08]">
        <li v-for="(ty, yi) in typeScale" :key="ty.spec" class="grid gap-2 px-5 py-5 md:grid-cols-[180px_1fr] md:items-baseline">
          <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">{{ tm("ds.typeNames")[yi] }}<br /><span class="normal-case tracking-normal text-white/45">{{ ty.spec }}</span></p>
          <p :class="ty.cls">{{ tm("ds.typeSamples")[yi] }}</p>
        </li>
      </ul>
    </section>

    <!-- Componentes -->
    <section class="mt-20" aria-labelledby="ds-comp">
      <h2 id="ds-comp" class="ds-h">{{ t("ds.components") }}</h2>
      <p class="ds-p">{{ t("ds.componentsLead") }}</p>

      <div class="mt-6 grid gap-5 lg:grid-cols-2">
        <div class="surface p-6">
          <h3 class="ds-sub">{{ t("ds.buttons") }}</h3>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" class="btn-primary">{{ t("ds.primary") }}</button>
            <button type="button" class="btn-ghost">{{ t("ds.secondary") }}</button>
            <button type="button" class="btn-primary" disabled style="opacity: 0.5; cursor: not-allowed">{{ t("ds.disabled") }}</button>
            <button type="button" class="btn-primary" aria-busy="true">
              <ThinkingOrb state="breathing" :size="20" color="#0F172A" :label="t('ds.loading')" />
              {{ t("ds.loading") }}
            </button>
          </div>
        </div>

        <div class="surface p-6">
          <h3 class="ds-sub">{{ t("ds.tags") }}</h3>
          <div class="mt-5 flex flex-wrap gap-2">
            <span class="chip">Vue 3</span>
            <span class="chip">TypeScript</span>
            <span class="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-light">
              <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>{{ t("detail.status_values.Producción") }}
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/60">{{ t("detail.status_values.Práctica") }}</span>
          </div>
        </div>

        <div class="surface p-6">
          <h3 class="ds-sub">{{ t("ds.fields") }}</h3>
          <div class="mt-5 space-y-4">
            <div>
              <label for="ds-ok" class="mb-1.5 block text-sm font-medium text-white/70">{{ t("ds.fieldDefault") }}</label>
              <input id="ds-ok" class="field" :placeholder="t('ds.fieldPlaceholder')" />
            </div>
            <div>
              <label for="ds-err" class="mb-1.5 block text-sm font-medium text-white/70">{{ t("ds.fieldError") }}</label>
              <input id="ds-err" class="field !border-red-400/70" value="ana@correo" aria-invalid="true" aria-describedby="ds-err-msg" />
              <p id="ds-err-msg" class="mt-1.5 flex items-center gap-1.5 text-sm text-red-300">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="text-xs" />
                {{ t("ds.fieldErrorMsg") }}
              </p>
            </div>
          </div>
        </div>

        <div class="surface p-6">
          <h3 class="ds-sub">{{ t("ds.orbs") }}</h3>
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
      <h2 id="ds-motion" class="ds-h">{{ t("ds.motion") }}</h2>
      <div class="mt-6 grid gap-5 md:grid-cols-3">
        <div v-for="m in tm('ds.motionList')" :key="m.spec" class="surface p-6">
          <h3 class="ds-sub">{{ m.title }}</h3>
          <p class="mt-2 text-[15px] leading-relaxed text-white/70">{{ m.body }}</p>
          <p class="mt-3 font-mono text-[11px] text-white/55">{{ m.spec }}</p>
        </div>
      </div>
    </section>

    <!-- Accesibilidad -->
    <section class="mt-20" aria-labelledby="ds-a11y">
      <h2 id="ds-a11y" class="ds-h">{{ t("ds.a11y") }}</h2>
      <ul class="mt-6 grid gap-3 md:grid-cols-2">
        <li v-for="rule in tm('ds.a11yList')" :key="rule" class="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-[15px] leading-relaxed text-white/75">
          <font-awesome-icon :icon="['fas', 'check']" class="mt-1.5 text-xs text-accent-light" />
          {{ rule }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import LogoMark from "@/components/LogoMark.vue";
import { t, tm } from "@/i18n";
import ThinkingOrb from "@/components/ThinkingOrb.vue";


const BG = [15, 23, 42]; // ink-950

const colors = [
  { token: "ink-950", value: "#0F172A" },
  { token: "ink-900", value: "#1E293B" },
  { token: "ink-800", value: "#334155" },
  { token: "accent", value: "#22C55E" },
  { token: "accent-light", value: "#4ADE80" },
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
  { a: 1 },
  { a: 0.8 },
  { a: 0.7 },
  { a: 0.55 },
  { a: 0.5 },
  { a: 0.08 },
].map((t) => ({
  ...t,
  cls: t.a === 1 ? "text-white" : `text-white/${Math.round(t.a * 100)}`,
  rgba: `rgba(255,255,255,${t.a})`,
  ratio: ratio(blend(t.a)),
}));

const typeScale = [
  { name: "Display", spec: "Space Grotesk 700 · clamp(52–92px)", cls: "font-display text-5xl font-bold tracking-tight md:text-7xl" },
  { name: "Título", spec: "Space Grotesk 700 · 30–48px", cls: "font-display text-3xl font-bold tracking-tight md:text-5xl" },
  { name: "Subtítulo", spec: "Space Grotesk 600 · 24px", cls: "font-display text-2xl font-semibold" },
  { name: "Cuerpo", spec: "Inter 400 · 17–18px · 1.75", cls: "text-lg leading-relaxed text-white/75" },
  { name: "Etiqueta", spec: "Space Mono 700 · 11px · +0.22em", cls: "font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-light" },
];

const orbStates = ["searching", "composing", "shaping", "solving", "breathing"];


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
