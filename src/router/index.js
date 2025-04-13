import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SplashView from "@/views/SplashView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "splash",
      component: SplashView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/projects",
      name: "projects",
      component: () => import("../views/ProjectsView.vue"),
    },
  ],
});
const redirectedOnLoad = sessionStorage.getItem("redirectedOnce");

router.beforeEach((to, from, next) => {
  if (!redirectedOnLoad) {
    sessionStorage.setItem("redirectedOnce", "true");

    // Guardar la ruta actual solo si no es el splash
    if (to.path !== "/") {
      sessionStorage.setItem("originalPath", to.fullPath);
      return next({ path: "/" }); // Manda al splash
    }
  }

  next();
});

export default router;
