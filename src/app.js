// La app sin montar, compartida por el navegador (main.js) y el prerender
// del build (entry-server.js).
import { createApp, createSSRApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import { createAppRouter } from "./router";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "./lib/icons";

import { glow } from "./directives/glow";

// ssr: true → createSSRApp, para renderizar en Node o hidratar el HTML
// prerenderizado; false → montaje normal en el navegador.
export const createVueApp = ({ ssr, history }) => {
  const app = ssr ? createSSRApp(App) : createApp(App);
  const router = createAppRouter(history);

  app.component("FontAwesomeIcon", FontAwesomeIcon);
  app.directive("glow", glow);

  app.use(createPinia());
  app.use(router);

  return { app, router };
};
