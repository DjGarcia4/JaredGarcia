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

const app = createApp(App);

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});
app.use(ToastPlugin);
app.use(createPinia());
app.use(router);

app.mount("#app");
