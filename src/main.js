import "./assets/main.css";
import "vue-sonner/style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "./lib/icons";

import { glow } from "./directives/glow";

const app = createApp(App);

app.component("FontAwesomeIcon", FontAwesomeIcon);
app.directive("glow", glow);

app.use(createPinia());
app.use(router);

app.mount("#app");
