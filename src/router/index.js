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
let redirectedOnLoad = false;

router.beforeEach((to, from, next) => {
  // Solo intercepta en la primera carga (refresh real)
  if (!redirectedOnLoad && to.path !== "/") {
    sessionStorage.setItem("originalPath", to.fullPath);
    redirectedOnLoad = true;
    next({ path: "/" });
  } else {
    next();
  }
});

export default router;
