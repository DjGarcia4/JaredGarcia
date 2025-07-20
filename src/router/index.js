import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
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
    {
      path: "/project/:slug",
      name: "project",
      component: () => import("../views/ProjectDetailView.vue"),
    },
    {
      path: "/certificate/:slug",
      name: "certificate",
      component: () =>
        import("../views/certificates/CertificateDetailView.vue"),
    },
  ],
});

export default router;
