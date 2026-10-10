import "./assets/main.css";
import "vue-sonner/style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { initialLocale, setLocale } from "./i18n";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "./lib/icons";

import { glow } from "./directives/glow";

const app = createApp(App);

app.component("FontAwesomeIcon", FontAwesomeIcon);
app.directive("glow", glow);

app.use(createPinia());
app.use(router);

// Monta cuando el idioma inicial está listo (si es inglés, su chunk se
// descarga primero; en español no hay espera).
setLocale(initialLocale, { persist: false }).finally(() => app.mount("#app"));
