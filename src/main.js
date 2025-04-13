import "./assets/main.css";
import "./assets/css/animate.css";
import "aos/dist/aos.css";
import "vue3-carousel/dist/carousel.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

// Firebase
import { VueFire, VueFireAuth } from "vuefire";
import { firebaseApp } from "./config/firebase";

// Font Awesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons"; // ← esto es lo nuevo
library.add(fas, fab); // ← actualizá esta línea
const app = createApp(App);
library.add(fas);
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});
app.use(ToastPlugin);
app.use(createPinia());
app.use(router);

app.mount("#app");
