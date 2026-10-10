// Prerender del build: renderiza cada ruta a HTML en Node. Lo usa
// scripts/prerender.js; el navegador nunca carga este archivo.
import { createMemoryHistory } from "vue-router";
import { renderToString } from "vue/server-renderer";

import { createVueApp } from "./app";
import { getCertificates, getProjects } from "./data/localized";
import { getPosts } from "./lib/blog";
import { resolveMeta } from "./lib/seo";

// Las mismas rutas que el sitemap.
export const listRoutes = () => [
  "/",
  "/projects",
  "/design-system",
  "/lab",
  "/blog",
  ...getProjects().filter((p) => p.status !== "Práctica").map((p) => `/project/${p.slug}`),
  ...getCertificates().map((c) => `/certificate/${c.slug}`),
  ...getPosts().map((p) => `/blog/${p.slug}`),
];

export const render = async (url) => {
  const { app, router } = createVueApp({ ssr: true, history: createMemoryHistory() });
  await router.push(url);
  await router.isReady();

  // state: datos que el cliente necesita para hidratar sin volver a pedirlos.
  // teleports: lo que los <Teleport to="body"> renderizan aparte (el
  // lightbox de los casos), que va al principio de <body>.
  const ctx = { state: {} };
  const html = await renderToString(app, ctx);
  return {
    html,
    meta: resolveMeta(router.currentRoute.value),
    state: ctx.state,
    modules: ctx.modules,
    teleports: ctx.teleports?.body ?? "",
  };
};
