import "./assets/main.css";
import "vue-sonner/style.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

// Fuentes servidas desde el propio sitio (solo el subset latino y los pesos
// que se usan): sin el CSS de Google Fonts que bloqueaba el render.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/space-mono/latin-400.css";
import "@fontsource/space-mono/latin-700.css";

import { createWebHistory } from "vue-router";

import { createVueApp } from "./app";
import { initialLocale, locale, setLocale } from "./i18n";
import { applyRouteMeta } from "./lib/seo";
import { settleVisibleIntros } from "./lib/gsap";

const root = document.getElementById("app");

// Las páginas del build vienen prerenderizadas en español. Si el idioma
// es otro, no se hidrata: se monta de cero (el contenido estaba oculto, ver
// el script de idioma que agrega scripts/prerender.js).
setLocale(initialLocale, { persist: false }).finally(async () => {
  const hydrate = root.hasAttribute("data-prerendered") && locale.value === "es";
  const { app, router } = createVueApp({
    ssr: hydrate,
    history: createWebHistory(import.meta.env.BASE_URL),
  });
  router.afterEach((to) => applyRouteMeta(to));

  await router.isReady();
  app.mount("#app");
  if (hydrate) settleVisibleIntros();
  document.documentElement.classList.remove("i18n-pending");
});
