import "./assets/main.css";
import "vue3-carousel/dist/carousel.css";
import "vue-sonner/style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

import { glow } from "./directives/glow";
import { stagger } from "./directives/stagger";

library.add(fas, fab);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.directive("glow", glow);
app.directive("stagger", stagger);

app.use(createPinia());
app.use(router);

app.mount("#app");
