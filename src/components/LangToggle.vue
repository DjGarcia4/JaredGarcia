<template>
  <div
    role="group"
    :aria-label="t('nav.language')"
    class="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-0.5 font-mono text-[11px] font-bold"
  >
    <button
      v-for="lang in SUPPORTED"
      :key="lang"
      type="button"
      :lang="lang"
      :aria-pressed="locale === lang"
      :aria-label="lang === 'es' ? 'Español' : 'English'"
      class="rounded-full px-2.5 py-1 uppercase transition-colors"
      :class="locale === lang ? 'bg-accent text-ink-950' : 'text-white/60 hover:text-white'"
      @click="setLocale(lang)"
    >
      {{ lang }}
    </button>
  </div>
</template>

<script setup>
import { SUPPORTED, locale, setLocale, t } from "@/i18n";
</script>
